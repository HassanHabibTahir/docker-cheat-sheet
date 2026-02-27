# 🚀 Node.js + PostgreSQL + Docker Example

A beginner-friendly example showing how to run **two Node.js applications** sharing **one PostgreSQL database** using Docker Compose.

---

## 📁 Project Structure

```
.
├── docker-compose.yml      # Orchestrates all services
├── .env                    # Environment variables (created from .env.example)
├── .env.example            # Template for environment variables
├── README.md               # This file
│
├── app1/                   # First Node.js app (port 3001)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── app2/                   # Second Node.js app (port 3002)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
└── database/
    └── init.sql            # Database initialization script
```

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│   Node.js App 1 │     │   Node.js App 2 │
│   Port: 3001    │     │   Port: 3002    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    Same Network       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  PostgreSQL │
              │   Port: 5432│
              └─────────────┘
```

**Key Point**: Both App 1 and App 2 connect to the same database and share the same data!

---

## 🚀 Step-by-Step: Run the Application

### Step 1: Clone/Navigate to Project

```bash
cd docker-cheat-sheet
```

### Step 2: Create Environment File

```bash
# Copy the example environment file
copy .env.example .env

# (Optional) Edit .env to change passwords, ports, etc.
```

> 💡 **What is `.env`?**
> - A file containing configuration variables (passwords, ports, etc.)
> - Docker Compose reads this file automatically
> - Keeps sensitive data out of your code

### Step 3: Start All Services

```bash
# Build and start all containers in detached mode (background)
docker-compose up --build -d
```

> 💡 **What this does:**
> - Reads environment variables from `.env`
> - Downloads PostgreSQL image
> - Builds Node.js images for app1 and app2
> - Creates a network for services to communicate
> - Starts all 3 containers

### Step 4: Check if Everything is Running

```bash
# See running containers
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

### Step 5: Test the APIs

#### 5.1 Check if apps are healthy

```bash
# Test App 1
curl http://localhost:3001/health

# Test App 2
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "healthy",
  "app": "App 1",
  "database": "connected"
}
```

#### 5.2 Get all users (from both apps)

```bash
# From App 1
curl http://localhost:3001/users

# From App 2 (same data!)
curl http://localhost:3002/users
```

Expected response:
```json
{
  "app": "App 1",
  "count": 3,
  "users": [
    { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" },
    { "id": 2, "name": "Bob Smith", "email": "bob@example.com" },
    { "id": 3, "name": "Charlie Brown", "email": "charlie@example.com" }
  ]
}
```

#### 5.3 Create a new user (via App 1)

```bash
curl -X POST http://localhost:3001/users ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"David Lee\", \"email\": \"david@example.com\"}"
```

#### 5.4 Verify the user exists in App 2

```bash
# The new user appears here too!
curl http://localhost:3002/users
```

#### 5.5 Get a specific user

```bash
curl http://localhost:3001/users/1
curl http://localhost:3002/users/1
```

---

## 🔧 How Environment Variables Work

### Flow Diagram

```
.env file ──→ docker-compose.yml ──→ Containers ──→ Apps/Database
```

### PostgreSQL Container

The PostgreSQL Docker image uses special environment variables:

| Variable | What It Does |
|----------|--------------|
| `POSTGRES_USER` | Creates a database user |
| `POSTGRES_PASSWORD` | Sets the user's password |
| `POSTGRES_DB` | Creates a database with this name |

These are **read by PostgreSQL** on first startup to initialize the database.

### Node.js Apps

The Node.js apps receive environment variables and use them to connect:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,      // "db" (service name)
  port: process.env.DB_PORT,      // 5432
  user: process.env.DB_USER,      // from .env
  password: process.env.DB_PASSWORD, // from .env
  database: process.env.DB_NAME,  // from .env
});
```

### Viewing Environment Variables in Containers

```bash
# See all env vars in app1
docker exec node_app1 env

# See env vars in PostgreSQL
docker exec postgres_db env | grep POSTGRES
```

---

## 🛠️ Useful Commands

### Stop Everything

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers AND delete all data
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app1
docker-compose logs db

# Follow logs (live)
docker-compose logs -f
```

### Restart a Single Service

```bash
# Restart only app1
docker-compose restart app1

# Rebuild and restart
docker-compose up --build -d app1
```

### Access Database Directly

```bash
# Connect to PostgreSQL inside the container
docker exec -it postgres_db psql -U myuser -d mydatabase

# Then run SQL commands, e.g.:
# \dt              - list tables
# SELECT * FROM users;
# \q               - quit
```

### Clean Everything (Start Fresh)

```bash
# Stop and remove everything including volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up --build -d
```

---

## 🔧 Environment Variables Reference

### Database Configuration (in `.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USER` | `myuser` | Database username |
| `DB_PASSWORD` | `mypassword` | Database password |
| `DB_NAME` | `mydatabase` | Database name |
| `DB_PORT` | `5432` | PostgreSQL port on host |

### App Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `APP1_PORT` | `3001` | Port for App 1 on host |
| `APP2_PORT` | `3002` | Port for App 2 on host |

---

## 🐛 Troubleshooting

### "Cannot connect to database"

Wait a few seconds and try again. PostgreSQL takes time to initialize on first run.

```bash
# Check if database is ready
docker-compose logs db | findstr "database system is ready"
```

### "Port already in use"

If ports 3001, 3002, or 5432 are already in use, edit `.env`:

```env
APP1_PORT=3003
APP2_PORT=3004
DB_PORT=5433
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

### Reset Everything

```bash
# Nuclear option - stop all, remove volumes, rebuild
docker-compose down -v
docker-compose up --build -d
```

---

## 📚 What You'll Learn

1. **Docker Compose** - How to orchestrate multiple containers
2. **Environment Variables** - How to configure apps without changing code
3. **Service Communication** - How containers talk to each other using service names
4. **Database Persistence** - How data survives container restarts
5. **Shared Database** - How multiple apps can use the same database
6. **Health Checks** - How to ensure services start in correct order

---

## 🎯 Next Steps / Exercise Ideas

1. **Add DELETE endpoint** - Allow removing users
2. **Add UPDATE endpoint** - Allow editing users
3. **Add search** - Find users by name or email
4. **Add validation** - Check email format before saving
5. **Add pagination** - Limit results per page
6. **Add another app** - Create app3 that also connects to the same database

---

## 📖 Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Node.js Driver (pg)](https://node-postgres.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

## 📝 License

This project is for educational purposes. Feel free to use and modify!
