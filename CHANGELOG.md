# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-04-16

### Added
- Initial project setup with TypeScript and Express.js
- Gender classification API endpoint (`GET /api/classify?name={name}`)
- Integration with Genderize.io external API
- Health check endpoint (`GET /health`)
- CORS middleware configuration
- Input validation for name parameter (empty, null, numeric values)
- Error handling with proper HTTP status codes (400, 422, 502, 500)
- Confidence scoring based on probability and sample size
- ISO 8601 formatted timestamps
- Integration tests using Node's `http` module
- PM2 ecosystem configuration for VPS deployment
- TypeScript strict mode enabled
- `.gitignore` and project structure

### Technical Details
- **Framework:** Express 5.1.0
- **Language:** TypeScript 5.9.3
- **HTTP Client:** Axios 1.12.2
- **CORS:** cors 2.8.5
- **Node.js:** v16+
- **Package Manager:** pnpm 8+

## [1.0.0] - 2026-04-17 (Stage 1)

### Added
- **Data Persistence:** PostgreSQL integration with TypeORM and automated migrations
- **Profile Entity:** UUID v7 identifiers, case-insensitive name uniqueness, timestamps
- **Multi-API Integration:** Agify (age prediction), Nationalize (country prediction) services alongside existing Genderize
- **RESTful Endpoints:**
  - `POST /api/profiles` - Create profile with idempotency (duplicate name handling)
  - `GET /api/profiles/{id}` - Retrieve single profile by ID
  - `GET /api/profiles` - List profiles with optional filtering (gender, country_id, age_group)
  - `DELETE /api/profiles/{id}` - Delete profile (204 No Content)
- **Age Classification:** Automatic age group categorization (child, teenager, adult, senior)
- **Intelligent Filtering:** Case-insensitive query parameters with multi-field support
- **Robust Error Handling:** Proper HTTP status codes (400, 404, 422, 502) with descriptive messages
- **Data Validation:** Edge case handling for null/missing API responses
- **Database Schema:** Profiles table with indexes for performance (name, gender, age_group, country_id, created_at)
- **Comprehensive Testing:** 15 integration tests covering CRUD, idempotency, filtering, and error cases
- **Enhanced Documentation:** Updated README with Stage 1 endpoints, database setup, troubleshooting guides
- **Release Infrastructure:** CHANGELOG tracking, RELEASE_PROCESS.md for versioning workflow
- **Development Workflow:** CONTRIBUTION.md with branch strategy (main/develop/stage-1)
- **Configuration:** .env.example template for database and API endpoints

### Technical Details
- **ORM:** TypeORM 0.3.28 with automatic migrations
- **Database:** PostgreSQL 12+ (self-hosted or managed)
- **UUID Generation:** UUID v7 with timestamp-based implementation
- **API Timeouts:** Configurable timeout for external API calls (default 5000ms)
- **Type Safety:** Full TypeScript strict mode with entity decorators
- **Database Access:** Repository pattern for clean separation of concerns
- **Parallel Processing:** Concurrent API calls for profile enrichment

### Known Limitations
- External API calls are blocking; consider message queue for batch processing in future versions
- UUID v7 uses custom timestamp-based implementation (not RFC 9562 compliant)
