const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { google } = require('googleapis');

module.exports = {
    uploadToGDrive: function (filePath) {

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.file'];

    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json', CREDENTIALS_PATH = 'credentials.json';

    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(__dirname, CREDENTIALS_PATH), async (err, credentials) => {
        if (err) {
          return await getAccessToken(credentials);
        }

        try {
          // Authorize a client with credentials, then call the Google Drive API.
          authorize(JSON.parse(credentials))
            .then(oAuthClient => uploadFile(oAuthClient))
            .then(fileData => resolve(fileData));
        } catch (err) {
          reject('Some error occured while uploading the file...');
        }
      });
    });

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials) {
      return new Promise((resolve, reject) => {
        try {
          const { client_secret, client_id, redirect_uris } = credentials.installed;
          const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

          fs.readFile(path.resolve(__dirname, TOKEN_PATH), async (err, token) => {
            if (err) {
              return await getAccessToken(oAuth2Client);
            }

            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
          });
        } catch (err) {
          reject(`--> Error while authorizing`);
        }
      });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    async function getAccessToken(oAuth2Client) {
      return new Promise((resolve, reject) => {
        try {
          const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
          });
          console.log('Authorize this app by visiting this url:', authUrl);
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
              if (err) return console.error('Error retrieving access token', err);
              oAuth2Client.setCredentials(token);
              // Store the token to disk for later program executions
              fs.writeFile(path.resolve(__dirname, TOKEN_PATH), JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
              });
              resolve(`Done writing token.json`);
            });
          });
        } catch (err) {
          reject('--> Error while generating token.json..');
        }
      });
    }

    async function uploadFile(auth) {
      return new Promise((resolve, reject) => {
        try {
          const drive = google.drive({ version: 'v3', auth });
          const fileMetadata = {
            'name': filePath,
            mimeType: 'image/jpeg'
          };
          const media = {
            body: fs.createReadStream(path.resolve(__dirname, filePath))
          };
          return drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink'
          }, function (err, response) {
            if (err) {
              throw err;
            } else {
              resolve(response.data);
            }
          });
        } catch (err) {
          reject(`--> Error while uploading the file to gDrive`);
        }
      });
    }
  }
}


