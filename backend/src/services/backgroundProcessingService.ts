import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import TLPService from './tlpService'
import { Pool, Client } from 'pg'

export interface DataExtractionJob {
  id: string
  campaignId: string
  type: 'ONE_TIME' | 'INCREMENTAL'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  startedAt?: Date
  completedAt?: Date
  extractedRows: number
  error?: string
  lastProcessedTimestamp?: string
}

export interface TransactionProcessingJob {
  id: string
  campaignId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  startedAt?: Date
  completedAt?: Date
  processedTransactions: number
  successfulAccruals: number
  failedAccruals: number
  error?: string
}

export class BackgroundProcessingService {
  private prisma: PrismaClient
  private isRunning: boolean = false

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Start background processing for a campaign
   */
  async startCampaignProcessing(campaignId: string): Promise<void> {
    try {
      logger.info('Starting background processing for campaign', { campaignId })

      // Check if processing is already running
      if (this.isRunning) {
        logger.warn('Background processing already running', { campaignId })
        return
      }

      this.isRunning = true

      // Start data extraction
      await this.executeOneTimeDataExtraction(campaignId)

      // Start transaction processing
      await this.processTransactions(campaignId)

      logger.info('Background processing started successfully', { campaignId })
    } catch (error: any) {
      logger.error('Failed to start background processing', {
        campaignId,
        error: error.message
      })
      this.isRunning = false
      throw error
    }
  }

