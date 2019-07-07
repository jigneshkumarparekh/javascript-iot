const Tessel = require('tessel-io');
const five = require('johnny-five');

const board = new five.Board({
  io: new Tessel()
});

const debounceTime = 5000;

let lastTimeChecked = null;

board.on('ready', () => {
  const soil = new five.Sensor("a7");
  soil.on('change', () => {
    const now = Date.now();
    if (!lastTimeChecked || (now - lastTimeChecked) > debounceTime) {
      lastTimeChecked = now;
      console.log(`--> Current soil value is: ${soil.value}`);
      if (soil.value < 300) {
        console.log(`--> Soil is dry.. Needs water`);
      } else {
        console.log(`--> There is enough water for the plant`);
      }
    }
  });
});