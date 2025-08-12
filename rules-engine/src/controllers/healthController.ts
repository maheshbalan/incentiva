import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rules-engine',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    logger.info('Health check passed');
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'rules-engine',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    res.status(503).json(healthStatus);
  }
});

// Detailed health check
router.get('/detailed', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;
    
    // Check system resources
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rules-engine',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      system: {
        uptime: process.uptime(),
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        cpu: {
          user: `${Math.round(cpuUsage.user / 1000)}ms`,
          system: `${Math.round(cpuUsage.system / 1000)}ms`,
        },
      },
      dependencies: {
        prisma: 'connected',
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    logger.info('Detailed health check passed');
    res.status(200).json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    
    const detailedHealth = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'rules-engine',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };

    res.status(503).json(detailedHealth);
  }
});

export { router as healthRoutes };
