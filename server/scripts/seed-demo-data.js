const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDemoData() {
  const client = await pool.connect();
  try {
    // Read the SQL file
    const sql = fs.readFileSync(path.join(__dirname, '../demo-data.sql'), 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    console.log('Demo data seeded successfully!');
  } catch (err) {
    console.error('Error seeding demo data:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData(); 