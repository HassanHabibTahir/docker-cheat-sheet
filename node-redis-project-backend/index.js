const express = require('express');
const { createClient } = require('redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis client setup
const redisClient = createClient({
  url: 'redis://redis:6379',
});
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// Routes
app.get('/', async (req, res) => {
  try {
    await redisClient.set('message', 'Hello from Redis ?  !');
    const message = await redisClient.get('message');
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Redis operation failed', details: error.message });
  }
});

app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({
      status: 'OK',
      redis: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      redis: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Start server
async function startServer() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
