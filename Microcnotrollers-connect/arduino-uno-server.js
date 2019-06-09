const five = require('johnny-five');
const url = require('url');
const express = require('express');
const app = express();
const board = new five.Board();

const port = 8080;


board.on(`ready`, () => {
  console.log(`--> Board is ready...`);
  
  app.get('*', (req, res) => {
    console.log(`--> Serving the request: ${req.url}`);
    // const urlParts = url.parse(req.url, true);
    // const { method } = req;

    res.end('Hello! from Arduino...');
  });

  app.post('/turnOn', (req, res) => {
    console.log(`--> Serving the request: ${req.url}`);
    res.end('Lamp turned on');
  });

  app.post('/turnOff', (req, res) => {
    console.log(`--> Serving the request: ${req.url}`);
    res.end('Lamp turned off');
  });

 
  app.listen(port, () => {
    console.log(`--> Server is listening on http://localhost:${port}`);
  });
});
