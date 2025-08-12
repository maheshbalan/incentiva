import { prisma } from '../index';
import { logger } from '../utils/logger';
import { CampaignTransaction, TransactionProcessingStatus } from '@incentiva/shared';

export class TransactionService {
  async getTransactionStatistics(campaignId: string) {
    try {
      const [
        totalTransactions,
        pendingTransactions,
        completedTransactions,
        failedTransactions,
        totalPoints
      ] = await Promise.all([
        prisma.campaignTransaction.count({
          where: { campaignId }
        }),
        prisma.campaignTransaction.count({
          where: { 
            campaignId,
            processingStatus: 'PENDING'
          }
        }),
        prisma.campaignTransaction.count({
          where: { 
            campaignId,
            processingStatus: 'COMPLETED'
          }
        }),
        prisma.campaignTransaction.count({
          where: { 
            campaignId,
            processingStatus: 'FAILED'
          }
        }),
        prisma.campaignTransaction.aggregate({
          where: { campaignId },
          _sum: { pointsAllocated: true }
        })
      ]);

      return {
        totalTransactions,
        pendingTransactions,
        completedTransactions,
        failedTransactions,
        totalPoints: totalPoints._sum.pointsAllocated || 0,
        successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0
      };
    } catch (error) {
      logger.error('Failed to get transaction statistics:', error);
      throw error;
    }
  }

  async retryTransaction(transactionId: string) {
    try {
      const transaction = await prisma.campaignTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.retryCount >= transaction.maxRetries) {
        throw new Error('Maximum retry count exceeded');
      }

      const updatedTransaction = await prisma.campaignTransaction.update({
        where: { id: transactionId },
        data: {
          processingStatus: 'PENDING',
          retryCount: { increment: 1 },
          errorMessage: null,
          updatedAt: new Date()
        }
      });

      logger.info('Transaction retry initiated:', { transactionId, retryCount: updatedTransaction.retryCount });
      return updatedTransaction;
    } catch (error) {
      logger.error('Failed to retry transaction:', error);
      throw error;
    }
  }

  async bulkRetryFailedTransactions(campaignId: string) {
    try {
      const failedTransactions = await prisma.campaignTransaction.findMany({
        where: {
          campaignId,
          processingStatus: 'FAILED',
          retryCount: { lt: 3 } // maxRetries
        }
      });

      const retryPromises = failedTransactions.map(transaction => this.retryTransaction(transaction.id));
      const results = await Promise.allSettled(retryPromises);

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      logger.info('Bulk retry completed:', { 
        campaignId, 
        total: failedTransactions.length, 
        successful, 
        failed 
      });

      return {
        retryCount: successful,
        failedCount: failed,
        totalProcessed: failedTransactions.length
      };
    } catch (error) {
      logger.error('Failed to bulk retry transactions:', error);
      throw error;
    }
  }

  async getProcessingQueue(campaignId: string, limit: number = 50) {
    try {
      const queue = await prisma.campaignTransaction.findMany({
        where: {
          campaignId,
          processingStatus: 'PENDING'
        },
        orderBy: [
          { retryCount: 'asc' },
          { createdAt: 'asc' }
        ],
        take: limit,
        select: {
          id: true,
          externalId: true,
          externalType: true,
          retryCount: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return queue;
    } catch (error) {
      logger.error('Failed to get processing queue:', error);
      throw error;
    }
  }

  async processTransaction(transactionId: string) {
    try {
      const transaction = await prisma.campaignTransaction.findUnique({
        where: { id: transactionId }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update status to processing
      await prisma.campaignTransaction.update({
        where: { id: transactionId },
        data: {
          processingStatus: 'PROCESSING',
          updatedAt: new Date()
        }
      });

      // TODO: Implement actual transaction processing logic
      // This would include:
      // 1. Applying business rules
      // 2. Calculating points
      // 3. Calling TLP API
      // 4. Updating status

      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedTransaction = await prisma.campaignTransaction.update({
        where: { id: transactionId },
        data: {
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info('Transaction processed successfully:', { transactionId });
      return updatedTransaction;
    } catch (error) {
      logger.error('Failed to process transaction:', error);
      
      // Update status to failed
      await prisma.campaignTransaction.update({
        where: { id: transactionId },
        data: {
          processingStatus: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        }
      });

      throw error;
    }
  }

  async exportTransactions(campaignId: string, format: string = 'json') {
    try {
      const transactions = await prisma.campaignTransaction.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' }
      });

      if (format === 'csv') {
        // Convert to CSV format
        const headers = ['ID', 'External ID', 'Type', 'Status', 'Points', 'Created', 'Updated'];
        const rows = transactions.map(t => [
          t.id,
          t.externalId || '',
          t.externalType || '',
          t.processingStatus,
          t.pointsAllocated,
          t.createdAt.toISOString(),
          t.updatedAt.toISOString()
        ]);

        const csvContent = [headers, ...rows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        return csvContent;
      }

      return transactions;
    } catch (error) {
      logger.error('Failed to export transactions:', error);
      throw error;
    }
  }

  async getProcessingMetrics(campaignId: string, period: string = '24h') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const metrics = await prisma.campaignTransaction.groupBy({
        by: ['processingStatus'],
        where: {
          campaignId,
          createdAt: { gte: startDate }
        },
        _count: { id: true },
        _sum: { pointsAllocated: true }
      });

      const result = {
        period,
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        totalPoints: 0,
        averageProcessingTime: 0
      };

      metrics.forEach(metric => {
        const count = metric._count.id;
        const points = metric._sum.pointsAllocated || 0;

        result.totalTransactions += count;
        result.totalPoints += points;

        switch (metric.processingStatus) {
          case 'COMPLETED':
            result.completedTransactions = count;
            break;
          case 'FAILED':
            result.failedTransactions = count;
            break;
          case 'PENDING':
            result.pendingTransactions = count;
            break;
        }
      });

      return result;
    } catch (error) {
      logger.error('Failed to get processing metrics:', error);
      throw error;
    }
  }
}
