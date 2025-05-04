document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('contributionsChart').getContext('2d');
  
  // Sample data - replace with actual data from API
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Monthly Contributions',
        data: [12000, 19000, 15000, 18000, 21000, 17000],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₱' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
  
  // In a real app, you would fetch this data from your API
  async function loadChartData() {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getChartData'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.values;
        chart.update();
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  }
  
  // Uncomment to load real data
  // loadChartData();
});