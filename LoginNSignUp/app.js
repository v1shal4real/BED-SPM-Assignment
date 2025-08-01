require('dotenv').config();
const express = require('express');
const cors = require('cors');
const patientRoutes = require('./routes/patientRoutes');
const ecRoutes = require('./routes/emergencyContactRoutes');
const articlesRoute = require('./routes/articlesRoute'); 
const savedArticlesRoute = require('./routes/savedArticlesRoute');
const loginRoute = require('./routes/loginRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.use('/api', patientRoutes);
app.use('/api/emergency-contacts', ecRoutes);
app.use('/api', articlesRoute); 
app.use('/api', savedArticlesRoute);
app.use('/api', loginRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
