# Genderize Classifier

A REST API server that classifies and predicts gender based on names using the [Genderize.io API](https://genderize.io/). Built with Node.js, Express, and TypeScript for production-ready performance and type safety.

## Features

- **Fast & Reliable** - REST API endpoint for gender classification
- **Type-Safe** - Full TypeScript support for robust development
- **CORS Enabled** - Cross-origin resource sharing configured
- **Confidence Metrics** - Provides probability and sample size for predictions
- **Health Checks** - Built-in health monitoring endpoint
- **Error Handling** - Comprehensive input validation and error responses
- **Production Ready** - PM2 configuration for VPS deployment

## Prerequisites

- **Node.js** v16+ 
- **pnpm** v8+ (or npm/yarn)
- **TypeScript** knowledge (optional, pre-configured)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/icekidtech/genderize-classifier.git
cd genderize-classifier
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

### 3. Build the Project

```bash
pnpm build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`.

## Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
PORT=3000
NODE_ENV=development
```

**Supported Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode (development/production) |

## Usage

### Local Development

Start the development server with hot-reloading using ts-node:

```bash
pnpm dev
```

Server runs on `http://localhost:3000` by default.

### Production

Start the production server (requires build step):

```bash
pnpm build
pnpm start
```

Or specify a custom port:

```bash
PORT=5000 pnpm start
```

## API Endpoints

### 1. Health Check

**Endpoint:** `GET /health`

**Description:** Check if the server is running and ready to handle requests.

**Response:**
```json
{
  "message": "Server is running"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### 2. Gender Classification

**Endpoint:** `GET /api/classify`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | The name to classify |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "name": "John",
    "gender": "male",
    "probability": 0.95,
    "sample_size": 1250,
    "is_confident": true,
    "processed_at": "2024-04-16T10:30:45Z"
  }
}
```

**Error Response (400/422):**
```json
{
  "status": "error",
  "message": "Missing or empty name parameter"
}
```

**Examples:**

Classify a male name:
```bash
curl "http://localhost:3000/api/classify?name=John"
```

Classify a female name:
```bash
curl "http://localhost:3000/api/classify?name=Sarah"
```

With spaces in name:
```bash
curl "http://localhost:3000/api/classify?name=Mary%20Jane"
```

---

### Response Format

All responses follow a consistent structure:

**Success:**
```javascript
{
  status: "success",
  data: {
    name: string,              // Input name
    gender: "male" | "female", // Predicted gender
    probability: number,       // Confidence score (0-1)
    sample_size: number,       // Number of records analyzed
    is_confident: boolean,     // True if probability > 0.75 and sample_size > 100
    processed_at: string       // ISO timestamp
  }
}
```

**Error:**
```javascript
{
  status: "error",
  message: string // Error description
}
```

---

## Error Codes

| Status | Code | Message | Reason |
|--------|------|---------|--------|
| 400 | `Bad Request` | Missing or empty name parameter | Name query param missing or blank |
| 422 | `Unprocessable Entity` | Name must be a string | Invalid data type or numeric-only input |
| 500 | `Internal Server Error` | External API error | Genderize.io API unreachable or timeout |

---

## Project Structure

```
genderize-classifier/
├── src/
│   ├── main.ts                 # Entry point
│   ├── middleware/
│   │   └── index.middleware.ts # CORS and request middleware
│   ├── routes/
│   │   ├── classify.routes.ts  # Gender classification endpoint
│   │   └── health.routes.ts    # Health check endpoint
│   ├── services/
│   │   └── genderize.services.ts # Genderize API integration
│   ├── types/
│   │   └── index.types.ts      # TypeScript interfaces
│   └── utils/
│       └── helpers.utils.ts    # Helper functions
├── dist/                       # Compiled JavaScript output
├── tests/
│   └── classify.test.ts        # Test file
├── config.ecosystem.ts         # PM2 ecosystem configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## Testing

Run the test suite:

```bash
pnpm test
```

---

## Deployment

### VPS Deployment with PM2

This project includes a `config.ecosystem.ts` file for PM2 process management. Follow these steps to deploy on your VPS:

#### Prerequisites on VPS

- Node.js v16+
- pnpm installed globally
- PM2 installed globally: `npm install -g pm2`

#### Deployment Steps

1. **Copy project to VPS:**
   ```bash
   scp -r . user@vps-ip:/path/to/genderize-classifier
   ```

2. **SSH into VPS:**
   ```bash
   ssh user@vps-ip
   cd /path/to/genderize-classifier
   ```

3. **Install dependencies (production only):**
   ```bash
   pnpm install --prod
   ```

4. **Build the project:**
   ```bash
   pnpm build
   ```

5. **Start with PM2:**
   ```bash
   pm2 start config.ecosystem.ts
   ```

6. **Verify it's running:**
   ```bash
   pm2 list
   pm2 logs genderize-classifier
   ```

7. **Setup auto-startup on reboot:**
   ```bash
   pm2 startup
   pm2 save
   ```

#### PM2 Configuration Details

The `config.ecosystem.ts` file includes:

- **Port:** 5000 (avoids conflict with port 3000)
- **Memory Limit:** 300MB auto-restart
- **Auto-restart:** Enabled on crashes
- **Logging:** Error and output logs in `logs/` directory
- **Min Uptime:** 10s (counts as successful start after 10s)
- **Max Restarts:** 10 attempts before giving up

#### Useful PM2 Commands

```bash
# List all PM2 processes
pm2 list

# View logs
pm2 logs genderize-classifier

# Stop the app
pm2 stop genderize-classifier

# Restart the app
pm2 restart genderize-classifier

# Delete from PM2
pm2 delete genderize-classifier

# Monitor in real-time
pm2 monit
```

---

## Testing the Deployment

After deployment, test the endpoint:

```bash
# Health check
curl http://<vps-ip>:5000/health

# Classify a name
curl "http://<vps-ip>:5000/api/classify?name=John"
```

---

## Troubleshooting

### Port Already in Use

If port 3000 (or 5000) is already occupied:

```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm start
```

### Genderize API Timeout

If requests fail with timeout errors:
- Check internet connectivity on VPS
- Verify Genderize.io is accessible: `curl https://api.genderize.io`
- Timeout is set to 5 seconds in `src/services/genderize.services.ts`

### PM2 Won't Start

Ensure the build step completed:
```bash
pnpm build
ls -la dist/  # Verify dist/main.js exists
```

---

## Performance Notes

- API calls to Genderize.io have a 5-second timeout
- Responses include probability scores for confidence-based filtering
- Recommended for classifying single names per request
- For batch processing, consider throttling requests to avoid rate limits

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | Web framework |
| `axios` | ^1.12.2 | HTTP client for API calls |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^17.2.3 | Environment variable management |
| `typescript` | ^5.9.3 | Type safety (dev) |
| `ts-node` | ^10.9.2 | TypeScript execution (dev) |

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
