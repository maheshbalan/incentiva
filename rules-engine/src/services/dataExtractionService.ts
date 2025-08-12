import { prisma } from '../index';
import { logger } from '../utils/logger';
import { 
  DataExtractionQueries,
  TransactionJSONSchema,
  JSONRuleSet
} from '@incentiva/shared';
import { Pool, PoolClient } from 'pg';

export interface ExtractionResult {
  success: boolean
  recordsProcessed: number
  recordsInserted: number
  errors: string[]
  executionTime: number
  lastProcessedDate?: string
}

export interface CustomerDatabaseConnection {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
}

export class DataExtractionService {
  private customerDbPool: Pool | null = null;

  /**
   * Execute one-time data load for a campaign
   */
  async executeOneTimeLoad(
    campaignId: string,
    extractionQueries: DataExtractionQueries,
    customerDbConnection: CustomerDatabaseConnection,
    transactionSchema: TransactionJSONSchema
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const result: ExtractionResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      errors: [],
      executionTime: 0
    };

    try {
      logger.info('Starting one-time data load:', { campaignId });

      // Connect to customer database
      await this.connectToCustomerDatabase(customerDbConnection);

      // Execute the one-time load query
      const queryResult = await this.executeQuery(
        extractionQueries.oneTimeLoad.sql,
        extractionQueries.oneTimeLoad.parameters
      );

      if (!queryResult.rows) {
        throw new Error('No data returned from customer database');
      }

      result.recordsProcessed = queryResult.rows.length;
      logger.info('Data extracted from customer database:', { 
        campaignId, 
        recordCount: result.recordsProcessed 
      });

      // Transform and insert data into transaction table
      const insertedCount = await this.insertTransactions(
        campaignId,
        queryResult.rows,
        transactionSchema
      );

      result.recordsInserted = insertedCount;
      result.success = true;
      result.lastProcessedDate = new Date().toISOString();

      logger.info('One-time data load completed successfully:', {
        campaignId,
        processed: result.recordsProcessed,
        inserted: result.recordsInserted
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`One-time load failed: ${errorMsg}`);
      logger.error('One-time data load failed:', { campaignId, error: errorMsg });
    } finally {
      result.executionTime = Date.now() - startTime;
      await this.disconnectFromCustomerDatabase();
    }

    return result;
  }

