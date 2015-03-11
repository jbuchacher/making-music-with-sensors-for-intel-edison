var express = require('express') 
var app = express() // initialize express
var server = require('http').Server(app) // give http module the express server
var cylon = require('cylon')

var io = require('socket.io')(server) // pass our http server to Socket.IO

app.use(express.static(__dirname + '/public')) // tell express to serve anything inside of the public directory

server.listen(8080) // tell express to start listening for requests on port 8080

var socket = io
    .of('/soundsocket') // establish a route to connect to using the Socket.IO client
    .on('connection', function (socket) {
      console.log('client connected') // each time a client establishes a connection, log a message to the console that the app is running on (on the Edison).
      socket.emit('test_message', 'some data')
    })

cylon.robot({
  connections: { // tell Cylon how we will be connecting to our devices
    edison: { adaptor: 'intel-iot' }
  },
  devices: {
    button: { driver: 'button', pin: 2 }
  }
}).on('ready', function(my) {
  console.log('cylon ready')

  my.button.on('push', function() { // when the button is pushed, this callback will be triggered
    console.log("Button pushed!")
  })

  my.button.on('release', function() { // when the button is released, this callback will be triggered
    console.log("Button released!")
  })
})

cylon.start()
