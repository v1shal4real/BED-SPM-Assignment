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

// "Smart" logic for booking
async function createAppointment(req, res) {
  try {
    const { PatientID, AppointmentDateTime } = req.body;
    // Doctor assignment logic
    const last = await appointmentModel.getLastAppointmentByPatientID(PatientID);
    const DoctorID = last ? last.DoctorID : await appointmentModel.getRandomDoctorID();
    // Auto-generate venue and room
    const clinicNum = Math.floor(Math.random() * 3) + 1;
    const Venue = `Clinic ${clinicNum}`;
    const roomId = 101 + Math.floor(Math.random() * 10);
    const RoomNumber = `R${roomId}`;
    // Create appointment
    const newAppointment = await appointmentModel.createAppointment({
      PatientID,
      DoctorID,
      AppointmentDateTime,
      Venue,
      RoomNumber,
    });
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error creating appointment" });
  }
}

async function updateAppointment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid appointment ID" });
    }
    const updated = await appointmentModel.updateAppointment(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Error updating appointment" });
  }
}

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
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
