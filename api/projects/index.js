const { initDb, parseJsonBody } = require('../db');

module.exports = async (req, res) => {
  try {
    const db = await initDb();

    if (req.method === 'GET') {
      return db.all('SELECT * FROM projects', (err, rows) => {
        if (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Unable to fetch projects' }));
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(rows));
      });
    }

    if (req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { title, description, tags, url } = body;

      if (!title || !description || !tags) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Title, description, and tags are required.' }));
      }

      return db.run(
        'INSERT INTO projects (title, description, tags, url) VALUES (?, ?, ?, ?)',
        [title.trim(), description.trim(), tags.trim(), url ? url.trim() : ''],
        function (err) {
          if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Unable to create project.' }));
          }

          db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'Unable to fetch created project.' }));
            }
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(row));
          });
        }
      );
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
