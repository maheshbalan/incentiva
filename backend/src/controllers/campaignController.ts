import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import AIService from '../services/aiService';
import TLPService from '../services/tlpService';
import { logger } from '../utils/logger';
import { CampaignStatus, RuleType } from '@incentiva/shared';

const router = Router();

// Initialize services
const aiService = new AIService({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  endpoint: 'https://api.anthropic.com/v1/messages'
});

const tlpService = new TLPService({
  apiKey: process.env.TLP_DEFAULT_API_KEY || '',
  endpointUrl: process.env.TLP_DEFAULT_ENDPOINT || ''
});

// Create new campaign
router.post('/', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Create campaign request received', {
      userId: req.user?.id,
      requestBody: JSON.stringify(req.body, null, 2)
    })
    const {
      name,
      description,
      startDate,
      endDate,
      individualGoal,
      overallGoal,
      campaignCurrency,
      amountPerPoint,
      totalPointsMinted,
      eligibilityCriteria,
      tlpApiKey,
      tlpEndpointUrl
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

          const campaign = await prisma.campaign.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          individualGoal: individualGoal ? parseFloat(individualGoal) : null,
          overallGoal: overallGoal ? parseFloat(overallGoal) : null,
          campaignCurrency: campaignCurrency || 'MXN',
          amountPerPoint: amountPerPoint ? parseFloat(amountPerPoint) : null,
          totalPointsMinted: totalPointsMinted ? parseFloat(totalPointsMinted) : null,
          eligibilityCriteria,
          tlpApiKey,
          tlpEndpointUrl,
          createdById: req.user.id
        },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info('Campaign created', { campaignId: campaign.id, name: campaign.name, createdById: req.user.id });

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Campaign creation failed:', {
      error: (error as any).message,
      stack: (error as any).stack,
      requestBody: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign'
    });
  }
});



// List campaigns
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    // If user is not admin, only show campaigns they're participating in
    if (req.user?.role !== 'ADMIN') {
      where.userCampaigns = {
        some: {
          userId: req.user?.id
        }
      };
    }

    logger.info('Campaign list query parameters', {
      userId: req.user?.id,
      role: req.user?.role,
      where
    })

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            userCampaigns: true,
            executions: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.campaign.count({ where });

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Campaign list failed:', {
      error: (error as any).message,
      stack: (error as any).stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to list campaigns'
    });
  }
});

// Get campaign by ID
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Campaign fetch request received', { 
      campaignId: id,
      requestHeaders: req.headers
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            lastName: true
          }
        },
        rules: true
      }
    });

    if (!campaign) {
      logger.warn('Campaign not found', { campaignId: id });
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    logger.info('Campaign fetched successfully', { 
      campaignId: id, 
      campaignData: JSON.stringify(campaign, null, 2)
    });

    res.json({
      success: true,
      campaign: campaign
    });
  } catch (error) {
    logger.error('Failed to fetch campaign with detailed error:', { 
      campaignId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign'
    });
  }
});

// Update campaign status
router.patch('/:id/status', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info('Campaign status updated', { campaignId: id, status });

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Failed to update campaign status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign status'
    });
  }
});

