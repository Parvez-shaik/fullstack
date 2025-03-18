const express = require('express');
const Topic = require('../models/Topic');

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
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });

  // Login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      if (results.length === 0) return res.status(400).json({ message: 'User not found' });

      const user = results[0];
      if (password !== user.password) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      req.session.user = { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      };
      res.status(200).json({ message: 'Login successful', user: req.session.user });
    });
  });

  // Get current session
  router.get('/session', (req, res) => {
    res.json({ user: req.session.user || null });
  });

  // Logout
  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Logout failed' });
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
      return res.status(400).json({ message: 'Topic name is required' });
    }

    Topic.createTopic(db, name, req.session.user.id, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error creating topic' });
      res.status(201).json({ id: result.insertId, name });
    });
  });

  // Get all topics
  router.get('/topics', (req, res) => {
    Topic.getAllTopics(db, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching topics' });
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
        if (err) return res.status(500).json({ error: 'Error checking vote' });

        if (results.length > 0) {
          return res.status(400).json({ message: 'You have already voted on this topic' });
        }

        // Insert vote
        db.query(
          'INSERT INTO votes (user_id, topic_id, vote) VALUES (?, ?, ?)',
          [req.session.user.id, topicId, vote],
          (err) => {
            if (err) return res.status(500).json({ error: 'Error recording vote' });
            res.status(200).json({ message: 'Vote recorded successfully' });
          }
        );
      }
    );
  });

  // Get vote results for a topic
  router.get('/votes/:topicId', (req, res) => {
    const { topicId } = req.params;
    Topic.getVoteCounts(db, topicId, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching vote counts' });
      res.json({
        topicId,
        ...results
      });
    });
  });

  return router;
};
