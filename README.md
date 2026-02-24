# 🚀 Docker Multi-Container Project — Node.js + Redis

This project demonstrates how to run a **Node.js backend** and **Redis database** using Docker Compose.

It explains:

- How containers are built
- How services communicate
- How networking works
- How environment variables are used
- Internal vs external ports
- How Redis connects with Node.js

---

# 📦 Project Architecture

```
Host Machine
│
├── Node.js Container (backend)
│       │
│       ▼
│   Redis Container
```

Both containers run inside the **same Docker network** created automatically by Docker Compose.

---

# 🐳 Technologies Used

- Node.js
- Redis
- Docker
- Docker Compose

---

# 📁 Project Structure

```
project-root
│── Dockerfile
│── docker-compose.yml
│── package.json
│── .env
│── src/
```

---

# ⚙️ Dockerfile (Node.js Container)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🔍 Explanation

### FROM node:20-alpine
Lightweight Node.js base image.

### WORKDIR /app
Working directory inside container.

### COPY package*.json ./
Copy dependencies list.

### RUN npm install
Install dependencies inside container.

### COPY . .
Copy project source code.

### EXPOSE 5000
Backend runs on port 5000 inside container.

### CMD ["npm", "start"]
Start the backend.

---

# 🧩 docker-compose.yml

```yaml
services:
  backend:
    build: .
    container_name: node-backend
    ports:
      - '${PORT}:${PORT}'
    depends_on:
      - redis
    env_file:
      - .env

  redis:
    image: redis:latest
    container_name: redis-db
    ports:
      - '${REDIS_PORT}:${REDIS_PORT}'
```

---

# 🔍 How Docker Compose Works

## Step 1 — Build backend image

```
docker compose build
```

Docker:

- Reads Dockerfile
- Creates Node.js image

---

## Step 2 — Create Network

Docker Compose automatically creates:

```
project_default
```

Both containers join this network.

---

## Step 3 — Start Containers

```
docker compose up
```

Now running:

- node-backend container
- redis-db container

---

# 🌐 Docker Internal Networking

Inside Docker network:

| Service | Hostname |
|---------|----------|
backend   | backend  |
redis     | redis    |

So containers talk using **service name**.

---

# 🔗 Redis Connection in Node.js

```js
const redisClient = createClient({
  url: 'redis://redis:6379',
});
```

## 🧠 Deep Explanation

### redis://
Protocol for Redis.

### redis
This is NOT localhost.

This is:

➡ Redis container hostname  
➡ Provided by Docker DNS

### 6379
Redis internal container port.

---

# 🔥 Data Flow

1️⃣ Backend starts  
2️⃣ Backend tries to connect to Redis  
3️⃣ Docker DNS resolves `redis` → Redis container IP  
4️⃣ Connection established  

---

# ❗ Internal vs External Ports

## Redis

```
6379 → container internal
${REDIS_PORT} → host access
```

### Container to Container

```
redis:6379 ✅
```

### Host to Redis

```
localhost:6379
```

---

# 🧪 How to Test Redis Running

### Check containers

```
docker ps
```

### Enter Redis

```
docker exec -it redis-db redis-cli
```

### Run

```
PING
```

Output:

```
PONG
```

---

# 🧪 How to Test Backend

```
http://localhost:5000
```

---

# 🔐 Environment Variables (.env)

```
PORT=5000
REDIS_PORT=6379
```

Used for:

- Dynamic configuration
- Port mapping
- Clean code

---

# ▶️ Run Project

```
docker compose up --build
```

---

# ⏹️ Stop Project

```
docker compose down
```

---

# 🔄 Restart

```
docker compose up
```

---

# 🧹 Remove Everything

```
docker compose down -v
```

---

# 🧠 Key Concepts Learned

## 1️⃣ Containerization
Each service runs in isolation.

## 2️⃣ Docker Network
Containers communicate using service name.

## 3️⃣ Service Discovery
No IP needed.

```
redis://redis:6379
```

## 4️⃣ Port Mapping
Access container from host.

## 5️⃣ Environment Variables
Centralized configuration.

## 6️⃣ depends_on
Ensures Redis starts before backend.

---

# 🧯 Debugging Guide

### Redis not connecting?

Check:

```
docker logs node-backend
```

### Redis running?

```
docker ps
```

---

# 🎯 Interview Explanation (Short Version)

This project runs Node.js and Redis in separate containers using Docker Compose.  
Both services communicate over a shared Docker network using service names as hostnames.  
The backend connects to Redis using:

```
redis://redis:6379
```

No localhost is used because each container has its own network namespace.

---

# 🏆 Learning Outcome

After this project you understand:

- Multi-container architecture
- Docker networking
- Backend + database connection
- Production-style setup

---

# 👨‍💻 Author

Hassan Habib Tahir
