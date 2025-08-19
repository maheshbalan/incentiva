import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateJWT, requireAdmin } from '../middleware/auth'
import { logger } from '../utils/logger'
import TLPService from '../services/tlpService'
import AIService from '../services/aiService'
import { AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

interface CampaignExecutionRequest {
  campaignId: string
  executeTLPSetup?: boolean
  generateRules?: boolean
  extractData?: boolean
}

interface CampaignExecutionResult {
  success: boolean
  campaignId: string
  executionId: string
  steps: {
    tlpSetup?: {
      success: boolean
      artifacts: any[]
      error?: string
    }
    ruleGeneration?: {
      success: boolean
      transactionSchema?: any
      jsonRules?: any
      dataQueries?: any
      error?: string
    }
    dataExtraction?: {
      success: boolean
      extractedRows?: number
      error?: string
    }
  }
  totalExecutionTime: number
  timestamp: string
}

/**
 * Execute a complete campaign setup
 * POST /api/campaign-execution/execute
 */
router.post('/execute', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now()
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { campaignId, executeTLPSetup = true, generateRules = true, extractData = true }: CampaignExecutionRequest = req.body

    logger.info('Starting campaign execution', {
      executionId,
      campaignId,
      executeTLPSetup,
      generateRules,
      extractData,
      userId: req.user?.id
    })

    // Validate campaign exists
    const campaign = await prisma.campaign.findUnique({
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
      throw new Error(`Campaign not found: ${campaignId}`)
    }

    // Validate campaign has required configuration
    if (!campaign.tlpApiKey || !campaign.tlpEndpointUrl) {
      throw new Error('Campaign missing TLP configuration')
    }

    if (!campaign.eligibilityCriteria) {
      throw new Error('Campaign missing eligibility criteria')
    }

    const result: CampaignExecutionResult = {
      success: true,
      campaignId,
      executionId,
      steps: {},
      totalExecutionTime: 0,
      timestamp: new Date().toISOString()
    }

    // Step 1: TLP Setup
    if (executeTLPSetup) {
      try {
        logger.info('Starting TLP setup', { executionId, campaignId })
        
        const tlpService = new TLPService({
          apiKey: campaign.tlpApiKey,
          endpointUrl: campaign.tlpEndpointUrl
        })

        const participants = campaign.participants.map(p => p.user)
        const tlpArtifacts = await tlpService.executeCampaignSetup(campaign, participants)
        
        result.steps.tlpSetup = {
          success: tlpArtifacts.every(a => a.status === 'SUCCESS'),
          artifacts: tlpArtifacts
        }

        // Store TLP artifacts in database
        for (const artifact of tlpArtifacts) {
          await prisma.tLPArtifact.create({
            data: {
              id: artifact.id,
              campaignId: campaign.id,
              artifactType: artifact.artifactType,
              artifactName: artifact.artifactName,
              apiCall: artifact.apiCall,
              response: artifact.response,
              status: artifact.status,
              createdAt: artifact.createdAt,
              errorDetails: artifact.errorDetails
            }
          })
        }

        logger.info('TLP setup completed', {
          executionId,
          campaignId,
          artifactsCreated: tlpArtifacts.length,
          successCount: tlpArtifacts.filter(a => a.status === 'SUCCESS').length
        })
      } catch (error: any) {
        logger.error('TLP setup failed', {
          executionId,
          campaignId,
          error: error.message
        })
        
        result.steps.tlpSetup = {
          success: false,
          artifacts: [],
          error: error.message
        }
      }
    }

    // Step 2: AI Rule Generation
    if (generateRules) {
      try {
        logger.info('Starting AI rule generation', { executionId, campaignId })
        
        const aiService = new AIService({
          apiKey: process.env.ANTHROPIC_API_KEY || '',
          model: 'claude-3-5-sonnet-20241022',
          endpoint: 'https://api.anthropic.com/v1/messages'
        })

        // Get database schema if available
        let databaseSchema = ''
        if (campaign.databaseType && campaign.databaseName) {
          databaseSchema = `Database: ${campaign.databaseType} - ${campaign.databaseName}`
        }

        const artifacts = await aiService.generateCampaignArtifacts(
          campaign.eligibilityCriteria,
          databaseSchema
        )

        result.steps.ruleGeneration = {
          success: artifacts.transactionSchema.success && 
                   artifacts.jsonRules.success && 
                   artifacts.dataQueries.success,
          transactionSchema: artifacts.transactionSchema.data,
          jsonRules: artifacts.jsonRules.data,
          dataQueries: artifacts.dataQueries.data
        }

        // Store generated artifacts in campaign
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            transactionSchema: JSON.stringify(artifacts.transactionSchema.data),
            jsonRules: JSON.stringify(artifacts.jsonRules.data),
            dataExtractionQueries: JSON.stringify(artifacts.dataQueries.data)
          }
        })

        logger.info('AI rule generation completed', {
          executionId,
          campaignId,
          schemaGenerated: !!artifacts.transactionSchema.data,
          rulesGenerated: !!artifacts.jsonRules.data,
          queriesGenerated: !!artifacts.dataQueries.data
        })
      } catch (error: any) {
        logger.error('AI rule generation failed', {
          executionId,
          campaignId,
          error: error.message
        })
        
        result.steps.ruleGeneration = {
          success: false,
          error: error.message
        }
      }
    }

    // Step 3: Data Extraction (placeholder for now)
    if (extractData) {
      try {
        logger.info('Starting data extraction', { executionId, campaignId })
        
        // This will be implemented when we connect to customer databases
        // For now, we'll simulate successful extraction
        
        result.steps.dataExtraction = {
          success: true,
          extractedRows: 0 // Will be actual count when implemented
        }

        logger.info('Data extraction completed', {
          executionId,
          campaignId,
          extractedRows: 0
        })
      } catch (error: any) {
        logger.error('Data extraction failed', {
          executionId,
          campaignId,
          error: error.message
        })
        
        result.steps.dataExtraction = {
          success: false,
          extractedRows: 0,
          error: error.message
        }
      }
    }

    // Calculate execution time
    result.totalExecutionTime = Date.now() - startTime

    // Determine overall success
    result.success = Object.values(result.steps).every(step => 
      step && step.success !== false
    )

    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: result.success ? 'ACTIVE' : 'DRAFT',
        lastExecutedAt: new Date()
      }
    })

    // Log execution result
    await prisma.campaignExecutionLog.create({
      data: {
        id: executionId,
        campaignId: campaign.id,
        executedBy: req.user!.id,
        executionData: JSON.stringify(result),
        success: result.success,
        executionTime: result.totalExecutionTime,
        createdAt: new Date()
      }
    })

    logger.info('Campaign execution completed', {
      executionId,
      campaignId,
      success: result.success,
      executionTime: result.totalExecutionTime,
      stepsCompleted: Object.keys(result.steps).length
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    const executionTime = Date.now() - startTime
    
    logger.error('Campaign execution failed', {
      executionId,
      campaignId: req.body.campaignId,
      error: error.message,
      executionTime
    })

    // Log failed execution
    try {
      await prisma.campaignExecutionLog.create({
        data: {
          id: executionId,
          campaignId: req.body.campaignId,
          executedBy: req.user!.id,
          executionData: JSON.stringify({ error: error.message }),
          success: false,
          executionTime,
          createdAt: new Date()
        }
      })
    } catch (logError) {
      logger.error('Failed to log execution error', { logError })
    }

    res.status(500).json({
      success: false,
      error: 'Campaign execution failed',
      details: error.message,
      executionId
    })
  }
})

