const five = require('johnny-five');
const http = require('http');
const url = require('url');

const board = new five.Board();

board.on(`ready`, () => {
  const server = http.createServer((req, res) => {
    const urlParts = url.parse(req.url, true);
    const { method } = req;

    if (method === 'POST' && urlParts.pathname === '/turnOn') {
      res.end('Lamp turned on');
    } else if(method === 'POST' && urlParts.pathname === '/turnOff') {
      res.end('Lamp tunred off');
    } else {
      res.end('Success');
    }

    server.listen(8080, () => {
      console.log(`--> Server is running at ${server.address()}`);
    });
  });
});

