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
    })

// this will be called when Cylon is fully initialized, which is when we should open up our WebSocket connection.
var cylonReady = function(my) {
  io
    .of('/soundsocket')
    .on('connection', function (socket) {
      registerSocketHandlers(my, socket);
    })
}

// this will be called each time a socket is opened, so each client will receive their own events when buttons are pushed.
var registerSocketHandlers = function(my, socket) {
  buttons = [my.button0, my.button1, my.button2, my.button3]
  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    registerButtonHandler(socket, button, i);
  }

  analogSensors = [my.potentiometer, my.photocell]
  for (var i = 0; i < analogSensors.length; i++) {
    var sensor = analogSensors[i];
    registerAnalogSensorHandler(socket, sensor, i);
  }
}

// convenience for button specific events
var registerButtonHandler = function(socket, button, buttonID) {
  // on push, send button ID and value of 1
  button.on('push', function() {
    socket.emit('button', {
      'id': buttonID,
      'value': 1
    })
  })

  // on push, send button ID and value of 0
  button.on('release', function() {
    socket.emit('button', {
      'id': buttonID,
      'value': 0
    })
  })
}

// convenience for listening to analog read events and emitting sensor data messages
var registerAnalogSensorHandler = function(socket, analogSensor, analogSensorID) {
  // on new data, send sensor ID and value of sensor reading
  analogSensor.on('analogRead', function() {
    sensorValue = analogSensor.analogRead()

    socket.emit('sensor', {
      'id': analogSensorID,
      'value': sensorValue
    })
  })
}

// tell Cylon which devices we will be interfacing with
var getDevices = function() {
  return {
    button0: { driver: 'button', pin: 2 },
    button1: { driver: 'button', pin: 3 },
    button2: { driver: 'button', pin: 4 },
    button3: { driver: 'button', pin: 5 },
    potentiometer: { driver: 'analogSensor', pin: 0, lowerLimit: 100, upperLimit: 900 },
    photocell: { driver: 'analogSensor', pin: 1, lowerLimit: 100, upperLimit: 900 }
  }
}

// tell Cylon how we will be connecting to our devices
var getConnections = function() {
  return {
    edison: { adaptor: 'intel-iot' }
  }
}

cylon.robot({
  connections: getConnections(),
  devices: getDevices()
}).on('ready', cylonReady)

cylon.start()
