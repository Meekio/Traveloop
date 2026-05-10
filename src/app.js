import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: config.apiVersion,
    environment: config.nodeEnv
  });
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import stopRoutes from './routes/stopRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import shareRoutes from './routes/shareRoutes.js';

// API routes
app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/', stopRoutes);
app.use('/', activityRoutes);
app.use('/', budgetRoutes);
app.use('/', noteRoutes);
app.use('/', checklistRoutes);
app.use('/', searchRoutes);
app.use('/', aiRoutes);
app.use('/', shareRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Traveloop API',
    version: config.apiVersion,
    endpoints: {
      health: '/health',
      version: '/version',
      auth: '/auth',
      trips: '/trips',
      stops: '/trips/:tripId/stops',
      activities: '/stops/:stopId/activities',
      budget: '/trips/:tripId/budget',
      notes: '/trips/:tripId/notes',
      checklist: '/trips/:tripId/checklist',
      search: {
        cities: '/search/cities?q=tokyo',
        weather: '/weather?lat=35.6762&lon=139.6503',
        activities: '/search/activities?lat=35.6762&lon=139.6503&category=restaurants'
      },
      ai: {
        generate: 'POST /trips/generate'
      },
      sharing: {
        create: 'POST /trips/:id/share',
        view: 'GET /shared/:shareToken',
        deactivate: 'DELETE /trips/:id/share'
      }
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
