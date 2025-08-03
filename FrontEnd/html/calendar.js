// index.js - For FullCalendar on index.html

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth'
    },
    events: function(fetchInfo, successCallback, failureCallback) {
      // Example: Fetch appointments for the logged-in patient
      const patientId = localStorage.getItem('PatientID');
      fetch(`/appointments/patient/${patientId}`)
        .then(response => response.json())
        .then(data => {
          var events = data.map(a => ({
            id: a.AppointmentID,
            title: a.DoctorName ? `Dr. ${a.DoctorName}` : `Dr. ${a.DoctorID}`,
            start: a.AppointmentDateTime
          }));
          successCallback(events);
        })
        .catch(err => failureCallback(err));
    },
    dateClick: function(info) {
      window.location.href = `selectTime.html?date=${info.dateStr}`;
    }
  });
  calendar.render();
});
