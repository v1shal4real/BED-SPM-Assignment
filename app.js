require('dotenv').config();
const express = require('express');
const cors = require('cors');


const patientRoutes = require('./LoginNSignUp/routes/patientRoutes');
const ecRoutes = require('./LoginNSignUp/routes/emergencyContactRoutes');
const articlesRoute = require('./LoginNSignUp/routes/articlesRoute');
const savedArticlesRoute = require('./LoginNSignUp/routes/savedArticlesRoute');
const loginRoute = require('./LoginNSignUp/routes/loginRoutes');
const emergencyInfoRoute = require('./LoginNSignUp/routes/emergencyInfoRoutes');



const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/FrontEnd/scripts'));
app.use(express.static(__dirname + '/FrontEnd'));


app.use('/api', patientRoutes);
app.use('/api/emergency-contacts', ecRoutes);
app.use('/api/articles', articlesRoute); 
app.use('/api/', savedArticlesRoute);
app.use('/api', loginRoute);
app.use('/api/emergency-info', emergencyInfoRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