// Update campaign
router.put('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    logger.info('Campaign update request received', { 
      campaignId: id, 
      requestBody: JSON.stringify(req.body, null, 2),
      requestHeaders: req.headers
    });

    // Remove non-updatable/unknown fields and coerce types
    const {
      // legacy fields
      individualGoalCurrency,
      overallGoalCurrency,
      // non-updatable / relational / server-managed
      id: _omitId,
      createdAt: _omitCreatedAt,
      updatedAt: _omitUpdatedAt,
      createdBy: _omitCreatedBy,
      createdById: _omitCreatedById,
      rules: _omitRules,
      userCampaigns: _omitUserCampaigns,
      executions: _omitExecutions,
      executionLogs: _omitExecutionLogs,
      schemas: _omitSchemas,
      redemptions: _omitRedemptions,
      goals: _omitGoals,
      transactions: _omitTransactions,
      rulesEngineJobs: _omitRulesEngineJobs,
      rulesEngineExecutions: _omitRulesEngineExecutions,
      tlpArtifacts: _omitTlpArtifacts,
      _count: _omitCount,
      // everything else
      ...rest
    } = updateData as any

    const cleanUpdateData: any = {}

    // Whitelist of updatable scalar fields
    const assignIfDefined = (key: string, value: any) => {
      if (value !== undefined) cleanUpdateData[key] = value
    }

    // Strings
    assignIfDefined('name', rest.name)
    assignIfDefined('description', rest.description)
    assignIfDefined('campaignCurrency', rest.campaignCurrency)
    assignIfDefined('eligibilityCriteria', rest.eligibilityCriteria)
    assignIfDefined('tlpApiKey', rest.tlpApiKey)
    assignIfDefined('tlpEndpointUrl', rest.tlpEndpointUrl)
    assignIfDefined('databaseType', rest.databaseType)
    assignIfDefined('databaseHost', rest.databaseHost)
    assignIfDefined('databaseName', rest.databaseName)
    assignIfDefined('databaseUsername', rest.databaseUsername)
    assignIfDefined('databasePassword', rest.databasePassword)
    assignIfDefined('rewards', rest.rewards)
    assignIfDefined('status', rest.status)

    // Dates
    if (rest.startDate) cleanUpdateData.startDate = new Date(rest.startDate)
    if (rest.endDate) cleanUpdateData.endDate = new Date(rest.endDate)

    // Numbers (coerce)
    if (rest.individualGoal !== undefined && rest.individualGoal !== null)
      cleanUpdateData.individualGoal = Number(rest.individualGoal)
    if (rest.overallGoal !== undefined && rest.overallGoal !== null)
      cleanUpdateData.overallGoal = Number(rest.overallGoal)
    if (rest.totalPointsMinted !== undefined && rest.totalPointsMinted !== null)
      cleanUpdateData.totalPointsMinted = Number(rest.totalPointsMinted)
    if (rest.amountPerPoint !== undefined && rest.amountPerPoint !== null)
      cleanUpdateData.amountPerPoint = Number(rest.amountPerPoint)
    if (rest.individualGoalBonus !== undefined && rest.individualGoalBonus !== null)
      cleanUpdateData.individualGoalBonus = Number(rest.individualGoalBonus)
    if (rest.overallGoalBonus !== undefined && rest.overallGoalBonus !== null)
      cleanUpdateData.overallGoalBonus = Number(rest.overallGoalBonus)
    if (rest.databasePort !== undefined && rest.databasePort !== null)
      cleanUpdateData.databasePort = Number(rest.databasePort)

    // JSON fields
    if (rest.transactionSchema !== undefined)
      cleanUpdateData.transactionSchema = typeof rest.transactionSchema === 'string' ? rest.transactionSchema : JSON.stringify(rest.transactionSchema)
    if (rest.jsonRules !== undefined)
      cleanUpdateData.jsonRules = typeof rest.jsonRules === 'string' ? rest.jsonRules : JSON.stringify(rest.jsonRules)
    if (rest.dataExtractionQueries !== undefined)
      cleanUpdateData.dataExtractionQueries = typeof rest.dataExtractionQueries === 'string' ? rest.dataExtractionQueries : JSON.stringify(rest.dataExtractionQueries)

    logger.info('Cleaned update data', { 
      campaignId: id, 
      originalData: Object.keys(req.body),
      cleanedData: Object.keys(cleanUpdateData),
      individualGoalCurrency,
      overallGoalCurrency,
      createdById: _omitCreatedById ? 'FILTERED_OUT' : 'NOT_PRESENT'
    });

    // Map old fields to new ones if they exist
    if (individualGoalCurrency && !cleanUpdateData.campaignCurrency) {
      cleanUpdateData.campaignCurrency = individualGoalCurrency;
      logger.info('Mapped individualGoalCurrency to campaignCurrency', { 
        campaignId: id, 
        value: individualGoalCurrency 
      });
    }
    if (overallGoalCurrency && !cleanUpdateData.campaignCurrency) {
      cleanUpdateData.campaignCurrency = overallGoalCurrency;
      logger.info('Mapped overallGoalCurrency to campaignCurrency', { 
        campaignId: id, 
        value: overallGoalCurrency 
      });
    }

    logger.info('Final update data for Prisma', { 
      campaignId: id, 
      data: JSON.stringify(cleanUpdateData, null, 2)
    });

    const campaign = await prisma.campaign.update({
      where: { id },
      data: cleanUpdateData,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info('Campaign updated successfully', { 
      campaignId: id, 
      updatedFields: Object.keys(cleanUpdateData)
    });

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Campaign update failed with detailed error:', { 
      campaignId: req.params.id,
      error: error.message,
      stack: error.stack,
      updateData: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign',
      details: error.message
    });
  }
});

