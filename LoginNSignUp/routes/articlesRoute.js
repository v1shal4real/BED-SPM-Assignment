// routes/articlesRoute.js
const express = require('express');
const router = express.Router();
const { getArticles } = require('../controller/articlesController'); // fixed path

router.get('/', getArticles); // route should be '/'

module.exports = router;
