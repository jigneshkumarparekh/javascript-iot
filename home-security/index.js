const five= require('johnny-five');
const Tessel = require('tessel-io');
const fetch = require('node-fetch');
const av = require('tessel-av');
const uploadFiles = require('./upload-file');

const board = new five.Board({
  io: new Tessel()
});

board.on('ready', () => {
  // Create a new `motion` hardware instance.
  const motion = new five.Motion(7);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", () => {
    console.log("calibrated");
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", () => {
    console.log("motionstart");
    captureAndUpload();
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", () => {
    console.log("motionend");
  });

});

function captureAndUpload() {
  const camera = new av.Camera();
  console.log(`--> Started capturing....`);
  const fileName = 'captured-via-door-event.jpg';
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