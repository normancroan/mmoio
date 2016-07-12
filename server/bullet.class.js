var Entity = require('./entity.class.js');
var Player = require('./player.class.js');

var Bullet = function(parent, angle, players) {
    var self = new Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    self.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function() {
        if (self.timer++ > 100) {
            self.toRemove = true;
        }
        super_update();

        for (var i in players) {
            var p = players[i];
            if (self.getDistance(p) < 32 && self.parent !== p.id) {
                //handle bullet collision with player
                self.toRemove = true;
            }
        }
    }
    Bullet.list[self.id] = self;
    return self;
}

Bullet.list = {};

Bullet.update = function() {
    var pack = [];
    for (var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        if (bullet.toRemove) {
            delete Bullet.list[i];
        } else {
            pack.push({
                x: bullet.x,
                y: bullet.y
            });
        }
    }
    return pack;
}

module.exports = Bullet;
