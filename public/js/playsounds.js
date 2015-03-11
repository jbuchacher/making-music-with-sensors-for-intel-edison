var BD
var SD
var HH1
var HH2
var CYM

var drum
var lead
var env
var arp
var delay
var inv

T("audio").load("./drumkit.wav", function() {
  BD  = this.slice(   0,  500).set({bang:false})
  SD  = this.slice( 500, 1000).set({bang:false})
  HH1 = this.slice(1000, 1500).set({bang:false, mul:0.2})
  HH2 = this.slice(1500, 2000).set({bang:false, mul:0.2})
  CYM = this.slice(2000).set({bang:false, mul:0.2})

  var scale = new sc.Scale([0,1,3,7,8], 12, "Pelog")

  var P1 = [
    [BD, HH1],
    [HH1],
    [HH2],
    [],
    [BD, SD, HH1],
    [HH1],
    [HH2],
    [SD],
  ].wrapExtend(128)

  var P2 = sc.series(16)

  drum = T("lowshelf", {freq:110, gain:8, mul:0.6}, BD, SD, HH1, HH2, CYM).play()
  lead = T("saw", {freq:T("param")})
  env  = T("perc", {r:100})
  arp  = T("OscGen", {wave:"sin(15)", env:env, mul:0.5})

  delay = T("delay", {time:"BPM128 L4", fb:0.65, mix:0.35},
            T("pan", {pos:T("tri", {freq:"BPM64 L1", mul:0.8}).kr()}, arp)
           ).play();

  inv = T("interval", {interval:"BPM128 L16"}, function(count) {
    var i = count % P1.length

    if (i === 0) CYM.bang()

    P1[i].forEach(function(p) {
      p.bang()
    })

    if (Math.random() < 0.015) {
      var j = (Math.random() * P1.length)|0;
      P1.wrapSwap(i, j);
      P2.wrapSwap(i, j);
    }

    var noteNum = scale.wrapAt(P2.wrapAt(count)) + 60;
    if (i % 2 === 0) {
      lead.freq.linTo(noteNum.midicps() * 2, "100ms");
    }
    arp.noteOn(noteNum + 24, 60)
  }).start()
})

var socketConnection = io.connect('http://192.168.1.11:8080/soundsocket')

socketConnection.on('connect', function () {
  console.log('connected to socket')
})

socketConnection.on('button', function (data) {
  buttonID = data['id']
  value = data['value']

  switch (buttonID) {
  case 0:
    if (value == 1) {
      BD.bang()
    }
    break;
  case 1:
    if (value == 1) {
      CYM.bang()
    }
    break;
  case 2:
    value == 1 ? HH1.set({mul: 1}) : HH1.set({mul: 0.2})
    break;
  case 3:
    value == 1 ? HH2.set({mul: 1}) : HH2.set({mul: 0.2})
    break;
  default:
  }
})

socketConnection.on('sensor', function (data) {
  sensorID = data['id']
  value = data['value']

  switch (sensorID) {
  case 0:
    inv.set({interval: value * 2 })
    break;
  case 1:
    arp.set({mul: 10 / value })
    break;
  default:
  }
})
