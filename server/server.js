const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // update with your MySQL username
  password: '123786', // update with your MySQL password
  database: 'voting_app',
});

// Connect to the database
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

module.exports.db = db; // Export the database connection for use in other files

// Define routes
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
