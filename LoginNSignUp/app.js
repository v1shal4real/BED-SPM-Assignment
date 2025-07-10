require('dotenv').config();
const express = require('express');
const cors = require('cors');
const patientRoutes = require('./routes/patientRoutes');
const app = express();
app.use(cors());

app.use(express.json());
app.use('/api', patientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
