# Installation Guide

This guide covers installing and running Chaotic Inbox locally or via Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: Local Installation](#method-1-local-installation)
- [Method 2: Docker Installation](#method-2-docker-installation)
- [Updating the Application](#updating-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Regardless of installation method, you'll need:

- **Git** - To clone the repository
- **A modern web browser** - Chrome, Firefox, Safari, or Edge

---

## Method 1: Local Installation

This method is suitable for all users who have Node.js installed or are comfortable installing it.

### Prerequisites

- **Node.js** 20 or higher ([Download here](https://nodejs.org/))
- **pnpm** 9 or higher ([Install guide](https://pnpm.io/installation))

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/cookiegigi/chaotic-inbox.git
   cd chaotic-inbox
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

### Available Commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm dev`     | Start development server with hot reload |
| `pnpm build`   | Build for production                     |
| `pnpm preview` | Preview production build locally         |
| `pnpm test`    | Run tests                                |
| `pnpm lint`    | Check code for issues                    |
| `pnpm format`  | Format code                              |

### Stopping the Server

Press `Ctrl+C` in the terminal to stop the development server.

---

## Method 2: Docker Installation

This method is ideal if you:

- Don't want to install Node.js/pnpm
- Prefer containerized environments
- Want consistent deployment across systems

### Prerequisites

- **Docker** ([Install guide](https://docs.docker.com/get-docker/))
- **Docker Compose** (usually included with Docker Desktop)

### Installation Steps

#### Option A: Using Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/cookiegigi/chaotic-inbox.git
   cd chaotic-inbox
   ```

2. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Open your browser**

   Navigate to [http://localhost:8080](http://localhost:8080)

#### Option B: Using Docker directly

1. **Clone the repository**

   ```bash
   git clone https://github.com/cookiegigi/chaotic-inbox.git
   cd chaotic-inbox
   ```

2. **Build the image**

   ```bash
   docker build -t chaotic-inbox .
   ```

3. **Run the container**

   ```bash
   docker run -d -p 8080:80 --name chaotic-inbox chaotic-inbox
   ```

4. **Open your browser**

   Navigate to [http://localhost:8080](http://localhost:8080)

### Managing the Docker Container

| Command                        | Description                       |
| ------------------------------ | --------------------------------- |
| `docker-compose down`          | Stop and remove the container     |
| `docker-compose logs -f`       | View container logs               |
| `docker-compose up -d --build` | Rebuild and restart after updates |

---

## Updating the Application

### Local Installation

```bash
cd chaotic-inbox
git pull origin main
pnpm install
pnpm dev
```

### Docker Installation

```bash
cd chaotic-inbox
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## Troubleshooting

### Local Installation Issues

#### "pnpm: command not found"

Install pnpm:

```bash
npm install -g pnpm
```

#### "Cannot find module" errors

Clear and reinstall dependencies:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Port 5173 is already in use

The dev server will automatically try the next available port. Check the terminal output for the actual port.

### Docker Installation Issues

#### "docker-compose: command not found"

Use `docker compose` (with a space) instead of `docker-compose`, or install Docker Compose separately.

#### Port 8080 is already in use

Edit `docker-compose.yml` and change the port mapping:

```yaml
ports:
  - '8081:80' # Use port 8081 instead
```

Then access at [http://localhost:8081](http://localhost:8081)

#### Container fails to start

Check the logs:

```bash
docker-compose logs
```

### Common Issues (Both Methods)

#### Clipboard/paste not working

- Make sure you're accessing the app via `localhost` or HTTPS
- Some browser features require a secure context
- Try using `http://127.0.0.1` instead of `http://localhost`

#### Data not persisting after refresh

- Data is stored in browser's IndexedDB
- Check browser settings - private/incognito mode may clear data
- Ensure third-party cookies/storage are not blocked

---

## Comparison

| Feature          | Local         | Docker                |
| ---------------- | ------------- | --------------------- |
| Setup time       | ~5 minutes    | ~10 minutes           |
| Node.js required | Yes (on host) | No                    |
| Hot reload       | Yes           | No (production build) |
| Best for         | Development   | Quick deployment      |

---

## Next Steps

- See the [README](../README.md) for feature overview
- Check [deployment.md](./deployment.md) for production deployment options
- Read [troubleshooting.md](./troubleshooting.md) for advanced issues
