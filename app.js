var express = require('express');
var app = express();
var serv = require('http').Server(app);
var Entity = require('./server/entity.class.js');
var Player = require('./server/player.class.js');
var Bullet = require('./server/bullet.class.js');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 8080);

serv.listen(app.get('port'), function(){
  console.log('server is running on port ' + app.get('port'));
});

var SOCKET_LIST = {};

var io = require('socket.io') (serv,{});

io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  Player.onConnect(socket);
  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
  socket.on('sendMsgToServer', function(data){
    var playerName = ("" + socket.id).slice(2,7);
    for (var i in SOCKET_LIST) {
      SOCKET_LIST[i].emit('addToChat', playerName + ': ' + data);
    }
  });
});


setInterval(function(){
  var pack = {
    player: Player.update(),
    bullet: Bullet.update()
  }
  for(var i in SOCKET_LIST){
  var socket = SOCKET_LIST[i];
  socket.emit('newPositions', pack);
  }


},1000/25)
