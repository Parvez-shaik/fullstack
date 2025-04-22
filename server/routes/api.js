const express = require('express');
const Topic = require('../models/Topic');

module.exports = function (pool) {
  const router = express.Router();

  // Register a new user (defaults to a regular user)
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password, 'user']
      );
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      if (err.code === '23505') { // PostgreSQL unique violation
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(400).json({ message: 'User not found' });

      const user = result.rows[0];
      if (password !== user.password) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      req.session.user = { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      };
      res.json({ message: 'Login successful', user: req.session.user });
    } catch (err) {
      return res.status(500).json({ error: 'Login failed' });
    }
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

    Topic.createTopic(pool, name, req.session.user.id, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error creating topic' });
      res.status(201).json({ id: result.insertId, name });
    });
  });

  // Get all topics
  router.get('/topics', (req, res) => {
    Topic.getAllTopics(pool, (err, results) => {
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
    pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND topic_id = $2',
      [req.session.user.id, topicId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Error checking vote' });

        if (results.rows.length > 0) {
          return res.status(400).json({ message: 'You have already voted on this topic' });
        }

        // Insert vote
        pool.query(
          'INSERT INTO votes (user_id, topic_id, vote) VALUES ($1, $2, $3)',
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
    Topic.getVoteCounts(pool, topicId, (err, results) => {
      if (err) return res.status(500).json({ error: 'Error fetching vote counts' });
      res.json({
        topicId,
        ...results
      });
    });
  });

  return router;
};