  /**
   * Execute one-time data extraction from customer database
   */
  async executeOneTimeDataExtraction(campaignId: string): Promise<DataExtractionJob> {
    const jobId = `extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info('Starting one-time data extraction', { jobId, campaignId })

      // Create extraction job record
      const job = await this.prisma.dataExtractionJob.create({
        data: {
          id: jobId,
          campaignId,
          type: 'ONE_TIME',
          status: 'RUNNING',
          startedAt: new Date(),
          extractedRows: 0
        }
      })

      // Get campaign configuration
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId }
      })

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      if (!campaign.dataExtractionQueries) {
        throw new Error('No data extraction queries configured')
      }

      // Parse extraction queries
      const queries = JSON.parse(campaign.dataExtractionQueries)
      
      // Connect to customer database
      const customerDb = await this.connectToCustomerDatabase(campaign)
      
      try {
        // Execute one-time load query
        const oneTimeQuery = queries.oneTimeLoad?.query
        if (!oneTimeQuery) {
          throw new Error('One-time load query not found')
        }

        logger.info('Executing one-time data extraction query', {
          jobId,
          campaignId,
          query: oneTimeQuery.substring(0, 100) + '...'
        })

        const result = await customerDb.query(oneTimeQuery)
        const extractedRows = result.rows.length

        logger.info('One-time data extraction completed', {
          jobId,
          campaignId,
          extractedRows
        })

        // Transform and store extracted data
        await this.storeExtractedData(campaignId, result.rows, queries.dataTransformation)

        // Update job status
        await this.prisma.dataExtractionJob.update({
          where: { id: jobId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            extractedRows
          }
        })

        return {
          ...job,
          status: 'COMPLETED',
          completedAt: new Date(),
          extractedRows,
          lastProcessedTimestamp: new Date().toISOString()
        }

      } finally {
        // Close database connection
        await customerDb.end()
      }

    } catch (error: any) {
      logger.error('One-time data extraction failed', {
        jobId,
        campaignId,
        error: error.message
      })

      // Update job status
      await this.prisma.dataExtractionJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message
        }
      })

      throw error
    }
  }

  /**
   * Execute incremental data extraction
   */
  async executeIncrementalDataExtraction(campaignId: string): Promise<DataExtractionJob> {
    const jobId = `extract_inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info('Starting incremental data extraction', { jobId, campaignId })

      // Create extraction job record
      const job = await this.prisma.dataExtractionJob.create({
        data: {
          id: jobId,
          campaignId,
          type: 'INCREMENTAL',
          status: 'RUNNING',
          startedAt: new Date(),
          extractedRows: 0
        }
      })

      // Get campaign configuration
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId }
      })

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      if (!campaign.dataExtractionQueries) {
        throw new Error('No data extraction queries configured')
      }

      // Get last extraction timestamp
      const lastJob = await this.prisma.dataExtractionJob.findFirst({
        where: {
          campaignId,
          type: 'INCREMENTAL',
          status: 'COMPLETED'
        },
        orderBy: { completedAt: 'desc' }
      })

      const lastTimestamp = lastJob?.lastProcessedTimestamp || campaign.startDate

      // Parse extraction queries
      const queries = JSON.parse(campaign.dataExtractionQueries)
      
      // Connect to customer database
      const customerDb = await this.connectToCustomerDatabase(campaign)
      
      try {
        // Execute incremental load query
        const incrementalQuery = queries.incrementalLoad?.query
        if (!incrementalQuery) {
          throw new Error('Incremental load query not found')
        }

        logger.info('Executing incremental data extraction query', {
          jobId,
          campaignId,
          lastTimestamp,
          query: incrementalQuery.substring(0, 100) + '...'
        })

        const result = await customerDb.query(incrementalQuery, [lastTimestamp])
        const extractedRows = result.rows.length

        logger.info('Incremental data extraction completed', {
          jobId,
          campaignId,
          extractedRows
        })

        // Transform and store extracted data
        await this.storeExtractedData(campaignId, result.rows, queries.dataTransformation)

        // Update job status
        await this.prisma.dataExtractionJob.update({
          where: { id: jobId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            extractedRows,
            lastProcessedTimestamp: new Date().toISOString()
          }
        })

        return {
          ...job,
          status: 'COMPLETED',
          completedAt: new Date(),
          extractedRows,
          lastProcessedTimestamp: new Date().toISOString()
        }

      } finally {
        // Close database connection
        await customerDb.end()
      }

    } catch (error: any) {
      logger.error('Incremental data extraction failed', {
        jobId,
        campaignId,
        error: error.message
      })

      // Update job status
      await this.prisma.dataExtractionJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message
        }
      })

      throw error
    }
  }

  /**
   * Process transactions using campaign rules
   */
  async processTransactions(campaignId: string): Promise<TransactionProcessingJob> {
    const jobId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info('Starting transaction processing', { jobId, campaignId })

      // Create processing job record
      const job = await this.prisma.transactionProcessingJob.create({
        data: {
          id: jobId,
          campaignId,
          status: 'RUNNING',
          startedAt: new Date(),
          processedTransactions: 0,
          successfulAccruals: 0,
          failedAccruals: 0
        }
      })

      // Get campaign and rules
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          participants: {
            include: {
              user: true
            }
          }
        }
      })

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      if (!campaign.jsonRules) {
        throw new Error('No JSON rules configured')
      }

      // Parse JSON rules
      const rules = JSON.parse(campaign.jsonRules)
      
      // Get unprocessed transactions
      const transactions = await this.prisma.campaignTransaction.findMany({
                  where: {
            campaignId,
            processedAt: null
          }
      })

      logger.info('Processing transactions', {
        jobId,
        campaignId,
        transactionCount: transactions.length
      })

      let successfulAccruals = 0
      let failedAccruals = 0

      // Process each transaction
      for (const transaction of transactions) {
        try {
          const transactionData = JSON.parse(transaction.transactionData as string)
          
          // Apply eligibility rules
          const isEligible = this.evaluateEligibilityRules(transactionData, rules.eligibilityRules)
          
          if (!isEligible) {
            logger.debug('Transaction not eligible', {
              jobId,
              transactionId: transaction.id,
              reason: 'Failed eligibility rules'
            })
            continue
          }

          // Calculate points using accrual rules
          const pointsEarned = this.calculatePoints(transactionData, rules.accrualRules)
          
          if (pointsEarned > 0) {
            // Create TLP accrual
            const tlpService = new TLPService({
              apiKey: campaign.tlpApiKey!,
              endpointUrl: campaign.tlpEndpointUrl!
            })

            const participant = campaign.participants.find(p => p.userId === transaction.participantId)
            if (participant) {
              const accrualResult = await tlpService.createDynamicAccrualOffer(
                campaign,
                participant.user,
                transactionData.amount || 0
              )

              if (accrualResult.status === 'SUCCESS') {
                successfulAccruals++
                
                // Update transaction
                await this.prisma.campaignTransaction.update({
                  where: { id: transaction.id },
                  data: {
                    processedAt: new Date(),
                    pointsEarned,
                    tlpResponse: accrualResult.response
                  }
                })

                logger.info('Transaction processed successfully', {
                  jobId,
                  transactionId: transaction.id,
                  pointsEarned
                })
              } else {
                failedAccruals++
                logger.error('Failed to create TLP accrual', {
                  jobId,
                  transactionId: transaction.id,
                  error: accrualResult.errorDetails
                })
              }
            }
          }

        } catch (error: any) {
          failedAccruals++
          logger.error('Failed to process transaction', {
            jobId,
            transactionId: transaction.id,
            error: error.message
          })
        }
      }

      // Update job status
      await this.prisma.transactionProcessingJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          processedTransactions: transactions.length,
          successfulAccruals,
          failedAccruals
        }
      })

      logger.info('Transaction processing completed', {
        jobId,
        campaignId,
        processedTransactions: transactions.length,
        successfulAccruals,
        failedAccruals
      })

      return {
        ...job,
        status: 'COMPLETED',
        completedAt: new Date(),
        processedTransactions: transactions.length,
        successfulAccruals,
        failedAccruals
      }

    } catch (error: any) {
      logger.error('Transaction processing failed', {
        jobId,
        campaignId,
        error: error.message
      })

      // Update job status
      await this.prisma.transactionProcessingJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error.message
        }
      })

      throw error
    }
  }

  /**
   * Connect to customer database
   */
  private async connectToCustomerDatabase(campaign: any): Promise<Client> {
    try {
      const client = new Client({
        host: campaign.databaseHost,
        port: campaign.databasePort || 5432,
        database: campaign.databaseName,
        user: campaign.databaseUsername,
        password: campaign.databasePassword,
        ssl: process.env.NODE_ENV === 'production'
      })

      await client.connect()
      return client
    } catch (error: any) {
      logger.error('Failed to connect to customer database', {
        campaignId: campaign.id,
        error: error.message
      })
      throw new Error(`Database connection failed: ${error.message}`)
    }
  }

  /**
   * Store extracted data as transactions
   */
  private async storeExtractedData(
    campaignId: string, 
    rows: any[], 
    transformation?: any
  ): Promise<void> {
    try {
      for (const row of rows) {
        // Apply field mappings if specified
        let transactionData: any = row as Record<string, any>
        if (transformation?.fieldMappings) {
          transactionData = {} as Record<string, any>
          for (const [sourceField, targetField] of Object.entries(transformation.fieldMappings) as [string, string][]) {
            transactionData[targetField] = (row as Record<string, any>)[sourceField]
          }
        }

        // Apply calculations if specified
        if (transformation?.calculations) {
          for (const calculation of transformation.calculations) {
            // Simple calculation evaluation (in production, use a proper expression evaluator)
            if (calculation.includes('points = Math.ceil(amount / 200)')) {
              const amount = transactionData.amount || 0
              transactionData.points = Math.ceil(amount / 200)
            }
          }
        }

        // Store transaction
        await this.prisma.campaignTransaction.create({
          data: {
            campaignId,
            participantId: transactionData.participantId || 'unknown',
            transactionData: JSON.stringify(transactionData),
            processedAt: null,
            createdAt: new Date()
          }
        })
      }

      logger.info('Extracted data stored successfully', {
        campaignId,
        rowsStored: rows.length
      })
    } catch (error: any) {
      logger.error('Failed to store extracted data', {
        campaignId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Evaluate eligibility rules
   */
  private evaluateEligibilityRules(transactionData: any, rules: any[]): boolean {
    if (!rules || rules.length === 0) {
      return true // No rules means all transactions are eligible
    }

    for (const rule of rules) {
      try {
        // Simple rule evaluation (in production, use a proper expression evaluator)
        if (rule.condition) {
          // This is a simplified evaluation - in production, use a proper rule engine
          const condition = rule.condition
            .replace(/participant\./g, 'transactionData.')
            .replace(/amount/g, 'transactionData.amount')
            .replace(/productLine/g, 'transactionData.productLine')
          
          // Very basic evaluation - in production, use a proper expression evaluator
          if (condition.includes('===') || condition.includes('==')) {
            const [field, value] = condition.split(/===?/).map(s => s.trim())
            if (eval(`transactionData.${field} === ${value}`) === false) {
              return false
            }
          }
        }
      } catch (error) {
        logger.warn('Failed to evaluate eligibility rule', {
          rule: rule.id,
          error: error.message
        })
        return false
      }
    }

    return true
  }

  /**
   * Calculate points using accrual rules
   */
  private calculatePoints(transactionData: any, rules: any[]): number {
    if (!rules || rules.length === 0) {
      return 0
    }

    let totalPoints = 0

    for (const rule of rules) {
      try {
        if (rule.condition && rule.calculation) {
          // Evaluate condition
          const condition = rule.condition
            .replace(/productLine/g, 'transactionData.productLine')
            .replace(/amount/g, 'transactionData.amount')
          
          // Very basic evaluation - in production, use a proper expression evaluator
          let conditionMet = false
          if (condition.includes('===') || condition.includes('==')) {
            const [field, value] = condition.split(/===?/).map(s => s.trim())
            conditionMet = eval(`transactionData.${field} === ${value}`)
          }

          if (conditionMet) {
            // Apply calculation
            const calculation = rule.calculation
              .replace(/amount/g, 'transactionData.amount')
              .replace(/Math\.ceil/g, 'Math.ceil')
            
            // Very basic calculation - in production, use a proper expression evaluator
            if (calculation.includes('Math.ceil(amount / 200)')) {
              const amount = transactionData.amount || 0
              totalPoints += Math.ceil(amount / 200)
            }
          }
        }
      } catch (error) {
        logger.warn('Failed to calculate points for rule', {
          rule: rule.id,
          error: error.message
        })
      }
    }

    return totalPoints
  }

  /**
   * Stop background processing
   */
  async stopProcessing(): Promise<void> {
    this.isRunning = false
    logger.info('Background processing stopped')
  }

  /**
   * Get processing status
   */
  isProcessing(): boolean {
    return this.isRunning
  }
}

export default BackgroundProcessingService
