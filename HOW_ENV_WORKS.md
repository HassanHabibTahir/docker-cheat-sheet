# 🔧 How Environment Variables Work in This Project

## The Problem

You asked: *"env not added, how container pgsql work"*

Great question! Let me explain.

---

## ✅ Method 1: Direct Environment Variables (Currently Used)

In `docker-compose.yml`, environment variables are defined **directly** under each service:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      # These go directly to the PostgreSQL container
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydatabase
```

### How PostgreSQL Container Uses These:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` | Creates a user named `myuser` |
| `POSTGRES_PASSWORD` | Sets password to `mypassword` |
| `POSTGRES_DB` | Creates database `mydatabase` |

> 📖 **Reference**: [Official PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

## ✅ Method 2: Using .env File (Now Added)

I've now added a `.env` file. Docker Compose **automatically** reads this file.

### Updated docker-compose.yml to use .env:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${DB_USER}      # Reads from .env
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
```

### Benefits of .env file:
- ✅ Change settings without modifying docker-compose.yml
- ✅ Keep sensitive data out of git (add .env to .gitignore)
- ✅ Easy to have different settings for dev/prod

---

## 🔄 How Node.js Apps Get Environment Variables

### Step 1: Docker Compose passes env vars to container

```yaml
services:
  app1:
    environment:
      DB_HOST: db           # "db" is the service name (Docker's DNS)
      DB_PORT: 5432
      DB_USER: myuser
      DB_PASSWORD: mypassword
      DB_NAME: mydatabase
```

### Step 2: Node.js reads them via `process.env`

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,      // "db"
  port: process.env.DB_PORT,      // "5432"
  user: process.env.DB_USER,      // "myuser"
  password: process.env.DB_PASSWORD, // "mypassword"
  database: process.env.DB_NAME,  // "mydatabase"
});
```

---

## 🔍 Visual Flow

```
┌─────────────────┐
│   .env file     │ ───┐
│  (variables)    │    │
└─────────────────┘    │    ┌──────────────────────┐
                       ├───→│  docker-compose.yml  │
┌─────────────────┐    │    │  (references vars)   │
│ docker-compose  │────┘    └──────────┬───────────┘
│    (reads .env) │                    │
└─────────────────┘                    ▼
                            ┌──────────────────────┐
                            │    Sets env vars     │
                            │   on each container  │
                            └──────────┬───────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           │                           │                           │
           ▼                           ▼                           ▼
    ┌─────────────┐           ┌─────────────┐             ┌─────────────┐
    │   App 1     │           │   App 2     │             │ PostgreSQL  │
    │  Container  │           │  Container  │             │  Container  │
    │             │           │             │             │             │
    │ process.env │           │ process.env │             │  POSTGRES_  │
    │  .DB_HOST   │           │  .DB_HOST   │             │   USER,etc  │
    └──────┬──────┘           └──────┬──────┘             └──────┬──────┘
           │                         │                           │
           │    ┌────────────────────┘                           │
           │    │                    ┌───────────────────────────┘
           ▼    ▼                    ▼
           ┌─────────────────────────────────┐
           │      Docker Internal Network    │
           │    (apps connect to "db:5432")  │
           └─────────────────────────────────┘
```

---

## 🧪 Testing Environment Variables

### Test 1: Check what env vars are set in a container

```bash
# See all environment variables in app1
docker exec node_app1 env

# See specific variable
docker exec node_app1 printenv DB_HOST
```

### Test 2: Check PostgreSQL env vars

```bash
docker exec postgres_db env | grep POSTGRES
```

---

## 🔧 Updated docker-compose.yml (Using .env)

Here's how to update docker-compose.yml to use the .env file:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: postgres_db
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  app1:
    build: ./app1
    container_name: node_app1
    ports:
      - "${APP1_PORT}:3000"
    environment:
      DB_HOST: db
      DB_PORT: ${DB_PORT}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      APP_NAME: "App 1"
    depends_on:
      - db

  app2:
    build: ./app2
    container_name: node_app2
    ports:
      - "${APP2_PORT}:3000"
    environment:
      DB_HOST: db
      DB_PORT: ${DB_PORT}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      APP_NAME: "App 2"
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 📝 Key Takeaways

1. **PostgreSQL container** uses special env vars (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) to create the initial database

2. **Node.js apps** read env vars via `process.env.VAR_NAME`

3. **Docker Compose** can get env vars from:
   - Direct values in `docker-compose.yml` (what we did first)
   - `.env` file (now added)
   - Shell environment variables

4. **Service names as hostnames**: In Docker Compose, the service name (`db`) becomes the hostname for other containers to connect to

---

## 🚀 Updated Run Commands

With the `.env` file, everything works the same way:

```bash
# Start everything
docker-compose up --build -d

# Docker Compose automatically reads .env file
# No changes needed to commands!
```

To use a different env file:
```bash
docker-compose --env-file .env.production up -d
```
