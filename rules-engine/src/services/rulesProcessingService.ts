import { logger } from '../utils/logger';
import { prisma } from '../index';
import { 
  GeneratedRules, 
  CampaignTransaction,
  JSONRuleSet,
  RuleDefinition,
  RuleCondition,
  RuleCalculation
} from '@incentiva/shared';

export interface RuleEvaluationResult {
  transactionId: string
  ruleId: string
  ruleType: string
  passed: boolean
  actualValue?: number
  expectedValue?: number
  pointsAllocated: number
  errorMessage?: string
  executionTime: number
  ruleDetails: RuleDefinition
}

export interface ProcessingResult {
  transactionId: string
  success: boolean
  pointsAllocated: number
  rulesEvaluated: RuleEvaluationResult[]
  totalExecutionTime: number
  errorMessage?: string
  accrualApiCalls: AccrualAPICall[]
}

export interface AccrualAPICall {
  ruleId: string
  ruleName: string
  points: number
  apiEndpoint: string
  requestBody: Record<string, any>
  priority: number
}

export class RulesProcessingService {
  private ruleSet: JSONRuleSet;

  constructor(ruleSet: JSONRuleSet) {
    this.ruleSet = ruleSet;
  }

  /**
   * Process a transaction using the JSON rule set
   */
  async processTransaction(transaction: CampaignTransaction): Promise<ProcessingResult> {
    const startTime = Date.now();
    const rulesEvaluated: RuleEvaluationResult[] = [];
    let totalPoints = 0;
    let success = true;
    let errorMessage: string | undefined;
    const accrualApiCalls: AccrualAPICall[] = [];

    try {
      logger.info('Processing transaction with JSON rules:', { 
        transactionId: transaction.id,
        ruleCount: this.getTotalRuleCount()
      });

      // Process eligibility rules first
      const eligibilityResults = await this.evaluateEligibilityRules(transaction);
      rulesEvaluated.push(...eligibilityResults);

      // Check if eligibility passed
      const eligibilityPassed = eligibilityResults.every(result => result.passed);
      if (!eligibilityPassed) {
        success = false;
        errorMessage = 'Transaction failed eligibility rules';
        return {
          transactionId: transaction.id,
          success: false,
          pointsAllocated: 0,
          rulesEvaluated,
          totalExecutionTime: Date.now() - startTime,
          errorMessage,
          accrualApiCalls: []
        };
      }

      // Process accrual rules
      const accrualResults = await this.evaluateAccrualRules(transaction);
      rulesEvaluated.push(...accrualResults);

      // Calculate total points and generate accrual API calls
      for (const result of accrualResults) {
        if (result.passed && result.pointsAllocated > 0) {
          totalPoints += result.pointsAllocated;
          
          // Generate accrual API call
          const apiCall = this.generateAccrualAPICall(result, transaction);
          if (apiCall) {
            accrualApiCalls.push(apiCall);
          }
        }
      }

      // Process bonus rules (if any)
      const bonusResults = await this.evaluateBonusRules(transaction);
      rulesEvaluated.push(...bonusResults);

      // Add bonus points and API calls
      for (const result of bonusResults) {
        if (result.passed && result.pointsAllocated > 0) {
          totalPoints += result.pointsAllocated;
          
          const apiCall = this.generateAccrualAPICall(result, transaction);
          if (apiCall) {
            accrualApiCalls.push(apiCall);
          }
        }
      }

      const totalExecutionTime = Date.now() - startTime;

      logger.info('Transaction processing completed:', {
        transactionId: transaction.id,
        success,
        totalPoints,
        executionTime: totalExecutionTime,
        accrualCalls: accrualApiCalls.length
      });

      return {
        transactionId: transaction.id,
        success,
        pointsAllocated: totalPoints,
        rulesEvaluated,
        totalExecutionTime,
        errorMessage,
        accrualApiCalls
      };

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Transaction processing failed:', {
        transactionId: transaction.id,
        error: errorMsg
      });

