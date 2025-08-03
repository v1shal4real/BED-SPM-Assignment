const communityModel = require("../model/communityModel");

// Get all messages by category
async function getMessagesByCategory(req, res) {
  try {
    const category = req.params.category || "General";
    const messages = await communityModel.getMessagesByCategory(category);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving messages" });
  }
}

// Post new message
async function createMessage(req, res) {
  try {
    const { PatientID, Content, Category } = req.body;
    if (!PatientID || !Content || !Content.trim() || !Category) {
      return res.status(400).json({ error: "All fields required." });
    }
    const msg = await communityModel.createMessage({ PatientID, Content, Category });
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: "Error posting message" });
  }
}

// Delete a message (only by owner)
async function deleteMessage(req, res) {
  try {
    const messageID = parseInt(req.params.id, 10);
    const { PatientID } = req.body;
    if (isNaN(messageID) || !PatientID) {
      return res.status(400).json({ error: "Invalid message or user" });
    }
    const success = await communityModel.deleteMessage(messageID, PatientID);
    if (!success) {
      return res.status(403).json({ error: "Cannot delete this message" });
    }
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting message" });
  }
}

module.exports = {
  getMessagesByCategory,
  createMessage,
  deleteMessage
};
