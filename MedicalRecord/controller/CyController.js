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

// Get a specific patient by ID
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

// Get all past appointments for a specific patient
async function getAppointmentRecord(req, res) {
    try {
        const recordId = parseInt(req.params.id);
        if (isNaN(recordId)) {
            return res.status(400).json({ error: 'Invalid record ID' });
        }

        const appointments = await CyModel.getAppointmentRecord(recordId);
        res.json(appointments);
    } catch (err) {
        console.error('Error in getAppointmentRecord:', err);
        res.status(500).json({ error: 'Failed to fetch appointment records' });
    }
}

// Update past appointments
async function updateAppointmentRecord(req, res) {
    try {
        const recordId = parseInt(req.params.id);
        if (isNaN(recordId)) {
            return res.status(400).json({ error: 'Invalid record ID' });
        }

        const { RecordDateTime, Venue, RoomNumber, DoctorID } = req.body;

        // Validate required fields
        if (!RecordDateTime || !Venue || !RoomNumber || !DoctorID) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const success = await CyModel.updateAppointmentRecord(recordId, {
            RecordDateTime,
            Venue,
            RoomNumber,
            DoctorID
        });

        if (!success) {
            return res.status(404).json({ error: 'Appointment record not found' });
        }

        res.json({ message: 'Appointment record updated successfully' });
    } catch (err) {
        console.error('Error in updateAppointmentRecord:', err);
        res.status(500).json({ error: 'Failed to update appointment record' });
    }
}

// Delete past appointments
async function deleteAppointmentRecord(req, res) {
    try {
        const recordId = parseInt(req.params.id);
        if (isNaN(recordId)) {
            return res.status(400).json({ error: 'Invalid record ID' });
        }

        const success = await CyModel.deleteAppointmentRecord(recordId);
        if (!success) {
            return res.status(404).json({ error: 'Appointment record not found' });
        }

        res.json({ message: 'Appointment record deleted successfully' });
    } catch (err) {
        console.error('Error in deleteAppointmentRecord:', err);
        res.status(500).json({ error: 'Failed to delete appointment record' });
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
    getAppointmentRecord,
    updateAppointmentRecord,
    deleteAppointmentRecord,
    getAllDoctors
}