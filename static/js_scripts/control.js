/**managment of controls -> flask py*/

const thresholdFromSlider = document.getElementById('threshold');
const ratioFromSlider = document.getElementById('ratio');
const responseFromSlider = document.getElementById('response');
const gainFromSlider = document.getElementById('gain');
const lookaheadFromSlider = document.getElementById('lookahead');
const rmspeakFromSelector = document.getElementById('rmspeak');

const radioGroup = document.querySelector('.radio-group');
const radios = radioGroup.querySelectorAll('input[type="radio"]');

const startCompressFromButton = document.getElementById('startCompress');
const progressBar = document.getElementById('progressBar');
const descargarBtn = document.getElementById('descargar-btn');


thresholdFromSlider.addEventListener('input', () => {
  fetch(`/control_puredata?threshold=${thresholdFromSlider.value}`)
});

ratioFromSlider.addEventListener('input', () => {
  fetch(`/control_puredata?ratio=${ratioFromSlider.value}&ratio=${ratioFromSlider.value}`)
});

responseFromSlider.addEventListener('input', () => {
  fetch(`/control_puredata?response=${responseFromSlider.value}&response=${responseFromSlider.value}`)
});

gainFromSlider.addEventListener('input', () => {
  fetch(`/control_puredata?gain=${gainFromSlider.value}&gain=${gainFromSlider.value}`)
});

lookaheadFromSlider.addEventListener('input', () => {
  fetch(`/control_puredata?lookahead=${lookaheadFromSlider.value}&lookahead=${lookaheadFromSlider.value}`)
});

radios.forEach(radio => {
  radio.addEventListener('change', () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/rmspeak', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`mode=${radio.value}`);
  });
});

startCompressFromButton.addEventListener('click', () => {
  fetch('/compress', {
    method: 'POST'
  })
    .then(function (response) {
      if (response.ok) {
        iniciarProgressBar();
      }
    });
});

function habilitarDescargarBtn() {
  descargarBtn.disabled = false;
}

descargarBtn.addEventListener('click', () => {
  window.location.href = '/descargar_archivo';
});

function iniciarProgressBar() {
  var duracion = 0;
  var audioElement = new Audio('/static/audio/recording.wav');
  audioElement.addEventListener('loadedmetadata', () => {
    duracion = audioElement.duration;
    var progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    progressBar.setAttribute('aria-valuemax', duracion);
    var interval = setInterval(() => {
      var valorActual = parseFloat(progressBar.getAttribute('aria-valuenow'));
      if (valorActual < duracion) {
        var incremento = duracion * 0.01;
        var nuevoValor = valorActual + incremento;
        progressBar.style.width = (nuevoValor / duracion * 100) + '%';
        progressBar.setAttribute('aria-valuenow', nuevoValor);
      } else {
        clearInterval(interval);
        progressBar.style.width = '100%';
        fetch('/stop_compress', {
          method: 'POST'
        })
        habilitarDescargarBtn();
      }
    }, 100);
  });
  audioElement.load();
}

