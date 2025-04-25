const express = require('express');
const Topic = require('../models/Topic');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-key';

// JWT auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // Attach user payload to request
    next();
  });
}


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
      
      const newUser = result.rows[0];
const token = jwt.sign({
  id: newUser.id,
  username: newUser.username,
  email: newUser.email,
  role: newUser.role
}, JWT_SECRET, { expiresIn: '24h' });

res.json({
  message: 'Registration successful',
  token,
  user: {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role
  }
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
    console.log('Login endpoint hit');
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



      const token = jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, role: user.role }
      });
      
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }
  });


  // Get all topics
  router.get('/topics', async (req, res) => {
    try {      
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

// Admin creates a new topic (JWT-based)
router.post('/topics', authenticateToken, async (req, res) => {
  // Only admins can create topics
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }

  const { name } = req.body;

  // Validate input
  if (!name) {
    return res.status(400).json({ message: 'Topic name is required' });
  }

  try {
    // Create topic using the admin's user ID
    const result = await pool.query(
      'INSERT INTO topics (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating topic:', err);
    res.status(500).json({ error: 'Error creating topic' });
  }
});


  // User votes on a topic (JWT-based)
router.post('/vote', authenticateToken, async (req, res) => {
  const userId = req.user.id; // Extracted from the JWT token
  const { topicId, vote } = req.body;

  // Validate input
  if (!topicId || (vote !== 1 && vote !== 0)) {
    return res.status(400).json({ message: 'Invalid vote input' });
  }

  try {
    // Check if the user has already voted on this topic
    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND topic_id = $2',
      [userId, topicId]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ message: 'You have already voted on this topic' });
    }

    // Record the vote
    await pool.query(
      'INSERT INTO votes (user_id, topic_id, vote) VALUES ($1, $2, $3)',
      [userId, topicId, vote]
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
