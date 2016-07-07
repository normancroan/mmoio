var socket = io();

var player = {
  name: 'rumby',
  isDuck: false
}

socket.emit('newPlayer', player);
