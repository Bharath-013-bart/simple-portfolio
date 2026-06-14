const { initDb, parseJsonBody } = require('../db');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Project ID is required.' }));
  }

  try {
    const db = await initDb();

    if (req.method === 'PUT') {
      const body = await parseJsonBody(req);
      const { title, description, tags, url } = body;

      if (!title || !description || !tags) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: 'Title, description, and tags are required.' }));
      }

      return db.run(
        'UPDATE projects SET title = ?, description = ?, tags = ?, url = ? WHERE id = ?',
        [title.trim(), description.trim(), tags.trim(), url ? url.trim() : '', id],
        function (err) {
          if (err) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Unable to update project.' }));
          }
          if (this.changes === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Project not found.' }));
          }
          db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
            if (err) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'Unable to fetch updated project.' }));
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(row));
          });
        }
      );
    }

    if (req.method === 'DELETE') {
      return db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
        if (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Unable to delete project.' }));
        }
        if (this.changes === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'Project not found.' }));
        }
        res.statusCode = 204;
        return res.end();
      });
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
