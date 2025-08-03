const express = require('express');
const router = express.Router();
const { saveArticle, getSavedArticles, deleteArticle } = require('../controller/savedArticlesController');

router.post('/saved-articles', saveArticle);
router.get('/saved-articles/:id', getSavedArticles);
router.delete('/saved-articles/:articleId', deleteArticle); // <-- Add this line

module.exports = router;
