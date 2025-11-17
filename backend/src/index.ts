import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import env from './config/env';
import logger from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());

// Disable ETag for API responses to avoid 304 responses for dynamic data
app.disable('etag');

// CORS
const allowedOrigins = (env.CORS_ORIGIN).split(',').map(o => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prevent caching for API routes (ensure clients always receive JSON body)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT) || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 CORS enabled for: ${env.CORS_ORIGIN}`);
});

// Handle errors
server.on('error', (error) => {
  logger.error(`❌ Server error: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error(`❌ Unhandled rejection: ${error}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;

