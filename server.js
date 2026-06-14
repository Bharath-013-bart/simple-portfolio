const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;
const dbFile = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Database open error:', err.message);
    process.exit(1);
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const initDb = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tags TEXT NOT NULL,
        url TEXT
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL
      )`
    );

    db.get('SELECT COUNT(*) AS count FROM projects', (err, row) => {
      if (!err && row.count === 0) {
        const insertProject = db.prepare(
          'INSERT INTO projects (title, description, tags, url) VALUES (?, ?, ?, ?)'
        );
        insertProject.run(
          'Portfolio Website',
          'A clean portfolio website built with Node.js, Express, and SQLite.',
          'HTML, CSS, JavaScript, Node.js, Express, SQLite',
          '#'
        );
        insertProject.run(
          'Blog Platform',
          'A minimal blogging interface with backend data storage and routing.',
          'HTML, CSS, Express, SQLite',
          '#'
        );
        insertProject.run(
          'Project Dashboard',
          'A responsive dashboard displaying projects and skills with an API.',
          'Responsive design, REST API, Database',
          '#'
        );
        insertProject.finalize();
      }
    });

    db.get('SELECT COUNT(*) AS count FROM skills', (err, row) => {
      if (!err && row.count === 0) {
        const insertSkill = db.prepare(
          'INSERT INTO skills (name, category) VALUES (?, ?)'
        );
        const skills = [
          ['HTML', 'Frontend'],
          ['CSS', 'Frontend'],
          ['JavaScript', 'Frontend'],
          ['Node.js', 'Backend'],
          ['Express', 'Backend'],
          ['SQLite', 'Database']
        ];
        skills.forEach((skill) => insertSkill.run(skill[0], skill[1]));
        insertSkill.finalize();
      }
    });
  });
};

app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch projects' });
    }
    res.json(rows);
  });
});

app.post('/api/projects', (req, res) => {
  const { title, description, tags, url } = req.body;
  if (!title || !description || !tags) {
    return res.status(400).json({ error: 'Title, description, and tags are required.' });
  }

  db.run(
    'INSERT INTO projects (title, description, tags, url) VALUES (?, ?, ?, ?)',
    [title.trim(), description.trim(), tags.trim(), url ? url.trim() : ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to create project.' });
      }
      db.get('SELECT * FROM projects WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Unable to fetch created project.' });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/projects/:id', (req, res) => {
  const { title, description, tags, url } = req.body;
  const { id } = req.params;

  if (!title || !description || !tags) {
    return res.status(400).json({ error: 'Title, description, and tags are required.' });
  }

  db.run(
    'UPDATE projects SET title = ?, description = ?, tags = ?, url = ? WHERE id = ?',
    [title.trim(), description.trim(), tags.trim(), url ? url.trim() : '', id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Unable to update project.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Unable to fetch updated project.' });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM projects WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Unable to delete project.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.status(204).end();
  });
});

app.get('/api/skills', (req, res) => {
  db.all('SELECT * FROM skills', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch skills' });
    }
    res.json(rows);
  });
});

app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Your Name',
    title: 'Full-Stack Developer',
    summary:
      'I build simple, responsive portfolio websites and backend services with Node.js and Express.'
  });
});

initDb();

app.listen(port, () => {
  console.log(`Portfolio app running at http://localhost:${port}`);
});
