const five = require("johnny-five");
const Tessel = require('tessel-io');
const http = require('http');
const URL = require('url');
const fs = require('fs');

const board = new five.Board({
  io: new Tessel()
});

board.on("ready", () => {
  const servo = new five.Servo('a5');

  // Servo alternate constructor with options
  /*
  var servo = new five.Servo({
    id: "MyServo",     // User defined id
    pin: 10,           // Which pin is it attached to?
    type: "standard",  // Default: "standard". Use "continuous" for continuous rotation servos
    range: [0,180],    // Default: 0-180
    fps: 100,          // Used to calculate rate of movement between positions
    invert: false,     // Invert all specified positions
    startAt: 90,       // Immediately move to a degree
    center: true,      // overrides startAt if true and moves the servo to the center of the range
  });
  */

  // Add servo to REPL (optional)
  board.repl.inject({
    servo
  });


  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  // defaults to 0
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  // defaults to 180
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo to 90°
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.to( 90 );

  // step( deg )
  //
  // step all servos by deg
  //
  // eg. array.step( -20 );

  // servo.sweep();

  createServer(servo);
});

function lock(servo) {
  servo.to(145);
}

function unlock(servo) {
  servo.to(45);
}

function createServer(servo) {
  const server = http.createServer(function (request, response) {
    const { url } = request;
    const urlParts = URL.parse(url, false);

    console.log(`--> Serving the action: ${urlParts.pathname}`);
    switch(urlParts.pathname) {
      case '/lock':
        lock(servo);
        response.end('SUCCESS');
        break;
      case '/unlock':
        unlock(servo);
        response.end('SUCCESS');
        break;
      default:
        showIndexPage(response);
        break;
    }
  });

  server.listen(8080);

  console.log('Server running at http://192.168.1.101:8080/ Or http://<YOUR_TESSEL_AP_NAME>.local:8080');
}

// Respond to the request with our index.html page
function showIndexPage(response) {
  // Create a response header telling the browser to expect html
  response.writeHead(200, {"Content-Type": "text/html"});

  // Use fs to read in index.html
  fs.readFile(__dirname + '/index.html', function (err, content) {
    // If there was an error, throw to stop code execution
    if (err) {
      throw err;
    }

    // Serve the content of index.html read in by fs.readFile
    response.end(content);
  });
}