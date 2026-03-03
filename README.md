# Notes Application API

A REST API for a simple Notes application built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** express-validator

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd notes-api
npm install
```

### 2. Configure environment variables

Copy the example env file and configure your database:

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/notes_db"
PORT=3000
NODE_ENV=development
```

### 3. Create the database

**Option A: Using Docker**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**
Create a PostgreSQL database named `notes_db` (or your preferred name):
```bash
createdb notes_db
```

### 4. Generate Prisma client (first time)

```bash
npm run db:generate
```

### 5. Start the server

**Migrations run automatically** on every server start (`npm run dev` or `npm start`). Pending migrations are applied before the server listens. No manual migration step is required for normal use.

For creating new migrations during development:
```bash
npm run db:migrate
```

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

### 6. Run tests (optional)
```bash
npm run test
```

The API will be available at `http://localhost:3000`.

**Swagger Documentation:** `http://localhost:3000/api-docs`