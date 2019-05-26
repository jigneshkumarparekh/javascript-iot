const five = require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');
const av = require('tessel-av');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const uploadFiles = require('./upload-file');

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  const door = new five.Switch({
    pin: 'a2',
    invert: true
  });

  door.on('open', () => {
    console.log(`--> Door is open....`);
    captureAndUpload();
  });

  door.on('close', () => {
    console.log(`--> Door is closed`);
  });
});

function captureAndUpload() {
  const camera = new av.Camera();
  console.log(`--> Started capturing....`);
  const fileName = 'captured-via-data-event.jpg';
  const filePath = path.join(__dirname, fileName);
  camera.capture()
    .pipe(fs.createWriteStream(filePath))
    .on('finish', () => {
      console.log(`--> File saved....`);
      console.log(chalk.green(`--> Uploading to gDrive`));
      uploadFiles.uploadToGDrive(fileName)
        .then(fileData => {
          console.log(chalk.green('--> File created: ', fileData.name, ' with URL: ', fileData.webViewLink));
          postDataToIFTTT(fileData.webViewLink);

          // Now, delete the captured image...
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) throw err;
              console.log(`${filePath} was deleted`);
            });
          }
        })
        .catch(err => console.log(chalk.red(err)));
    });
}

function postDataToIFTTT(fileUrl) {
  fetch(
    'https://maker.ifttt.com/trigger/mailbox/with/key/gfEtP72iHNe_lGN6BoyVAYze9VRVfInneBGwXWpVzok',
    {
      method: 'POST',
      body: `{"value1":"${fileUrl}"}`,
      headers: { 'Content-Type': 'application/json' }
    }
  )
    .then(() => console.log(chalk.green(`--> Data posted to IFTTT - Webhooks for event "mailbox"`)));
}
