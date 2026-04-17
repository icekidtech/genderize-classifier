# HNG Profile Intelligence Service

A production-ready REST API for profile enrichment and management. This multi-stage project progressively builds features, from simple gender classification (Stage 0) to comprehensive profile intelligence with data persistence (Stage 1+).

**Current Version:** `1.0.0` (Stage 1 - Data Persistence & API Design - COMPLETED)

## Table of Contents

- [Features](#features)
- [Stage 0: Gender Classification](#stage-0-gender-classification)
- [Stage 1: Profile Intelligence (New)](#stage-1-profile-intelligence)
- [Prerequisites & Installation](#prerequisites--installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Features

**Stage 0:**
- Gender classification API using Genderize.io
- Type-safe TypeScript implementation
- CORS enabled for cross-origin requests
- Health check monitoring
- Comprehensive error handling

**Stage 1 (Completed - v1.0.0):**
- PostgreSQL database integration with TypeORM
- Multi-API enrichment (Genderize, Agify, Nationalize)
- Profile creation, retrieval, filtering, and deletion
- Idempotency for duplicate submissions
- UUID v4 generation for profile IDs
- Advanced filtering (gender, country, age group)
- Robust data validation and error handling
- 204 No Content responses for deletions
- **15/15 integration tests passing**
- Full data persistence with automatic schema synchronization

## Stage 0: Gender Classification

**Endpoint:** `GET /api/classify?name={name}`

### Example Request

```bash
curl "http://localhost:5000/api/classify?name=John"
```

### Example Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 5000,
    "is_confident": true,
    "processed_at": "2026-04-17T12:00:00.000Z"
  }
}
```

### Error Responses

```bash
# Missing name (400)
curl "http://localhost:5000/api/classify"

# Invalid type (422)
curl "http://localhost:5000/api/classify?name=123"

# External API failure (502)
# Response: {"status": "error", "message": "External API error: Unable to process gender classification"}
```

---

### Stage 1: Profile Intelligence (Completed)

### Overview

Stage 1 adds data persistence and multi-API integration. The system enriches names using three external APIs, all profiles are persisted in PostgreSQL with automatic schema management:

- **Genderize.io** - Gender prediction
- **Agify.io** - Age prediction  
- **Nationalize.io** - Nationality/country prediction

All data is persisted in PostgreSQL with UUID v7 identifiers.

### New Endpoints

#### 1. Create Profile - `POST /api/profiles`

**Request:**
```json
{
  "name": "ella"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

**Idempotency (Duplicate Name - 200):**
```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ...existing profile... }
}
```

#### 2. Get Profile - `GET /api/profiles/{id}`

**Request:**
```bash
curl "http://localhost:5000/api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12"
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
    "name": "emmanuel",
    "gender": "male",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 25,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00.000Z"
  }
}
```

#### 3. List Profiles - `GET /api/profiles`

**With Filters:**
```bash
curl "http://localhost:5000/api/profiles?gender=male&country_id=NG&age_group=adult"
```

**Response (200):**
```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "emmanuel",
      "gender": "male",
      "age": 25,
      "age_group": "adult",
      "country_id": "NG"
    },
    {
      "id": "id-2",
      "name": "tunde",
      "gender": "male",
      "age": 32,
      "age_group": "adult",
      "country_id": "NG"
    }
  ]
}
```

#### 4. Delete Profile - `DELETE /api/profiles/{id}`

**Request:**
```bash
curl -X DELETE "http://localhost:5000/api/profiles/b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12"
```

**Response (204 No Content)**

---

## Prerequisites & Installation

### Requirements

- **Node.js** v16+
- **pnpm** v8+ (or npm/yarn)
- **PostgreSQL** 12+ (for Stage 1)
- **Git**

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd stage-zero
   ```

2. **Checkout the stage you want to work with:**
   ```bash
   # For Stage 0 (released)
   git checkout main

   # For Stage 1 development (in progress)
   git checkout stage-1

   # Or for latest development
   git checkout develop
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Build the project:**
   ```bash
   pnpm build
   ```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root. Copy from `.env.example`:

```bash
cp .env.example .env
```

**For Stage 0 (Basic):**
```env
NODE_ENV=development
PORT=5000
```

**For Stage 1 (With Database):**
```env
# Application
NODE_ENV=development
PORT=5000

# PostgreSQL (Option 1: Connection string - recommended)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/genderize_stage1

# PostgreSQL (Option 2: Individual parameters)
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USER=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_NAME=genderize_stage1

# External APIs (optional - uses defaults if not set)
GENDERIZE_API_URL=https://api.genderize.io
AGIFY_API_URL=https://api.agify.io
NATIONALIZE_API_URL=https://api.nationalize.io

# API Configuration
API_TIMEOUT=5000
LOG_LEVEL=info
```

### Database Setup (Stage 1)

1. **Create the database locally:**
   ```bash
   createdb genderize_stage1
   ```

2. **Or define custom connection in .env:**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/custom_db_name
   ```

3. **Migrations will run automatically on server start.**

---

## Running the Server

### Development Mode (Hot Reload)

```bash
pnpm dev
```

Server runs on `http://localhost:5000` by default.

### Production Build & Start

```bash
pnpm build
pnpm start
```

### Custom Port

```bash
PORT=3000 pnpm dev
# or
PORT=3000 pnpm start
```

---

## API Endpoints

### Health Check

```bash
GET /health

Response: {"status": "ok"}
```

### Stage 0: Classification

```bash
GET /api/classify?name=John

Response (200):
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 5000,
    "is_confident": true,
    "processed_at": "2026-04-17T12:00:00.000Z"
  }
}
```

### Stage 1: Profile Management

```bash
# Create
POST /api/profiles
Body: {"name": "ella"}
Response: 201 or 200 (idempotent)

# Get by ID
GET /api/profiles/{id}
Response: 200 or 404

# List with filters
GET /api/profiles?gender=male&country_id=NG&age_group=adult
Response: 200

# Delete
DELETE /api/profiles/{id}
Response: 204 No Content or 404
```

---

## Testing

### Test Stage 0 (Classification)

```bash
pnpm test
```

### Test Stage 1 (Profiles) ✅

```bash
pnpm test:profiles
```

**Status:** All 15 integration tests passing ✅
- Profile creation with multi-API enrichment
- Idempotency verification
- Filtering (gender, country, age group)
- Error handling (validation, not found, API failures)
- Delete operations

### Test Both

```bash
pnpm test && pnpm test:profiles
```

---

## Deployment

### VPS Deployment with PM2

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for versioning and release procedures.

**Quick PM2 Setup:**

```bash
# Install PM2 globally (once)
npm install -g pm2

# Start the app
pm2 start ecosystem.config.js

# View logs
pm2 logs genderize-classifier

# Setup auto-restart
pm2 startup
pm2 save
```

---

## Project Structure

```
stage-zero/
├── src/
│   ├── main.ts                      # Entry point
│   ├── database.ts                  # TypeORM configuration (Stage 1)
│   ├── middleware/
│   │   └── index.middleware.ts      # CORS middleware
│   ├── routes/
│   │   ├── health.routes.ts         # Health check
│   │   ├── classify.routes.ts       # Gender classification (Stage 0)
│   │   └── profiles.routes.ts       # Profile management (Stage 1)
│   ├── services/
│   │   ├── genderize.services.ts    # Genderize API
│   │   ├── agify.services.ts        # Agify API (Stage 1)
│   │   ├── nationalize.services.ts  # Nationalize API (Stage 1)
│   │   └── profiles.services.ts     # Profile orchestration (Stage 1)
│   ├── entities/
│   │   └── Profile.ts               # TypeORM Profile entity (Stage 1)
│   ├── repositories/
│   │   └── ProfileRepository.ts     # Database access layer (Stage 1)
│   ├── migrations/
│   │   └── *-CreateProfilesTable.ts # Database migrations (Stage 1)
│   ├── types/
│   │   └── index.types.ts           # TypeScript interfaces
│   └── utils/
│       └── helpers.utils.ts         # Helper functions
├── tests/
│   ├── classify.test.ts             # Stage 0 tests
│   └── profiles.test.ts             # Stage 1 tests
├── dist/                            # Compiled output
├── CHANGELOG.md                     # Version history
├── CONTRIBUTION.md                  # Development guide
├── RELEASE_PROCESS.md               # Release procedures
├── .env.example                     # Environment template
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript config
├── ecosystem.config.js              # PM2 config
└── README.md                        # This file
```

---

## Error Codes

| Status | Reason | Response |
|--------|--------|----------|
| 200 | Success (or idempotent) | `{"status": "success", "data": {...}}` |
| 201 | Created | `{"status": "success", "data": {...}}` |
| 204 | Deleted (No Content) | (empty) |
| 400 | Bad Request (missing/empty name) | `{"status": "error", "message": "..."}` |
| 404 | Not Found | `{"status": "error", "message": "Profile not found"}` |
| 422 | Invalid Type | `{"status": "error", "message": "Name must be a string"}` |
| 500 | Server Error | `{"status": "error", "message": "Internal server error"}` |
| 502 | External API Error | `{"status": "error", "message": "{API} returned an invalid response"}` |

---

## Troubleshooting

### PostgreSQL Connection Error (Stage 1)

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Ensure PostgreSQL is running: `psql --version` and try `psql`
- Check DATABASE_URL format in .env
- Verify database exists: `psql -l`

### Port Already in Use

```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### External API Timeout

If profiles fail to create with 502 errors:
- Check internet connection
- Verify external APIs are reachable:
  ```bash
  curl https://api.genderize.io?name=test
  curl https://api.agify.io?name=test
  curl https://api.nationalize.io?name=test
  ```

### TypeORM Migration Issues

```bash
# Run migrations manually
npm run typeorm migration:run

# View migration status
npm run typeorm migration:show
```

---

## Development Guide

See [CONTRIBUTION.md](CONTRIBUTION.md) for:
- Branch strategy
- Local setup instructions
- Code style guidelines
- Testing requirements
- PR checklist

---

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for version history and [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for release procedures.

**Current Release:** `1.0.0` (Stage 1 - Completed ✅)  
**Upcoming:** Stage 2 (TBD)

---

## Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.1.0 | Web framework |
| axios | ^1.12.2 | HTTP client |
| cors | ^2.8.5 | CORS middleware |
| pg | ^8.11.3 | PostgreSQL driver |
| typeorm | ^0.3.17 | ORM & migrations |
| uuid | ^9.0.1 | UUID generation |
| dotenv | ^17.2.3 | Environment config |

### Development
| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.9.3 | Type safety |
| ts-node | ^10.9.2 | TS execution |
| @types/* | Latest | Type definitions |
| reflect-metadata | ^0.1.13 | TypeORM decorators |

---

## License

ISC

---

## Support

For issues, questions, or contributions, refer to [CONTRIBUTION.md](CONTRIBUTION.md).

---

## License

ISC

---

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## Author

Created as part of HNG Stage Zero Project

---

## Support

For issues or questions:
- Check the [Genderize.io API documentation](https://genderize.io/api)
- Review error responses and validation messages
- Check PM2 logs: `pm2 logs genderize-classifier`
