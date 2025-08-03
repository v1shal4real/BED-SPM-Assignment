document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);      
      localStorage.setItem('id', data.id);

      if (data.role === 'patient') {
        window.location.href = '/html/homepage.html';
      } else if (data.role === 'doctor') {
        window.location.href = '/html/homepage.html';
      }
    } else {
      alert(data.message || 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Network error. Please try again.');
  }
});

const bcrypt = require('bcryptjs');
const password = 'your_doctor_password';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log(hash); 
});

console.log('Email:', email);
console.log('Response status:', res.status);


