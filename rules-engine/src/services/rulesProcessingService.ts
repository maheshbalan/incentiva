import { logger } from '../utils/logger';
import { GeneratedRules, CampaignTransaction } from '@incentiva/shared';

export interface RuleEvaluationResult {
  transactionId: string;
  ruleId: string;
  ruleType: string;
  passed: boolean;
  actualValue?: number;
  expectedValue?: number;
  pointsAllocated: number;
  errorMessage?: string;
  executionTime: number;
}

export interface ProcessingResult {
  transactionId: string;
  success: boolean;
  pointsAllocated: number;
  rulesEvaluated: RuleEvaluationResult[];
  totalExecutionTime: number;
  errorMessage?: string;
}

export class RulesProcessingService {
  private rules: GeneratedRules;

  constructor(rules: GeneratedRules) {
    this.rules = rules;
  }

  async processTransaction(transaction: CampaignTransaction): Promise<ProcessingResult> {
    const startTime = Date.now();
    const rulesEvaluated: RuleEvaluationResult[] = [];
    let totalPoints = 0;
    let success = true;
    let errorMessage: string | undefined;

    try {
      logger.info('Processing transaction with rules:', { 
        transactionId: transaction.id,
        ruleCount: this.rules.rules.goalRules.length + this.rules.rules.eligibilityRules.length + this.rules.rules.prizeRules.length
      });

      // Process goal rules
      for (const goalRule of this.rules.rules.goalRules) {
        const result = await this.evaluateGoalRule(transaction, goalRule);
        rulesEvaluated.push(result);
        
        if (result.passed) {
          totalPoints += result.pointsAllocated;
        }
      }

      // Process eligibility rules
      for (const eligibilityRule of this.rules.rules.eligibilityRules) {
        const result = await this.evaluateEligibilityRule(transaction, eligibilityRule);
        rulesEvaluated.push(result);
        
        if (!result.passed) {
          success = false;
          errorMessage = `Failed eligibility rule: ${eligibilityRule.description}`;
          break;
        }
      }

              // Only process prize rules if eligibility passed
        if (success) {
          for (const prizeRule of this.rules.rules.prizeRules) {
          const result = await this.evaluatePrizeRule(transaction, prizeRule);
          rulesEvaluated.push(result);
          
          if (result.passed) {
            totalPoints += result.pointsAllocated;
          }
        }
      }

      const totalExecutionTime = Date.now() - startTime;

      logger.info('Transaction processing completed:', {
        transactionId: transaction.id,
        success,
        totalPoints,
        executionTime: totalExecutionTime
      });

      return {
        transactionId: transaction.id,
        success,
        pointsAllocated: totalPoints,
        rulesEvaluated,
        totalExecutionTime,
        errorMessage
      };

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Transaction processing failed:', {
        transactionId: transaction.id,
        error: errorMsg,
        executionTime: totalExecutionTime
      });

