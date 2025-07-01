document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Stop the form from submitting the usual way

  // Get input values
  const data = {
    fullName: document.getElementById('fullName').value,
    dob: document.getElementById('dob').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    address: document.getElementById('address').value,
    password: document.getElementById('password').value,
  };

  try {
    // Replace with your backend URL if not running on the same machine/port
    const response = await fetch('http://localhost:3000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      alert('Sign up successful!');
      // Optionally: reset form, redirect, etc.
      document.getElementById('signupForm').reset();
    } else {
      alert(result.error || 'Sign up failed.');
    }
  } catch (err) {
    alert('Error connecting to the server.');
  }
});