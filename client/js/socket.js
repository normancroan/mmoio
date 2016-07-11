
document.addEventListener("DOMContentLoaded", function(event) {
  var ctx = document.getElementById("ctx").getContext("2d");
  ctx.font = "30px Arial";

  //connect to server
  var socket = io();

  //listen for events
  socket.on('newPositions', function(data){
    ctx.clearRect(0,0,500,500);
    for (var i = 0; i < data.player.length; i++) {
      ctx.fillText(data.player[i].number,data.player[i].x,data.player[i].y);
    }

    for (var i = 0; i < data.bullet.length; i++) {
      ctx.fillRect(data.bullet[i].x-5,data.bullet[i].y-5,10,10);
    }
  });


  //player movement
  document.onkeydown = function(e){
    if (e.keyCode === 68) {
      socket.emit('keyPress', {inputID:'right', state:true});
    }
    else if (e.keyCode === 83) {
      socket.emit('keyPress', {inputID:'down', state:true});
    }
    else if (e.keyCode === 65) {
      socket.emit('keyPress', {inputID:'left', state:true});
    }
    else if (e.keyCode === 87) {
      socket.emit('keyPress', {inputID:'up', state:true});
    }
  }
  document.onkeyup = function(e){
    if (e.keyCode === 68) {
      socket.emit('keyPress', {inputID:'right', state:false});
    }
    else if (e.keyCode === 83) {
      socket.emit('keyPress', {inputID:'down', state:false});
    }
    else if (e.keyCode === 65) {
      socket.emit('keyPress', {inputID:'left', state:false});
    }
    else if (e.keyCode === 87) {
      socket.emit('keyPress', {inputID:'up', state:false});
    }
  }

});
