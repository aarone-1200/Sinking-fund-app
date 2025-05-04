const API_URL = import.meta.env.VITE_API_URL || "YOUR_APPS_SCRIPT_URL"; // Replace with your deployed web app URL

// Login function
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        data: { username, password }
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      if (result.user.needsPwChange) {
        window.location.href = 'change-password.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } else {
      alert(result.message || 'Login failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
});

// Registration function
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    fullName: document.getElementById('fullName').value,
    username: document.getElementById('regUsername').value,
    password: document.getElementById('regPassword').value,
    email: document.getElementById('email').value
  };
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        data
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Registration successful! Please login.');
      window.location.href = 'index.html';
    } else {
      alert(result.message || 'Registration failed');
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
});
