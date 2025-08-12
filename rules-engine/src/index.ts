import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rulesEngineRoutes } from './controllers/rulesEngineController';
import { jobRoutes } from './controllers/jobController';
import { transactionRoutes } from './controllers/transactionController';
import { healthRoutes } from './controllers/healthController';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.use('/health', healthRoutes);

// API routes with authentication
app.use('/api/rules-engine', authMiddleware, rulesEngineRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  logger.info(`🚀 Rules Engine Service started on port ${port}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${port}/health`);
});

export default app;
