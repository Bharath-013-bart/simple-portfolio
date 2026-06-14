module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      name: 'Your Name',
      title: 'Full-Stack Developer',
      summary:
        'I build simple, responsive portfolio websites and backend services with Node.js and Express.'
    })
  );
};