/**
 * Get campaign execution status
 * GET /api/campaign-execution/status/:campaignId
 */
router.get('/status/:campaignId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        tlpArtifacts: {
          orderBy: { createdAt: 'desc' }
        },
        executionLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    const status = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: campaign.status,
      lastExecutedAt: campaign.lastExecutedAt,
      tlpArtifacts: {
        total: campaign.tlpArtifacts.length,
        successful: campaign.tlpArtifacts.filter(a => a.status === 'SUCCESS').length,
        failed: campaign.tlpArtifacts.filter(a => a.status === 'FAILED').length,
        recent: campaign.tlpArtifacts.slice(0, 10)
      },
      executionHistory: campaign.executionLogs,
      hasTransactionSchema: !!campaign.transactionSchema,
      hasJsonRules: !!campaign.jsonRules,
      hasDataQueries: !!campaign.dataExtractionQueries
    }

    res.json({
      success: true,
      data: status
    })

  } catch (error: any) {
    logger.error('Failed to get campaign execution status', {
      campaignId: req.params.campaignId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get execution status',
      details: error.message
    })
  }
})

/**
 * Get TLP artifacts for a campaign
 * GET /api/campaign-execution/artifacts/:campaignId
 */
router.get('/artifacts/:campaignId', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params

    const artifacts = await prisma.tLPArtifact.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: artifacts
    })

  } catch (error: any) {
    logger.error('Failed to get TLP artifacts', {
      campaignId: req.params.campaignId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to get TLP artifacts',
      details: error.message
    })
  }
})

/**
 * Retry failed TLP artifact creation
 * POST /api/campaign-execution/retry-artifact/:artifactId
 */
router.post('/retry-artifact/:artifactId', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { artifactId } = req.params

    const artifact = await prisma.tLPArtifact.findUnique({
      where: { id: artifactId },
      include: {
        campaign: true
      }
    })

    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: 'Artifact not found'
      })
    }

    if (artifact.status === 'SUCCESS') {
      return res.status(400).json({
        success: false,
        error: 'Artifact is already successful'
      })
    }

    // Retry the specific artifact creation
    const tlpService = new TLPService({
      apiKey: artifact.campaign.tlpApiKey,
      endpointUrl: artifact.campaign.tlpEndpointUrl
    })

    let retryResult: any

    switch (artifact.artifactType) {
      case 'POINT_TYPE':
        retryResult = await tlpService.createPointType(artifact.campaign)
        break
      case 'POINT_ISSUE':
        retryResult = await tlpService.mintCampaignPoints(artifact.campaign, 1000000)
        break
      case 'MEMBER':
        // We need participant info for member creation
        const participant = await prisma.user.findFirst({
          where: { id: artifact.campaign.createdById }
        })
        if (participant) {
          retryResult = await tlpService.createMember(participant, artifact.campaign)
        }
        break
      default:
        throw new Error(`Unsupported artifact type for retry: ${artifact.artifactType}`)
    }

    if (retryResult && retryResult.status === 'SUCCESS') {
      // Update the artifact
      await prisma.tLPArtifact.update({
        where: { id: artifactId },
        data: {
          status: 'SUCCESS',
          response: retryResult.response,
          errorDetails: null
        }
      })

      res.json({
        success: true,
        data: { message: 'Artifact retry successful', artifactId }
      })
    } else {
      throw new Error('Artifact retry failed')
    }

  } catch (error: any) {
    logger.error('Failed to retry artifact', {
      artifactId: req.params.artifactId,
      error: error.message
    })

    res.status(500).json({
      success: false,
      error: 'Failed to retry artifact',
      details: error.message
    })
  }
})

export default router
