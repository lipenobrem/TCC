document.addEventListener('DOMContentLoaded', () => {
    const commonOptions = {
        type: 'line',
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    };

    const temperatureData = {
        labels: [],
        datasets: [{
            label: 'Temperatura do Solo (°C)',
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
            borderWidth: 1,
        }]
    };

    const phData = {
        labels: [],
        datasets: [{
            label: 'pH do Solo',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    // Configuração dos gráficos usando Chart.js
    var tempCtx = document.getElementById('temperature-chart').getContext('2d');
    var temperatureChart = new Chart(tempCtx, {
        ...commonOptions,
        data: temperatureData
    });

    var humidityCtx = document.getElementById('humidity-chart').getContext('2d');
    var humidityChart = new Chart(humidityCtx, {
        ...commonOptions,
        data: humidityData
    });

    var phCtx = document.getElementById('ph-chart').getContext('2d');
    var phChart = new Chart(phCtx, {
        ...commonOptions,
        data: phData,
        options: {
            ...commonOptions.options,
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 14
                }
            }
        }
    });

    // Conecta ao WebSocket
    const socket = new WebSocket('ws://<ESP32_IP_ADDRESS>:<PORT>'); 
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);

        const currentTime = new Date().toLocaleTimeString();

        // Atualiza os dados dos gráficos
        temperatureChart.data.labels.push(currentTime);
        temperatureChart.data.datasets[0].data.push(data.temperature);
        temperatureChart.update();

        humidityChart.data.labels.push(currentTime);
        humidityChart.data.datasets[0].data.push(data.humidity);
        humidityChart.update();

        phChart.data.labels.push(currentTime);
        phChart.data.datasets[0].data.push(data.ph);
        phChart.update();

        // Limita o número de pontos no gráfico
        if (temperatureChart.data.labels.length > 20) {
            temperatureChart.data.labels.shift();
            temperatureChart.data.datasets[0].data.shift();
        }

        if (humidityChart.data.labels.length > 20) {
            humidityChart.data.labels.shift();
            humidityChart.data.datasets[0].data.shift();
        }

        if (phChart.data.labels.length > 20) {
            phChart.data.labels.shift();
            phChart.data.datasets[0].data.shift();
        }
    };
});
