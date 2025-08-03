const params = new URLSearchParams(window.location.search);
const patientId = params.get('patientId');

document.addEventListener('DOMContentLoaded', async () => {
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    alert('No patient ID found. Please log in.');
    // Optionally redirect to login
    return;
  }
  // Fetch and prefill emergency info
  const res = await fetch(`/api/emergency-info/${patientId}`);
  if (res.ok) {
    const info = await res.json();
    document.getElementById('patientName').value = info?.FullName || '';
    document.getElementById('dob').value = info?.DateOfBirth ? info.DateOfBirth.slice(0,10) : '';
    document.getElementById('bloodType').value = info?.BloodType || '';
    document.getElementById('chronic').value = info?.ChronicConditions || '';
    document.getElementById('allergies').value = info?.Allergies || '';
    document.getElementById('doctorEmail').value = info?.DoctorEmail || '';
  }

  // Save handler (Create or Update)
  document.querySelector('.btn').addEventListener('click', async function (e) {
    e.preventDefault();

    const data = {
      dateOfBirth: document.getElementById('dob').value,
      bloodType: document.getElementById('bloodType').value,
      chronicConditions: document.getElementById('chronic').value,
      allergies: document.getElementById('allergies').value,
      doctorEmail: document.getElementById('doctorEmail').value,
    };

    const res = await fetch(`/api/emergency-info/${patientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert('Emergency info saved!');
      // Optionally redirect after save:
      // window.location.href = `/html/patient-profile.html?patientId=${patientId}`;
      location.reload();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Unable to save'));
    }
  });

  // Delete handler
  const delBtn = document.getElementById('deleteInfoBtn');
  if (delBtn) {
    delBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      if (!confirm('Are you sure you want to delete this info?')) return;
      const res = await fetch(`/api/emergency-info/${patientId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Info deleted!');
        location.reload();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Unable to delete'));
      }
    });
  }
});
