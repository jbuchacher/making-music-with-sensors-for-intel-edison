var BD;

T("audio").load("./drumkit.wav", function() {
  BD = this.slice(0,  500).set({bang:false})
  drum = T("lowshelf", {freq:110, gain:8, mul:0.6}, BD).play()
})

var socketConnection = io.connect('http://192.168.1.11:8080/soundsocket')

socketConnection.on('connect', function () {
  console.log('connected to socket')
})

socketConnection.on('button', function (value) {
  if (value == 'push') {
    BD.bang()
  }
})
