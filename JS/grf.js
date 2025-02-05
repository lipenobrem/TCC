document.addEventListener('DOMContentLoaded', () => {
    function updateChart(chart, label, data) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(data);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.update();
    }

    const temperatureData = {
        labels: [],
        datasets: [{
            label: 'Temperatura do Ar (°C)',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    const humidityData = {
        labels: [],
        datasets: [{
            label: 'Umidade do Solo (%)',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const tempCtx = document.getElementById('temperature-chart').getContext('2d');
    const temperatureChart = new Chart(tempCtx, {
        type: 'line',
        data: temperatureData,
        options: {
            scales: {
                x: { display: false },
                y: { beginAtZero: true, suggestedMin: 10, suggestedMax: 50 }
            }
        }
    });

    const humidityCtx = document.getElementById('humidity-chart').getContext('2d');
    const humidityChart = new Chart(humidityCtx, {
        type: 'line',
        data: humidityData,
        options: {
            scales: {
                x: { display: false },
                y: { beginAtZero: true, suggestedMin: 0, suggestedMax: 100 }
            }
        }
    });

    function fetchData() {
        fetch('#')
            .then(response => {
                if (!response.ok) throw new Error(`Erro na resposta do servidor: ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data);

                if (typeof data.temperature === 'number' && typeof data.umidadeSolo === 'number') {
                    const currentTime = new Date().toLocaleTimeString();
                    updateChart(temperatureChart, currentTime, data.temperature);
                    updateChart(humidityChart, currentTime, data.umidadeSolo);
                } else {
                    console.error('Dados incompletos recebidos:', data);
                }
            })
            .catch(error => {
                console.error('Erro ao obter os dados do servidor:', error.message);
            });
    }

    setInterval(fetchData, 5000); 
});
