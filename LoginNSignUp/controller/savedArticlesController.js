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

module.exports = { saveArticle, getSavedArticles };
