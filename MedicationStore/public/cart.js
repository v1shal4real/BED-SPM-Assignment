document.addEventListener("DOMContentLoaded", renderCart);

function renderCart() {
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!cart.length) {
    cartList.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "";
    return;
  }

  let total = 0;
  cartList.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${item.imageUrl || '/images/placeholder.png'}" class="cart-img" alt="${item.name}">
        <div class="cart-info">
          <div class="cart-name">${item.name}</div>
          <div class="cart-qty">
            Quantity:
            <input type="number" min="1" value="${item.qty}" class="cart-qty-input" data-id="${item.id}">
          </div>
          <div class="cart-price">S$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <button class="cart-remove" data-id="${item.id}">Remove</button>
      </div>
    `;
  }).join("");
  cartTotal.textContent = `Total: S$${total.toFixed(2)}`;

  // Quantity change
  document.querySelectorAll('.cart-qty-input').forEach(input => {
    input.addEventListener('change', function() {
      let newQty = parseInt(this.value, 10);
      if (isNaN(newQty) || newQty < 1) newQty = 1;
      const id = Number(this.dataset.id);
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const item = cart.find(i => i.id === id);
      if (item) item.qty = newQty;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
  });

  // Remove button
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = Number(this.dataset.id);
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart = cart.filter(i => i.id !== id);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
  });
}