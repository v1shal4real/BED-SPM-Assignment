require('dotenv').config();
const express = require('express');
const cors = require('cors');
const patientRoutes = require('./routes/patientRoutes');
const ecRoutes = require('./routes/emergencyContactRoutes');
const app = express();
app.use(cors());

app.use(express.json());
app.use('/api', patientRoutes);
app.use('/api/emergency-contacts', ecRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
