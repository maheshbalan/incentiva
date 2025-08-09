import { Router, Request, Response } from 'express';
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { tlpService } from '../services/tlpService';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';

const router = Router();

// Configure TLP API credentials
router.post('/configure', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { apiKey, endpointUrl } = req.body;

    // Test the connection
    const testService = new (require('../services/tlpService').TLPService)(apiKey, endpointUrl);
    const isHealthy = await testService.healthCheck();

    if (!isHealthy) {
      return res.status(400).json({
        success: false,
        error: 'Failed to connect to TLP API'
      });
    }

    logger.info('TLP API configured successfully');

    res.json({
      success: true,
      message: 'TLP API configured successfully'
    });
  } catch (error) {
    logger.error('TLP configuration failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to configure TLP API'
    });
  }
});

// Check TLP API health
router.get('/health', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const isHealthy = await tlpService.healthCheck();

    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('TLP health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check TLP health'
    });
  }
});

// Generate graphics for offers
router.post('/generate-graphics', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    const imageUrl = await aiService.generateGraphics(description);

    logger.info('Graphics generated', { description, imageUrl });

    res.json({
      success: true,
      data: { imageUrl }
    });
  } catch (error) {
    logger.error('Graphics generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate graphics'
    });
  }
});

// List TLP point types
router.get('/point-types', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pointTypes = await tlpService.listPointTypes();

    res.json({
      success: true,
      data: pointTypes
    });
  } catch (error) {
    logger.error('Point types retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get point types'
    });
  }
});

// List TLP offers
router.get('/offers', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filters } = req.query;
    const parsedFilters = filters ? JSON.parse(filters as string) : undefined;

    const offers = await tlpService.listOffers(parsedFilters);

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    logger.error('Offers retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get offers'
    });
  }
});

// List TLP members
router.get('/members', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filters } = req.query;
    const parsedFilters = filters ? JSON.parse(filters as string) : undefined;

    const members = await tlpService.listMembers(parsedFilters);

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    logger.error('Members retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get members'
    });
  }
});

// Get member balance
router.get('/members/:memberId/balance/:pointTypeId', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { memberId, pointTypeId } = req.params;

    const balance = await tlpService.getMemberBalance(memberId, pointTypeId);

    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    logger.error('Member balance retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get member balance'
    });
  }
});

// List TLP transactions
router.get('/transactions', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filters } = req.query;
    const parsedFilters = filters ? JSON.parse(filters as string) : undefined;

    const transactions = await tlpService.listTransactions(parsedFilters);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('Transactions retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// Test TLP API connection
router.post('/test-connection', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { apiKey, endpointUrl } = req.body;

    const testService = new (require('../services/tlpService').TLPService)(apiKey, endpointUrl);
    
    // Test basic operations
    const healthCheck = await testService.healthCheck();
    const pointTypes = await testService.listPointTypes();

    res.json({
      success: true,
      data: {
        connected: healthCheck,
        pointTypesCount: pointTypes.length,
        endpoint: endpointUrl
      }
    });
  } catch (error) {
    logger.error('TLP connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test TLP connection'
    });
  }
});

export default router; 