import express, { Express } from 'express';
import { corsMiddleware, manualCors } from './middleware/index.middleware';
import { classifyRoute } from './routes/classify.routes';
import { healthRoute } from './routes/health.routes';

const app: Express = express();
const port = process.env.PORT || 3000;

// ==================== Middleware ====================

// Enable CORS
app.use(corsMiddleware);

// Fallback: Manually set CORS headers
app.use(manualCors);

// ==================== Routes ====================

// Health check
app.get('/health', healthRoute);

// Classify gender endpoint
app.get('/api/classify', classifyRoute);

// ==================== Server Start ====================

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Endpoint available at http://localhost:${port}/api/classify?name=<name>`);
});

export default app;
