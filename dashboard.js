document.addEventListener('DOMContentLoaded', async () => {
  // Check login
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Show admin link if admin
  if (user.role === 'admin') {
    document.getElementById('adminLink').style.display = 'block';
  }

  // Load dashboard data
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getDashboardData' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('totalMembers').textContent = data.totalMembers;
      document.getElementById('currentBalance').textContent = `₱${data.currentBalance.toFixed(2)}`;
      document.getElementById('monthlyContributions').textContent = `₱${data.monthlyContributions.toFixed(2)}`;
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }

  // Load chart data
  initChart();
});

async function initChart() {
  const ctx = document.getElementById('contributionsChart').getContext('2d');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getContributionsChart' })
    });
    
    const data = await response.json();
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Contributions',
          data: data.values || [12000, 19000, 15000, 18000, 21000, 17000],
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => '₱' + value
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to load chart data:', error);
  }
}