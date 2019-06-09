const five = require('johnny-five');
const url = require('url');
const express = require('express');
const app = express();
const board = new five.Board();

const port = 8080;


board.on(`ready`, () => {
  console.log(`--> Board is ready...`);
  app.get('*', (req, res) => {
    const urlParts = url.parse(req.url, true);
    const { method } = req;

    if (method === 'POST' && urlParts.pathname === '/turnOn') {
      res.end('Lamp turned on');
    } else if(method === 'POST' && urlParts.pathname === '/turnOff') {
      res.end('Lamp tunred off');
    } else {
      res.end('Hello! from Arduino...');
    }
  });

 
  app.listen(port, () => {
    console.log(`--> Server is listening on http://localhost:${port}`);
  });
});
