# Learn Docker with Projects

## Projects

- [Static Website Hosting with Nginx and Docker](https://github.com/HassanHabibTahir/docker-cheat-sheet/tree/static_website_hosting_with_nginx_and_docker)
- [Multi-Container Docker Applications](https://github.com/HassanHabibTahir/docker-cheat-sheet/tree/multi-container-docker-applications-with-docker-compose)
- [one-database-shared-by-multiple-containers](https://github.com/HassanHabibTahir/docker-cheat-sheet/tree/one-database-shared-by-multiple-containers)

# 🐳 Docker — Complete Daily Learning Guide

> Learn Docker from scratch to advanced, one day at a time.

---

## 📅 DAY 1 — What is Docker & Why It Exists

### 🔹 The Problem Docker Solves

Before Docker, developers faced the classic:

> _"It works on my machine!"_

Different OS versions, missing libraries, and conflicting dependencies broke apps in production. Docker fixes this by **packaging everything your app needs** into one portable unit.

---

### 🔹 What is Docker?

Docker is an **open-source platform** that lets you build, ship, and run applications inside **containers** — lightweight, isolated, and portable environments.

- Created by Solomon Hykes in **2013**
- Written in **Go**
- Built on **Linux kernel features**: `namespaces` + `cgroups`

---

### 🔹 Containers vs Virtual Machines

| Feature     | Container 🐳       | Virtual Machine 💻 |
| ----------- | ------------------ | ------------------ |
| Boot Time   | Seconds            | Minutes            |
| Size        | MBs                | GBs                |
| OS          | Shares host kernel | Full OS inside     |
| Isolation   | Process-level      | Hardware-level     |
| Performance | Near-native        | Overhead           |

> **Rule of thumb:** Use containers for apps; use VMs when you need full OS isolation.

---

### 🔹 Docker Architecture

```
  You (CLI)
     │
     ▼
Docker Client ──REST API──▶ Docker Daemon (dockerd)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                Images       Containers      Networks/Volumes
                    │
                    ▼
             Docker Registry (Docker Hub)
```

**Key Components:**

- **Docker Client** — The CLI you type commands into (`docker run`, `docker build`)
- **Docker Daemon** — Background service that manages everything
- **Docker Registry** — Remote store for images (e.g., Docker Hub, GHCR, ECR)
- **Docker Objects** — Images, Containers, Volumes, Networks

---

### ✅ Day 1 Practice

```bash
# Install Docker (Ubuntu)
sudo apt update && sudo apt install docker.io -y

# Verify installation
docker --version

# Run your first container!
docker run hello-world
```

---

---

## 📅 DAY 2 — Docker Images

### 🔹 What is a Docker Image?

A Docker image is a **read-only, layered template** used to create containers.
Think of it like a **recipe** — the container is the cooked dish.

An image contains:

- Application code
- Runtime (Node, Python, Java, etc.)
- Libraries & dependencies
- Environment variables
- Startup instructions

---

### 🔹 Image Layers

Every image is made of **stacked layers**. Each Dockerfile instruction adds a new layer.

```
┌──────────────────────┐
│  Your App Code       │  ← Layer 4 (COPY . .)
├──────────────────────┤
│  npm install         │  ← Layer 3 (RUN npm install)
├──────────────────────┤
│  package.json copied │  ← Layer 2 (COPY package.json)
├──────────────────────┤
│  node:18-alpine      │  ← Layer 1 (Base Image)
└──────────────────────┘
```

> 🔑 **Layers are cached!** Unchanged layers are reused, making builds faster.

---

### 🔹 Common Image Commands

```bash
# Pull an image from Docker Hub
docker pull nginx:latest

# List all local images
docker images

# Inspect image details
docker inspect nginx

# Remove an image
docker rmi nginx

# Remove all unused images
docker image prune -a

# Tag an image
docker tag myapp:latest myapp:v1.0
```

---

### 🔹 Docker Hub

Docker Hub is the **default public registry** for Docker images.

```bash
# Login to Docker Hub
docker login

# Push your image
docker push yourusername/myapp:1.0

# Search for images
docker search ubuntu
```

---

### ✅ Day 2 Practice

```bash
docker pull node:18-alpine
docker images
docker inspect node:18-alpine
docker rmi node:18-alpine
```

---

---

## 📅 DAY 3 — Dockerfile

### 🔹 What is a Dockerfile?

A **Dockerfile** is a plain text file with step-by-step instructions to build a Docker image. Every line is an instruction that creates a layer.

---

### 🔹 Dockerfile Instructions (All of them)

```dockerfile
# ─── Base Image ───────────────────────────────────────────
FROM node:18-alpine
# Sets the base image. Always the first instruction.

# ─── Metadata ─────────────────────────────────────────────
LABEL maintainer="you@email.com"
LABEL version="1.0"
# Adds metadata (key=value) to the image.

# ─── Working Directory ────────────────────────────────────
WORKDIR /app
# Sets the working directory inside the container.
# All subsequent commands run from here.

# ─── Copy Files ───────────────────────────────────────────
COPY package*.json ./
# Copies files from host to container.
# Use COPY over ADD unless you need tar extraction or URLs.

ADD https://example.com/file.tar.gz /tmp/
# Like COPY but also handles URLs and auto-extracts tar archives.

# ─── Run Commands ─────────────────────────────────────────
RUN npm install
# Executes a command at BUILD time. Creates a new layer.

# ─── Environment Variables ────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000
# Sets environment variables inside the image/container.

# ─── Build Arguments ──────────────────────────────────────
ARG APP_VERSION=1.0
# Available only at BUILD time (not at runtime).
# Pass via: docker build --build-arg APP_VERSION=2.0

# ─── Expose Port ──────────────────────────────────────────
EXPOSE 3000
# Documents which port the container listens on.
# Doesn't actually publish the port — use -p for that.

# ─── Volume ───────────────────────────────────────────────
VOLUME ["/data"]
# Creates a mount point for persistent data.

# ─── User ─────────────────────────────────────────────────
USER node
# Sets the user for subsequent RUN/CMD/ENTRYPOINT instructions.
# Best practice: don't run as root.

# ─── CMD vs ENTRYPOINT ────────────────────────────────────
CMD ["node", "server.js"]
# Default command when container starts.
# Can be overridden at runtime: docker run myapp npm test

ENTRYPOINT ["node"]
# Fixed command. Arguments can be appended.
# docker run myapp server.js → runs: node server.js

# ─── Health Check ─────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:3000/health || exit 1
# Docker checks container health periodically.

# ─── Shell Form vs Exec Form ──────────────────────────────
# Shell form (runs via /bin/sh -c):
RUN npm install
CMD node server.js

# Exec form (preferred — no shell, signals work correctly):
RUN ["npm", "install"]
CMD ["node", "server.js"]
```

---

### 🔹 Real-World Node.js Dockerfile

```dockerfile
FROM node:18-alpine

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy deps first (layer caching benefit)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Switch to non-root
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

---

### 🔹 .dockerignore

Like `.gitignore` — tells Docker what NOT to copy into the image.

```
node_modules
.git
.env
*.log
dist
coverage
```

---

### ✅ Day 3 Practice

```bash
# Build an image
docker build -t myapp:1.0 .

# Build with build args
docker build --build-arg NODE_ENV=production -t myapp:prod .

# View build layers
docker history myapp:1.0
```

---

---

## 📅 DAY 4 — Docker Containers

### 🔹 What is a Container?

A container is a **running instance of an image**. If an image is a class, a container is an object. You can run multiple containers from the same image.

---

### 🔹 Container Lifecycle

```
  docker create  →  Created
  docker start   →  Running
  docker pause   →  Paused
  docker stop    →  Stopped
  docker rm      →  Deleted
```

---

### 🔹 Essential Container Commands

```bash
# Run a container (creates + starts)
docker run nginx

# Run in detached (background) mode
docker run -d nginx

# Run with a name
docker run -d --name my-nginx nginx

# Run with port mapping (host:container)
docker run -d -p 8080:80 nginx
# Now visit http://localhost:8080

# Run with environment variables
docker run -d -e NODE_ENV=production myapp

# Run interactively (with terminal)
docker run -it ubuntu bash

# Run and auto-remove when stopped
docker run --rm ubuntu echo "Hello!"

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop a container
docker stop my-nginx

# Start a stopped container
docker start my-nginx

# Restart a container
docker restart my-nginx

# Remove a container
docker rm my-nginx

# Remove a running container (force)
docker rm -f my-nginx

# Remove all stopped containers
docker container prune
```

---

### 🔹 Inspecting Containers

```bash
# View container logs
docker logs my-nginx

# Follow logs in real time
docker logs -f my-nginx

# View resource usage (CPU, RAM)
docker stats

# Inspect full container config
docker inspect my-nginx

# View running processes inside container
docker top my-nginx
```

---

### 🔹 Executing Commands Inside a Container

```bash
# Open a shell inside a running container
docker exec -it my-nginx bash

# Run a single command
docker exec my-nginx cat /etc/nginx/nginx.conf

# Copy files to/from a container
docker cp myfile.txt my-nginx:/app/myfile.txt
docker cp my-nginx:/app/logs.txt ./logs.txt
```

---

### ✅ Day 4 Practice

```bash
docker run -d --name webserver -p 8080:80 nginx
docker ps
docker logs webserver
docker exec -it webserver bash
# Inside: ls, cat /etc/nginx/nginx.conf, exit
docker stop webserver
docker rm webserver
```

---

---

## 📅 DAY 5 — Docker Volumes & Persistent Storage

### 🔹 The Problem: Containers are Ephemeral

When a container is deleted, **all data inside it is lost**. Volumes solve this by persisting data outside the container.

---

### 🔹 Types of Storage in Docker

| Type            | Description                                  |
| --------------- | -------------------------------------------- |
| **Volume**      | Managed by Docker. Best for production data. |
| **Bind Mount**  | Maps a host directory to a container path.   |
| **tmpfs Mount** | Stored in host memory only. Not persisted.   |

---

### 🔹 Docker Volumes

```bash
# Create a volume
docker volume create mydata

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect mydata

# Run container with a volume
docker run -d --name db \
  -v mydata:/var/lib/postgresql/data \
  postgres:15

# Remove a volume
docker volume rm mydata

# Remove all unused volumes
docker volume prune
```

---

### 🔹 Bind Mounts

Map a **host folder** directly into the container. Great for development — changes on the host reflect instantly in the container.

```bash
# Syntax: -v /host/path:/container/path
docker run -d \
  -v $(pwd)/src:/app/src \
  -p 3000:3000 \
  myapp
```

> ⚠️ Bind mounts depend on the host directory structure. Use volumes for production.

---

### 🔹 Volume in Dockerfile

```dockerfile
# Declare a volume mount point
VOLUME ["/app/data"]
```

---

### ✅ Day 5 Practice

```bash
# Run a Postgres container with persistent volume
docker volume create pgdata

docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# Stop and remove container — data is still in the volume!
docker stop postgres && docker rm postgres

# Restart with same volume — data is back!
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15
```

---

---

## 📅 DAY 6 — Docker Networking

### 🔹 Why Networking Matters

Containers are isolated. Networking lets containers talk to each other, to the host, and to the internet.

---

### 🔹 Docker Network Types

| Driver      | Description                                                |
| ----------- | ---------------------------------------------------------- |
| **bridge**  | Default. Containers on same bridge can talk to each other. |
| **host**    | Container uses host's network directly. No isolation.      |
| **none**    | No networking. Fully isolated.                             |
| **overlay** | For multi-host networking (Docker Swarm / Kubernetes).     |
| **macvlan** | Assigns container a real MAC address on your LAN.          |

---

### 🔹 Network Commands

```bash
# List networks
docker network ls

# Create a custom bridge network
docker network create mynetwork

# Run containers on the same network
docker run -d --name app --network mynetwork myapp
docker run -d --name db --network mynetwork postgres:15

# Containers on the same network can talk by NAME:
# app container can reach db at: postgres://db:5432

# Inspect a network
docker network inspect mynetwork

# Connect a running container to a network
docker network connect mynetwork mycontainer

# Disconnect
docker network disconnect mynetwork mycontainer

# Remove a network
docker network rm mynetwork
```

---

### 🔹 Port Mapping

```bash
# -p hostPort:containerPort
docker run -p 8080:80 nginx      # http://localhost:8080 → nginx:80
docker run -p 3000:3000 myapp

# Bind to specific host IP
docker run -p 127.0.0.1:8080:80 nginx

# Random host port
docker run -P nginx  # Docker picks a random port
docker ps            # Check which port was assigned
```

---

### ✅ Day 6 Practice

```bash
docker network create appnet

docker run -d --name backend --network appnet myapp
docker run -d --name database --network appnet \
  -e POSTGRES_PASSWORD=secret postgres:15

# Test: backend can reach "database" by hostname
docker exec -it backend ping database
```

---

---

## 📅 DAY 7 — Docker Compose

### 🔹 What is Docker Compose?

Docker Compose lets you **define and run multi-container apps** using a single YAML file (`docker-compose.yml`). Instead of typing long `docker run` commands, you declare everything in one place.

---

### 🔹 docker-compose.yml Structure

```yaml
version: '3.9' # Compose file version

services: # Define your containers here
  app:
    build: . # Build from Dockerfile in current dir
    container_name: myapp
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    networks:
      - appnet
    restart: always # Restart policy

  db:
    image: postgres:15 # Use existing image
    container_name: mydb
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myappdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - appnet

  redis:
    image: redis:7-alpine
    networks:
      - appnet

volumes: # Named volumes
  pgdata:

networks: # Custom networks
  appnet:
    driver: bridge
```

---

### 🔹 Docker Compose Commands

```bash
# Start all services (detached)
docker compose up -d

# Start and rebuild images
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes too
docker compose down -v

# View logs
docker compose logs -f

# View logs for one service
docker compose logs -f app

# List running services
docker compose ps

# Run a command in a service
docker compose exec app bash

# Scale a service (run multiple instances)
docker compose up -d --scale app=3

# Pull latest images
docker compose pull

# Restart a single service
docker compose restart app
```

---

### 🔹 Restart Policies

```yaml
restart: no           # Never restart (default)
restart: always       # Always restart
restart: on-failure   # Restart only on error
restart: unless-stopped  # Restart always unless manually stopped
```

---

### ✅ Day 7 Practice

Create a full stack app with Compose:

```yaml
# docker-compose.yml
version: '3.9'
services:
  web:
    image: nginx:alpine
    ports:
      - '8080:80'
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose ps
docker compose logs db
docker compose down
```

---

---

## 📅 DAY 8 — Multi-Stage Builds

### 🔹 What is a Multi-Stage Build?

Multi-stage builds let you use **multiple FROM statements** in one Dockerfile. You build in one stage and copy only the final output to a smaller production image — keeping your final image lean and secure.

---

### 🔹 Example: Node.js Multi-Stage Build

```dockerfile
# ─── Stage 1: Build ───────────────────────────────────────
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build        # Output: /app/dist

# ─── Stage 2: Production ──────────────────────────────────
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

> 🔥 Result: Builder image might be 900MB. Final image is ~120MB!

---

### 🔹 Example: Go Binary (ultra-small image)

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM scratch          # Empty image — just the binary!
COPY --from=builder /app/main /main
ENTRYPOINT ["/main"]
```

---

### ✅ Day 8 Practice

```bash
# Build and compare sizes
docker build --target builder -t myapp:builder .
docker build -t myapp:prod .

docker images | grep myapp
# See the size difference!
```

---

---

## 📅 DAY 9 — Docker Security Best Practices

### 🔹 1. Never Run as Root

```dockerfile
# Bad ❌
RUN apt-get install curl
CMD ["node", "server.js"]

# Good ✅
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["node", "server.js"]
```

---

### 🔹 2. Use Minimal Base Images

```dockerfile
# Bad ❌  (~900MB, many vulnerabilities)
FROM node:18

# Good ✅  (~120MB, minimal attack surface)
FROM node:18-alpine

# Best for compiled apps ✅  (~5MB)
FROM scratch
```

---

### 🔹 3. Scan Images for Vulnerabilities

```bash
# Docker's built-in scanner
docker scout cves myapp:latest

# Or use Trivy (popular open-source tool)
trivy image myapp:latest
```

---

### 🔹 4. Use .dockerignore

```
.env
.git
node_modules
*.log
secrets/
```

---

### 🔹 5. Don't Hardcode Secrets

```dockerfile
# Bad ❌
ENV DATABASE_PASSWORD=supersecret

# Good ✅ — pass at runtime
docker run -e DATABASE_PASSWORD=$DB_PASS myapp

# Best ✅ — use Docker Secrets (Swarm/K8s)
docker secret create db_password ./password.txt
```

---

### 🔹 6. Read-Only Filesystem

```bash
docker run --read-only myapp
# Prevent container from writing to its filesystem
```

---

### 🔹 7. Limit Resources

```bash
docker run \
  --memory="256m" \
  --cpus="0.5" \
  myapp
```

---

---

## 📅 DAY 10 — Docker in CI/CD & Production

### 🔹 Docker in a CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/docker.yml
name: Build & Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: yourusername/myapp:latest
```

---

### 🔹 Docker Registry Options

| Registry         | Best For                   |
| ---------------- | -------------------------- |
| Docker Hub       | Public images, open source |
| GitHub GHCR      | GitHub-integrated projects |
| AWS ECR          | AWS/ECS/EKS deployments    |
| Google GCR / GAR | GCP deployments            |
| Self-hosted      | Private, on-prem           |

---

### 🔹 Health Checks in Production

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' myapp
```

---

### 🔹 Docker Resource Limits (Production)

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

---

## 📅 BONUS — Quick Reference Cheat Sheet

```bash
# ── Images ──────────────────────────────────
docker pull <image>              # Download image
docker build -t name:tag .       # Build image
docker images                    # List images
docker rmi <image>               # Delete image
docker image prune -a            # Delete unused images

# ── Containers ──────────────────────────────
docker run -d -p 8080:80 nginx   # Run container
docker run -it ubuntu bash       # Interactive shell
docker ps                        # Running containers
docker ps -a                     # All containers
docker stop <container>          # Stop
docker rm <container>            # Remove
docker logs -f <container>       # Follow logs
docker exec -it <c> bash         # Shell into container
docker stats                     # Resource usage

# ── Volumes ─────────────────────────────────
docker volume create vol         # Create volume
docker volume ls                 # List volumes
docker volume rm vol             # Remove volume

# ── Networks ────────────────────────────────
docker network create net        # Create network
docker network ls                # List networks
docker network inspect net       # Inspect

# ── Compose ─────────────────────────────────
docker compose up -d             # Start all
docker compose down              # Stop all
docker compose logs -f           # Follow logs
docker compose ps                # Status
docker compose exec app bash     # Shell into service

# ── System Cleanup ──────────────────────────
docker system prune              # Remove all unused resources
docker system prune -a           # Including images
docker system df                 # Disk usage
```

---

> 🚀 **Next Steps after Docker:**
>
> - **Docker Swarm** — Native container orchestration
> - **Kubernetes (K8s)** — Industry-standard orchestration
> - **Helm** — Kubernetes package manager
> - **Terraform** — Infrastructure as code

---

_Happy containerizing! 🐳_
