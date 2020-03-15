// NOTE: Please create "twillio.env" file in root directory of the project

'use strict';
const five = require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');
const chalk = require('chalk');
const path = require('path');

// Load the environment variable for twillio
// NOTE: Please check if "twillio.env" file exists as it's not checked in to the repo.
require('dotenv').config({ path: path.join(__dirname, 'twilio.env')});

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  console.log(`--> Tessel 2 board is ready....`);
  const button = new five.Button({
    pin: 'a2',
    holdtime: 3000
  });

  button.on('press', () => console.log(`--> Button pressed.`));
  button.on('release', () => console.log(`--> Button released.`));
  button.on('hold', () => {
    console.log(`--> Button held for 3s`);
    sendSMS();
    postDataToIFTTT();
  });
});


function sendSMS() {
  // Twillio Phone#: +1(732) 587-7904
  // NOTE: Please check if "twillio.env" file exists as it's not checked in to the repo.
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  console.log(`--> accountSid: `, accountSid);
  console.log(`--> authToken: `, authToken);
  const client = require('twilio')(accountSid, authToken);

  client.messages
    .create({
      body: 'Testing message for safety device. Please check youe Life360 app for my location.',
      from: '+17325877904',
      to: '+19255351340'
    })
    .then(message => console.log(message.sid));
}

function postDataToIFTTT() {
  const eventName = 'LocationShare';
  fetch(
    `https://maker.ifttt.com/trigger/${eventName}/with/key/gfEtP72iHNe_lGN6BoyVAXXXP7FtH0jMT0TVfrE-T7_`,
    {
      method: 'POST',
      body: ``,
      headers: { 'Content-Type': 'application/json' }
    }
  )
    .then(() => console.log(chalk.green(`--> Data posted to IFTTT - Webhooks for event "${eventName}"`)));
}