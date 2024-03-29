'use strict';
const video = document.getElementById(`video`);

async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
  } catch (error) {
    console.error('Error loading models from local path:', error);
    // If loading from local path fails, try loading from GitHub
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(
        'https://aliscripter.github.io/Face-Recognize/models'
      );
      await faceapi.nets.faceLandmark68Net.loadFromUri(
        'https://aliscripter.github.io/Face-Recognize/models'
      );
      await faceapi.nets.faceRecognitionNet.loadFromUri(
        'https://aliscripter.github.io/Face-Recognize/models'
      );
      await faceapi.nets.faceExpressionNet.loadFromUri(
        'https://aliscripter.github.io/Face-Recognize/models'
      );
    } catch (error) {
      console.error('Error loading models from GitHub:', error);
    }
  }
}

loadModels().then(startVideo);

//!-------- get camera from user

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      video.width = videoWidth;
      video.height = videoHeight;
    };
  } catch (err) {
    console.error('Error accessing webcam:', err);
  }
}

//!-------- Recognize

video.addEventListener(`play`, () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});

startVideo();
