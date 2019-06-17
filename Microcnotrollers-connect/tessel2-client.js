const fetch = require('node-fetch');
const five = require('johnny-five');
const Tessel = require('tessel-io');


const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  console.log('--> Board is ready. Making an API call to server..');
  fetch('http://192.168.0.24:8080/turnOff', {method: 'POST', body: ''})
    .then(res => res.text())
    .then(res => console.log('--> Success.', res))
    .catch(err => console.log(`--> Error while making an API call: ${err}`));
});