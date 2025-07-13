const form = document.getElementById('createMedForm');
const msg  = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Creating…';

  const data = {
    name:        form.name.value.trim(),
    description: form.description.value.trim(),
    price:       parseFloat(form.price.value)
  };

  try {
    const res = await fetch('/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create');
    }

    const created = await res.json();
    msg.style.color = 'green';
    msg.textContent = `Created medication with ID ${created.id}`;
    form.reset();
  } catch (err) {
    msg.style.color = 'red';
    msg.textContent = err.message;
  }
});