      return {
        transactionId: transaction.id,
        success: false,
        pointsAllocated: 0,
        rulesEvaluated,
        totalExecutionTime,
        errorMessage: errorMsg
      };
    }
  }

  private async evaluateGoalRule(
    transaction: CampaignTransaction, 
    rule: any
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now();
    
    try {
      logger.debug('Evaluating goal rule:', { ruleId: rule.id, ruleType: rule.type });

      let actualValue: number | undefined;
      let passed = false;
      let pointsAllocated = 0;

      // Extract transaction data
      const transactionData = transaction.transactionData as any;
      
      switch (rule.type) {
        case 'individual':
          actualValue = this.calculateIndividualGoalValue(transactionData, rule);
          passed = actualValue >= rule.targetValue;
          if (passed) {
            pointsAllocated = rule.bonusPoints || 0;
          }
          break;
          
        case 'overall':
          actualValue = this.calculateOverallGoalValue(transactionData, rule);
          passed = actualValue >= rule.targetValue;
          if (passed) {
            pointsAllocated = rule.bonusPoints || 0;
          }
          break;
          
        default:
          throw new Error(`Unknown goal rule type: ${rule.type}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'goal',
        passed,
        actualValue,
        expectedValue: rule.targetValue,
        pointsAllocated,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Goal rule evaluation failed:', {
        ruleId: rule.id,
        error: errorMsg
      });

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'goal',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
        executionTime
      };
    }
  }

  private async evaluateEligibilityRule(
    transaction: CampaignTransaction, 
    rule: any
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now();
    
    try {
      logger.debug('Evaluating eligibility rule:', { ruleId: rule.id });

      const transactionData = transaction.transactionData as any;
      const passed = this.evaluateEligibilityCondition(transactionData, rule.conditions);
      const executionTime = Date.now() - startTime;

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'eligibility',
        passed,
        pointsAllocated: 0,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Eligibility rule evaluation failed:', {
        ruleId: rule.id,
        error: errorMsg
      });

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'eligibility',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
        executionTime
      };
    }
  }

  private async evaluatePrizeRule(
    transaction: CampaignTransaction, 
    rule: any
  ): Promise<RuleEvaluationResult> {
    const startTime = Date.now();
    
    try {
      logger.debug('Evaluating prize rule:', { ruleId: rule.id });

      const transactionData = transaction.transactionData as any;
      const passed = this.evaluatePrizeCondition(transactionData, rule.conditions);
      const pointsAllocated = passed ? rule.pointValue * (transactionData.amount || 0) : 0;
      const executionTime = Date.now() - startTime;

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'prize',
        passed,
        actualValue: transactionData.amount,
        expectedValue: rule.minimumValue,
        pointsAllocated,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Prize rule evaluation failed:', {
        ruleId: rule.id,
        error: errorMsg
      });

      return {
        transactionId: transaction.id,
        ruleId: rule.id,
        ruleType: 'prize',
        passed: false,
        pointsAllocated: 0,
        errorMessage: errorMsg,
        executionTime
      };
    }
  }

  private calculateIndividualGoalValue(transactionData: any, rule: any): number {
    // TODO: Implement actual individual goal calculation logic
    // This would typically involve looking up the user's progress toward their individual goal
    
    // Mock implementation
    return transactionData.amount || 0;
  }

  private calculateOverallGoalValue(transactionData: any, rule: any): number {
    // TODO: Implement actual overall goal calculation logic
    // This would typically involve looking up the campaign's overall progress
    
    // Mock implementation
    return transactionData.amount || 0;
  }

  private evaluateEligibilityCondition(transactionData: any, condition: any): boolean {
    // TODO: Implement actual eligibility condition evaluation
    // This would parse and evaluate complex conditions like "status = 'paid' AND amount > 100"
    
    // Mock implementation
    if (condition.field === 'status') {
      return transactionData.status === condition.value;
    }
    if (condition.field === 'amount') {
      return transactionData.amount >= condition.value;
    }
    
    return true; // Default to eligible
  }

  private evaluatePrizeCondition(transactionData: any, condition: any): boolean {
    // TODO: Implement actual prize condition evaluation
    
    // Mock implementation
    if (condition.field === 'status') {
      return transactionData.status === condition.value;
    }
    if (condition.field === 'amount') {
      return transactionData.amount >= condition.value;
    }
    
    return true; // Default to eligible
  }

  async validateRules(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validate goal rules
      if (!this.rules.rules.goalRules || this.rules.rules.goalRules.length === 0) {
        errors.push('No goal rules defined');
      }

      // Validate eligibility rules
      if (!this.rules.rules.eligibilityRules || this.rules.rules.eligibilityRules.length === 0) {
        errors.push('No eligibility rules defined');
      }

      // Validate prize rules
      if (!this.rules.rules.prizeRules || this.rules.rules.prizeRules.length === 0) {
        errors.push('No prize rules defined');
      }

      // Validate rule structure
      this.rules.rules.goalRules?.forEach((rule, index) => {
        if (!rule.type) errors.push(`Goal rule ${index}: Missing type`);
        if (!rule.targetValue) errors.push(`Goal rule ${index}: Missing target value`);
      });

      this.rules.rules.eligibilityRules?.forEach((rule, index) => {
        if (!rule.description) errors.push(`Eligibility rule ${index}: Missing description`);
        if (!rule.conditions) errors.push(`Eligibility rule ${index}: Missing conditions`);
      });

      this.rules.rules.prizeRules?.forEach((rule, index) => {
        if (!rule.description) errors.push(`Prize rule ${index}: Missing description`);
        if (!rule.conditions) errors.push(`Prize rule ${index}: Missing conditions`);
        if (!rule.pointValue) errors.push(`Prize rule ${index}: Missing point value`);
      });

      const isValid = errors.length === 0;

      logger.info('Rules validation completed:', { 
        isValid, 
        errorCount: errors.length 
      });

      return { valid: isValid, errors };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Validation error: ${errorMsg}`);
      
      logger.error('Rules validation failed:', error);
      return { valid: false, errors };
    }
  }
}
