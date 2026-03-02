# Learn Docker with Projects

## Projects
- [Static Website Hosting with Nginx and Docker](https://github.com/HassanHabibTahir/docker-cheat-sheet)
- [Multi-Container Docker Applications](https://github.com/HassanHabibTahir/docker-cheat-sheet/tree/multi-container-docker-applications-with-docker-compose)
- [one-database-shared-by-multiple-containers](https://github.com/HassanHabibTahir/docker-cheat-sheet/tree/one-database-shared-by-multiple-containers  )

## What is Docker?

Docker is a tool that helps you package an application and everything it needs into one container, so it can run the same way on any computer, server, or cloud environment.

## Core Docker Concepts (VERY IMPORTANT)

| Term | Simple Meaning |
|------|----------------|
| **Image** | A blueprint or template of an application. It contains the app code and all required dependencies. |
| **Container** | A running instance of an image. It is the actual app running in an isolated environment. |
| **Dockerfile** | A text file that has step-by-step instructions to build a Docker image. |
| **Docker Compose** | A tool used to run and manage multiple containers (services) together using one file. |
| **Volume** | Used to store data permanently, even when a container is stopped or removed. |
| **Port Mapping** | Connects a container's port to your system's port so the app can be accessed from a browser. |

---

# Static Website Hosting with Nginx and Docker
This repository contains a **static website** served using **Nginx** inside a **Docker container**.
This README explains **all steps**, including Docker commands, Dockerfile, Docker Compose, and troubleshooting.

---

## 📁 Project Structure

project-folder/
│── index.html
│── Dockerfile
│── docker-compose.yml

- `index.html` → Your static website
- `Dockerfile` → Instructions to build a custom Docker image
- `docker-compose.yml` → To manage container easily

---

## 📝 index.html (sample)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Docker App</title>
  </head>
  <body>
    <h1>Hello from Docker 🚀</h1>
  </body>
</html>
```

## 🐳 Dockerfile

FROM nginx:latest

# Copy project files into container

COPY . /usr/share/nginx/html

EXPOSE 80

Explanation:

| Line                           | Meaning                          |
| ------------------------------ | -------------------------------- |
| `FROM nginx:latest`            | Base Nginx image                 |
| `COPY . /usr/share/nginx/html` | Copy current folder to container |
| `EXPOSE 80`                    | Expose port 80                   |

## ⚙️ docker-compose.yml

```bash
version: '3.9'
services:
  nginx:
    # image: nginx:latest
    build: .
    container_name: my-appa
    ports:
      - '8080:80'
    volumes:
      - .:/usr/share/nginx/html
    restart: always

```

### Explanation:

build: . → Build Docker image from Dockerfile

container_name → Name of the container

ports: '8080:80' → Host port 8080 → container port 80

volumes → Mount current folder for live development

restart: always → Container auto restart

## ▶️ Run Project

# Build and start container in background

docker compose up -d --build

# Access in browser

http://localhost:8080

## ⏹ Stop Project

docker compose down

## 🔄 Rebuild after changes

```bash
docker compose up -d --build
```

--build ensures Docker rebuilds the image

### Stop and remove containers, images, volumes

docker compose down --rmi all --volumes

##💡 Docker Commands Reference

| Command                          | Purpose                 |
| -------------------------------- | ----------------------- |
| `docker ps`                      | Show running containers |
| `docker ps -a`                   | Show all containers     |
| `docker start <container>`       | Start container         |
| `docker stop <container>`        | Stop container          |
| `docker exec -it <container> sh` | Open shell in container |
| `docker image ls`                | List images             |
| `docker rmi <image>`             | Remove image            |

⚡ Tips & Notes

COPY syntax: Always COPY <source> <destination>

Volume vs Dockerfile:

Volume → development (live reload)

Dockerfile → production (static build)

Ports: Format host_port:container_port

Docker Desktop GUI: Refresh or restart if container info missing
