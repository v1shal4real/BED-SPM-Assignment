// Global variables
let allPatients = [];
let currentPatient = null;
let currentAppointments = [];
let allDoctors = [];
let editingPatientId = null;
let editingAppointmentId = null;
const apiBaseUrl = "http://localhost:3000";

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAllPatients();
    loadAllDoctors();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Patient form submission
    document.getElementById('patientForm').addEventListener('submit', handlePatientFormSubmit);
    
    // Appointment form submission
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentFormSubmit);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Load all patients for the main table
async function loadAllPatients() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/patients`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        
        allPatients = await response.json();
        displayPatientsTable();
    } catch (error) {
        console.error('Error loading patients:', error);
        displayError('Failed to load patients. Please try again.');
    }
}

// Load all doctors for dropdown
async function loadAllDoctors() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/doctors`);
        if (!response.ok) throw new Error('Failed to fetch doctors');
        
        allDoctors = await response.json();
        populateDoctorDropdown();
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Populate doctor dropdown
function populateDoctorDropdown() {
    const select = document.getElementById('appointmentDoctor');
    select.innerHTML = '<option value="">Select Doctor</option>';
    
    allDoctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.DoctorID;
        option.textContent = doctor.FullName;
        select.appendChild(option);
    });
}

// Display patients in a table format
function displayPatientsTable() {
    const container = document.getElementById('patientsTableContainer');
    
    if (allPatients.length === 0) {
        container.innerHTML = '<div class="loading">No patients found.</div>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Patient ID</th>
                    <th>Full Name</th>
                    <th>Date of Birth</th>
                    <th>Contact Number</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${allPatients.map(patient => `
                    <tr onclick="viewPatientDetail(${patient.PatientID})">
                        <td>${patient.PatientID}</td>
                        <td>${patient.FullName}</td>
                        <td>${formatDate(patient.DateOfBirth)}</td>
                        <td>${patient.ContactNumber}</td>
                        <td>${patient.Email}</td>
                        <td>${patient.Address}</td>
                        <td onclick="event.stopPropagation()">
                            <div class="action-buttons">
                                <button onclick="editPatient(${patient.PatientID})" class="btn btn-edit">Edit</button>
                                <button onclick="deletePatient(${patient.PatientID})" class="btn btn-delete">Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// Search for a patient by ID
async function searchPatientById() {
    const patientId = document.getElementById('patientIdSearch').value.trim();
    
    if (!patientId) {
        alert('Please enter a Patient ID');
        return;
    }

    try {
        await viewPatientDetail(parseInt(patientId));
    } catch (error) {
        console.error('Error searching patient:', error);
        alert('Patient not found or error occurred while searching.');
    }
}

// View detailed patient information
async function viewPatientDetail(patientId) {
    try {
        // Show loading state
        document.getElementById('patientsTableSection').classList.add('hidden');
        document.getElementById('patientDetailSection').classList.remove('hidden');
        document.getElementById('patientDetailContainer').innerHTML = '<div class="loading">Loading patient details...</div>';

        // Fetch patient details
        const patientResponse = await fetch(`${apiBaseUrl}/api/patients/${patientId}`);
        if (!patientResponse.ok) throw new Error('Patient not found');
        
        currentPatient = await patientResponse.json();

        // Fetch patient appointments
        const appointmentsResponse = await fetch(`${apiBaseUrl}/api/patients/${patientId}/appointments`);
        if (!appointmentsResponse.ok) throw new Error('Failed to fetch appointments');
        
        currentAppointments = await appointmentsResponse.json();

        // Display patient detail
        displayPatientDetail();
    } catch (error) {
        console.error('Error loading patient detail:', error);
        document.getElementById('patientDetailContainer').innerHTML = 
            '<div class="error">Failed to load patient details. Please try again.</div>';
    }
}

// Display patient detail view
function displayPatientDetail() {
    const container = document.getElementById('patientDetailContainer');
    
    const patientDetailHTML = `
        <div class="patient-detail">
            <div class="patient-actions">
                <button onclick="editPatient(${currentPatient.PatientID})" class="btn btn-edit">Edit Patient</button>
                <button onclick="deletePatient(${currentPatient.PatientID})" class="btn btn-delete">Delete Patient</button>
            </div>
            <h2>Patient Information</h2>
            <div class="patient-info">
                <div class="info-item">
                    <span class="info-label">Patient ID:</span>
                    <span>${currentPatient.PatientID}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Full Name:</span>
                    <span>${currentPatient.FullName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date of Birth:</span>
                    <span>${formatDate(currentPatient.DateOfBirth)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Contact Number:</span>
                    <span>${currentPatient.ContactNumber}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span>${currentPatient.Email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Address:</span>
                    <span>${currentPatient.Address}</span>
                </div>
            </div>
        </div>

        <div class="appointments-section">
            <h2>Past Appointments</h2>
            ${currentAppointments.length === 0 ? 
                '<p>No appointments found for this patient.</p>' :
                currentAppointments.map(appointment => `
                    <div class="appointment-card">
                        <div class="appointment-header">
                            <div class="appointment-date">${formatDateTime(appointment.AppointmentDateTime)}</div>
                            <div class="appointment-details">${appointment.DoctorName}</div>
                        </div>
                        <div class="appointment-details">
                            <strong>Venue:</strong> ${appointment.Venue} | <strong>Room:</strong> ${appointment.RoomNumber}
                        </div>
                        <div class="appointment-actions">
                            <button onclick="editAppointment(${appointment.AppointmentID})" class="btn btn-edit">Edit</button>
                            <button onclick="deleteAppointment(${appointment.AppointmentID})" class="btn btn-delete">Delete</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
    
    container.innerHTML = patientDetailHTML;
}

// Edit patient
function editPatient(patientId) {
    editingPatientId = patientId;
    
    // Find patient data
    let patientData = allPatients.find(p => p.PatientID === patientId);
    if (!patientData && currentPatient && currentPatient.PatientID === patientId) {
        patientData = currentPatient;
    }
    
    if (!patientData) {
        alert('Patient data not found');
        return;
    }
    
    // Populate form
    document.getElementById('patientFullName').value = patientData.FullName;
    document.getElementById('patientDOB').value = formatDateForInput(patientData.DateOfBirth);
    document.getElementById('patientContact').value = patientData.ContactNumber;
    document.getElementById('patientEmail').value = patientData.Email;
    document.getElementById('patientAddress').value = patientData.Address;
    
    // Show modal
    document.getElementById('patientModal').style.display = 'block';
}

// Handle patient form submission
async function handlePatientFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        FullName: document.getElementById('patientFullName').value,
        DateOfBirth: document.getElementById('patientDOB').value,
        ContactNumber: document.getElementById('patientContact').value,
        Email: document.getElementById('patientEmail').value,
        Address: document.getElementById('patientAddress').value
    };
    
    try {
        const response = await fetch(`${apiBaseUrl}/api/patients/${editingPatientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update patient');
        
        // Close modal and refresh data
        closePatientModal();
        showSuccess('Patient updated successfully!');
        
        // Refresh patient list
        await loadAllPatients();
        
        // If we're viewing patient detail, refresh it too
        if (currentPatient && currentPatient.PatientID === editingPatientId) {
            await viewPatientDetail(editingPatientId);
        }
        
    } catch (error) {
        console.error('Error updating patient:', error);
        alert('Failed to update patient. Please try again.');
    }
}

// Delete patient
async function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/api/patients/${patientId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete patient');
        
        showSuccess('Patient deleted successfully!');
        
        // Refresh patient list
        await loadAllPatients();
        
        // If we're viewing the deleted patient, go back to main view
        if (currentPatient && currentPatient.PatientID === patientId) {
            showAllPatients();
        }
        
    } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
    }
}

// Edit appointment
function editAppointment(appointmentId) {
    editingAppointmentId = appointmentId;
    
    // Find appointment data
    const appointmentData = currentAppointments.find(a => a.AppointmentID === appointmentId);
    if (!appointmentData) {
        alert('Appointment data not found');
        return;
    }
    
    // Populate form
    document.getElementById('appointmentDateTime').value = formatDateTimeForInput(appointmentData.AppointmentDateTime);
    document.getElementById('appointmentVenue').value = appointmentData.Venue;
    document.getElementById('appointmentRoom').value = appointmentData.RoomNumber;
    document.getElementById('appointmentDoctor').value = appointmentData.DoctorID;
    
    // Show modal
    document.getElementById('appointmentModal').style.display = 'block';
}

// Handle appointment form submission
async function handleAppointmentFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        AppointmentDateTime: document.getElementById('appointmentDateTime').value,
        Venue: document.getElementById('appointmentVenue').value,
        RoomNumber: document.getElementById('appointmentRoom').value,
        DoctorID: parseInt(document.getElementById('appointmentDoctor').value)
    };
    
    try {
        const response = await fetch(`${apiBaseUrl}/api/appointments/${editingAppointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update appointment');
        
        // Close modal and refresh data
        closeAppointmentModal();
        showSuccess('Appointment updated successfully!');
        
        // Refresh appointment list
        if (currentPatient) {
            await viewPatientDetail(currentPatient.PatientID);
        }
        
    } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update appointment. Please try again.');
    }
}

// Delete appointment
async function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/api/appointments/${appointmentId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete appointment');
        
        showSuccess('Appointment deleted successfully!');
        
        // Refresh appointment list
        if (currentPatient) {
            await viewPatientDetail(currentPatient.PatientID);
        }
        
    } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
    }
}

// Modal functions
function closePatientModal() {
    document.getElementById('patientModal').style.display = 'none';
    editingPatientId = null;
}

function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
    editingAppointmentId = null;
}

// Show all patients view
function showAllPatients() {
    document.getElementById('patientDetailSection').classList.add('hidden');
    document.getElementById('patientsTableSection').classList.remove('hidden');
    document.getElementById('patientIdSearch').value = '';
    currentPatient = null;
    currentAppointments = [];
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
}

function formatDateTimeForInput(dateTimeString) {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toISOString().slice(0, 16);
}

// Display error message
function displayError(message) {
    const container = document.getElementById('patientsTableContainer');
    container.innerHTML = `<div class="error">${message}</div>`;
}

// Show success message
function showSuccess(message) {
    // Remove any existing success messages
    const existingSuccess = document.querySelector('.success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Create and show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild.nextSibling);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Handle Enter key press in search input
document.getElementById('patientIdSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchPatientById();
    }
});