# My Vite React TypeScript Project

![CI](https://github.com/cookiegigi/chaotic-inbox/actions/workflows/ci.yml/badge.svg)

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## Installation

Choose one of the following methods:

### Option 1: Local Installation (with Node.js)

Requires Node.js 20+ and pnpm 9+.

```bash
# Clone the repository
git clone https://github.com/cookiegigi/chaotic-inbox.git
cd chaotic-inbox

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Option 2: Docker Installation

Requires Docker and Docker Compose.

```bash
# Clone the repository
git clone https://github.com/cookiegigi/chaotic-inbox.git
cd chaotic-inbox

# Start with Docker Compose
docker-compose up -d
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

For detailed installation instructions, troubleshooting, and more options, see the [Installation Guide](./docs/installation.md).

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests with Vitest
- `pnpm test:coverage` - Run tests with coverage
- `pnpm storybook` - Start Storybook development server

## Deployment

For production deployment instructions, see the [Deployment Guide](./docs/deployment.md).

Quick start:

```bash
pnpm build
# Serve the dist/ folder with any static file server
```
