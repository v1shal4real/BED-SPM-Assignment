const doctorModel = require('../model/CRUDDocModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.user = decoded;
        next();
        
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// Create doctor
async function createDoctor(req, res) {
    try {
        const { name, email, tempPassword, role } = req.body;
        
        // Validate input
        if (!name || !email || !tempPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const doctorData = {
            fullName,
            email,
            passwordHash: hashedPassword,
            role: role || 'doctor'
        };

        const newDoctor = await doctorModel.createDoctor(doctorData);
        
        res.status(201).json({ 
            message: 'Doctor account created successfully',
            doctor: {
                id: newDoctor.DoctorID,
                name: `${newDoctor.fullName}`,
                email: newDoctor.EmailAddress,
            }
        });

    } catch (error) {
        console.error('Error creating doctor:', error);
        
        if (error.message === 'Email already exists') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
}

// Get all doctors
async function getAllDoctors(req, res) {
    try {
        const doctors = await doctorModel.getAllDoctors();
        
        // Remove sensitive data
        const sanitizedDoctors = doctors.map(doctor => ({
            id: doctor.DoctorID,
            name: `${doctor.fullName}`,
            email: doctor.EmailAddress,
        }));

        res.status(200).json(sanitizedDoctors);

    } catch (error) {
        console.error('Error getting doctors:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Get doctor by ID
async function getDoctorById(req, res) {
    try {
        const { id } = req.params;
        const doctor = await doctorModel.getDoctorById(id);
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Remove sensitive data
        const sanitizedDoctor = {
            id: doctor.DoctorID,
            name: `${doctor.fullName}`,
            email: doctor.EmailAddress,
            role: doctor.Role,
            createdDate: doctor.CreatedDate
        };

        res.status(200).json(sanitizedDoctor);

    } catch (error) {
        console.error('Error getting doctor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update doctor
async function updateDoctor(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
            delete updateData.password;
        }

        const updatedDoctor = await doctorModel.updateDoctor(id, updateData);
        
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ 
            message: 'Doctor updated successfully',
            doctor: {
                id: updatedDoctor.DoctorID,
                name: `${updatedDoctor.fullNameullName}`,
                email: updatedDoctor.EmailAddress,
            }
        });

    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Delete doctor
async function deleteDoctor(req, res) {
    try {
        const { id } = req.params;
        const deletedDoctor = await doctorModel.deleteDoctor(id);
        
        if (!deletedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({ message: 'Doctor deleted successfully' });

    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    verifyAdminToken,
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};