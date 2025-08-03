const sql = require('mssql');
const dbConfig = require("../../dbConfig");

// Add or upsert item to cart
async function addItem(userId, medicationId, name, price, imageUrl, quantity = 1) {
  try {
    await sql.connect(dbConfig);

    // Check for existing entry
    const { recordset } = await sql.query`
      SELECT Quantity
      FROM CartItems
      WHERE UserId = ${userId} 
        AND MedicationId = ${medicationId}`;

    if (recordset.length) {
      // If already exists, update quantity
      const newQty = recordset[0].Quantity + quantity;
      await sql.query`
        UPDATE CartItems
        SET Quantity = ${newQty}
        WHERE UserId = ${userId}
          AND MedicationId = ${medicationId}`;
    } else {
      // Insert new row
      await sql.query`
        INSERT INTO CartItems (UserId, MedicationId, Name, Price, ImageUrl, Quantity)
        VALUES (${userId}, ${medicationId}, ${name}, ${price}, ${imageUrl}, ${quantity})`;
    }
  } finally {
    await sql.close();
  }
}

// Get all items in user's cart
async function getItems(userId) {
  try {
    await sql.connect(dbConfig);

    const result = await sql.query`
      SELECT Id, MedicationId, Name, Price, ImageUrl, Quantity
      FROM CartItems
      WHERE UserId = ${userId}
      ORDER BY Id DESC`;

    return result.recordset;
  } finally {
    await sql.close();
  }
}

// Update quantity of a cart item
async function updateItem(userId, medicationId, quantity) {
  try {
    await sql.connect(dbConfig);

    await sql.query`
      UPDATE CartItems
      SET Quantity = ${quantity}
      WHERE UserId = ${userId}
        AND MedicationId = ${medicationId}`;
  } finally {
    await sql.close();
  }
}

// Remove an item from cart
async function deleteItem(userId, medicationId) {
  try {
    await sql.connect(dbConfig);

    await sql.query`
      DELETE FROM CartItems
      WHERE UserId = ${userId}
        AND MedicationId = ${medicationId}`;
  } finally {
    await sql.close();
  }
}

module.exports = {
  addItem,
  getItems,
  updateItem,
  deleteItem
};