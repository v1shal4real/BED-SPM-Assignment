
const axios = require('axios');
require('dotenv').config();

const getArticles = async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'health',
        country: 'us',
        apiKey: process.env.NEWS_API_KEY
      }
    });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error.message);
    res.status(500).json({ error: 'Failed to fetch health articles' });
  }
};

module.exports = { getArticles };
