const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const MemoryStore = require('memorystore')(session); // ✅ Add this line
const topicRoutes = require('./routes/api');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to the database!');
  release();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? ['https://voting-app-frontend-jaj1.onrender.com', 'https://voting-app-backend-b7co.onrender.com']
//     : 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//   exposedHeaders: ['Set-Cookie']
// }));

// app.use(cors({
//   origin: ['https://voting-app-frontend-jaj1.onrender.com'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Set-Cookie']
// }));

// CORS configuration — MUST come before routes
const allowedOrigins = ['https://voting-app-frontend-jaj1.onrender.com'];

// const allowedOrigins = ['https://voting-app-frontend-jaj1.onrender.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));





// Session configuration
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: true, // required for HTTPS
//     sameSite: 'none', // allows cross-site
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//     // 🔴 DO NOT add domain
//   }  
// }));

// const MemoryStore = require('memorystore')(session);




// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Voting App API');
});

// Handle preflight CORS requests
// app.options('*', cors());

app.use('/api', topicRoutes(pool));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`CORS Origin: ${process.env.NODE_ENV === 'production' ? 'https://voting-app-frontend-jaj1.onrender.com' : 'http://localhost:3000'}`);
});
