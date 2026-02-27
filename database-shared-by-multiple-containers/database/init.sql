-- ============================================
-- Database Initialization Script
-- ============================================
-- This script runs automatically when PostgreSQL starts for the first time
-- It creates the tables needed for our application

-- Create a simple users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,      -- Auto-incrementing unique ID
    name VARCHAR(100) NOT NULL, -- User's name (required)
    email VARCHAR(100) UNIQUE NOT NULL, -- User's email (must be unique)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Auto-set creation time
);

-- Add some sample data (optional - for testing)
INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Brown', 'charlie@example.com')
ON CONFLICT (email) DO NOTHING; -- Skip if already exists

-- Print confirmation
SELECT 'Database initialized successfully!' AS status;
SELECT * FROM users;
