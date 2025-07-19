const emergencyContactModel = require('../models/emergencyContactModel');

exports.getContacts = async (req, res) => {
  const { patientId } = req.params;
  try {
    const contacts = await emergencyContactModel.getContactsByPatientId(patientId);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await emergencyContactModel.getAllContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all contacts.' });
  }
};


exports.addContact = async (req, res) => {
  try {
    await emergencyContactModel.addContact(req.body);
    res.status(201).json({ message: 'Contact added.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add contact.' });
  }
};

exports.updateContact = async (req, res) => {
  try {
    await emergencyContactModel.updateContact(req.params.contactId, req.body);
    res.json({ message: 'Contact updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contact.' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await emergencyContactModel.deleteContact(req.params.contactId);
    res.json({ message: 'Contact deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact.' });
  }
};
