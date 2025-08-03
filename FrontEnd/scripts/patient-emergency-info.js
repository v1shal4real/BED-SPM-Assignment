document.addEventListener('DOMContentLoaded', async () => {
  // Get patientId from localStorage (assuming it's set after login)
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    alert('No patient ID found. Please log in again.');
    window.location.href = 'login.html';
    return;
  }

  // Fetch emergency info from the server
  try {
    const res = await fetch(`/api/emergency-info/${patientId}`);
    if (!res.ok) throw new Error();

    const info = await res.json();
    document.getElementById('patientName').textContent = info?.FullName || '—';
    document.getElementById('dob').textContent = info?.DateOfBirth ? info.DateOfBirth.slice(0,10) : '—';
    document.getElementById('bloodType').textContent = info?.BloodType || '—';
    document.getElementById('chronic').textContent = info?.ChronicConditions || '—';
    document.getElementById('allergies').textContent = info?.Allergies || '—';
    document.getElementById('doctorEmail').textContent = info?.DoctorEmail || '—';
  } catch {
    alert('Unable to load your emergency information.');
  }
});
