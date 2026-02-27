/**
 * ============================================
 * Node.js Express Server - App 2
 * ============================================
 * This app is IDENTICAL to App 1.
 * Both apps share the SAME PostgreSQL database!
 * This demonstrates multiple services using one database.
 */

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Same database configuration as App 1
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const APP_NAME = process.env.APP_NAME || 'Unknown App';

// ----------------------------------------
// Same API Routes as App 1
// ----------------------------------------

app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${APP_NAME}!`,
    note: 'This app shares the same database as App 1!',
    endpoints: {
      getAllUsers: 'GET /users',
      getUserById: 'GET /users/:id',
      createUser: 'POST /users'
    }
  });
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    
    res.json({
      app: APP_NAME,
      count: result.rowCount,
      users: result.rows,
      note: 'Same data as App 1 - shared database!'
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      app: APP_NAME,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json({
      app: APP_NAME,
      message: 'User created via App 2!',
      user: result.rows[0],
      note: 'You can see this user in App 1 too!'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      app: APP_NAME,
      database: 'connected' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      app: APP_NAME,
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ----------------------------------------
// Start Server
// ----------------------------------------
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} is running on port ${PORT}`);
  console.log(`🔗 This app shares the database with App 1!`);
  console.log(`📋 Try: curl http://localhost:3002/users`);
});
