var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.listen(8080, function(){
  console.log('server is listening on port 8080');
});
