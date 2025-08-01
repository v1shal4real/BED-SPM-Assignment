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
      localStorage.setItem('patientId', data.patientId);
      alert('Login successful!');
      window.location.href = '/homepage.html';
    } else {
      alert(data.message || 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Network error. Please try again.');
  }
});

console.log('Email:', email);
console.log('User found:', user);
console.log('Password entered:', password);
console.log('Password hash in DB:', user?.PasswordHash);
console.log('Response status:', res.status);


