// routes/articlesRoute.js
const express = require('express');
const router = express.Router();
const { getArticles } = require('../controllers/articlesController');

router.get('/articles', getArticles);

module.exports = router;
