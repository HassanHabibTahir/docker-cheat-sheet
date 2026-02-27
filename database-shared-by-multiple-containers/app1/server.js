/**
 * ============================================
 * Node.js Express Server - App 1
 * ============================================
 * This is a simple REST API that connects to PostgreSQL
 * and provides GET and POST endpoints for users.
 */

const express = require('express');
const { Pool } = require('pg');

// Create Express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// ----------------------------------------
// Database Connection Setup
// ----------------------------------------
// Pool is a connection pool - it manages multiple database connections efficiently
const pool = new Pool({
  host: process.env.DB_HOST,         // 'db' (from docker-compose.yml)
  port: process.env.DB_PORT,         // 5432
  user: process.env.DB_USER,         // 'myuser'
  password: process.env.DB_PASSWORD, // 'mypassword'
  database: process.env.DB_NAME,     // 'mydatabase'
});

const APP_NAME = process.env.APP_NAME || 'Unknown App';

// ----------------------------------------
// API Routes
// ----------------------------------------

/**
 * GET / - Welcome message
 * Returns a simple message showing which app is running
 */
app.get('/', (req, res) => {
  res.json({
    message: `Welcome to ${APP_NAME}!`,
    endpoints: {
      getAllUsers: 'GET /users',
      getUserById: 'GET /users/:id',
      createUser: 'POST /users'
    }
  });
});

/**
 * GET /users - Get all users
 * Returns a list of all users in the database
 */
app.get('/users', async (req, res) => {
  try {
    // Query the database
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    
    res.json({
      app: APP_NAME,
      count: result.rowCount,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /users/:id - Get a single user by ID
 * Returns one user or 404 if not found
 */
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parameterized query to prevent SQL injection
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

/**
 * POST /users - Create a new user
 * Body: { "name": "John", "email": "john@example.com" }
 */
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Insert new user and return the created record
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    
    res.status(201).json({
      app: APP_NAME,
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ----------------------------------------
// Health Check Endpoint
// ----------------------------------------
app.get('/health', async (req, res) => {
  try {
    // Test database connection
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
// Start the Server
// ----------------------------------------
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} is running on port ${PORT}`);
  console.log(`📋 Try these commands:`);
  console.log(`   curl http://localhost:3001/`);
  console.log(`   curl http://localhost:3001/users`);
  console.log(`   curl -X POST http://localhost:3001/users -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com"}'`);
});
