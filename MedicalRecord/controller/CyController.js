const CyModel = require("../model/CyModel");

// Get all patients for staff view
async function getAllPatients(req, res) {
    try {
        const patients = await CyModel.getAllPatients();
        res.json(patients);
    } catch (err) {
        console.error('Error in getAllPatients:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
}

// Get a specific patient by ID (used also for individual patients view)
async function getPatientById(req, res) {
    try {
        const patientId = parseInt(req.params.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }

        const patient = await CyModel.getPatientById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (err) {
        console.error('Error in getPatientById:', err);
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
}

// Update patient information
async function updatePatient(req, res) {
    try {
        const patientId = parseInt(req.params.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }

        const { FullName, DateOfBirth, ContactNumber, Email, Address } = req.body;

        // Validate required fields
        if (!FullName || !DateOfBirth || !ContactNumber || !Email || !Address) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const success = await CyModel.updatePatient(patientId, {
            FullName,
            DateOfBirth,
            ContactNumber,
            Email,
            Address
        });

        if (!success) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        console.error('Error in updatePatient:', err);
        res.status(500).json({ error: 'Failed to update patient' });
    }
}

// Delete a patient
async function deletePatient(req, res) {
    try {
        const patientId = parseInt(req.params.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }

        const success = await CyModel.deletePatient(patientId);
        if (!success) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        console.error('Error in deletePatient:', err);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
}

// Get all appointments for a specific patient
async function getPatientAppointments(req, res) {
    try {
        const patientId = parseInt(req.params.id);
        if (isNaN(patientId)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }

        const appointments = await CyModel.getPatientAppointments(patientId);
        res.json(appointments);
    } catch (err) {
        console.error('Error in getPatientAppointments:', err);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
}

// Update an appointment
async function updateAppointment(req, res) {
    try {
        const appointmentId = parseInt(req.params.id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({ error: 'Invalid appointment ID' });
        }

        const { AppointmentDateTime, Venue, RoomNumber, DoctorID } = req.body;

        // Validate required fields
        if (!AppointmentDateTime || !Venue || !RoomNumber || !DoctorID) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const success = await CyModel.updateAppointment(appointmentId, {
            AppointmentDateTime,
            Venue,
            RoomNumber,
            DoctorID
        });

        if (!success) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
        console.error('Error in updateAppointment:', err);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
}

// Delete an appointment
async function deleteAppointment(req, res) {
    try {
        const appointmentId = parseInt(req.params.id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({ error: 'Invalid appointment ID' });
        }

        const success = await CyModel.deleteAppointment(appointmentId);
        if (!success) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error('Error in deleteAppointment:', err);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
}

// Get all doctors for dropdown selection
async function getAllDoctors(req, res) {
    try {
        const doctors = await CyModel.getAllDoctors();
        res.json(doctors);
    } catch (err) {
        console.error('Error in getAllDoctors:', err);
        res.status(500).json({ error: 'Failed to fetch doctors' });
    }
}

module.exports = {
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientAppointments,
    updateAppointment,
    deleteAppointment,
    getAllDoctors
}