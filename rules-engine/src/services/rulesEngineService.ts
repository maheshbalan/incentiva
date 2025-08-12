import { prisma } from '../index';
import { logger } from '../utils/logger';
import { 
  GeneratedRules, 
  GeneratedCode,
  CustomerDatabaseSchema 
} from '@incentiva/shared';

export class RulesEngineService {
  
  /**
   * Store generated rules in the database
   */
  async storeGeneratedRules(campaignId: string, generatedRules: GeneratedRules) {
    try {
      logger.info('Storing generated rules:', { campaignId });

      // Store the main rules record
      const rulesRecord = await prisma.campaignRule.create({
        data: {
          campaignId,
          ruleType: 'GOAL', // Main rules record
          ruleDefinition: generatedRules as any,
          generatedCode: JSON.stringify(generatedRules.generatedCode),
          schemaUnderstandingScore: generatedRules.understandingScore,
          schemaFeedback: generatedRules.feedback
        }
      });

      // Store individual goal rules
      for (const goalRule of generatedRules.rules.goalRules) {
        await prisma.campaignRule.create({
          data: {
            campaignId,
            ruleType: 'GOAL',
            ruleDefinition: goalRule as any,
            generatedCode: goalRule.calculationLogic,
            schemaUnderstandingScore: generatedRules.understandingScore,
            schemaFeedback: `Goal rule: ${goalRule.description}`
          }
        });
      }

      // Store eligibility rules
      for (const eligibilityRule of generatedRules.rules.eligibilityRules) {
        await prisma.campaignRule.create({
          data: {
            campaignId,
            ruleType: 'ELIGIBILITY',
            ruleDefinition: eligibilityRule as any,
            generatedCode: eligibilityRule.conditions.join(' AND '),
            schemaUnderstandingScore: generatedRules.understandingScore,
            schemaFeedback: `Eligibility rule: ${eligibilityRule.description}`
          }
        });
      }

      // Store prize rules
      for (const prizeRule of generatedRules.rules.prizeRules) {
        await prisma.campaignRule.create({
          data: {
            campaignId,
            ruleType: 'PRIZE',
            ruleDefinition: prizeRule as any,
            generatedCode: prizeRule.conditions.join(' AND '),
            schemaUnderstandingScore: generatedRules.understandingScore,
            schemaFeedback: `Prize rule: ${prizeRule.description}`
          }
        });
      }

      logger.info('Generated rules stored successfully:', { campaignId, rulesId: rulesRecord.id });
      return rulesRecord;

    } catch (error) {
      logger.error('Failed to store generated rules:', error);
      throw new Error(`Failed to store generated rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store schema analysis in the database
   */
  async storeSchemaAnalysis(campaignId: string, schemaAnalysis: CustomerDatabaseSchema) {
    try {
      logger.info('Storing schema analysis:', { campaignId });

      const schemaRecord = await prisma.campaignSchema.create({
        data: {
          campaignId,
          schemaDefinition: schemaAnalysis as any,
          understandingScore: schemaAnalysis.understandingScore,
          feedbackText: schemaAnalysis.feedback
        }
      });

      logger.info('Schema analysis stored successfully:', { campaignId, schemaId: schemaRecord.id });
      return schemaRecord;

    } catch (error) {
      logger.error('Failed to store schema analysis:', error);
      throw new Error(`Failed to store schema analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store generated code in the database
   */
  async storeGeneratedCode(campaignId: string, generatedCode: GeneratedCode) {
    try {
      logger.info('Storing generated code:', { campaignId });

      const codeRecord = await prisma.campaignRule.create({
        data: {
          campaignId,
          ruleType: 'GOAL', // Using GOAL type for code storage
          ruleDefinition: generatedCode as any,
          generatedCode: JSON.stringify(generatedCode),
          schemaUnderstandingScore: 1.0, // Code generation is considered fully understood
          schemaFeedback: 'Generated microservice code for campaign execution'
        }
      });

      logger.info('Generated code stored successfully:', { campaignId, codeId: codeRecord.id });
      return codeRecord;

    } catch (error) {
      logger.error('Failed to store generated code:', error);
      throw new Error(`Failed to store generated code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test generated rules with sample data
   */
  async testRules(campaignId: string, rulesId: string, testData: any) {
    try {
      logger.info('Testing rules:', { campaignId, rulesId });

      // Retrieve the rules
      const rules = await prisma.campaignRule.findUnique({
        where: { id: rulesId }
      });

      if (!rules) {
        throw new Error('Rules not found');
      }

      // Parse the rules
      const parsedRules = rules.ruleDefinition as any;
      
      // Test the rules with the provided data
      const testResults = await this.executeRulesTest(parsedRules, testData);

      logger.info('Rules test completed:', { campaignId, rulesId, results: testResults });
      return testResults;

    } catch (error) {
      logger.error('Failed to test rules:', error);
      throw new Error(`Failed to test rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute rules test with sample data
   */
  private async executeRulesTest(rules: any, testData: any) {
    const results = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testDetails: [] as any[],
      executionTime: 0,
      errors: [] as string[]
    };

    const startTime = Date.now();

    try {
      // Test goal rules
      if (rules.goalRules) {
        for (const goalRule of rules.goalRules) {
          results.totalTests++;
          
          try {
            const testResult = await this.testGoalRule(goalRule, testData);
            if (testResult.passed) {
              results.passedTests++;
            } else {
              results.failedTests++;
            }
            results.testDetails.push(testResult);
          } catch (error) {
            results.failedTests++;
            results.errors.push(`Goal rule test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Test eligibility rules
      if (rules.eligibilityRules) {
        for (const eligibilityRule of rules.eligibilityRules) {
          results.totalTests++;
          
          try {
            const testResult = await this.testEligibilityRule(eligibilityRule, testData);
            if (testResult.passed) {
              results.passedTests++;
            } else {
              results.failedTests++;
            }
            results.testDetails.push(testResult);
          } catch (error) {
            results.failedTests++;
            results.errors.push(`Eligibility rule test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Test prize rules
      if (rules.prizeRules) {
        for (const prizeRule of rules.prizeRules) {
          results.totalTests++;
          
          try {
            const testResult = await this.testPrizeRule(prizeRule, testData);
            if (testResult.passed) {
              results.passedTests++;
            } else {
              results.failedTests++;
            }
            results.testDetails.push(testResult);
          } catch (error) {
            results.failedTests++;
            results.errors.push(`Prize rule test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

    } catch (error) {
      results.errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    results.executionTime = Date.now() - startTime;
    return results;
  }

  /**
   * Test a specific goal rule
   */
  private async testGoalRule(goalRule: any, testData: any) {
    const result = {
      ruleType: 'GOAL',
      ruleDescription: goalRule.description,
      passed: false,
      actualValue: null,
      expectedValue: goalRule.targetValue,
      currency: goalRule.currency,
      error: null as string | null
    };

    try {
      // This is a simplified test - in a real implementation, you would execute the actual calculation logic
      // For now, we'll just check if the test data contains the required fields
      const requiredFields = goalRule.applicableFields || [];
      const hasRequiredFields = requiredFields.every((field: string) => 
        testData.hasOwnProperty(field)
      );

      if (!hasRequiredFields) {
        result.error = `Missing required fields: ${requiredFields.filter((field: string) => !testData.hasOwnProperty(field)).join(', ')}`;
        return result;
      }

      // Simulate calculation (in real implementation, this would execute the actual logic)
      result.actualValue = testData[requiredFields[0]] || 0;
      result.passed = result.actualValue >= goalRule.targetValue;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Test a specific eligibility rule
   */
  private async testEligibilityRule(eligibilityRule: any, testData: any) {
    const result = {
      ruleType: 'ELIGIBILITY',
      ruleDescription: eligibilityRule.description,
      passed: false,
      conditions: eligibilityRule.conditions || [],
      error: null as string | null
    };

    try {
      // Check if all conditions are met
      const conditionsMet = (eligibilityRule.conditions || []).every((condition: string) => {
        // This is a simplified check - in real implementation, you would evaluate the actual condition
        return testData.hasOwnProperty(condition.split(' ')[0]); // Basic field existence check
      });

      result.passed = conditionsMet;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Test a specific prize rule
   */
  private async testPrizeRule(prizeRule: any, testData: any) {
    const result = {
      ruleType: 'PRIZE',
      ruleDescription: prizeRule.description,
      passed: false,
      pointValue: prizeRule.pointValue,
      conditions: prizeRule.conditions || [],
      error: null as string | null
    };

    try {
      // Check if all conditions are met for the prize
      const conditionsMet = (prizeRule.conditions || []).every((condition: string) => {
        // This is a simplified check - in real implementation, you would evaluate the actual condition
        return testData.hasOwnProperty(condition.split(' ')[0]); // Basic field existence check
      });

      result.passed = conditionsMet;

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * Get all rules for a campaign
   */
  async getCampaignRules(campaignId: string) {
    try {
      const rules = await prisma.campaignRule.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' }
      });

      return rules;
    } catch (error) {
      logger.error('Failed to retrieve campaign rules:', error);
      throw new Error(`Failed to retrieve campaign rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all schemas for a campaign
   */
  async getCampaignSchemas(campaignId: string) {
    try {
      const schemas = await prisma.campaignSchema.findMany({
        where: { campaignId },
        orderBy: { createdAt: 'desc' }
      });

      return schemas;
    } catch (error) {
      logger.error('Failed to retrieve campaign schemas:', error);
      throw new Error(`Failed to retrieve campaign schemas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
