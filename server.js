var app     = require('express')(),
    server  = require('http').Server(app),
    io      = require('socket.io')(server),
    static  = require('serve-static'),
    mongodb = require('mongodb'),
    MongoClient = mongodb.MongoClient;

var scoreTable = [],
    topScores = 20,
    scores,
    players,
    playersCache = {};

function getPlayerName(id) {
  return playersCache[id] && playersCache[id].name;
}

function setPlayerName(id, name) {
  if(playerExists(id)) {
    playersCache[id].name = name;
  } else {
    playersCache[id] = { id : id, name : name };
  }
  players
    .update(
      { id : id },
      { id : id, name : name },
      { upsert : true },
      function(err, result) {
        if(err)
          console.error(err);
      }
    );
}

function playerExists(id) {
  return !!playersCache[id];
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

function updateScore(data, final) {
  if(final) {
    scores.insert(data, function(err, result) {
      if(err)
        console.error(err);
    });
  }
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

MongoClient.connect(process.env.MONGOSOUP_URL || "mongodb://localhost", function(err, db) {
  if(err) {
    console.log("failed to connect to the database");
  } else {
    console.log("connected to database");
  }
  server.listen(process.env.PORT || 5000);
  app.use(static('bin/', {}));

  players = db.collection('players');
  players.find({})
    .toArray(function(err, docs) {
      if (err) {
        return console.error(err)
      }
      docs.forEach(function(doc) {
        players[doc.id] = doc;;
      });
    });

  scores = db.collection('scores');
  scores.find({})
    .sort({ score : -1 })
    .limit(topScores)
    .toArray(function(err, docs) {
      if (err) {
        return console.error(err)
      }
      docs.forEach(function(doc) {
        scoreTable.push(doc);
      });
    });
});

io.on('connection', function (socket) {
  socket.emit('request:id');
  var latestScore;

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

  socket.on('score:start', function (data) {
    latestScore = data;
    insertScore(data);
  });

  // id, score, level, time, gameid
  socket.on('score:update', function (data) {
    if(!latestScore) {
      insertScore(data);
      latestScore = data;
    } else {
      latestScore.score = data.score;
      latestScore.level = data.level;
      latestScore.time = data.time;
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
    updateScore(data, true);
    if(isTopScore(data.score)) {
      var players = getTopPlayers();
      socket.broadcast.emit('leaderboard:top', players);
      socket.emit('leaderboard:top', players);
    }
    latestScore = null;
  });

  socket.on('disconnect', function() {
    if(latestScore) {
      updateScore(latestScore, true);
      latestScore = null;
    }
  });
});
