const express = require('express');
const router = express.Router();
const { login } = require('../controller/loginController');
const validation = require('../middleware/validationMiddleware');


router.post('/login', login);

module.exports = router;
