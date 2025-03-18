const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const topicRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secureSessionKey',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database configuration
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123786',
  database: process.env.DB_NAME || 'voting_app',
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Voting App API');
});

app.use('/api', topicRoutes(db));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
