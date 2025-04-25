const express = require('express');
const Topic = require('../models/Topic');

module.exports = function (pool) {
  const router = express.Router();

  // Register a new user
  router.post('/register', async (req, res) => {
    const { username, email, password, role = 'user' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, password, role]
      );
      
      // Set session for the newly registered user
      req.session.user = {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role
      };
      
      res.status(201).json({ 
        message: 'User registered successfully',
        user: req.session.user
      });
    } catch (err) {
      console.error('Registration error:', err);
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
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = result.rows[0];
      if (password !== user.password) {
        return res.status(400).json({ message: 'Invalid password' });
      }

      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      console.log('Login successful, session set:', req.session.user);

      res.json({ 
        message: 'Login successful',
        user: req.session.user
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get current session
  router.get('/session', (req, res) => {
    console.log('Session check:', {
      sessionId: req.sessionID,
      user: req.session.user,
      cookies: req.headers.cookie
    });
    res.json({ user: req.session.user || null });
  });

  // Logout
  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Get all topics
  router.get('/topics', async (req, res) => {
    try {
      console.log('Topics request - Session:', req.session);
      console.log('Topics request - Headers:', req.headers);
      
      const result = await pool.query(`
        SELECT 
          t.id,
          t.name,
          t.created_at,
          u.username as created_by_username,
          u.role as creator_role
        FROM topics t
        JOIN users u ON t.created_by = u.id
        ORDER BY t.created_at DESC
      `);
      console.log('Topics query result:', result.rows);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching topics:', err);
      res.status(500).json({ error: 'Error fetching topics' });
    }
  });

  // Admin creates a new topic
  router.post('/topics', async (req, res) => {
    console.log('Create topic request:', {
      sessionId: req.sessionID,
      user: req.session.user,
      cookies: req.headers.cookie,
      body: req.body
    });

    if (!req.session.user) {
      console.log('No user in session');
      return res.status(401).json({ message: 'Not logged in' });
    }

    if (req.session.user.role !== 'admin') {
      console.log('User is not admin:', req.session.user);
      return res.status(403).json({ message: 'Unauthorized. Admins only.' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Topic name is required' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO topics (name, created_by) VALUES ($1, $2) RETURNING *',
        [name, req.session.user.id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating topic:', err);
      res.status(500).json({ error: 'Error creating topic' });
    }
  });

  // User votes on a topic
  router.post('/vote', async (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { topicId, vote } = req.body;
    if (!topicId || (vote !== 1 && vote !== 0)) {
      return res.status(400).json({ message: 'Invalid vote input' });
    }

    try {
      // Check if user has already voted
      const existingVote = await pool.query(
        'SELECT * FROM votes WHERE user_id = $1 AND topic_id = $2',
        [req.session.user.id, topicId]
      );

      if (existingVote.rows.length > 0) {
        return res.status(400).json({ message: 'You have already voted on this topic' });
      }

      // Insert vote
      await pool.query(
        'INSERT INTO votes (user_id, topic_id, vote) VALUES ($1, $2, $3)',
        [req.session.user.id, topicId, vote]
      );
      res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
      console.error('Error recording vote:', err);
      res.status(500).json({ error: 'Error recording vote' });
    }
  });

  // Get vote results for a topic
  router.get('/votes/:topicId', async (req, res) => {
    const { topicId } = req.params;
    try {
      const yesVotes = await pool.query(
        'SELECT COUNT(*) AS yes_votes FROM votes WHERE topic_id = $1 AND vote = 1',
        [topicId]
      );
      const noVotes = await pool.query(
        'SELECT COUNT(*) AS no_votes FROM votes WHERE topic_id = $1 AND vote = 0',
        [topicId]
      );
      res.json({
        topicId,
        yes_votes: parseInt(yesVotes.rows[0].yes_votes),
        no_votes: parseInt(noVotes.rows[0].no_votes)
      });
    } catch (err) {
      console.error('Error fetching vote counts:', err);
      res.status(500).json({ error: 'Error fetching vote counts' });
    }
  });

  return router;
};
