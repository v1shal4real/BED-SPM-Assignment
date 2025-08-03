window.onload = function () {
  // Helper: get patient ID from the URL
  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
  const patientId = localStorage.getItem('patientId');
  if (!patientId) {
    alert('Please sign up or log in first!');
    window.location.href = '/html/login.html';
  }
  const msgDiv = document.getElementById('msg');

  function showMessage(text, isError = false) {
    msgDiv.innerHTML = `<div style="color:${isError ? '#d8000c' : '#388e3c'};margin-bottom:8px;">${text}</div>`;
    setTimeout(() => { msgDiv.innerHTML = '' }, 3000);
  }

  function setProfileFields(profile) {
    document.getElementById('fullName').textContent = profile.FullName || '';
    document.getElementById('dob').textContent = profile.DateOfBirth ? profile.DateOfBirth.split('T')[0] : '';
    document.getElementById('phone').textContent = profile.ContactNumber || '';
    document.getElementById('email').textContent = profile.Email || '';
    document.getElementById('address').textContent = profile.Address || '';
  }

  if (patientId) {
    fetch(`http://localhost:3000/api/profile/${patientId}`)
      .then(res => res.json())
      .then(profile => {
        if (profile && !profile.error) {
          setProfileFields(profile);
        } else {
          showMessage('Profile not found!', true);
        }
      })
      .catch(err => showMessage('Error fetching profile.', true));
  } else {
    showMessage('No Patient ID in URL!', true);
  }

  window.editField = function (span) {
    if (span.querySelector('input')) return; // already editing
    const currentValue = span.textContent;
    const input = document.createElement('input');
    input.value = currentValue;
    input.style.width = '90%';
    input.onblur = function () {
      span.textContent = input.value;
    };
    input.onkeydown = function (e) {
      if (e.key === 'Enter') input.blur();
    };
    span.textContent = '';
    span.appendChild(input);
    input.focus();
  };

  const contactsTbody = document.getElementById('contactsTbody');
  const addContactBtn = document.getElementById('addContactBtn');

  // Fetch and display all contacts
  function fetchContacts() {
    fetch(`http://localhost:3000/api/emergency-contacts/${patientId}`)
      .then(res => res.json())
      .then(contacts => {
        contactsTbody.innerHTML = '';
        contacts.forEach(contact => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="ec-edit" data-id="${contact.ContactID}" data-field="ContactName">${contact.ContactName}</td>
            <td class="ec-edit" data-id="${contact.ContactID}" data-field="Relationship">${contact.Relationship}</td>
            <td class="ec-edit" data-id="${contact.ContactID}" data-field="ContactNumber">${contact.ContactNumber}</td>
            <td>
              <button class="delete-btn" onclick="deleteContact(${contact.ContactID})">Delete</button>
            </td>
          `;
          contactsTbody.appendChild(row);
        });
      });
  }

  // Inline editing for contacts
  contactsTbody.addEventListener('click', function (event) {
    const cell = event.target;
    if (!cell.classList.contains('ec-edit')) return;

    if (cell.querySelector('input')) return;
    const currentValue = cell.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.style.width = "90%";
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    input.onblur = saveEdit;
    input.onkeydown = function (e) {
      if (e.key === 'Enter') input.blur();
    };

    function saveEdit() {
      const newValue = input.value.trim();
      const contactId = cell.getAttribute('data-id');
      const field = cell.getAttribute('data-field');
      cell.textContent = newValue;

      // PUT update to backend
      fetch(`http://localhost:3000/api/emergency-contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      })
        .then(res => res.json())
        .then(data => {
          showMessage('Contact updated!');
        })
        .catch(err => showMessage('Failed to update contact', true));
    }
  });

  // Add a new contact
  addContactBtn.onclick = function () {
    const name = document.getElementById('newContactName').value.trim();
    const relationship = document.getElementById('newContactRelationship').value.trim();
    const number = document.getElementById('newContactNumber').value.trim();
    if (!name || !relationship || !number) {
      showMessage('Please fill in all emergency contact fields.', true);
      return;
    }
    fetch('http://localhost:3000/api/emergency-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, name, relationship, contactNumber: number })
    }).then(() => {
      document.getElementById('newContactName').value = '';
      document.getElementById('newContactRelationship').value = '';
      document.getElementById('newContactNumber').value = '';
      fetchContacts();
    });
  };

  window.deleteContact = function (contactId) {
    fetch(`http://localhost:3000/api/emergency-contacts/${contactId}`, { method: 'DELETE' })
      .then(() => fetchContacts());
  };

  // Load contacts on page load
  if (patientId) fetchContacts();

  // --- Save profile changes ---
  document.getElementById('saveProfileBtn').onclick = async function () {
    function getFieldValue(id) {
      const el = document.getElementById(id);
      if (el.querySelector('input')) return el.querySelector('input').value;
      return el.textContent;
    }
    const updated = {
      fullName: getFieldValue('fullName'),
      dateOfBirth: getFieldValue('dob'),
      contactNumber: getFieldValue('phone'),
      email: getFieldValue('email'),
      address: getFieldValue('address')
    };

    try {
      const response = await fetch(`http://localhost:3000/api/profile/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const result = await response.json();
      if (response.ok) {
        showMessage('Changes saved!');
        setTimeout(() => {
          window.location.href = '/html/homepage.html';
        }, 1000);
      }
      else {
        showMessage(result.error || 'Update failed.', true);
      }
    } catch (err) {
      showMessage('Network error during save.', true);
    }
  };

  document.getElementById('logoutBtn').onclick = function () {
    localStorage.clear();
    alert('Logged out');
    window.location.href = '/html/login.html';
  };
};
