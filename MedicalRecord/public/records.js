// Global variables
let allPatients = [];
let currentPatient = null;
let currentRecords = [];
let allDoctors = [];
let editingRecordId = null;
const apiBaseUrl = "http://localhost:3000";
// second feature
let currentMedicalDetails = [];
let editingDetailId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAllPatients();
    loadAllDoctors();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Record form submission
    document.getElementById('appointmentForm').addEventListener('submit', handleRecordFormSubmit); // feature 1
    document.getElementById('medicalDetailForm').addEventListener('submit', handleMedicalDetailFormSubmit); // feature 2
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
        const response = await fetch(`${apiBaseUrl}/patients`);
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
        const response = await fetch(`${apiBaseUrl}/doctors`);
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
        alert('Patient not found or error occurred');
    }
}

// View detailed patient information
async function viewPatientDetail(patientId) {
    try {
        document.getElementById('patientsTableSection').classList.add('hidden');
        document.getElementById('patientDetailSection').classList.remove('hidden');
        document.getElementById('patientDetailContainer').innerHTML = '<div class="loading">Loading patient details...</div>';

        const patientResponse = await fetch(`${apiBaseUrl}/patients/${patientId}`);
        if (!patientResponse.ok) throw new Error('Patient not found');
        
        currentPatient = await patientResponse.json();

        const recordsResponse = await fetch(`${apiBaseUrl}/records/patient/${patientId}`);
        if (recordsResponse.ok) {
            currentRecords = await recordsResponse.json();
        } else {
            currentRecords = [];
        }

        displayPatientDetail();

        const detailsResponse = await fetch(`${apiBaseUrl}/medical-details/patient/${patientId}`);
        if (detailsResponse.ok) {
            currentMedicalDetails = await detailsResponse.json();
        } else {
            currentMedicalDetails = [];
        }

        displayMedicalDetails();

    } catch (error) {
        console.error('Error loading patient detail:', error);
        document.getElementById('patientDetailContainer').innerHTML = 
            '<div class="error">Failed to load patient details</div>';
    }
}