      return {
        transactionId: transaction.id,
        success: false,
        pointsAllocated: 0,
        rulesEvaluated,
        totalExecutionTime,
        errorMessage: errorMsg,
        accrualApiCalls: []
      };
    }
  }

  /**
   * Evaluate eligibility rules
   */
  private async evaluateEligibilityRules(transaction: CampaignTransaction): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];

    for (const rule of this.ruleSet.rules.eligibility) {
      if (!rule.enabled) continue;

    const startTime = Date.now();
      try {
        const passed = await this.evaluateRuleCondition(rule.condition, transaction);
      const executionTime = Date.now() - startTime;

        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'eligibility',
        passed,
          pointsAllocated: 0,
          executionTime,
          ruleDetails: rule
        });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'eligibility',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
          executionTime,
          ruleDetails: rule
        });
      }
    }

    return results;
  }

  /**
   * Evaluate accrual rules
   */
  private async evaluateAccrualRules(transaction: CampaignTransaction): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];

    for (const rule of this.ruleSet.rules.accrual) {
      if (!rule.enabled) continue;

    const startTime = Date.now();
      try {
        const passed = await this.evaluateRuleCondition(rule.condition, transaction);
        let pointsAllocated = 0;
    
        if (passed && rule.calculation) {
          pointsAllocated = await this.calculatePoints(rule.calculation, transaction);
        }

      const executionTime = Date.now() - startTime;

        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'accrual',
        passed,
          pointsAllocated,
          executionTime,
          ruleDetails: rule
        });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'accrual',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
          executionTime,
          ruleDetails: rule
        });
      }
    }

    return results;
  }

  /**
   * Evaluate bonus rules
   */
  private async evaluateBonusRules(transaction: CampaignTransaction): Promise<RuleEvaluationResult[]> {
    const results: RuleEvaluationResult[] = [];

    for (const rule of this.ruleSet.rules.bonus) {
      if (!rule.enabled) continue;

    const startTime = Date.now();
      try {
        const passed = await this.evaluateRuleCondition(rule.condition, transaction);
        let pointsAllocated = 0;
    
        if (passed && rule.calculation) {
          pointsAllocated = await this.calculatePoints(rule.calculation, transaction);
        }

      const executionTime = Date.now() - startTime;

        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'bonus',
        passed,
        pointsAllocated,
          executionTime,
          ruleDetails: rule
        });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
        results.push({
        transactionId: transaction.id,
        ruleId: rule.id,
          ruleType: 'bonus',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
          executionTime,
          ruleDetails: rule
        });
      }
    }

    return results;
  }

  /**
   * Evaluate a rule condition
   */
  private async evaluateRuleCondition(condition: RuleCondition, transaction: CampaignTransaction): Promise<boolean> {
    switch (condition.type) {
      case 'fieldComparison':
        return this.evaluateFieldComparison(condition, transaction);
      
      case 'aggregate':
        return await this.evaluateAggregateCondition(condition, transaction);
      
      case 'logical':
        return this.evaluateLogicalCondition(condition, transaction);
      
      case 'custom':
        return this.evaluateCustomCondition(condition, transaction);
      
      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }
  }

  /**
   * Evaluate field comparison condition
   */
  private evaluateFieldComparison(condition: RuleCondition, transaction: CampaignTransaction): boolean {
    if (!condition.field || !condition.operator || condition.value === undefined) {
      throw new Error('Invalid field comparison condition');
    }

    const fieldValue = this.getTransactionFieldValue(transaction, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'greaterThanOrEqual':
        return Number(fieldValue) >= Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      case 'lessThanOrEqual':
        return Number(fieldValue) <= Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'startsWith':
        return String(fieldValue).startsWith(String(condition.value));
      case 'endsWith':
        return String(fieldValue).endsWith(String(condition.value));
      default:
        throw new Error(`Unknown operator: ${condition.operator}`);
    }
  }

  /**
   * Evaluate aggregate condition
   */
  private async evaluateAggregateCondition(condition: RuleCondition, transaction: CampaignTransaction): Promise<boolean> {
    if (!condition.aggregation || !condition.field || !condition.operator || condition.value === undefined) {
      throw new Error('Invalid aggregate condition');
    }

    // For now, we'll evaluate against the current transaction
    // In a real implementation, you'd query the database for aggregate values
    const fieldValue = this.getTransactionFieldValue(transaction, condition.field);
    
    switch (condition.operator) {
      case 'gte':
        return Number(fieldValue) >= Number(condition.value);
      case 'gt':
        return Number(fieldValue) > Number(condition.value);
      case 'lte':
        return Number(fieldValue) <= Number(condition.value);
      case 'lt':
        return Number(fieldValue) < Number(condition.value);
      case 'eq':
        return Number(fieldValue) === Number(condition.value);
      default:
        throw new Error(`Unknown aggregate operator: ${condition.operator}`);
    }
  }

  /**
   * Evaluate logical condition
   */
  private evaluateLogicalCondition(condition: RuleCondition, transaction: CampaignTransaction): boolean {
    if (!condition.logicalOperator || !condition.subConditions) {
      throw new Error('Invalid logical condition');
    }

    const subResults = condition.subConditions.map(subCondition => 
      this.evaluateRuleCondition(subCondition, transaction)
    );

    switch (condition.logicalOperator) {
      case 'AND':
        return subResults.every(result => result);
      case 'OR':
        return subResults.some(result => result);
      default:
        throw new Error(`Unknown logical operator: ${condition.logicalOperator}`);
    }
  }

  /**
   * Evaluate custom condition
   */
  private evaluateCustomCondition(condition: RuleCondition, transaction: CampaignTransaction): boolean {
    // Custom conditions would be implemented based on business requirements
    // For now, return false as a safe default
    logger.warn('Custom condition evaluation not implemented:', { condition });
    return false;
  }

  /**
   * Calculate points based on rule calculation
   */
  private async calculatePoints(calculation: RuleCalculation, transaction: CampaignTransaction): Promise<number> {
    switch (calculation.type) {
      case 'mathematical':
        return this.calculateMathematicalPoints(calculation, transaction);
      
      case 'fixed':
        return calculation.points || 0;
      
      case 'percentage':
        return this.calculatePercentagePoints(calculation, transaction);
      
      case 'custom':
        return this.calculateCustomPoints(calculation, transaction);
      
      default:
        throw new Error(`Unknown calculation type: ${calculation.type}`);
    }
  }

  /**
   * Calculate mathematical points
   */
  private calculateMathematicalPoints(calculation: RuleCalculation, transaction: CampaignTransaction): number {
    if (!calculation.fields || !calculation.multiplier) {
      throw new Error('Invalid mathematical calculation');
    }

    let totalValue = 0;
    for (const field of calculation.fields) {
      const fieldValue = this.getTransactionFieldValue(transaction, field);
      totalValue += Number(fieldValue) || 0;
    }

    let result = totalValue * calculation.multiplier;

    // Apply rounding if specified
    if (calculation.rounding) {
      switch (calculation.rounding) {
        case 'floor':
          result = Math.floor(result);
          break;
        case 'ceil':
          result = Math.ceil(result);
          break;
        case 'round':
          result = Math.round(result);
          break;
      }
    }

    return Math.max(0, result); // Ensure non-negative
  }

  /**
   * Calculate percentage points
   */
  private calculatePercentagePoints(calculation: RuleCalculation, transaction: CampaignTransaction): number {
    if (!calculation.percentage || !calculation.fields) {
      throw new Error('Invalid percentage calculation');
    }

    let totalValue = 0;
    for (const field of calculation.fields) {
      const fieldValue = this.getTransactionFieldValue(transaction, field);
      totalValue += Number(fieldValue) || 0;
    }

    return Math.max(0, (totalValue * calculation.percentage) / 100);
  }

  /**
   * Calculate custom points
   */
  private calculateCustomPoints(calculation: RuleCalculation, transaction: CampaignTransaction): number {
    // Custom calculation logic would be implemented based on business requirements
    logger.warn('Custom point calculation not implemented:', { calculation });
    return 0;
  }

  /**
   * Get transaction field value
   */
  private getTransactionFieldValue(transaction: CampaignTransaction, fieldName: string): any {
    // Access the transaction data based on the field name
    // This assumes transaction.transactionData is a JSON object
    if (transaction.transactionData && typeof transaction.transactionData === 'object') {
      return (transaction.transactionData as any)[fieldName];
    }
    
    // Fallback to direct property access
    return (transaction as any)[fieldName];
  }

  /**
   * Generate accrual API call
   */
  private generateAccrualAPICall(result: RuleEvaluationResult, transaction: CampaignTransaction): AccrualAPICall | null {
    if (!result.passed || result.pointsAllocated <= 0) {
      return null;
    }

    return {
      ruleId: result.ruleId,
      ruleName: result.ruleDetails.name,
      points: result.pointsAllocated,
      apiEndpoint: '/api/tlp/accruals',
      requestBody: {
        campaignId: transaction.campaignId,
        userId: (transaction as any).userId || 'unknown',
        points: result.pointsAllocated,
        ruleId: result.ruleId,
        transactionId: transaction.id,
        description: `${result.ruleDetails.name}: ${result.pointsAllocated} points`,
        metadata: {
          ruleType: result.ruleType,
          ruleDescription: result.ruleDetails.description,
          transactionData: transaction.transactionData
        }
      },
      priority: result.ruleDetails.priority || 1
    };
  }

  /**
   * Get total rule count
   */
  private getTotalRuleCount(): number {
    return (
      this.ruleSet.rules.eligibility.length +
      this.ruleSet.rules.accrual.length +
      this.ruleSet.rules.bonus.length
    );
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
