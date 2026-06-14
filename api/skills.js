const { initDb } = require('./db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const db = await initDb();
    db.all('SELECT * FROM skills', (err, rows) => {
      if (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Unable to fetch skills' }));
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(rows));
    });
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Database initialization failed' }));
  }
};
