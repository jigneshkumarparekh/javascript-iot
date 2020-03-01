'use strict';

const five= require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');
const av = require('tessel-av');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const uploadFiles = require('./upload-file');

let debounceTime = 10000, lastImageCaptureTime, isUploading = false, motionOn = false;

const board = new five.Board({
  io: new Tessel()
});


board.on('ready', async () => {
  console.log(`--> Tessel 2 board is ready...`);

  let windSpeed = await getWeather();
  setInterval(async () => {
    console.log(`--> Getting new weather...`);
    windSpeed = await getWeather();
    console.log(`--> Got new weather data > ${windSpeed}`);
  }, 660000); // 11 min.

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
  motion.on("motionstart", async () => {
    motionOn = true;
    console.log("--> Motion start");

    // Check if motion is still on after X seconds to prevent the false alarm.
    // This is not needed if motion sensor is located inside.
    console.log(`--> Wind Speed is: ${windSpeed}`);
    setTimeout(() => {
      if (motionOn) {
        console.log(`--> Something really wrong...`);
        captureAndUpload();
      }
    }, windSpeed > 8 ? 30000 : debounceTime);
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", () => {
    motionOn = false;
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
    'https://maker.ifttt.com/trigger/mailbox/with/key/gfEtP72iHNe_lGN6BoyVAXXXP7FtH0jMT0TVfrE-T7_',
    {
      method: 'POST',
      body: `{"value1":"${fileUrl}"}`,
      headers: { 'Content-Type': 'application/json' }
    }
  )
  .then(() => console.log(chalk.green(`--> Data posted to IFTTT - Webhooks for event "mailbox"`)));
}

function getWeather() {
  console.log(`--> Getting weather`);
  const apiKey = "bcd076b2b09ab4811091acbb32bd8cf7";
  const city = "5392593" // "San Ramon,US";
  const url = `http://api.openweathermap.org/data/2.5/weather?id=${city}&appid=${apiKey}`;

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(`--> Weather data: `, data.wind);
      return data.wind.speed;
    });
}