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

var io = require('socket.io') (serv,{});

io.sockets.on('connection', function(socket){
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10 * Math.random());
  SOCKET_LIST[socket.id] = socket;

  socket.on('disconnect', function(){
    delete SOCKET_LIST[socket.id];
  });

});


setInterval(function(){
  var pack = [];
  for(var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.x++;
    socket.y++;
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number
    });
  }
  for(var i in SOCKET_LIST){
  var socket = SOCKET_LIST[i];
  socket.emit('newPositions', pack);
  }


},1000/25)
