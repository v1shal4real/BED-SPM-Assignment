const appointmentModel = require("../model/ZcModels");

async function getAllAppointments(req, res) {
  try {
    const appointments = await appointmentModel.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving appointments" });
  }
}

// Filter by patient for view
async function getAppointmentsByPatientID(req, res) {
  try {
    const patientID = parseInt(req.params.id, 10);
    if (isNaN(patientID) || patientID <= 0) return res.status(400).json({ error: "Invalid patient ID" });
    const appointments = await appointmentModel.getAppointmentsByPatientID(patientID);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving appointments" });
  }
}

async function getAppointmentById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }
    const appointment = await appointmentModel.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error retrieving appointment" });
  }
}

// "Smart" logic for booking (prevents double-book, past slot)
async function createAppointment(req, res) {
  try {
    const { PatientID, AppointmentDateTime } = req.body;
    // Doctor assignment logic
    const last = await appointmentModel.getLastAppointmentByPatientID(PatientID);
    const DoctorID = last ? last.DoctorID : await appointmentModel.getRandomDoctorID();
    // Prevent booking in the past
    if (new Date(AppointmentDateTime) < new Date()) {
      return res.status(400).json({ error: "Cannot book a past date/time." });
    }
    // Prevent double booking
    const available = await appointmentModel.isSlotAvailable(AppointmentDateTime, DoctorID);
    if (!available) {
      return res.status(400).json({ error: "This slot is already booked." });
    }
    // Auto-generate venue/room
    const clinicNum = Math.floor(Math.random() * 3) + 1;
    const Venue = `Clinic ${clinicNum}`;
    const roomId = 101 + Math.floor(Math.random() * 10);
    const RoomNumber = `R${roomId}`;
    const newAppointment = await appointmentModel.createAppointment({
      PatientID,
      DoctorID,
      AppointmentDateTime,
      Venue,
      RoomNumber,
    });
    // For audit/log
    console.log(`[Booking Log] Patient ${PatientID} booked ${AppointmentDateTime} with Doctor ${DoctorID}`);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating appointment" });
  }
}

// Reschedule appointment (update with checks)
async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: "Invalid appointment ID" });
    const { AppointmentDateTime } = req.body;
    const appt = await appointmentModel.getAppointmentById(id);
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    // Prevent reschedule to past or double-book
    if (new Date(AppointmentDateTime) < new Date()) {
      return res.status(400).json({ error: "Cannot reschedule to past." });
    }
    const available = await appointmentModel.isSlotAvailable(AppointmentDateTime, appt.DoctorID, id);
    if (!available) {
      return res.status(400).json({ error: "This slot is already booked." });
    }
    const updated = await appointmentModel.updateAppointment(id, { AppointmentDateTime });
    res.json(updated);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
}

// Cancel appointment
async function deleteAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }
    const deleted = await appointmentModel.deleteAppointment(id);
    if (!deleted) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error deleting appointment" });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentsByPatientID,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
