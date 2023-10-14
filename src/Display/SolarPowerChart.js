import Chart from 'chart.js';

const createChart = (chartRef, data) => {
  if (chartRef) {
    const ctx = chartRef.getContext('2d');
    
    new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
};

export default createChart;
