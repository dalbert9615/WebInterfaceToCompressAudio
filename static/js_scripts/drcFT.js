/**graphic Function transfer of DRC
 * output=threshold+((input+threshold)/ratio)
 */

var options = {

    scales: {
        xAxes: [
            {
                ticks: {
                    min: -60,
                    max: 60
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Input [dB]',
                }
            }
        ],
        yAxes: [
            {
                ticks: {
                    min: -60,
                    max: 60,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Output [dB]',
                }
            }
        ]
    }
};

var ctx = document.getElementById('compress').getContext('2d');

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from(Array(241).keys()).map(x => x - 120),
        datasets: [
            {
                label: 'Compress',
                data: [],
                borderColor: 'black',
                borderWidth: 2,
                fill: false
            },
        ]
    },
    options: options,
});

var thresholdSlider = document.getElementById('threshold');
var ratioSlider = document.getElementById('ratio');

thresholdSlider.addEventListener('input', updateChart);
ratioSlider.addEventListener('input', updateChart);

function updateChart() {
    var th = -thresholdSlider.value;
    var ratio = ratioSlider.value;

    var compresion = [];
    for (var i = -120; i <= th; i++) {
        compresion.push(i);
    }
    for (var i = th + 1; i <= 120; i++) {
        compresion.push(th + (i - th) / ratio);
    }

    myChart.data.datasets[0].data = compresion;

    myChart.update();
}

updateChart();





