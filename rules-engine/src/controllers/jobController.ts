import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { JobService } from '../services/jobService';

const router = Router();
const jobService = new JobService();

// Create a new rules engine job
router.post('/', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { 
    campaignId, 
    jobType, 
    schedule, 
    isRecurring, 
    dataSourceConfig, 
    batchSize, 
    maxConcurrency 
  } = req.body;

  if (!campaignId || !jobType || !dataSourceConfig) {
    throw createError('Campaign ID, job type, and data source configuration are required', 400);
  }

  logger.info('Creating rules engine job:', { campaignId, jobType });

  try {
    const job = await jobService.createJob({
      campaignId,
      jobType,
      schedule,
      isRecurring: isRecurring || false,
      dataSourceConfig,
      batchSize: batchSize || 1000,
      maxConcurrency: maxConcurrency || 5
    });

    logger.info('Job created successfully:', { campaignId, jobId: job.id });

    res.status(201).json({
      status: 'success',
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    logger.error('Failed to create job:', error);
    throw createError('Failed to create job', 500);
  }
}));

// Get all jobs for a campaign
router.get('/campaign/:campaignId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  logger.info('Retrieving jobs for campaign:', { campaignId });

  try {
    const jobs = await prisma.rulesEngineJob.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Get last 5 executions
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: jobs
    });
  } catch (error) {
    logger.error('Failed to retrieve jobs:', error);
    throw createError('Failed to retrieve campaign jobs', 500);
  }
}));

// Get a specific job
router.get('/:jobId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  logger.info('Retrieving job:', { jobId });

  try {
    const job = await prisma.rulesEngineJob.findUnique({
      where: { id: jobId },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!job) {
      throw createError('Job not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: job
    });
  } catch (error) {
    logger.error('Failed to retrieve job:', error);
    throw createError('Failed to retrieve job', 500);
  }
}));

// Start a job execution
router.post('/:jobId/start', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  logger.info('Starting job execution:', { jobId });

  try {
    const execution = await jobService.startJobExecution(jobId);

    logger.info('Job execution started:', { jobId, executionId: execution.id });

    res.status(200).json({
      status: 'success',
      message: 'Job execution started successfully',
      data: execution
    });
  } catch (error) {
    logger.error('Failed to start job execution:', error);
    throw createError('Failed to start job execution', 500);
  }
}));

// Stop a job execution
router.post('/:jobId/stop', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  logger.info('Stopping job execution:', { jobId });

  try {
    const result = await jobService.stopJobExecution(jobId);

    logger.info('Job execution stopped:', { jobId });

    res.status(200).json({
      status: 'success',
      message: 'Job execution stopped successfully',
      data: result
    });
  } catch (error) {
    logger.error('Failed to stop job execution:', error);
    throw createError('Failed to stop job execution', 500);
  }
}));

// Update job configuration
router.put('/:jobId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const updateData = req.body;

  logger.info('Updating job configuration:', { jobId });

  try {
    const updatedJob = await prisma.rulesEngineJob.update({
      where: { id: jobId },
      data: updateData
    });

    logger.info('Job updated successfully:', { jobId });

    res.status(200).json({
      status: 'success',
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    logger.error('Failed to update job:', error);
    throw createError('Failed to update job', 500);
  }
}));

// Delete a job
router.delete('/:jobId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  logger.info('Deleting job:', { jobId });

  try {
    // Check if job has running executions
    const runningExecutions = await prisma.rulesEngineExecution.findMany({
      where: { 
        jobId, 
        status: 'RUNNING' 
      }
    });

    if (runningExecutions.length > 0) {
      throw createError('Cannot delete job with running executions', 400);
    }

    // Delete job and all executions
    await prisma.rulesEngineExecution.deleteMany({
      where: { jobId }
    });

    await prisma.rulesEngineJob.delete({
      where: { id: jobId }
    });

    logger.info('Job deleted successfully:', { jobId });

    res.status(200).json({
      status: 'success',
      message: 'Job deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete job:', error);
    throw createError('Failed to delete job', 500);
  }
}));

// Get job execution logs
router.get('/:jobId/executions', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  logger.info('Retrieving job executions:', { jobId, limit, offset });

  try {
    const executions = await prisma.rulesEngineExecution.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const totalCount = await prisma.rulesEngineExecution.count({
      where: { jobId }
    });

    res.status(200).json({
      status: 'success',
      data: {
        executions,
        pagination: {
          total: totalCount,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: totalCount > Number(limit) + Number(offset)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve job executions:', error);
    throw createError('Failed to retrieve job executions', 500);
  }
}));

// Get specific execution details
router.get('/executions/:executionId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { executionId } = req.params;

  logger.info('Retrieving execution details:', { executionId });

  try {
    const execution = await prisma.rulesEngineExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      throw createError('Execution not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: execution
    });
  } catch (error) {
    logger.error('Failed to retrieve execution details:', error);
    throw createError('Failed to retrieve execution details', 500);
  }
}));

export { router as jobRoutes };
