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
      localStorage.setItem('userRole', data.role); 
      localStorage.setItem('userId', data.userId); 
      alert('Login successful!');
      if (data.role === 'patient') {
        localStorage.setItem('patientId', data.id);
        console.log('Redirecting to homepage.html');
        window.location.href = '/html/homepage.html';
      } else if (data.role === 'doctor') {
        console.log('Redirecting to doctor homepage');
        window.location.href = '/html/doctor-homepage.html';
      } else if (data.role === 'admin') {
        console.log('Redirecting to admin homepage');
        window.location.href = '../html/CreateDoctor.html';
      } else {
        console.log('No role match, role is:', data.role);
        alert('Unknown user role: ' + data.role);
      }
    } else {
      alert(data.message || 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('Network error. Please try again.');
  }
});
//REMOVE THIS AFTER DEBUGGING
console.log('Email:', email);
console.log('User found:', user);
console.log('Password entered:', password);
console.log('Password hash in DB:', user?.PasswordHash);
console.log('Response status:', res.status);


