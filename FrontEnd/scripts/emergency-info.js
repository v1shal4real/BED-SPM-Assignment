// Get patientId from the query string (e.g., ?patientId=11)
const params = new URLSearchParams(window.location.search);
const patientId = params.get('patientId');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  // Defensive: Ensure patientId is present
  if (!patientId) {
    alert("Missing patient ID in URL!");
    return;
  }

  // Fetch and prefill emergency info
  try {
    const res = await fetch(`/api/emergency-info/${patientId}`);
    if (res.ok) {
      const info = await res.json();
      document.getElementById('patientName').value = info?.FullName || '';
      document.getElementById('dob').value = info?.DateOfBirth ? info.DateOfBirth.slice(0,10) : '';
      document.getElementById('bloodType').value = info?.BloodType || '';
      document.getElementById('chronic').value = info?.ChronicConditions || '';
      document.getElementById('allergies').value = info?.Allergies || '';
      document.getElementById('doctorEmail').value = info?.DoctorEmail || '';
    } else {
      // Could show a message if info is not found, but keep the form empty for creation
      console.log("No emergency info found for patient.");
    }
  } catch (err) {
    alert("Error fetching emergency info.");
    console.error(err);
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

    try {
      const res = await fetch(`/api/emergency-info/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert('Emergency info saved!');
        location.reload();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Unable to save'));
      }
    } catch (err) {
      alert('Error saving emergency info.');
      console.error(err);
    }
  });

  // Delete handler
  const delBtn = document.getElementById('deleteInfoBtn');
  if (delBtn) {
    delBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      if (!confirm('Are you sure you want to delete this info?')) return;
      try {
        const res = await fetch(`/api/emergency-info/${patientId}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Info deleted!');
          location.reload();
        } else {
          const err = await res.json();
          alert('Error: ' + (err.error || 'Unable to delete'));
        }
      } catch (err) {
        alert('Error deleting emergency info.');
        console.error(err);
      }
    });
  }
});
