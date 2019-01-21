const five = require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  console.log('--> Board is ready. Making an API call to server..');
  fetch('http://localhost:3000/turnOn').then(() => console.log('--> Success.'));
});