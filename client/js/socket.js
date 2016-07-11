
document.addEventListener("DOMContentLoaded", function(event) {
  var ctx = document.getElementById("ctx").getContext("2d");
  var chatText = document.getElementById("chat-text");
  var chatInput = document.getElementById("chat-input");
  var chatForm = document.getElementById("chat-form");
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

  //chat
  socket.on('addToChat', function(data) {
    chatText.innerHTML += '<div>' + data + '</div>';
    chatText.scrollTop = chatText.scrollHeight;
  });

  chatForm.onsubmit = function(e) {
    e.preventDefault();
    socket.emit('sendMsgToServer', chatInput.value);
    chatInput.value = "";
  }

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

  document.onmousedown = function(event) {
    socket.emit('keyPress', {inputID:'attack', state:true});
  }
  document.onmouseup = function(event) {
    socket.emit('keyPress', {inputID:'attack', state:false});
  }
  document.onmousemove = function(event) {
    var x = -250 + event.clientX - 8;
    var y = -250 + event.clientY - 8;
    var angle = Math.atan2(y,x) / Math.PI * 180;
    socket.emit('keyPress', {inputID:'mouseAngle', state:angle});
  }

});
