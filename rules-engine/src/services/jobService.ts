import { prisma } from '../index';
import { logger } from '../utils/logger';
import { 
  RulesEngineJobType, 
  RulesEngineJobStatus, 
  RulesEngineExecutionType, 
  RulesEngineExecutionStatus 
} from '@incentiva/shared';
import { DataExtractionService } from './dataExtractionService';
import { RulesProcessingService } from './rulesProcessingService';
import { TLPIntegrationService } from './tlpIntegrationService';

export interface CreateJobData {
  campaignId: string;
  jobType: RulesEngineJobType;
  schedule?: string;
  isRecurring: boolean;
  dataSourceConfig: any;
  batchSize: number;
  maxConcurrency: number;
}

export class JobService {
  private dataExtractionService: DataExtractionService;
  private rulesProcessingService: RulesProcessingService;
  private tlpIntegrationService: TLPIntegrationService;

  constructor() {
    // Initialize services with mock configurations for now
    // TODO: Get actual configurations from campaign or environment
    this.dataExtractionService = new DataExtractionService();
    
    this.rulesProcessingService = new RulesProcessingService({
      campaignId: 'mock-campaign-id',
      version: '1.0',
      rules: { 
        eligibility: [], 
        accrual: [], 
        bonus: [] 
      }
    });
    
    this.tlpIntegrationService = new TLPIntegrationService({
      apiKey: 'mock-api-key',
      endpointUrl: 'https://mock-tlp-endpoint.com'
    });
  }

