const uploadFiles = require('./upload-file');
const fetch = require('node-fetch');
const chalk = require('chalk');

console.log(chalk.green(`--> Started uploading to G-Drive...`));
uploadFiles.uploadToGDrive('my-upload.jpg')
  .then(fileData => {
    console.log(chalk.green('--> File created: ', fileData.name, ' with URL: ', fileData.webViewLink));
    postDataToIFTTT(fileData.webViewLink);
  })
  .catch(err => console.log(chalk.red(err)));


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