const five = require('johnny-five');
const http = require('http');
const url = require('url');
const express = require('express');
const app = express();
const board = new five.Board();




board.on(`ready`, () => {
  console.log(`--> Board is ready...`);
  app.get('*', (req, res) => {
    const urlParts = url.parse(req.url, true);
    const { method } = req;

    console.log(`--> URL parts: `, urlParts);
  
    if (method === 'POST' && urlParts.pathname === '/turnOn') {
      res.end('Lamp turned on');
    } else if(method === 'POST' && urlParts.pathname === '/turnOff') {
      res.end('Lamp tunred off');
    } else {
      res.end('Hello! from Arduino...');
    }
  });

 
  app.listen(8080, () => {
    console.log(`--> Server is listening on port 8080`);
  });
});