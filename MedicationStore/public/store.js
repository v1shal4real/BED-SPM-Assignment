const apiBase     = "";      // same‐origin
const medsListDiv = document.getElementById("medsList");
const messageDiv  = document.getElementById("message");

// helper to read ?id=…
function qsParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function showNotification(message, type = "success", duration = 3000) {
  const el = document.getElementById("notification");
  el.textContent = message;
  el.className = `notification ${type} show`;

  // auto-hide
  setTimeout(() => {
    el.classList.remove("show");
    el.classList.add("hidden");
  }, duration);
}

// 1) LIST page
async function fetchMedications() {
  medsListDiv.innerHTML = "Loading…";
  try {
    const res = await fetch(`${apiBase}/medications`);
    if (!res.ok) throw new Error(await res.text());
    const meds = await res.json();
    medsListDiv.innerHTML = meds.length
      ? meds.map(m => `
          <div class="category-block" data-id="${m.id}">
            <div class="category-item">
              <div class="category-image-container">
                <img
                  src="${m.imageUrl || '/images/placeholder.png'}"
                  alt="${m.name}"
                  class="category-img"
                  style="cursor:pointer"
                />
              </div>
            </div>
            <div class="category-content">
              <h3 class="category-title">${m.name}</h3>
              <p class="category-description">${m.description || ''}</p>
              <div class="delivery-info">
                <i class="bx bx-package"></i> Same day delivery
              </div>
              <a href="#" class="add-to-cart-btn" 
                data-id="${m.id}" 
                data-name="${m.name}" 
                data-price="${m.price}" 
                data-image="${m.imageUrl || '/images/placeholder.png'}"
                style="cursor:pointer"
              >Add to Cart</a>
              <div class="category-price">
                S$${parseFloat(m.price).toFixed(2)}
              </div>
            </div>
          </div>
        `).join("")
      : "<p>No medications found.</p>";

    // Only image is clickable for edit
    document.querySelectorAll(".category-block").forEach(card => {
      const img = card.querySelector(".category-img");
      if (img) {
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = card.dataset.id;
          window.location.href = `/store-edit.html?id=${id}`;
        });
      }
    });

    // Add to Cart button handler (localStorage version)
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const id = Number(this.dataset.id);
        const name = this.dataset.name;
        const price = Number(this.dataset.price);
        const imageUrl = this.dataset.image;
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(item => item.id === id);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({ id, name, price, imageUrl, qty: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        // window.location.href = "/cart.html"; // <-- Remove or comment out this line
        showNotification("Added to cart!", "success", 1200); // Optional: show a notification
      });
    });

  } catch (err) {
    medsListDiv.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

// 2) EDIT page: populate form
async function populateEditForm(id) {
  try {
    const res = await fetch(`${apiBase}/medications/${id}`);
    if (!res.ok) throw new Error(await res.text());
    const m = await res.json();

    document.getElementById("med-name").value = m.name;
    document.getElementById("med-description").value = m.description;
    document.getElementById("med-price").value = m.price;

    // append hidden existingImageUrl
    const form = document.getElementById("editMedForm");
    let h = form.querySelector("input[name=existingImageUrl]");
    if (!h) {
      h = document.createElement("input");
      h.type = "hidden";
      h.name = "existingImageUrl";
      form.appendChild(h);
    }
    h.value = m.imageUrl || "";
  } catch (err) {
    alert("Error loading medication: " + err.message);
  }
}

// 3) EDIT page: submit
function handleEditSubmit(id) {
  const form = document.getElementById("editMedForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const res = await fetch(`/medications/${id}`, {
        method: "PUT",
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification("Medication updated successfully!", "success", 1200);
      setTimeout(() => {
        location.href = "/store.html";
      }, 1200);
    } catch (err) {
      showNotification("Update failed: " + err.message, "error", 3000);
    }
  });
}

// 4) EDIT page: delete
function handleDelete(id) {
  document.getElementById("deleteMedBtn").addEventListener("click", async () => {
    if (!confirm("Delete this medication?")) return;
    try {
      const res = await fetch(`/medications/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification("Medication deleted successfully!", "success", 1200);
      setTimeout(() => {
        location.href = "/store.html";
      }, 1200);
    } catch (err) {
      showNotification("Delete failed: " + err.message, "error", 3000);
    }
  });
}

// 5) ADD page: submit
function handleAddSubmit() {
  const form = document.getElementById("addMedForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      const res = await fetch("/medications", {
        method: "POST",
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification("Medication added successfully!", "success", 1200);
      setTimeout(() => {
        location.href = "/store.html";
      }, 1200);
    } catch (err) {
      showNotification("Failed to add medication: " + err.message, "error", 3000);
    }
  });
}

// MAIN: Only one DOMContentLoaded listener for all pages
document.addEventListener("DOMContentLoaded", () => {
  // LIST page
  if (medsListDiv) {
    fetchMedications();
  }

  // ADD page
  handleAddSubmit();

  // EDIT page
  const editForm = document.getElementById("editMedForm");
  if (editForm) {
    const id = qsParam("id");
    if (!id) {
      alert("No medication ID in URL");
      return;
    }
    populateEditForm(id);
    handleEditSubmit(id);
    handleDelete(id);
  }
});