  /**
   * Create a new rules engine job
   */
  async createJob(jobData: CreateJobData) {
    try {
      logger.info('Creating new rules engine job:', jobData);

      const job = await prisma.rulesEngineJob.create({
        data: {
          campaignId: jobData.campaignId,
          jobType: jobData.jobType,
          status: RulesEngineJobStatus.PENDING,
          schedule: jobData.schedule,
          isRecurring: jobData.isRecurring,
          dataSourceConfig: jobData.dataSourceConfig,
          batchSize: jobData.batchSize,
          maxConcurrency: jobData.maxConcurrency,
          totalRecords: 0,
          processedRecords: 0,
          failedRecords: 0
        }
      });

      logger.info('Job created successfully:', { jobId: job.id, campaignId: jobData.campaignId });
      return job;

    } catch (error) {
      logger.error('Failed to create job:', error);
      throw new Error(`Failed to create job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start a job execution
   */
  async startJobExecution(jobId: string) {
    try {
      logger.info('Starting job execution:', { jobId });

      // Get the job details
      const job = await prisma.rulesEngineJob.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status === RulesEngineJobStatus.RUNNING) {
        throw new Error('Job is already running');
      }

      // Update job status to running
      await prisma.rulesEngineJob.update({
        where: { id: jobId },
        data: {
          status: RulesEngineJobStatus.RUNNING,
          startedAt: new Date()
        }
      });

      // Create execution record
      const execution = await prisma.rulesEngineExecution.create({
        data: {
          jobId,
          campaignId: job.campaignId,
          executionType: this.mapJobTypeToExecutionType(job.jobType),
          status: RulesEngineExecutionStatus.RUNNING,
          startTime: new Date()
        }
      });

      // Start the actual job processing in the background
      this.processJobInBackground(jobId, execution.id, job);

      logger.info('Job execution started:', { jobId, executionId: execution.id });
      return execution;

    } catch (error) {
      logger.error('Failed to start job execution:', error);
      throw new Error(`Failed to start job execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop a job execution
   */
  async stopJobExecution(jobId: string) {
    try {
      logger.info('Stopping job execution:', { jobId });

      // Update job status
      await prisma.rulesEngineJob.update({
        where: { id: jobId },
        data: {
          status: RulesEngineJobStatus.CANCELLED,
          completedAt: new Date()
        }
      });

      // Update running executions to cancelled
      await prisma.rulesEngineExecution.updateMany({
        where: { 
          jobId, 
          status: RulesEngineExecutionStatus.RUNNING 
        },
        data: {
          status: RulesEngineExecutionStatus.CANCELLED,
          endTime: new Date()
        }
      });

      logger.info('Job execution stopped:', { jobId });
      return { message: 'Job execution stopped successfully' };

    } catch (error) {
      logger.error('Failed to stop job execution:', error);
      throw new Error(`Failed to stop job execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process job in background
   */
  private async processJobInBackground(jobId: string, executionId: string, job: any) {
    try {
      logger.info('Processing job in background:', { jobId, executionId, jobType: job.jobType });

      let totalRecords = 0;
      let processedRecords = 0;
      let failedRecords = 0;

      // Execute based on job type
      switch (job.jobType) {
        case RulesEngineJobType.INITIAL_DATA_LOAD:
          // TODO: Implement initial data load
          logger.info('Initial data load would be performed here');
          totalRecords = 0;
          processedRecords = 0;
          failedRecords = 0;
          break;

        case RulesEngineJobType.INCREMENTAL_UPDATE:
          // TODO: Implement incremental update
          logger.info('Incremental update would be performed here');
          totalRecords = 0;
          processedRecords = 0;
          failedRecords = 0;
          break;

        case RulesEngineJobType.RULES_PROCESSING:
          // TODO: Implement rules processing for multiple transactions
          // For now, just log the action
          logger.info('Rules processing would be performed here');
          totalRecords = 0;
          processedRecords = 0;
          failedRecords = 0;
          break;

        case RulesEngineJobType.TLP_SYNC:
          // TODO: Implement TLP synchronization
          // For now, just log the action
          logger.info('TLP synchronization would be performed here');
          totalRecords = 0;
          processedRecords = 0;
          failedRecords = 0;
          break;

        default:
          throw new Error(`Unsupported job type: ${job.jobType}`);
      }

      // Update execution record
      await prisma.rulesEngineExecution.update({
        where: { id: executionId },
        data: {
          status: RulesEngineExecutionStatus.COMPLETED,
          endTime: new Date(),
          durationMs: Date.now() - new Date().getTime(),
          recordsProcessed: totalRecords,
          recordsSucceeded: processedRecords,
          recordsFailed: failedRecords
        }
      });

      // Update job record
      await prisma.rulesEngineJob.update({
        where: { id: jobId },
        data: {
          status: RulesEngineJobStatus.COMPLETED,
          completedAt: new Date(),
          totalRecords,
          processedRecords,
          failedRecords
        }
      });

      logger.info('Job processing completed:', { 
        jobId, 
        executionId, 
        totalRecords, 
        processedRecords, 
        failedRecords 
      });

    } catch (error) {
      logger.error('Job processing failed:', { jobId, executionId, error });

      // Update execution record with error
      await prisma.rulesEngineExecution.update({
        where: { id: executionId },
        data: {
          status: RulesEngineExecutionStatus.FAILED,
          endTime: new Date(),
          durationMs: Date.now() - new Date().getTime(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stackTrace: error instanceof Error ? error.stack : undefined
        }
      });

      // Update job record with error
      await prisma.rulesEngineJob.update({
        where: { id: jobId },
        data: {
          status: RulesEngineJobStatus.FAILED,
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  /**
   * Map job type to execution type
   */
  private mapJobTypeToExecutionType(jobType: RulesEngineJobType): RulesEngineExecutionType {
    switch (jobType) {
      case RulesEngineJobType.INITIAL_DATA_LOAD:
      case RulesEngineJobType.INCREMENTAL_UPDATE:
        return RulesEngineExecutionType.DATA_EXTRACTION;
      case RulesEngineJobType.RULES_PROCESSING:
        return RulesEngineExecutionType.RULES_APPLICATION;
      case RulesEngineJobType.TLP_SYNC:
        return RulesEngineExecutionType.TLP_INTEGRATION;
      default:
        return RulesEngineExecutionType.FULL_PROCESSING;
    }
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(campaignId: string) {
    try {
      const stats = await prisma.rulesEngineJob.groupBy({
        by: ['status'],
        where: { campaignId },
        _count: { id: true },
        _sum: {
          totalRecords: true,
          processedRecords: true,
          failedRecords: true
        }
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get job statistics:', error);
      throw new Error(`Failed to get job statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule recurring jobs
   */
  async scheduleRecurringJobs() {
    try {
      const recurringJobs = await prisma.rulesEngineJob.findMany({
        where: {
          isRecurring: true,
          status: {
            in: [RulesEngineJobStatus.COMPLETED, RulesEngineJobStatus.FAILED]
          }
        }
      });

      for (const job of recurringJobs) {
        if (job.schedule) {
          // Check if it's time to run the job based on schedule
          if (this.shouldRunJob(job.schedule, job.lastRunAt)) {
            logger.info('Scheduling recurring job:', { jobId: job.id, schedule: job.schedule });
            
            // Schedule the job to run
            setTimeout(() => {
              this.startJobExecution(job.id);
            }, 1000); // Run after 1 second
          }
        }
      }
    } catch (error) {
      logger.error('Failed to schedule recurring jobs:', error);
    }
  }

  /**
   * Check if a job should run based on schedule
   */
  private shouldRunJob(schedule: string, lastRunAt?: Date | null): boolean {
    if (!lastRunAt) {
      return true; // First run
    }

    // Simple schedule checking - in production, use a proper cron parser
    // This is a simplified version for demonstration
    const now = new Date();
    const timeSinceLastRun = now.getTime() - lastRunAt.getTime();
    
    // For now, just check if it's been more than 1 hour since last run
    // In production, this would parse the actual cron expression
    return timeSinceLastRun > 60 * 60 * 1000; // 1 hour
  }
}
