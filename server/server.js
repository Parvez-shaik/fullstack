const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const topicRoutes = require('./routes/api');

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: 'secureSessionKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123786',
  database: 'voting_app',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

app.get('/', (req, res) => {
  res.send('Welcome to the Voting App API');
});

app.use('/api', topicRoutes(db));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
