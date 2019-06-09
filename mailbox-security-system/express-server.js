const fetch = require('node-fetch');
const path = require('path');
const os = require('os');
const express = require('express');
const app = express();
const server = require('http').Server(app);

const port = 8080;
server.listen(port, function () {
  console.log(`--> Server is running at: http://${os.hostname()}:${port}`);
});

// app.use(express.static(path.join(__dirname, '/')));

app.post('/capture', (request, response) => {
  console.log(`--> Recieved request for capture...`);
  response.send('POST - SUCCESS');
});

app.post('/test', function (req, res) {
  res.send('POST request to homepage');
});

app.get('/', (request, response) => {
  response.send('GET -SUCCESS');
});

function postData() {
  console.log(`--> Making a request to express server...`);
  fetch(`http://localhost:${port}/capture`,
    {
      method: 'POST',
      body: JSON.stringify({})
    })
    .then(res => console.log(`--> Successfully capture and uploaded to gDrive:`))
    .catch(err => console.log(`--> Error while uploading the file: `, err));
}

setTimeout(() => {
  postData();
}, 5000);