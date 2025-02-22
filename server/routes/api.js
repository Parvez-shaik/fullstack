const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // Register a new user (defaults to a regular user)
  router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "user")',
      [username, email, password],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });

  // Login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(400).json({ message: 'User not found' });

      const user = results[0];

      if (password !== user.password) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      req.session.user = { id: user.id, email: user.email, username: user.username, role: user.role };
      res.status(200).json({ message: 'Login successful', user: req.session.user });
    });
  });


  // Logout
  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Admin creates a new topic
  router.post('/topics', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Admins only.' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Topic name is required' });
    }

    db.query(
      'INSERT INTO topics (name, created_by) VALUES (?, ?)',
      [name, req.session.user.id],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Error adding topic' });
        res.status(201).json({ id: result.insertId, name });
      }
    );
  });

  // Get all topics
// Express route to get topics
router.get('/topics', (req, res) => {
  db.query('SELECT * FROM topics', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});


  // User votes on a topic (Yes/No)
  router.post('/vote', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { topicId, vote } = req.body;
    if (!topicId || (vote !== 'yes' && vote !== 'no')) {
      return res.status(400).json({ message: 'Invalid vote input' });
    }

    // Check if user has already voted
    db.query(
      'SELECT * FROM votes WHERE user_id = ? AND topic_id = ?',
      [req.session.user.id, topicId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
          return res.status(400).json({ message: 'You have already voted on this topic' });
        }

        // Insert vote
        db.query(
          'INSERT INTO votes (user_id, topic_id, vote) VALUES (?, ?, ?)',
          [req.session.user.id, topicId, vote],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Vote recorded successfully' });
          }
        );
      }
    );
  });

  // Get vote results for a topic
  router.get('/votes/:topicId', (req, res) => {
    const { topicId } = req.params;

    db.query(
      'SELECT COUNT(*) AS yes_votes FROM votes WHERE topic_id = ? AND vote = "yes"',
      [topicId],
      (err, yesResults) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
          'SELECT COUNT(*) AS no_votes FROM votes WHERE topic_id = ? AND vote = "no"',
          [topicId],
          (err, noResults) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
              topicId,
              yes_votes: yesResults[0].yes_votes,
              no_votes: noResults[0].no_votes,
            });
          }
        );
      }
    );
  });

  return router;
};
