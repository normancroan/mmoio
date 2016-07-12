var Entity = require('./entity.class.js');
var Bullet = require('./bullet.class.js');

var Player = function(id) {
  var self = new Entity();
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
    var b = new Bullet(self.id,angle,Player.list);
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

module.exports = Player;
