// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
require('@tensorflow/tfjs-node');

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const canvas = require('canvas');
const faceapi = require('face-api.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch });

async function loadModels() {
  return Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
    faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
  ]);
}

function saveFile(fileName, buf) {
  const baseDir = path.resolve(__dirname, 'out');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf);
  console.log(`--> Written file location: `, path.resolve(baseDir, fileName));
}

function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Jignesh']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await canvas.loadImage(`./labeled_images/${label}/${i}.jpg`);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  )
}

(function() {
  loadModels().then(async () => {
    console.log(`--> Model loaded...`);
    const imgUrl = './labeled_images/Jignesh/1.jpg';

    const queryImage = await canvas.loadImage(imgUrl);

    // Create the query from image to compare with labeled images
    const resultsQuery = await faceapi
      .detectAllFaces(queryImage)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // First find all available lables
    const labeledFaceDescriptors = await loadLabeledImages();

    // Load face matcher with all the labels
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    const labels = faceMatcher.labeledDescriptors.map(ld => ld.label);

    console.log(`--> Loaded labels: `, labels);

    // Finally compare the query image face with labeled faces and find the best result
    const bestMatch = resultsQuery.map(res => {
      return faceMatcher.findBestMatch(res.descriptor);
    });
    console.log(`--> Best Match: `, bestMatch.toString());

  });
})();