// Delete campaign
router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.campaign.delete({
      where: { id }
    });

    logger.info('Campaign deleted', { campaignId: id });

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Campaign deletion failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign'
    });
  }
});

// Upload and analyze schema
router.post('/:id/schema', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { schemaDefinition } = req.body;

    // Analyze schema using AI
    const analysis = await aiService.generateTransactionSchema(JSON.stringify(schemaDefinition));

    // Save schema analysis
    const schema = await prisma.campaignSchema.create({
      data: {
        campaignId: id,
        schemaDefinition,
        understandingScore: null, // Will be calculated later
        feedbackText: null // Will be provided later
      }
    });

    logger.info('Schema uploaded and analyzed', { 
      campaignId: id, 
      schemaId: schema.id
    });

    res.json({
      success: true,
      data: {
        schema,
        analysis
      }
    });
  } catch (error) {
    logger.error('Schema upload failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload and analyze schema'
    });
  }
});

// Get schema analysis
router.get('/:id/schema', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const schemas = await prisma.campaignSchema.findMany({
      where: { campaignId: id },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json({
      success: true,
      data: schemas
    });
  } catch (error) {
    logger.error('Schema retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get schema analysis'
    });
  }
});

// Generate rules from natural language
router.post('/:id/rules', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { requirements } = req.body;

    // Get latest schema analysis
    const latestSchema = await prisma.campaignSchema.findFirst({
      where: { campaignId: id },
      orderBy: { uploadedAt: 'desc' }
    });

    if (!latestSchema) {
      return res.status(400).json({
        success: false,
        error: 'No schema uploaded for this campaign'
      });
    }

    // Generate rules using AI
    const rulesResult = await aiService.generateJSONRules(requirements, {
      tables: [],
      relationships: [],
      understandingScore: Number(latestSchema.understandingScore) || 0,
      feedback: latestSchema.feedbackText || '',
      requiredFields: []
    });

    if (!rulesResult.success || !rulesResult.data) {
      throw new Error(rulesResult.error || 'Failed to generate rules');
    }

    // Parse the generated rules from the AI response
    const rules = JSON.parse(rulesResult.data);

    // Save generated rules
    const savedRules = await Promise.all(
      (rules.goalRules || []).map(goal => 
        prisma.campaignRule.create({
          data: {
            campaignId: id,
            ruleType: RuleType.GOAL,
            ruleDefinition: JSON.stringify(goal)
          }
        })
      )
    );

    await Promise.all(
      (rules.eligibilityRules || []).map(eligibility =>
        prisma.campaignRule.create({
          data: {
            campaignId: id,
            ruleType: RuleType.ELIGIBILITY,
            ruleDefinition: JSON.stringify(eligibility)
          }
        })
      )
    );

    await Promise.all(
      (rules.prizeRules || []).map(prize =>
        prisma.campaignRule.create({
          data: {
            campaignId: id,
            ruleType: RuleType.PRIZE,
            ruleDefinition: JSON.stringify(prize)
          }
        })
      )
    );

    logger.info('Rules generated', { 
      campaignId: id, 
      goalsCount: rules.goalRules?.length || 0,
      prizesCount: rules.prizeRules?.length || 0
    });

    res.json({
      success: true,
      data: {
        rules,
        savedRules
      }
    });
  } catch (error) {
    logger.error('Rules generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate rules'
    });
  }
});

