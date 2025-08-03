const sql = require('mssql');


const saveArticle = async (req, res) => {
  const { patientId, title, description, url } = req.body;
  try {
    await sql.query`
      INSERT INTO SavedArticles (PatientID, title, description, url)
      VALUES (${patientId}, ${title}, ${description}, ${url});
    `;
    res.status(201).json({ message: 'Article saved successfully!' });
  } catch (err) {
    console.error('Error saving article:', err);
    res.status(500).json({ error: 'Failed to save article' });
  }
};


const getSavedArticles = async (req, res) => {
  const { id } = req.params; 
  try {
    const result = await sql.query`
      SELECT * FROM SavedArticles WHERE PatientID = ${id};
    `;
    res.json({ articles: result.recordset });
  } catch (err) {
    console.error('Error fetching saved articles:', err);
    res.status(500).json({ error: 'Failed to fetch saved articles' });
  }
};

const deleteArticle = async (req, res) => {
  const { articleId } = req.params; // from the route
  try {
    await sql.query`
      DELETE FROM SavedArticles WHERE id = ${articleId}
    `;
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting article:', err);
    res.status(500).json({ error: 'Failed to delete article.' });
  }
};

module.exports = {
  saveArticle,
  getSavedArticles,
  deleteArticle // <-- Add this to exports
};