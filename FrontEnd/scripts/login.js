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

    // Debug logs
    console.log('Email:', email);
    console.log('API response:', data);
    console.log('Password entered:', password);
    console.log('Response status:', res.status);

    if (res.ok) {
      console.log('Login successful, storing data and redirecting...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);      
      localStorage.setItem('id', data.id);

      console.log('Stored role:', data.role);
      console.log('About to redirect...');

      if (data.role === 'patient') {
        localStorage.setItem('patientId', data.id);
        console.log('Redirecting to homepage.html');
        window.location.href = '/html/homepage.html';
      } else if (data.role === 'doctor') {
        console.log('Redirecting to doctor homepage');
        window.location.href = '/html/doctor-homepage.html';
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


