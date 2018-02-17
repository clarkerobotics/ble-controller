// NOTES:
// D28 - Button! :D
// D2 - right pot
// D31 - right pot
// D29 - left pot
// D30 - left pot
var called = false;

function onInit() {
  if (called) return;
  called = true;
  var on = false;
  var button = D28;
  var leftUD = D29;
  var leftLR = D30;
  var rightUD = D31;
  var rightLR = D2;
  var timer;

  // Setup BLE Services & Advertisements
  NRF.setAdvertising({
    0x181C: [on]
  }, {
    name: "BLE Controller"
  });
  NRF.setServices({
    0xDADA: {
      0xAEAE : {
        value : "-", // optional
        maxLen : 60, // optional (otherwise is length of initial value)
        broadcast : false, // optional, default is false
        readable : true,   // optional, default is false
        notify : true,   // optional, default is false
        indicate : true,   // optional, default is false
        description: "Coordinates"
      }
    }
  }, {
    advertise: ["DADA"]
  });

  //reset all
  LED1.write(0); // RED
  LED2.write(0); // GREEN
  LED3.write(0); // BLUE

  function sendData(data) {
    //console.log("sendData", data);
    // TODO: send as JSON string
    var str = JSON.stringify(data);
    console.log("sendData", str);
    // Bluetooth.println(str);
    // NRF.setAdvertising({ 0x181C: [str] });
    NRF.setServices({ 0xDADA: { 0xAEAE : { value : str } } });
  }

  setWatch(function(e) {
    on = !on;
    LED1.write(on);
    if (on) setTimeout(function(){
      LED1.write(0);
    }, 500);
    console.log("Enabled: ", on);
    sendData({
      e: on,
      lud: 0,
      llr: 0,
      rud: 0,
      rlr: 0,
      bat: Puck.getBatteryPercentage()
    });
    if (on) startController();
    if (!on) clearInterval(timer);
  }, button, { repeat: true, edge: 'rising', debounce: 50 });
  // you'll need to use  edge: 'falling' if you connected the button to 0v

  function startController(){
    timer = setInterval(function(){
      var l1 = analogRead(leftUD);
      var l2 = analogRead(leftLR);
      var r1 = analogRead(rightUD);
      var r2 = analogRead(rightLR);

      //format values
      l1 = Math.round(Math.abs(l1 * 1000));
      l2 = Math.round(Math.abs(l2 * 1000));
      r1 = Math.round(Math.abs(r1 * 1000));
      r2 = Math.round(Math.abs(r2 * 1000));
      var leftLedOn = 0;
      var rightLedOn = 0;
      if (l1 > 900 || l1 < 10) leftLedOn = 1;
      if (r1 > 900 || r1 < 10) rightLedOn = 1;
      LED2.write(leftLedOn);
      LED3.write(rightLedOn);
      //console.log('vars',l1, l2, r1, r2);

      // Send over the wire!
      sendData({
        e: true,
        lud: l1,
        llr: l2,
        rud: r1,
        rlr: r2
      });
    }, 300);
  }

}
onInit();

// NOTE: Use when needing to store in memory! start from memory!

// save();