// Approve campaign for execution
router.post('/:id/approve', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if campaign has rules
    const rules = await prisma.campaignRule.findMany({
      where: { campaignId: id }
    });

    if (rules.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campaign must have rules before approval'
      });
    }

    // Update campaign status
    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.APPROVED }
    });

    logger.info('Campaign approved', { campaignId: id });

    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Campaign approval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve campaign'
    });
  }
});

// Execute campaign (create TLP entities)
router.post('/:id/execute', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        rules: true
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status !== CampaignStatus.APPROVED) {
      return res.status(400).json({
        success: false,
        error: 'Campaign must be approved before execution'
      });
    }

    // Create TLP point type
    const pointType = await tlpService.createPointType(campaign);

    // Create TLP offers for prizes
    const prizeRules = campaign.rules.filter(rule => rule.ruleType === RuleType.PRIZE);
    const offers = await Promise.all(
      prizeRules.map(rule => {
        const prize = rule.ruleDefinition as any;
        // TODO: Implement redemption offer creation
        // For now, return a placeholder
        return {
          id: `ro_${Date.now()}_${Math.random()}`,
          campaignId: campaign.id,
          artifactType: 'REDEMPTION_OFFER',
          artifactName: prize.name,
          apiCall: JSON.stringify({ prize }),
          response: 'Placeholder - redemption offer creation not yet implemented',
          status: 'PENDING',
          createdAt: new Date()
        };
      })
    );

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ACTIVE }
    });

    logger.info('Campaign executed', { 
      campaignId: id, 
      pointTypeId: pointType.id,
      offersCount: offers.length
    });

    res.json({
      success: true,
      data: {
        campaign: { ...campaign, status: CampaignStatus.ACTIVE },
        pointType,
        offers
      }
    });
  } catch (error) {
    logger.error('Campaign execution failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute campaign'
    });
  }
});

// Get campaign progress
router.get('/:id/progress', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const userCampaign = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: req.user!.id,
          campaignId: id
        }
      },
      include: {
        campaign: true
      }
    });

    if (!userCampaign) {
      return res.status(404).json({
        success: false,
        error: 'User not participating in this campaign'
      });
    }

    res.json({
      success: true,
      data: userCampaign
    });
  } catch (error) {
    logger.error('Campaign progress failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get campaign progress'
    });
  }
});

// Allocate points to participants
router.post('/:id/allocate-points', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, points, description } = req.body;

    // Update user campaign participation
    const userCampaign = await prisma.userCampaign.upsert({
      where: {
        userId_campaignId: {
          userId,
          campaignId: id
        }
      },
      update: {
        currentPoints: {
          increment: points
        }
      },
      create: {
        userId,
        campaignId: id,
        currentPoints: points
      }
    });

    // Record execution
    await prisma.campaignExecution.create({
      data: {
        campaignId: id,
        pointsAllocated: points,
        executionDate: new Date()
      }
    });

    logger.info('Points allocated', { 
      campaignId: id, 
      userId, 
      points 
    });

    res.json({
      success: true,
      data: userCampaign
    });
  } catch (error) {
    logger.error('Point allocation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to allocate points'
    });
  }
});

// Get campaign participants
router.get('/:id/participants', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const participants = await prisma.userCampaign.findMany({
      where: { campaignId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    logger.error('Participants retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get participants'
    });
  }
});

// Add participant to campaign
router.post('/:id/participants', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is already a participant
    const existingParticipation = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId: id
        }
      }
    });

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        error: 'User is already a participant in this campaign'
      });
    }

    // Add user to campaign
    const userCampaign = await prisma.userCampaign.create({
      data: {
        userId,
        campaignId: id,
        currentPoints: 0
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    logger.info('Participant added to campaign', { 
      campaignId: id, 
      userId 
    });

    res.json({
      success: true,
      data: userCampaign
    });
  } catch (error) {
    logger.error('Add participant failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add participant'
    });
  }
});

// Remove participant from campaign
router.delete('/:id/participants/:userId', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    // Remove user from campaign
    await prisma.userCampaign.delete({
      where: {
        userId_campaignId: {
          userId,
          campaignId: id
        }
      }
    });

    logger.info('Participant removed from campaign', { 
      campaignId: id, 
      userId 
    });

    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    logger.error('Remove participant failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove participant'
    });
  }
});

export default router; 