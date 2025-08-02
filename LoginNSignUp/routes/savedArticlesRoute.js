const express = require('express');
const router = express.Router();
const { saveArticle, getSavedArticles } = require('../controllers/savedArticlesController');

router.post('/saved-articles', saveArticle);
router.get('/saved-articles/:id', getSavedArticles);

module.exports = router;
