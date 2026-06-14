const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.join('/tmp', 'portfolio.db');
let dbPromise;

const parseJsonBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

const initDb = () => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const exists = fs.existsSync(dbFile);
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        return reject(err);
      }

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

        if (!exists) {
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
        }

        resolve(db);
      });
    });
  });

  return dbPromise;
};

module.exports = {
  initDb,
  parseJsonBody
};
