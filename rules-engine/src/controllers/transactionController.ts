import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { TransactionService } from '../services/transactionService';

const router = Router();
const transactionService = new TransactionService();

// Get all transactions for a campaign
router.get('/campaign/:campaignId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { 
    limit = 100, 
    offset = 0, 
    status, 
    externalType,
    processed 
  } = req.query;

  logger.info('Retrieving transactions for campaign:', { campaignId, limit, offset, status });

  try {
    const whereClause: any = { campaignId };
    
    if (status) {
      whereClause.processingStatus = status;
    }
    
    if (externalType) {
      whereClause.externalType = externalType;
    }
    
    if (processed !== undefined) {
      whereClause.rulesApplied = processed === 'true';
    }

    const transactions = await prisma.campaignTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const totalCount = await prisma.campaignTransaction.count({
      where: whereClause
    });

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total: totalCount,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: totalCount > Number(limit) + Number(offset)
        }
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve transactions:', error);
    throw createError('Failed to retrieve transactions', 500);
  }
}));

// Get transaction statistics for a campaign
router.get('/campaign/:campaignId/stats', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  logger.info('Retrieving transaction statistics for campaign:', { campaignId });

  try {
    const stats = await transactionService.getTransactionStatistics(campaignId);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('Failed to retrieve transaction statistics:', error);
    throw createError('Failed to retrieve transaction statistics', 500);
  }
}));

// Get a specific transaction
router.get('/:transactionId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  logger.info('Retrieving transaction:', { transactionId });

  try {
    const transaction = await prisma.campaignTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw createError('Transaction not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    logger.error('Failed to retrieve transaction:', error);
    throw createError('Failed to retrieve transaction', 500);
  }
}));

// Retry failed transaction
router.post('/:transactionId/retry', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  logger.info('Retrying transaction:', { transactionId });

  try {
    const result = await transactionService.retryTransaction(transactionId);

    res.status(200).json({
      status: 'success',
      message: 'Transaction retry initiated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Failed to retry transaction:', error);
    throw createError('Failed to retry transaction', 500);
  }
}));

// Bulk retry failed transactions
router.post('/campaign/:campaignId/retry-failed', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  logger.info('Bulk retrying failed transactions for campaign:', { campaignId });

  try {
    const result = await transactionService.bulkRetryFailedTransactions(campaignId);

    res.status(200).json({
      status: 'success',
      message: `Bulk retry initiated for ${result.retryCount} transactions`,
      data: result
    });
  } catch (error) {
    logger.error('Failed to bulk retry transactions:', error);
    throw createError('Failed to bulk retry transactions', 500);
  }
}));

// Get transaction processing queue
router.get('/campaign/:campaignId/queue', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { limit = 50 } = req.query;

  logger.info('Retrieving transaction processing queue for campaign:', { campaignId, limit });

  try {
    const queue = await transactionService.getProcessingQueue(campaignId, Number(limit));

    res.status(200).json({
      status: 'success',
      data: queue
    });
  } catch (error) {
    logger.error('Failed to retrieve processing queue:', error);
    throw createError('Failed to retrieve processing queue', 500);
  }
});

// Manually process a transaction
router.post('/:transactionId/process', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  logger.info('Manually processing transaction:', { transactionId });

  try {
    const result = await transactionService.processTransaction(transactionId);

    res.status(200).json({
      status: 'success',
      message: 'Transaction processed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Failed to process transaction:', error);
    throw createError('Failed to process transaction', 500);
  }
});

// Get transaction error details
router.get('/:transactionId/errors', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;

  logger.info('Retrieving transaction error details:', { transactionId });

  try {
    const transaction = await prisma.campaignTransaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        errorMessage: true,
        retryCount: true,
        maxRetries: true,
        processingStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!transaction) {
      throw createError('Transaction not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    logger.error('Failed to retrieve transaction error details:', error);
    throw createError('Failed to retrieve transaction error details', 500);
  }
}));

// Update transaction metadata
router.put('/:transactionId', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const updateData = req.body;

  logger.info('Updating transaction metadata:', { transactionId });

  try {
    // Only allow updating certain fields
    const allowedFields = ['externalId', 'externalType', 'maxRetries'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        filteredData[field] = updateData[field];
      }
    }

    const updatedTransaction = await prisma.campaignTransaction.update({
      where: { id: transactionId },
      data: filteredData
    });

    logger.info('Transaction updated successfully:', { transactionId });

    res.status(200).json({
      status: 'success',
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    logger.error('Failed to update transaction:', error);
    throw createError('Failed to update transaction', 500);
  }
}));

// Export transactions for a campaign
router.get('/campaign/:campaignId/export', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { format = 'json' } = req.query;

  logger.info('Exporting transactions for campaign:', { campaignId, format });

  try {
    const exportData = await transactionService.exportTransactions(campaignId, format as string);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${campaignId}.csv"`);
      res.send(exportData);
    } else {
      res.status(200).json({
        status: 'success',
        data: exportData
      });
    }
  } catch (error) {
    logger.error('Failed to export transactions:', error);
    throw createError('Failed to export transactions', 500);
  }
}));

// Get transaction processing metrics
router.get('/campaign/:campaignId/metrics', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { period = '24h' } = req.query;

  logger.info('Retrieving transaction processing metrics for campaign:', { campaignId, period });

  try {
    const metrics = await transactionService.getProcessingMetrics(campaignId, period as string);

    res.status(200).json({
      status: 'success',
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to retrieve transaction metrics:', error);
    throw createError('Failed to retrieve transaction metrics', 500);
  }
}));

export { router as transactionRoutes };
