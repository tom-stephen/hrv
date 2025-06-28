require('dotenv').config();
const { Pool } = require('pg');

// Railway automatically provides DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrv_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        hrv_value DECIMAL NOT NULL,
        readiness VARCHAR(50) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS coach_athletes (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES users(id),
        athlete_id INTEGER REFERENCES users(id),
        UNIQUE(coach_id, athlete_id)
      )
    `);

    // Insert sample data
    const bcrypt = require('bcryptjs');
    const sampleUsers = [
      { email: 'athlete@test.com', password: 'password123', name: 'John Smith', user_type: 'athlete' },
      { email: 'coach@test.com', password: 'password123', name: 'Coach Johnson', user_type: 'coach' },
    ];

    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (email, password, name, user_type) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.email, hashedPassword, user.name, user.user_type]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = { pool, initDatabase }; 