var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

app.set('port', process.env.PORT || 8080);

app.listen(app.get('port'), function(){
  console.log('server is listening on port ' + app.get('port'));
});
