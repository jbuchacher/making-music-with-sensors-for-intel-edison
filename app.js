var express = require('express') 
var app = express() // initialize express
var server = require('http').Server(app) // give http module the express server

app.use(express.static(__dirname + '/public')) // tell express to serve anything inside of the public directory

server.listen(8080) // tell express to start listening for requests on port 8080
