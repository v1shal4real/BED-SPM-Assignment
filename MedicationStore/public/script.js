// public/script.js
const medsListDiv  = document.getElementById("medsList");
const fetchMedsBtn = document.getElementById("fetchMedsBtn");
const messageDiv   = document.getElementById("message");
const apiBase      = "http://localhost:3000";

async function fetchMedications() {
  try {
    medsListDiv.innerHTML = "Loading…";
    messageDiv.textContent = "";

    const res = await fetch(`${apiBase}/medications`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || res.statusText);
    }

    const meds = await res.json();
    medsListDiv.innerHTML = "";

    if (meds.length === 0) {
      medsListDiv.innerHTML = "<p>No medications found.</p>";
      return;
    }

    meds.forEach((m) => {
      const d = document.createElement("div");
      d.classList.add("med-card");
      d.innerHTML = `
        <h4>${m.name}</h4>
        <p>${m.description}</p>
        <p><strong>Price:</strong> $${m.price}</p>
      `;
      medsListDiv.appendChild(d);
    });
  } catch (err) {
    console.error("Fetch error:", err);
    medsListDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

fetchMedsBtn.addEventListener("click", fetchMedications);
window.addEventListener("load",    fetchMedications);
