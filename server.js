var app    = require('express')(),
    server = require('http').Server(app),
    io     = require('socket.io')(server),
    static = require('serve-static');

server.listen(process.env.PORT || 5000);

app.use(static('bin/', {}));

var scoreTable = [],
    players = {},
    topScores = 20,
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
  return scoreTable.length < topScores ? scoreTable.length : topScores;
}

function isTopPlayer(id) {
  var len = getTopLen();
  for(var i = 0; i < scoreTable.length; i++)
    if(scoreTable[i].id === id)
      return true;
  return false;
}

function isTopScore(score) {
  if(scoreTable.length < topScores)
    return true;
  for(var i = 0; i < scoreTable.length; i++)
    if(scoreTable[i].score > score)
      return true;
  return false;
}

function sortScoreTable() {
  scoreTable.sort(function(a, b) {
    return b.score - a.score;
  });
}

function insertScore(data) {
  scoreTable.push(data);
  sortScoreTable();
}

function updateScore(/*data*/) {
  sortScoreTable();
}

function getTopPlayers() {
  var list = [],
      i = 0;
  while(list.length < topScores && i < scoreTable.length) {
    var game = scoreTable[i++];
    list.push({
      name  : getPlayerName(game.id),
      score : game.score,
      level : game.level
    });
  }
  return list;
}

io.on('connection', function (socket) {
  socket.emit('request:id');

  // id, name
  socket.on('id:confirm', function(data) {
    if(!playerExists[data.id]) {
      setPlayerName(data.id, data.name);
    }
    socket.emit('leaderboard:top', getTopPlayers());
  });

  socket.on('id:change', function(data) {
    if(getPlayerName(data.id) === data.name)
      return;
    setPlayerName(data.id, data.name);
    if(isTopPlayer(data.id)) {
      var players = getTopPlayers();
      socket.broadcast.emit('leaderboard:top', players);
      socket.emit('leaderboard:top', players);
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
      var players = getTopPlayers();
      socket.broadcast.emit('leaderboard:top', players);
      socket.emit('leaderboard:top', players);
    }
  });

  // id, score, level, time, gameid
  socket.on('score:end', function (data) {
    if(!gameSessions[data.gameid]) return;
    updateScore(data);
    delete gameSessions[data.gameid];
    if(isTopScore(data.score)) {
      var players = getTopPlayers();
      socket.broadcast.emit('leaderboard:top', players);
      socket.emit('leaderboard:top', players);
    }
  });
});