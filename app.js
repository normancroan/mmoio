var express = require('express');
var app = express();
var serv = require('http').Server(app);
var Entity = require('./server/entity.class.js');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 8080);

serv.listen(app.get('port'), function(){
  console.log('server is running on port ' + app.get('port'));
});

var SOCKET_LIST = {};

//moved entity to separate file

var Player = function(id) {
  var self = Entity.spawn();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.mouseAngle = 0;
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

    if(self.pressingAttack){
      self.shootBullet(self.mouseAngle);
    }
  }

  self.shootBullet = function(angle) {
    var b = Bullet(self.id,angle);
    b.x = self.x;
    b.y = self.y;
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
    else if (data.inputID === 'attack') {
      player.pressingAttack = data.state;
    }
    else if (data.inputID === 'mouseAngle') {
      var x = (-player.x + data.state.x);
      var y = (-player.y + data.state.y);
      var angle = Math.atan2(y,x) / Math.PI * 180;
      player.mouseAngle = angle;
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


var Bullet = function(parent, angle){
  var self = Entity.spawn();
  self.id = Math.random();
  self.spdX = Math.cos(angle/180*Math.PI) * 10;
  self.spdY = Math.sin(angle/180*Math.PI) * 10;
  self.parent = parent;
  self.timer = 0;
  self.toRemove = false;
  var super_update = self.update;
  self.update = function(){
    if (self.timer++ > 100){
      self.toRemove = true;
    }
    super_update();

    for (var i in Player.list){
      var p = Player.list[i];
      if (self.getDistance(p) < 32 && self.parent !== p.id){
        //handle bullet collision with player
        self.toRemove = true;
      }
    }
  }
  Bullet.list[self.id] = self;
  return self;
}

Bullet.list = {};

Bullet.update = function(){
  var pack = [];
  for(var i in Bullet.list){
    var bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove){
      delete Bullet.list[i];
    } else {
      pack.push({
        x:bullet.x,
        y:bullet.y
      });
    }
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
