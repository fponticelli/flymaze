var app    = require('express')(),
    server = require('http').Server(app),
    io     = require('socket.io')(server),
    static = require('serve-static');

server.listen(process.env.PORT || 5000);

app.use(static('bin/', {}));

var scoreTable = [],
    players = {},
    topPlayers = 10,
    gameSessions = {};

function getPlayerName(id) {
  return players[id];
}

function setPlayerName(id, name) {
  players[id] = name;
}

function playerExists(id) {
  return !!players[id];
}

function getTopLen() {
  return scoreTable.length < topPlayers ? scoreTable.length : topPlayers;
}

function isTopPlayer(id) {
  var len = getTopLen();
  for(var i = 0; i < scoreTable.length; i++)
    if(scoreTable[i].id === id)
      return true;
  return false;
}

function isTopScore(score) {
  var len = getTopLen();
  for(var i = 0; i < scoreTable.length; i++)
    if(scoreTable[i].score > score)
      return true;
  return false;
}

function scoreScoreTable() {
  scoreTable.sort(function(a, b) {
    return a.score - b.score;
  });
}

function insertScore(data) {
  scoreTable.push(data);
  scoreScoreTable();
}

function updateScore(/*data*/) {
  scoreScoreTable();
}

io.on('connection', function (socket) {
  socket.emit('request:id');

  // id, name
  socket.on('id:confirm', function(data) {
    if(!playerExists[data.id]) {
      setPlayerName(data.id, data.name);
    }
    // TODO this should only hit the current player
    socket.emit('leaderboard:top', players.slice(0, topPlayers));
  });

  socket.on('id:change', function(data) {
    if(getPlayerName(data.id) === data.name)
      return;
    if(isTopPlayer(data.id)) {
      socket.emit('leaderboard:top', players.slice(0, topPlayers));
    }
  });

  // id, score, level, time, gameid
  socket.on('score:play', function (data) {
    if(!gameSessions[data.gameid]) {
      gameSessions[data.gameid] = data;
      insertScore(data);
    } else {
      var o = gameSessions[data.gameid];
      o.score = data.score;
      o.level = data.level;
      o.time = data.time;
      updateScore(data);
    }
    if(isTopScore(data.score)) {
      socket.emit('leaderboard:top', players.slice(0, topPlayers));
    }
  });

  // id, score, level, time, gameid
  socket.on('score:finale', function (data) {
    if(!gameSessions[data.gameid]) return;
    updateScore(data);
    if(isTopScore(data.score)) {
      socket.emit('leaderboard:top', players.slice(0, topPlayers));
    }
  });
});