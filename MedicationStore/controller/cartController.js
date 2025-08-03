const cartModel = require('../model/cartModel');

// Add or update (upsert) a medication in the cart
exports.addOrUpdateCart = async (req, res) => {
  let { userId, medicationId, name, price, imageUrl, quantity = 1 } = req.body;
  medicationId = Number(medicationId); // Ensure it's a number
  quantity = Number(quantity);

  try {
    const items = await cartModel.getItems(userId);
    // Compare as numbers
    const existingItem = items.find(item => Number(item.medicationId) === medicationId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      await cartModel.updateItem(userId, medicationId, newQty);
      return res.json({ message: 'Cart updated', medicationId, quantity: newQty });
    }

    await cartModel.addItem(userId, medicationId, name, price, imageUrl, quantity);
    return res.status(201).json({ message: 'Added to cart', medicationId, quantity });
  } catch (err) {
    console.error('addOrUpdateCart error:', err);
    res.status(500).json({ error: err.message || 'addOrUpdateCart failed' });
  }
};

// Get all items in a user's cart
exports.getCart = async (req, res) => {
  const { userId } = req.params;
  try {
    const items = await cartModel.getItems(userId);
    res.json(items);
  } catch (err) {
    console.error('getCart error:', err);
    res.status(500).json({ error: 'Cannot fetch cart items' });
  }
};

// Manually update the quantity of a cart item
exports.updateCart = async (req, res) => {
  const { userId, medicationId, quantity } = req.body;
  try {
    await cartModel.updateItem(userId, medicationId, quantity);
    res.json({ message: 'Cart item updated', medicationId, quantity });
  } catch (err) {
    console.error('updateCart error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// Remove an item from the cart
exports.removeFromCart = async (req, res) => {
  const { userId, medicationId } = req.body;
  try {
    await cartModel.deleteItem(userId, medicationId);
    res.json({ message: 'Removed from cart', medicationId });
  } catch (err) {
    console.error('removeFromCart error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
};