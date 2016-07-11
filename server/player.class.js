var Entity = require('./entity.class.js');

//TODO Split out the Player class

exports.spawn = function(id) {
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
