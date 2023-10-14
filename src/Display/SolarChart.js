import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import CSV from '../CSV/PV_Elec_Gas3.csv';

function SolarPowerGraph() {
  const [data, setData] = useState([]);
  const [timeInterval, setTimeInterval] = useState('daily');
  const chartRef = React.createRef();
  let myChart = null;

  // Fetch and parse the CSV data
  useEffect(() => {
    fetch(CSV)
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        const rowsData = rows.slice(1).map((row) => {
          const values = row.split(',');
          const rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });
          return rowData;
        });

        // Debug: Log the loaded data
        console.log('Loaded Data:', rowsData);

        setData(rowsData);
      });
  }, []);

  // Generate or update the chart when data or time interval changes
  useEffect(() => {
    if (chartRef.current) {
      if (myChart) {
        myChart.destroy();
      }
      myChart = generateGraph(data, timeInterval);
    }

    // Cleanup when the component unmounts
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, [data, timeInterval]);

  const generateGraph = (data, timeInterval) => {
    if (!data.length) {
      return null; // Do not create a chart if data is empty
    }

    const chartData = processData(data, timeInterval);

    // Debug: Log the chart data
    console.log('Chart Data:', chartData);

    return new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: `Solar Power Production (${timeInterval})`,
            data: chartData.values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
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
  };

  const processData = (data, timeInterval) => {
    let labels = [];
    let values = [];
  
    if (timeInterval === 'daily') {
      // Process daily data (same as before)
      data = data.slice(-30); // Get the last 30 days of data

      data.forEach((entry) => {
        labels.push(entry.date); // Use the 'date' field
        values.push(parseFloat(entry['kWh electricity/day'])); // Convert 'kWh electricity/day' to a numeric value
      });
  
    }
    else if (timeInterval === 'weekly') {
        // Process weekly data (average for each week) for the last 52 weeks
        const last365DaysData = data.slice(-365); // Get the last 365 days of data
      
        let currentWeek = [];
        let currentDate = '';
        let sum = 0;
        let count = 0;
      
        last365DaysData.forEach((entry) => {
          const date = entry.date;
          const value = parseFloat(entry['kWh electricity/day']);
      
          if (date !== currentDate) {
            // If a new week starts, calculate the average for the previous week
            if (currentWeek.length > 0) {
              const weekAverage = sum / count;
              labels.push(currentDate); // Use the start date of the week
              values.push(weekAverage);
      
              // Reset for the new week
              currentWeek = [];
              currentDate = date;
              sum = 0;
              count = 0;
            }
          }
      
          // Add daily data to the current week
          currentWeek.push(value);
          sum += value;
          count += 1;
        });
      
        // Calculate the average for the last week (if there's data)
        if (currentWeek.length > 0) {
          const weekAverage = sum / count;
          labels.push(currentDate); // Use the start date of the last week
          values.push(weekAverage);
        }
      }
      
       else if (timeInterval === 'monthly') {
      // Process monthly data (average for each month)
      data = data.slice(-365); // Get the last 12 months of data

      let currentMonth = '';
      let sum = 0;
      let count = 0;
  
      data.forEach((entry) => {
        const date = entry.date;
        const value = parseFloat(entry['kWh electricity/day']);
        const month = date.split('/')[1];
  
        if (month !== currentMonth) {
          // If a new month starts, calculate the average for the previous month
          if (count > 0) {
            const monthAverage = sum / count;
            labels.push(currentMonth);
            values.push(monthAverage);
          }
  
          // Start a new month
          currentMonth = month;
          sum = value;
          count = 1;
        } else {
          // Continue adding to the current month
          sum += value;
          count += 1;
        }
      });
  
      // Don't forget to calculate the average for the last month
      if (count > 0) {
        const monthAverage = sum / count;
        labels.push(currentMonth);
        values.push(monthAverage);
      }
    } else if (timeInterval === 'yearly') {
      // Process yearly data (average for each year)
      let currentYear = '';
      let sum = 0;
      let count = 0;
  
      data.forEach((entry) => {
        const date = entry.date;
        const value = parseFloat(entry['kWh electricity/day']);
        const year = date.split('/')[2];
  
        if (year !== currentYear) {
          // If a new year starts, calculate the average for the previous year
          if (count > 0) {
            const yearAverage = sum / count;
            labels.push(currentYear);
            values.push(yearAverage);
          }
  
          // Start a new year
          currentYear = year;
          sum = value;
          count = 1;
        } else {
          // Continue adding to the current year
          sum += value;
          count += 1;
        }
      });
  
      // Don't forget to calculate the average for the last year
      if (count > 0) {
        const yearAverage = sum / count;
        labels.push(currentYear);
        values.push(yearAverage);
      }
    }
  
    return { labels, values };
  };
  
  

  return (
    <div>
      <select
        value={timeInterval}
        onChange={(e) => setTimeInterval(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <canvas ref={chartRef} width="400" height="200"></canvas>
    </div>
  );
}

export default SolarPowerGraph;
