const five= require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');
const av = require('tessel-av');
const uploadFiles = require('./upload-file');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

let debounceTime = 5000, lastImageCaptureTime, isUploading = false;

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  console.log(`--> Tessel 2 board is ready...`);


  // Create a new `motion` hardware instance.
  const motion = new five.Motion({
    pin: 'a7'
  });

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", () => {
    console.log("--> calibrated");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", () => {
    console.log("--> Motion start");
    captureAndUpload();
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", () => {
    console.log("--> Motion end");
  });

});

function captureAndUpload() {

  // Debounce in case of constant movement...
  if (isUploading || (lastImageCaptureTime && (Date.now() - lastImageCaptureTime) < debounceTime)) {
    return;
  }

  isUploading = true;
  try {
    const camera = new av.Camera();
    console.log(`--> Started capturing....`);
    const fileName = 'captured-via-door-event.jpg';
    const filePath = path.join(__dirname, fileName);
    lastImageCaptureTime = Date.now();
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
            isUploading = false;
          })
          .catch(err => {
            console.log(chalk.red(err));
            isUploading = false;
            throw err;
          });
      });
  } catch (error) {
    console.log(`--> Some unknown error: `, error);
    isUploading = false;
  }
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