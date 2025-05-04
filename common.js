// API Configuration
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";

// Common Functions
function showMessage(elementId, message, isSuccess = true) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `message ${isSuccess ? 'success' : 'error'}`;
  element.style.display = 'block';
  
  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

// Toggle Password Visibility
document.addEventListener('DOMContentLoaded', function() {
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');
  
  togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
    });
  });
  
  // Check if user is logged in
  if (window.location.pathname !== '/index.html' && window.location.pathname !== '/register.html') {
    const user = localStorage.getItem('sinkingFundUser');
    if (!user) {
      window.location.href = 'index.html';
    } else {
      // Display username and set admin link visibility
      const userData = JSON.parse(user);
      if (document.getElementById('usernameDisplay')) {
        document.getElementById('usernameDisplay').textContent = `Welcome, ${userData.username}`;
      }
      if (document.getElementById('adminLink') && userData.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
      }
    }
  }
  
  // Logout button
  if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function() {
      localStorage.removeItem('sinkingFundUser');
      window.location.href = 'index.html';
    });
  }
});