// Display patient detail view
function displayPatientDetail() {
    const container = document.getElementById('patientDetailContainer');
    
    const patientDetailHTML = `
        <div class="patient-detail">
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
            <h2>Appointment Records</h2>
            <div id="recordsContainer">
                ${currentRecords.length === 0 ? 
                    '<p>No medical records found for this patient.</p>' :
                    currentRecords.map(record => `
                        <div class="appointment-card">
                            <div class="appointment-header">
                                <div class="appointment-date">${formatDateTime(record.RecordDateTime)}</div>
                                <div class="appointment-details">${record.DoctorName}</div>
                            </div>
                            <div class="appointment-details">
                                <strong>Venue:</strong> ${record.Venue} | <strong>Room:</strong> ${record.RoomNumber}
                            </div>
                            <div class="appointment-actions">
                                <button onclick="editRecord(${record.RecordID})" class="btn btn-edit">Edit</button>
                                <button onclick="deleteRecord(${record.RecordID})" class="btn btn-delete">Delete</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>

        <div class="medical-details-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2>Medical Record Details</h2>
                <button onclick="openCreateMedicalDetailModal()" class="btn btn-primary">Add Medical Detail</button>
            </div>
            <div id="medicalDetailsContainer">
                <p>No medical details found for this patient.</p>
            </div>
        </div>
    `;
    
    container.innerHTML = patientDetailHTML;
}

// Display medical details

function displayMedicalDetails() {
    const container = document.getElementById('medicalDetailsContainer');
    
    if (currentMedicalDetails.length === 0) {
        container.innerHTML = '<p>No medical details found for this patient.</p>';
        return;
    }

    container.innerHTML = currentMedicalDetails.map(detail => `
        <div class="medical-detail-card" onclick="viewMedicalDetail(${detail.DetailID})">
            <div class="medical-detail-summary">
                <div>
                    <div class="detail-diagnosis">${detail.Diagnosis}</div>
                    <div class="detail-date">${formatDateTime(detail.RecordDateTime)}</div>
                </div>
                <div class="detail-actions" onclick="event.stopPropagation()">
                    <button onclick="editMedicalDetail(${detail.DetailID})" class="btn btn-edit">Edit</button>
                    <button onclick="deleteMedicalDetail(${detail.DetailID})" class="btn btn-delete">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// View full medical detail
function viewMedicalDetail(detailId) {
    const detail = currentMedicalDetails.find(d => d.DetailID === detailId);
    if (!detail) return;

    const content = `
        <div class="medical-detail-full">
            <h3>Medical Record Detail</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Appointment Date:</strong>
                    ${formatDateTime(detail.RecordDateTime)}
                </div>
                <div class="detail-item">
                    <strong>Doctor:</strong>
                    ${detail.DoctorName}
                </div>
                <div class="detail-item">
                    <strong>Diagnosis:</strong>
                    ${detail.Diagnosis || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Blood Pressure:</strong>
                    ${detail.BloodPressure || 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Temperature:</strong>
                    ${detail.Temperature ? detail.Temperature + '°C' : 'N/A'}
                </div>
                <div class="detail-item">
                    <strong>Allergies:</strong>
                    ${detail.Allergies || 'None'}
                </div>
                <div class="detail-item">
                    <strong>Follow-up Required:</strong>
                    ${detail.FollowUpRequired ? 'Yes' : 'No'}
                </div>
            </div>
            <div class="detail-item" style="margin-bottom: 15px;">
                <strong>Symptoms:</strong>
                <div style="margin-top: 5px;">${detail.Symptoms || 'N/A'}</div>
            </div>
            <div class="detail-item" style="margin-bottom: 15px;">
                <strong>Lab Results:</strong>
                <div style="margin-top: 5px;">${detail.LabResults || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <strong>Doctor Notes:</strong>
                <div style="margin-top: 5px;">${detail.DoctorNotes || 'N/A'}</div>
            </div>
            <div class="form-buttons" style="margin-top: 20px;">
                <button onclick="editMedicalDetail(${detail.DetailID}); closeMedicalDetailViewModal();" class="btn-primary">Edit</button>
                <button onclick="deleteMedicalDetail(${detail.DetailID}); closeMedicalDetailViewModal();" class="btn btn-delete">Delete</button>
            </div>
        </div>
    `;

    document.getElementById('medicalDetailViewContent').innerHTML = content;
    document.getElementById('medicalDetailViewModal').style.display = 'block';
}

// Open create medical detail modal
function openCreateMedicalDetailModal() {
    editingDetailId = null;
    document.getElementById('medicalDetailModalTitle').textContent = 'Add Medical Detail';
    document.getElementById('saveMedicalDetailBtn').textContent = 'Save';
    
    // Populate record dropdown
    const recordSelect = document.getElementById('recordSelect');
    recordSelect.innerHTML = '<option value="">Select Appointment</option>';
    currentRecords.forEach(record => {
        const option = document.createElement('option');
        option.value = record.RecordID;
        option.textContent = `${formatDateTime(record.RecordDateTime)} - ${record.DoctorName}`;
        recordSelect.appendChild(option);
    });

    // Clear form
    document.getElementById('medicalDetailForm').reset();
    document.getElementById('medicalDetailModal').style.display = 'block';
}

// Edit medical detail
function editMedicalDetail(detailId) {
    editingDetailId = detailId;
    const detail = currentMedicalDetails.find(d => d.DetailID === detailId);
    if (!detail) return;

    document.getElementById('medicalDetailModalTitle').textContent = 'Edit Medical Detail';
    document.getElementById('saveMedicalDetailBtn').textContent = 'Update';

    // Populate record dropdown
    const recordSelect = document.getElementById('recordSelect');
    recordSelect.innerHTML = '<option value="">Select Appointment</option>';
    currentRecords.forEach(record => {
        const option = document.createElement('option');
        option.value = record.RecordID;
        option.textContent = `${formatDateTime(record.RecordDateTime)} - ${record.DoctorName}`;
        recordSelect.appendChild(option);
    });

    // Populate form with existing data
    document.getElementById('recordSelect').value = detail.RecordID;
    document.getElementById('symptoms').value = detail.Symptoms || '';
    document.getElementById('diagnosis').value = detail.Diagnosis || '';
    document.getElementById('bloodPressure').value = detail.BloodPressure || '';
    document.getElementById('temperature').value = detail.Temperature || '';
    document.getElementById('allergies').value = detail.Allergies || '';
    document.getElementById('labResults').value = detail.LabResults || '';
    document.getElementById('doctorNotes').value = detail.DoctorNotes || '';
    document.getElementById('followUpRequired').value = detail.FollowUpRequired ? '1' : '0';

    document.getElementById('medicalDetailModal').style.display = 'block';
}

// Handle medical detail form submission
async function handleMedicalDetailFormSubmit(event) {
    event.preventDefault();

    const formData = {
        RecordID: parseInt(document.getElementById('recordSelect').value),
        Symptoms: document.getElementById('symptoms').value,
        Diagnosis: document.getElementById('diagnosis').value,
        BloodPressure: document.getElementById('bloodPressure').value,
        Temperature: parseFloat(document.getElementById('temperature').value) || null,
        Allergies: document.getElementById('allergies').value,
        LabResults: document.getElementById('labResults').value,
        DoctorNotes: document.getElementById('doctorNotes').value,
        FollowUpRequired: parseInt(document.getElementById('followUpRequired').value)
    };

    try {
        let response;
        if (editingDetailId) {
            response = await fetch(`${apiBaseUrl}/medical-details/${editingDetailId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch(`${apiBaseUrl}/medical-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        if (!response.ok) throw new Error('Failed to save medical detail');

        closeMedicalDetailModal();
        showSuccess(`Medical detail ${editingDetailId ? 'updated' : 'created'} successfully!`);
        
        // Reload medical details
        const detailsResponse = await fetch(`${apiBaseUrl}/medical-details/patient/${currentPatient.PatientID}`);
        if (detailsResponse.ok) {
            currentMedicalDetails = await detailsResponse.json();
            displayMedicalDetails();
        }

    } catch (error) {
        console.error('Error saving medical detail:', error);
        alert('Failed to save medical detail. Please try again.');
    }
}

// Delete medical detail
async function deleteMedicalDetail(detailId) {
    if (!confirm('Are you sure you want to delete this medical detail? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/medical-details/${detailId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete medical detail');

        showSuccess('Medical detail deleted successfully!');
        currentMedicalDetails = currentMedicalDetails.filter(d => d.DetailID !== detailId);
        displayMedicalDetails();

    } catch (error) {
        console.error('Error deleting medical detail:', error);
        alert('Failed to delete medical detail. Please try again.');
    }
}

// Modal functions
function closeMedicalDetailModal() {
    document.getElementById('medicalDetailModal').style.display = 'none';
    editingDetailId = null;
}

function closeMedicalDetailViewModal() {
    document.getElementById('medicalDetailViewModal').style.display = 'none';
}


// Edit record
function editRecord(recordId) {
    editingRecordId = recordId;
    
    // Find record data
    const recordData = currentRecords.find(r => r.RecordID === recordId);
    if (!recordData) {
        alert('Record data not found');
        return;
    }
    
    // Populate form
    document.getElementById('appointmentDateTime').value = formatDateTimeForInput(recordData.RecordDateTime);
    document.getElementById('appointmentVenue').value = recordData.Venue;
    document.getElementById('appointmentRoom').value = recordData.RoomNumber;
    document.getElementById('appointmentDoctor').value = recordData.DoctorID;
    
    document.getElementById('appointmentModal').style.display = 'block';
}

// Handle record form submission
async function handleRecordFormSubmit(event) {
    event.preventDefault();
    
    const formData = {
        RecordDateTime: document.getElementById('appointmentDateTime').value,
        Venue: document.getElementById('appointmentVenue').value,
        RoomNumber: document.getElementById('appointmentRoom').value,
        DoctorID: parseInt(document.getElementById('appointmentDoctor').value)
    };
    
    try {
        const response = await fetch(`${apiBaseUrl}/records/${editingRecordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update record');
        
        closeAppointmentModal();
        showSuccess('Medical record updated successfully!');
        
        // Reload patient details to refresh the display
        if (currentPatient) {
            await viewPatientDetail(currentPatient.PatientID);
        }
        
    } catch (error) {
        console.error('Error updating record:', error);
        alert('Failed to update record. Please try again.');
    }
}

// Delete record
async function deleteRecord(recordId) {
    if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/records/${recordId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete record');
        
        showSuccess('Medical record deleted successfully!');
        
        // Remove from current records and refresh display
        currentRecords = currentRecords.filter(r => r.RecordID !== recordId);
        const container = document.getElementById('recordsContainer');
        if (currentRecords.length === 0) {
            container.innerHTML = '<p>No records loaded. Enter a Record ID to view specific medical records.</p>';
        } else {
            container.innerHTML = currentRecords.map(record => `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="appointment-date">${formatDateTime(record.RecordDateTime)}</div>
                        <div class="appointment-details">${record.DoctorName}</div>
                    </div>
                    <div class="appointment-details">
                        <strong>Venue:</strong> ${record.Venue} | <strong>Room:</strong> ${record.RoomNumber}
                    </div>
                    <div class="appointment-actions">
                        <button onclick="editRecord(${record.RecordID})" class="btn btn-edit">Edit</button>
                        <button onclick="deleteRecord(${record.RecordID})" class="btn btn-delete">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record. Please try again.');
    }
}

// Modal functions
function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
    editingRecordId = null;
}

// Show all patients view
function showAllPatients() {
    document.getElementById('patientDetailSection').classList.add('hidden');
    document.getElementById('patientsTableSection').classList.remove('hidden');
    document.getElementById('patientIdSearch').value = '';
    currentPatient = null;
    currentRecords = [];
    currentMedicalDetails = [];
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