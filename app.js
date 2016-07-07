var express = require('express');
var app = express();
var serv = require('http').Server(app);
var browserSync = require('browser-sync');

//sync stuff
function listening () {
  console.log('syncing browser');
  browserSync({
    proxy: 'localhost:' + 8080,
    files: ['./client/*.{js,css,html}']
  });
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 8080);

serv.listen(app.get('port'), function(){
  listening();
  console.log('server is running on port ' + app.get('port'));
});

var io = require('socket.io') (serv,{});
io.sockets.on('connection', function(socket){
  console.log('connected!');
});
