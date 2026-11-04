# Prisma Learning

A RESTful API built with **Express 5, TypeScript, Prisma ORM 7, and PostgreSQL** to learn modern backend development.

## Overview

This project demonstrates how to build a structured REST API using Express, TypeScript, Prisma ORM, and PostgreSQL.

It includes user management, request validation, centralized error handling, database integration, API documentation, and security middleware.

## Features

- RESTful User CRUD API
- PostgreSQL integration with Prisma ORM 7
- TypeScript with strict type checking
- Request validation using Zod
- Centralized error handling
- Pagination and search
- Helmet security headers
- CORS configuration
- API rate limiting
- Health check endpoints
- Swagger API documentation
- Graceful server shutdown

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | Web framework |
| TypeScript | Type safety |
| Prisma ORM 7 | Database ORM |
| PostgreSQL | Relational database |
| Zod | Request and environment validation |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| Swagger | API documentation |
| pnpm | Package manager |

## Prerequisites

Make sure you have the following installed:

- Node.js
- pnpm
- PostgreSQL
- Git

## Project Structure

```text
prisma-learning/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── controllers/
│   ├── generated/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── prisma7.config.ts
└── tsconfig.json
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/nanuboss/prisma-learning.git
cd prisma-learning
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Update the values in `.env`, especially `DATABASE_URL`, with your PostgreSQL credentials and database name.

Example:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
CLIENT_URL=http://localhost:3000
```

Never commit your actual `.env` file or expose database credentials.

### 4. Generate Prisma Client

```bash
pnpm exec prisma generate
```

### 5. Apply database migrations

Make sure your PostgreSQL database exists, then run:

```bash
pnpm db:migrate:deploy
```

This applies the existing migrations to your database.

## Running the Project

### Development

```bash
pnpm dev
```

The development server runs at:

http://localhost:5000

### Production build

```bash
pnpm build
```

### Start production server

```bash
pnpm start
```

Run the build command before starting the production server.

## API Documentation

Swagger UI is available at:

http://localhost:5000/api-docs

Use the interactive documentation to explore and test API endpoints.

## API Endpoints

Base URL:

http://localhost:5000/api/v1

### Health Checks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health/live` | Checks whether the server is running |
| GET | `/health/ready` | Checks server and database readiness |

### User APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Create a user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get a user by ID |
| PATCH | `/users/:id` | Update a user |
| DELETE | `/users/:id` | Delete a user |

### User List Query Parameters

The `GET /users` endpoint supports:

| Parameter | Description | Default |
|---|---|---|
| `page` | Page number | `1` |
| `limit` | Number of records per page (maximum 100) | `10` |
| `search` | Search by user name or email | — |
| `email` | Filter by exact email address | — |

Example:

```text
GET /api/v1/users?page=1&limit=10&search=dinesh
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Application environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `CLIENT_URL` | Allowed frontend origin | `http://localhost:3000` |

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Start production server |
| `pnpm db:migrate:deploy` | Apply pending migrations |

## Learning Goals

This repository is part of a hands-on learning journey covering:

- Express.js backend architecture
- TypeScript fundamentals and strict typing
- Prisma ORM and database migrations
- REST API design
- Request validation and error handling
- API security and documentation
- Git and GitHub workflow

## Repository

[GitHub - prisma-learning](https://github.com/nanuboss/prisma-learning)
