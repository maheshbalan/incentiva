import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import TLPService from '../services/tlpService';
import { logger } from '../utils/logger';

const router = Router();

// Initialize TLP service
const tlpService = new TLPService({
  apiKey: process.env.TLP_DEFAULT_API_KEY || '',
  endpointUrl: process.env.TLP_DEFAULT_ENDPOINT || ''
});

// Get user's campaigns
router.get('/campaigns', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userCampaigns = await prisma.userCampaign.findMany({
      where: { userId: req.user.id },
      include: {
        campaign: {
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
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: userCampaigns
    });
  } catch (error) {
    logger.error('User campaigns retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user campaigns'
    });
  }
});

// Get personal progress for a campaign
router.get('/:campaignId/progress', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userCampaign = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
        }
      },
      include: {
        campaign: {
          include: {
            rules: {
              where: {
                ruleType: 'GOAL'
              }
            }
          }
        }
      }
    });

    if (!userCampaign) {
      return res.status(404).json({
        success: false,
        error: 'User not participating in this campaign'
      });
    }

    // Calculate goal progress
    const goals = userCampaign.campaign.rules.map(rule => {
      const goal = rule.ruleDefinition as any;
      const progress = (userCampaign.currentPoints / goal.target) * 100;
      return {
        ...goal,
        progress: Math.min(progress, 100),
        currentPoints: userCampaign.currentPoints
      };
    });

    res.json({
      success: true,
      data: {
        userCampaign,
        goals,
        totalProgress: userCampaign.goalProgress
      }
    });
  } catch (error) {
    logger.error('Progress retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress'
    });
  }
});

// Get point balance
router.get('/:campaignId/points', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userCampaign = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
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
      data: {
        currentPoints: userCampaign.currentPoints,
        goalProgress: userCampaign.goalProgress,
        campaign: userCampaign.campaign
      }
    });
  } catch (error) {
    logger.error('Point balance retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get point balance'
    });
  }
});

// Get transaction history
router.get('/:campaignId/transactions', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const redemptions = await prisma.campaignRedemption.findMany({
      where: {
        campaignId,
        userId: req.user.id
      },
      orderBy: { redemptionDate: 'desc' },
      skip,
      take: Number(limit)
    });

    const total = await prisma.campaignRedemption.count({
      where: {
        campaignId,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      data: redemptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Transaction history retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history'
    });
  }
});

// Get available redemption offers
router.get('/:campaignId/offers', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get campaign rules for prizes
    const prizeRules = await prisma.campaignRule.findMany({
      where: {
        campaignId,
        ruleType: 'PRIZE'
      }
    });

    // Get user's current points
    const userCampaign = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
        }
      }
    });

    if (!userCampaign) {
      return res.status(404).json({
        success: false,
        error: 'User not participating in this campaign'
      });
    }

    // Format offers with availability
    const offers = prizeRules.map(rule => {
      const prize = rule.ruleDefinition as any;
      return {
        id: rule.id,
        name: prize.name,
        description: prize.description,
        pointCost: prize.pointCost,
        imageUrl: prize.imageUrl,
        available: userCampaign.currentPoints >= prize.pointCost,
        canAfford: userCampaign.currentPoints >= prize.pointCost
      };
    });

    res.json({
      success: true,
      data: {
        offers,
        currentPoints: userCampaign.currentPoints
      }
    });
  } catch (error) {
    logger.error('Offers retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offers'
    });
  }
});

// Redeem points for offer
router.post('/:campaignId/redeem', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;
    const { offerId, points } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get user campaign participation
    const userCampaign = await prisma.userCampaign.findUnique({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
        }
      }
    });

    if (!userCampaign) {
      return res.status(404).json({
        success: false,
        error: 'User not participating in this campaign'
      });
    }

    if (userCampaign.currentPoints < points) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient points for redemption'
      });
    }

    // Create redemption record
    const redemption = await prisma.campaignRedemption.create({
      data: {
        campaignId,
        userId: req.user.id,
        offerId,
        pointsRedeemed: points,
        status: 'PENDING'
      }
    });

    // Update user's point balance
    await prisma.userCampaign.update({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
        }
      },
      data: {
        currentPoints: {
          decrement: points
        }
      }
    });

    // TODO: Integrate with TLP API for actual redemption
    // const tlpTransaction = await tlpService.redeemPoints({
    //   memberId: userCampaign.participantId!,
    //   pointType: 'campaign-points',
    //   points,
    //   transactionType: 'redeem',
    //   description: `Redemption for offer ${offerId}`
    // });

    logger.info('Points redeemed', { 
      campaignId, 
      userId: req.user.id, 
      points, 
      offerId 
    });

    res.json({
      success: true,
      data: {
        redemption,
        newBalance: userCampaign.currentPoints - points
      }
    });
  } catch (error) {
    logger.error('Redemption failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem points'
    });
  }
});

// Join campaign
router.post('/:campaignId/join', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    if (campaign.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Campaign is not active'
      });
    }

    // Create or update user campaign participation
    const userCampaign = await prisma.userCampaign.upsert({
      where: {
        userId_campaignId: {
          userId: req.user.id,
          campaignId
        }
      },
      update: {},
      create: {
        userId: req.user.id,
        campaignId,
        currentPoints: 0,
        goalProgress: 0
      }
    });

    logger.info('User joined campaign', { 
      campaignId, 
      userId: req.user.id 
    });

    res.json({
      success: true,
      data: userCampaign
    });
  } catch (error) {
    logger.error('Campaign join failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join campaign'
    });
  }
});

export default router; 