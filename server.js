var app    = require('express')(),
    server = require('http').Server(app),
    io     = require('socket.io')(server),
    static = require('serve-static');

server.listen(process.env.PORT || 5000);

app.use(static('bin/', {}));



io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

// on connection
// send leaderboard