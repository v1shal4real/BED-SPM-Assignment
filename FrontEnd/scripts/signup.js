// signup.js

document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Gather values from form
  const fullName = document.getElementById('fullName').value;
  const dateOfBirth = document.getElementById('dob').value;
  const contactNumber = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;
  const password = document.getElementById('password').value;

  // Construct payload
  const payload = {
    fullName,
    dateOfBirth,
    contactNumber,
    email,
    address,
    password
  };

  try {
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem('patientId', result.patientId);
      alert('Sign up successful!');
      window.location.href = "/profile.html?id=" + result.patientId;
    } else {
      alert(result.error || 'Sign up failed.');
    }
  } catch (error) {
    alert('Network error during sign up.');
    console.error(error);

  }
});