  /**
   * Execute incremental data load for a campaign
   */
  async executeIncrementalLoad(
    campaignId: string,
    extractionQueries: DataExtractionQueries,
    customerDbConnection: CustomerDatabaseConnection,
    transactionSchema: TransactionJSONSchema
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const result: ExtractionResult = {
      success: false,
      recordsProcessed: 0,
      recordsInserted: 0,
      errors: [],
      executionTime: 0
    };

    try {
      logger.info('Starting incremental data load:', { campaignId });

      // Connect to customer database
      await this.connectToCustomerDatabase(customerDbConnection);

      // Get the last processed date from our transaction table
      const lastProcessedDate = await this.getLastProcessedDate(campaignId);
      
      // Update query parameters with last processed date
      const updatedParams = {
        ...extractionQueries.incrementalLoad.parameters,
        lastProcessedDate: lastProcessedDate || '1970-01-01'
      };

      // Execute the incremental load query
      const queryResult = await this.executeQuery(
        extractionQueries.incrementalLoad.sql,
        updatedParams
      );

      if (!queryResult.rows) {
        throw new Error('No data returned from customer database');
      }

      result.recordsProcessed = queryResult.rows.length;
      logger.info('Incremental data extracted:', { 
        campaignId, 
        recordCount: result.recordsProcessed,
        lastProcessedDate
      });

      // Transform and insert new data into transaction table
      const insertedCount = await this.insertTransactions(
        campaignId,
        queryResult.rows,
        transactionSchema
      );

      result.recordsInserted = insertedCount;
      result.success = true;
      result.lastProcessedDate = new Date().toISOString();

      logger.info('Incremental data load completed successfully:', {
        campaignId,
        processed: result.recordsProcessed,
        inserted: result.recordsInserted
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Incremental load failed: ${errorMsg}`);
      logger.error('Incremental data load failed:', { campaignId, error: errorMsg });
    } finally {
      result.executionTime = Date.now() - startTime;
      await this.disconnectFromCustomerDatabase();
    }

    return result;
  }

  /**
   * Connect to customer database
   */
  private async connectToCustomerDatabase(connection: CustomerDatabaseConnection): Promise<void> {
    try {
      this.customerDbPool = new Pool({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.username,
        password: connection.password,
        ssl: connection.ssl || false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      });

      // Test connection
      const client = await this.customerDbPool.connect();
      await client.query('SELECT 1');
      client.release();

      logger.info('Connected to customer database successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to connect to customer database: ${errorMsg}`);
    }
  }

  /**
   * Execute query on customer database
   */
  private async executeQuery(sql: string, parameters: Record<string, any>): Promise<any> {
    if (!this.customerDbPool) {
      throw new Error('Not connected to customer database');
    }

    try {
      // Replace parameter placeholders with actual values
      let processedSql = sql;
      const values: any[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(parameters)) {
        const placeholder = `:${key}`;
        if (processedSql.includes(placeholder)) {
          processedSql = processedSql.replace(new RegExp(placeholder, 'g'), `$${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      logger.debug('Executing query:', { sql: processedSql, parameters: values });
      
      const result = await this.customerDbPool.query(processedSql, values);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Query execution failed: ${errorMsg}`);
    }
  }

  /**
   * Insert transactions into our transaction table
   */
  private async insertTransactions(
    campaignId: string,
    customerData: any[],
    transactionSchema: TransactionJSONSchema
  ): Promise<number> {
    try {
      let insertedCount = 0;

      for (const record of customerData) {
        try {
          // Transform customer data to transaction format
          const transactionData = this.transformCustomerDataToTransaction(
            record,
            transactionSchema
          );

          // Insert into transaction table
          await prisma.campaignTransaction.create({
            data: {
              campaignId,
              externalId: record.orderId || record.id,
              externalType: 'customer_order',
              transactionData: transactionData as any,
              status: 'PENDING',
              processingPriority: 1
            }
          });

          insertedCount++;
        } catch (insertError) {
          logger.warn('Failed to insert transaction record:', {
            campaignId,
            record: record.orderId || record.id,
            error: insertError instanceof Error ? insertError.message : 'Unknown error'
          });
        }
      }

      return insertedCount;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to insert transactions: ${errorMsg}`);
    }
  }

  /**
   * Transform customer data to transaction format based on schema
   */
  private transformCustomerDataToTransaction(
    customerRecord: any,
    schema: TransactionJSONSchema
  ): Record<string, any> {
    const transaction: Record<string, any> = {};

    for (const field of schema.fields) {
      const sourceValue = customerRecord[field.sourceField];
      
      if (sourceValue !== undefined) {
        // Apply transformation if specified
        if (field.transformation) {
          transaction[field.name] = this.applyTransformation(sourceValue, field.transformation);
        } else {
          transaction[field.name] = sourceValue;
        }
      } else if (field.required) {
        logger.warn('Required field missing:', { field: field.name, sourceField: field.sourceField });
        transaction[field.name] = null;
      }
    }

    return transaction;
  }

  /**
   * Apply field transformation
   */
  private applyTransformation(value: any, transformation: string): any {
    try {
      // Simple transformation examples - can be extended
      if (transformation === 'toUpperCase' && typeof value === 'string') {
        return value.toUpperCase();
      }
      if (transformation === 'toLowerCase' && typeof value === 'string') {
        return value.toLowerCase();
      }
      if (transformation === 'parseFloat' && typeof value === 'string') {
        return parseFloat(value);
      }
      if (transformation === 'parseInt' && typeof value === 'string') {
        return parseInt(value, 10);
      }
      
      // Default: return original value
      return value;
    } catch (error) {
      logger.warn('Transformation failed:', { value, transformation, error });
      return value;
    }
  }

  /**
   * Get last processed date for incremental loads
   */
  private async getLastProcessedDate(campaignId: string): Promise<string | null> {
    try {
      const lastTransaction = await prisma.campaignTransaction.findFirst({
        where: { campaignId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      return lastTransaction?.createdAt?.toISOString() || null;
    } catch (error) {
      logger.warn('Failed to get last processed date:', { campaignId, error });
      return null;
    }
  }

  /**
   * Disconnect from customer database
   */
  private async disconnectFromCustomerDatabase(): Promise<void> {
    if (this.customerDbPool) {
      try {
        await this.customerDbPool.end();
        this.customerDbPool = null;
        logger.info('Disconnected from customer database');
      } catch (error) {
        logger.warn('Error disconnecting from customer database:', error);
      }
    }
  }

  /**
   * Schedule recurring incremental loads
   */
  async scheduleIncrementalLoads(
    campaignId: string,
    schedule: string,
    extractionQueries: DataExtractionQueries,
    customerDbConnection: CustomerDatabaseConnection,
    transactionSchema: TransactionJSONSchema
  ): Promise<void> {
    // This would integrate with a job scheduler like node-cron
    // For now, we'll just log the schedule
    logger.info('Scheduling incremental loads:', {
      campaignId,
      schedule,
      nextRun: this.calculateNextRun(schedule)
    });
  }

  /**
   * Calculate next run time based on schedule
   */
  private calculateNextRun(schedule: string): string {
    // Simple schedule parsing - can be enhanced
    if (schedule === 'daily') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // 2 AM
      return tomorrow.toISOString();
    }
    
    return new Date().toISOString();
  }
}
