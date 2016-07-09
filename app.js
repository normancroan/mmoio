var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 8080);

serv.listen(app.get('port'), function(){
  console.log('server is running on port ' + app.get('port'));
});

var SOCKET_LIST = {};

var Entity = function(){
  var self = {
    x:250,
    y:250,
    spdX:0,
    spdY:0,
    id:"",
  }
  self.updatePosition = function(){
    self.x += self.spdX;
    self.y += self.spdY;
  }
  self.update = function(){
    self.updatePosition();
  }
  return self;
}

var Player = function(id) {
  var self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpd = 10;

  self.updateSpd = function(){
    if (self.pressingRight) {
      self.spdX = self.maxSpd;
    }
    else if (self.pressingLeft) {
      self.spdX = -self.maxSpd;
    }
    else {
      self.spdX = 0;
    }

    if (self.pressingUp) {
      self.spdY = -self.maxSpd;
    }
    else if (self.pressingDown) {
      self.spdY = self.maxSpd;
    }
    else {
      self.spdY = 0;
    }
  }

  var super_update = self.update;
  self.update = function(){
    self.updateSpd();
    super_update();
  }
  Player.list[id] = self;
  return self;
}
Player.list = {};
Player.onConnect = function(socket){
  var player = Player(socket.id);
  socket.on('keyPress', function(data){
    if (data.inputID === 'left') {
      player.pressingLeft = data.state;
    }
    else if (data.inputID === 'right') {
      player.pressingRight = data.state;
    }
    else if (data.inputID === 'up') {
      player.pressingUp = data.state;
    }
    else if (data.inputID === 'down') {
      player.pressingDown = data.state;
    }
  });
}
Player.onDisconnect = function(socket){
  delete Player.list[socket.id];
}
Player.update = function(){
  var pack = [];
  for(var i in Player.list){
    var player = Player.list[i];
    player.update();
    pack.push({
      x:player.x,
      y:player.y,
      number: player.number
    });
  }
  return pack;
}

var io = require('socket.io') (serv,{});

io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  Player.onConnect(socket);
  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
});


setInterval(function(){
  var pack = Player.update();
  for(var i in SOCKET_LIST){
  var socket = SOCKET_LIST[i];
  socket.emit('newPositions', pack);
  }


},1000/25)
