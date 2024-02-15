/**draw vertical picometer
* to IN audio
* permission to client for devices in 
* rec audio and post to py
*/

const canvas = document.getElementById("grap-pic");
const context = canvas.getContext("2d");
const sensibilidad = 1.2;

let mediaRecorder; 
let chunks = []; 
let isRecording = false; 

function audioStream() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw() {
                analyser.getByteFrequencyData(dataArray);

                const amplitud = Math.max(...dataArray) / 255;
                const ancho = canvas.width * amplitud * sensibilidad;

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = "green";
                context.fillRect(0, 0, ancho, canvas.height);

                requestAnimationFrame(draw);

                const audioData = dataArray.buffer;
               
            }
            draw();

        })
        .catch(function (err) {
        });
}
audioStream();

function startRecording() {
  const constraints = { audio: true };
  navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          chunks = [];
          isRecording = true;
          document.getElementById("recordButton").innerText = "Stop Rec";
          document.getElementById("recordButton").classList.add("btn-danger");
          mediaRecorder.addEventListener("dataavailable", function (event) {
              chunks.push(event.data);
          });
      })
      .catch(function (err) {
          console.error(err);
      });
}

function stopRecording() {
  if (isRecording) {
      mediaRecorder.stop();
      mediaRecorder.addEventListener("stop", function () {
          isRecording = false;
          document.getElementById("recordButton").innerText = "Start Rec";
          document.getElementById("recordButton").classList.remove("btn-danger");
          saveRecording(); 
      });
  }
}

function saveRecording() {
  const blob = new Blob(chunks, { type: 'audio/wav' });
  const formData = new FormData();
  formData.append('recording', blob);
  fetch('/save_recording', {
      method: 'POST',
      body: formData
  })
      .then(response => {
          if (response.ok) {
              console.log('.wav guardado con exito');
          } else {
              console.error('Error guardando .wav');
          }
      })
      .catch(error => {
          console.error('error solicitud', error);
      });
}

const recordButton = document.getElementById("recordButton");
recordButton.addEventListener("click", function () {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
})


