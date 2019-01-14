const five = require("johnny-five");
const Tessel = require("tessel-io");
const http = require('http');
const URL = require('url');
const fs = require('fs');

const board = new five.Board({
  io: new Tessel()
});

let motors;

board.on("ready", function() {
  motors = new five.Motors([
    [ "a5", "a4", "a3" ],
    [ "b5", "b4", "b3" ],
  ]);

  createServer();
});

function createServer() {
  const server = http.createServer(function (request, response) {
    const { url } = request;
    const urlParts = URL.parse(url, false);

    console.log(`--> Serving the action: ${urlParts.pathname}`);
    switch(urlParts.pathname) {
      case '/left':
        turnLeft();
        response.end('SUCCESS');
        break;
      case '/right':
        turnRight();
        response.end('SUCCESS');
        break;
      case '/forward':
        spinForward();
        response.end('SUCCESS');
        break;
      case '/reverse':
        spinReverse();
        response.end('SUCCESS');
        break;
      case '/stop':
        motors.stop();
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

function spinForward(speed = 100) { // Speed has to be between [0 - 255]
  console.log(`--> Spining forward`);
  motors.stop();
  motors[0].forward(speed);
  // TODO: Fix this wiring. This is due to motor running in reverse direction on car-bot.
  motors[1].reverse(speed);
}

function spinReverse(speed = 100) {
  console.log(`--> Spining reverse`);
  motors.stop();
  motors[1].forward(speed);
  // TODO: Fix this wiring. This is due to motor running in reverse direction on car-bot.
  motors[0].reverse(speed);
}

function turnLeft(speed = 100) {
  console.log(`--> Turning left`);
  motors.stop();
  motors[0].forward(speed);
}

function turnRight(speed = 100) {
  console.log(`--> Turning right`);
  motors.stop();
  motors[1].forward(speed);
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