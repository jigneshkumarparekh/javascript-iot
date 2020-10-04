'use strict';
const av = require('tessel-av');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const uploadFiles = require('../upload-file');

fs.mkdirSync(path.resolve(__dirname, 'camera-images'));

const camera = new av.Camera();

const capture = camera.stream();

capture.on('data', function(data) {
  console.log(`--> Got data; `, data);
});

let counter = 0;
capture.on('frame', function(frame) {
  const filePath = path.resolve(__dirname, 'camera-images' ,`camera-feed-${counter++}.jpg`);
  console.log(`--> File Path: `, filePath);
  fs.writeFile(filePath, frame, { flag: 'wx' }, (err) => {
    if (err) {
      console.log(`--> ERROR: `, err);
      throw err;
    }
    console.log(`--> Written the file: ${filePath}`);
  });
  console.log(`--> Got frame: `, frame);
});

setTimeout(() => {
  camera.stop();
  // TODO: Fix the filePath issue: Need to upload all the files from the frames
  // checkFileAndUpload(filePath);
}, 3000);


function checkFileAndUpload(filePath) {
  if (fs.existsSync(filePath)) {
    const fileInfo = fs.statSync(filePath);
    console.log(`--> Video Info: `, fileInfo);

    uploadFiles.uploadToGDrive(filePath)
      .then(fileData => {
        console.log(chalk.green('--> File created: ', fileData.name, ' with URL: ', fileData.webViewLink));
      })
      .catch(err => console.log(chalk.red(err)));
  }
}