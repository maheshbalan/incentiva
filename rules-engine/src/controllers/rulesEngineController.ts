import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';
import { RulesEngineService } from '../services/rulesEngineService';
import { AIService } from '../services/aiService';

const router = Router();
const rulesEngineService = new RulesEngineService();
const aiService = new AIService();

// Generate rules from natural language description
router.post('/generate-rules', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId, naturalLanguageRules, databaseSchema } = req.body;

  if (!campaignId || !naturalLanguageRules) {
    throw createError('Campaign ID and natural language rules are required', 400);
  }

  logger.info('Generating rules for campaign:', { campaignId });

  try {
    // Use Anthropic to analyze schema and generate rules
    const generatedRules = await aiService.generateRules(
      campaignId,
      naturalLanguageRules,
      databaseSchema
    );

    // Store generated rules in database
    const storedRules = await rulesEngineService.storeGeneratedRules(campaignId, generatedRules);

    logger.info('Rules generated successfully:', { campaignId, rulesId: storedRules.id });

    res.status(201).json({
      status: 'success',
      message: 'Rules generated successfully',
      data: storedRules
    });
  } catch (error) {
    logger.error('Failed to generate rules:', error);
    throw createError('Failed to generate rules', 500);
  }
}));

// Analyze customer database schema
router.post('/analyze-schema', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId, databaseConnection, sampleQueries } = req.body;

  if (!campaignId || !databaseConnection) {
    throw createError('Campaign ID and database connection are required', 400);
  }

  logger.info('Analyzing database schema for campaign:', { campaignId });

  try {
    // Use Anthropic to analyze the database schema
    const schemaAnalysis = await aiService.analyzeDatabaseSchema(
      campaignId,
      databaseConnection,
      sampleQueries
    );

    // Store schema analysis in database
    const storedSchema = await rulesEngineService.storeSchemaAnalysis(campaignId, schemaAnalysis);

    logger.info('Schema analysis completed:', { campaignId, schemaId: storedSchema.id });

    res.status(200).json({
      status: 'success',
      message: 'Schema analysis completed',
      data: storedSchema
    });
  } catch (error) {
    logger.error('Failed to analyze schema:', error);
    throw createError('Failed to analyze database schema', 500);
  }
}));

// Generate microservice code
router.post('/generate-code', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId, rulesId, schemaId } = req.body;

  if (!campaignId || !rulesId || !schemaId) {
    throw createError('Campaign ID, rules ID, and schema ID are required', 400);
  }

  logger.info('Generating microservice code for campaign:', { campaignId });

  try {
    // Retrieve stored rules and schema
    const rules = await prisma.campaignRule.findUnique({ where: { id: rulesId } });
    const schema = await prisma.campaignSchema.findUnique({ where: { id: schemaId } });

    if (!rules || !schema) {
      throw createError('Rules or schema not found', 404);
    }

    // Use Anthropic to generate microservice code
    const generatedCode = await aiService.generateMicroserviceCode(
      campaignId,
      rules.ruleDefinition,
      schema.schemaDefinition
    );

    // Store generated code
    const storedCode = await rulesEngineService.storeGeneratedCode(campaignId, generatedCode);

    logger.info('Code generation completed:', { campaignId, codeId: storedCode.id });

    res.status(200).json({
      status: 'success',
      message: 'Microservice code generated successfully',
      data: storedCode
    });
  } catch (error) {
    logger.error('Failed to generate code:', error);
    throw createError('Failed to generate microservice code', 500);
  }
}));

// Get generated rules for a campaign
router.get('/campaign/:campaignId/rules', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  logger.info('Retrieving rules for campaign:', { campaignId });

  try {
    const rules = await prisma.campaignRule.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: rules
    });
  } catch (error) {
    logger.error('Failed to retrieve rules:', error);
    throw createError('Failed to retrieve campaign rules', 500);
  }
}));

// Get schema analysis for a campaign
router.get('/campaign/:campaignId/schema', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  logger.info('Retrieving schema analysis for campaign:', { campaignId });

  try {
    const schemas = await prisma.campaignSchema.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: schemas
    });
  } catch (error) {
    logger.error('Failed to retrieve schema analysis:', error);
    throw createError('Failed to retrieve schema analysis', 500);
  }
}));

// Test generated rules
router.post('/test-rules', requireAdmin, asyncHandler(async (req: Request, res: Response) => {
  const { campaignId, rulesId, testData } = req.body;

  if (!campaignId || !rulesId || !testData) {
    throw createError('Campaign ID, rules ID, and test data are required', 400);
  }

  logger.info('Testing rules for campaign:', { campaignId });

  try {
    const testResults = await rulesEngineService.testRules(campaignId, rulesId, testData);

    res.status(200).json({
      status: 'success',
      message: 'Rules test completed',
      data: testResults
    });
  } catch (error) {
    logger.error('Failed to test rules:', error);
    throw createError('Failed to test rules', 500);
  }
}));

export { router as rulesEngineRoutes };
