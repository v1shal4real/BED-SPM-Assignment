const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Create a message
async function createMessage(data) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      INSERT INTO CommunityMessages (PatientID, Content, Category)
      VALUES (@PatientID, @Content, @Category);
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const req = connection.request();
    req.input("PatientID", data.PatientID);
    req.input("Content", data.Content);
    req.input("Category", data.Category || "General");
    const result = await req.query(query);
    const newId = result.recordset[0].id;
    return await getMessageById(newId);
  } catch (error) {
    throw error;
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
}

// Get all messages in a category (newest first)
async function getMessagesByCategory(category) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT m.MessageID, m.PatientID, p.FullName AS PatientName, m.Content, m.CreatedAt, m.Category
      FROM CommunityMessages m
      JOIN Patients p ON m.PatientID = p.PatientID
      WHERE m.Category = @category
      ORDER BY m.CreatedAt DESC
    `;
    const req = connection.request();
    req.input("category", category);
    const result = await req.query(query);
    return result.recordset;
  } catch (error) { throw error; }
  finally { if (connection) try { await connection.close(); } catch (e) {} }
}

// Get one message by ID (for confirmation)
async function getMessageById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      SELECT m.MessageID, m.PatientID, p.FullName AS PatientName, m.Content, m.CreatedAt, m.Category
      FROM CommunityMessages m
      JOIN Patients p ON m.PatientID = p.PatientID
      WHERE m.MessageID = @id
    `;
    const req = connection.request();
    req.input("id", id);
    const result = await req.query(query);
    return result.recordset[0] || null;
  } catch (error) {
    throw error;
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
}

// Delete message (only allow by PatientID or admin)
async function deleteMessage(messageID, patientID) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const query = `
      DELETE FROM CommunityMessages WHERE MessageID = @msgID AND PatientID = @patientID
    `;
    const req = connection.request();
    req.input("msgID", messageID);
    req.input("patientID", patientID);
    const result = await req.query(query);
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw error;
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
}

module.exports = {
  createMessage,
  getMessagesByCategory,
  getMessageById,
  deleteMessage
};
