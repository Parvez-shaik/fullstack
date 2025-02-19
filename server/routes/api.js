const express = require('express');
const Topic = require('../models/Topic.js'); // Adjust the path as necessary
const router = express.Router();

// Get all topics
router.get('/topics', (req, res) => {
  Topic.getAllTopics((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create a new topic
router.post('/topics', (req, res) => {
  const { name } = req.body;
  Topic.createTopic(name, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, name });
  });
});

// Vote on a topic
router.post('/vote', (req, res) => {
  const { topicId, vote } = req.body;
  Topic.vote(topicId, vote, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Vote registered successfully' });
  });
});

module.exports = router;
