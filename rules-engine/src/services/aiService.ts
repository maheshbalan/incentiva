import axios from 'axios';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { 
  GeneratedRules, 
  GeneratedCode,
  CustomerDatabaseSchema,
  TransactionJSONSchema,
  JSONRuleSet,
  DataExtractionQueries
} from '@incentiva/shared';

export class AIService {
  private anthropicApiKey: string;
  private anthropicEndpoint: string;

  constructor() {
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.anthropicEndpoint = 'https://api.anthropic.com/v1/messages';
    
    if (!this.anthropicApiKey) {
      logger.warn('ANTHROPIC_API_KEY not provided - AI features will be limited');
    }
  }

  /**
   * Generate loyalty campaign rules from natural language description
   */
  async generateRules(
    campaignId: string,
    naturalLanguageRules: string,
    databaseSchema?: CustomerDatabaseSchema
  ): Promise<GeneratedRules> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    logger.info('Generating rules using Anthropic:', { campaignId });

    try {
      const prompt = this.buildRulesGenerationPrompt(naturalLanguageRules, databaseSchema);
      
      const response = await this.callAnthropic(prompt);
      
      // Parse the response and extract rules
      const parsedRules = this.parseGeneratedRules(response, campaignId);
      
      logger.info('Rules generated successfully:', { campaignId });
      
      return parsedRules;
    } catch (error) {
      logger.error('Failed to generate rules:', error);
      throw new Error(`Failed to generate rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze customer database schema using Anthropic
   */
  async analyzeDatabaseSchema(
    campaignId: string,
    databaseConnection: any,
    sampleQueries?: string[]
  ): Promise<CustomerDatabaseSchema> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    logger.info('Analyzing database schema using Anthropic:', { campaignId });

    try {
      const prompt = this.buildSchemaAnalysisPrompt(databaseConnection, sampleQueries);
      
      const response = await this.callAnthropic(prompt);
      
      // Parse the response and extract schema analysis
      const parsedSchema = this.parseSchemaAnalysis(response);
      
      logger.info('Schema analysis completed:', { campaignId });
      
      return parsedSchema;
    } catch (error) {
      logger.error('Failed to analyze schema:', error);
      throw new Error(`Failed to analyze schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate microservice code using Anthropic
   */
  async generateMicroserviceCode(
    campaignId: string,
    rules: any,
    schema: any
  ): Promise<GeneratedCode> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    logger.info('Generating microservice code using Anthropic:', { campaignId });

    try {
      const prompt = this.buildCodeGenerationPrompt(rules, schema);
      
      const response = await this.callAnthropic(prompt);
      
      // Parse the response and extract generated code
      const parsedCode = this.parseGeneratedCode(response);
      
      logger.info('Code generation completed:', { campaignId });
      
      return parsedCode;
    } catch (error) {
      logger.error('Failed to generate code:', error);
      throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate transaction JSON schema and rules from natural language
   */
  async generateTransactionSchemaAndRules(
    campaignId: string,
    naturalLanguageRules: string,
    databaseSchema: CustomerDatabaseSchema
  ): Promise<{
    transactionSchema: TransactionJSONSchema;
    ruleSet: JSONRuleSet;
    dataExtractionQueries: DataExtractionQueries;
  }> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    logger.info('Generating transaction schema and rules:', { campaignId });

    try {
      const prompt = this.buildTransactionSchemaPrompt(naturalLanguageRules, databaseSchema);
      
      const response = await this.callAnthropic(prompt);
      
      // Parse the response and extract schema and rules
      const parsed = this.parseTransactionSchemaAndRules(response, campaignId);
      
      logger.info('Transaction schema and rules generated successfully:', { campaignId });
      
      return parsed;
    } catch (error) {
      logger.error('Failed to generate transaction schema and rules:', error);
      throw new Error(`Failed to generate transaction schema and rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.anthropicEndpoint,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicApiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      if (response.data?.content?.[0]?.text) {
        return response.data.content[0].text;
      } else {
        throw new Error('Invalid response format from Anthropic API');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Anthropic API error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(`Anthropic API error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Build prompt for rules generation
   */
  private buildRulesGenerationPrompt(
    naturalLanguageRules: string,
    databaseSchema?: CustomerDatabaseSchema
  ): string {
    let prompt = `You are an expert loyalty campaign rules engine. Generate structured rules from the following natural language description:

Campaign Rules Description:
${naturalLanguageRules}

`;

    if (databaseSchema) {
      prompt += `Database Schema Context:
${JSON.stringify(databaseSchema, null, 2)}

`;
    }

    prompt += `Please generate rules in the following JSON format:
{
  "campaignId": "campaign_id_here",
  "schema": ${databaseSchema ? JSON.stringify(databaseSchema) : 'null'},
  "rules": {
    "goalRules": [
      {
        "type": "INDIVIDUAL|OVERALL|REGIONAL",
        "targetValue": 50000,
        "currency": "MXN",
        "description": "Goal description",
        "calculationLogic": "SQL or TypeScript logic for calculation",
        "applicableTables": ["table1", "table2"],
        "applicableFields": ["field1", "field2"]
      }
    ],
    "eligibilityRules": [
      {
        "description": "Eligibility condition description",
        "conditions": ["condition1", "condition2"],
        "applicableTables": ["table1", "table2"],
        "applicableFields": ["field1", "field2"],
        "exclusionCriteria": ["exclusion1", "exclusion2"]
      }
    ],
    "prizeRules": [
      {
        "description": "Prize description",
        "pointValue": 50000,
        "conditions": ["condition1", "condition2"],
        "applicableTables": ["table1", "table2"],
        "applicableFields": ["field1", "field2"]
      }
    ]
  },
  "generatedCode": {
    "dataExtractionQuery": "SQL query for data extraction",
    "rulesApplicationLogic": "TypeScript logic for applying rules",
    "tlpIntegrationCode": "Code for TLP API integration",
    "microserviceCode": "Complete microservice implementation",
    "testCode": "Unit tests for the rules"
  },
  "understandingScore": 0.85,
  "feedback": "Analysis feedback and suggestions"
}

Focus on:
1. Translating natural language requirements into executable rules
2. Creating appropriate goals based on the schema
3. Defining eligibility criteria
4. Specifying redemption prizes
5. Generating executable code for TLP integration
6. Providing confidence scores and feedback

Return only valid JSON, no additional text.`;

    return prompt;
  }

  /**
   * Build prompt for schema analysis
   */
  private buildSchemaAnalysisPrompt(
    databaseConnection: any,
    sampleQueries?: string[]
  ): string {
    let prompt = `You are an expert database schema analyst. Analyze the following database connection and provide a comprehensive schema understanding:

Database Connection Details:
${JSON.stringify(databaseConnection, null, 2)}

`;

    if (sampleQueries && sampleQueries.length > 0) {
      prompt += `Sample Queries for Context:
${sampleQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

`;
    }

    prompt += `Please analyze the schema and provide the following JSON format:
{
  "tables": [
    {
      "name": "table_name",
      "description": "Table description",
      "fields": [
        {
          "name": "field_name",
          "type": "data_type",
          "nullable": true,
          "description": "Field description",
          "sampleValues": ["value1", "value2"],
          "isForeignKey": false,
          "referencedTable": null,
          "referencedField": null
        }
      ],
      "primaryKey": "primary_key_field",
      "indexes": ["index1", "index2"],
      "estimatedRowCount": 1000
    }
  ],
  "relationships": [
    {
      "fromTable": "table_name",
      "fromField": "field_name",
      "toTable": "referenced_table",
      "toField": "referenced_field",
      "relationshipType": "one-to-one|one-to-many|many-to-many",
      "description": "Relationship description"
    }
  ],
  "understandingScore": 0.85,
  "feedback": "Analysis feedback and suggestions"
}

Focus on identifying:
1. Sales-related tables (orders, customers, products, etc.)
2. Key relationships between tables
3. Fields needed for loyalty campaign calculations
4. Data types and constraints
5. Potential issues or missing information

Provide a confidence score (0.0 to 1.0) for your understanding of the schema.

Return only valid JSON, no additional text.`;

    return prompt;
  }

  /**
   * Build prompt for code generation
   */
  private buildCodeGenerationPrompt(rules: any, schema: any): string {
    return `You are an expert TypeScript developer specializing in loyalty campaign microservices. Generate executable code based on the following rules and schema:

Generated Rules:
${JSON.stringify(rules, null, 2)}

Database Schema:
${JSON.stringify(schema, null, 2)}

Please provide code in the following JSON format:
{
  "dataExtractionQuery": "SQL queries for data extraction with pagination",
  "rulesApplicationLogic": "Complete TypeScript class for campaign execution",
  "tlpIntegrationCode": "TLP API integration methods",
  "microserviceCode": "Complete microservice implementation with error handling",
  "testCode": "Comprehensive unit tests for the rules"
}

The TypeScript code should include:
1. Campaign class with goal calculation methods
2. TLP API integration methods
3. Data validation and error handling
4. Real-time progress tracking
5. Point allocation logic
6. Batch processing capabilities
7. Retry mechanisms for failed operations

The SQL should include:
1. Queries for extracting relevant data with proper pagination
2. Calculations for goal progress
3. Performance optimizations
4. Error handling for edge cases

Return only valid JSON, no additional text.`;
  }

  /**
   * Build prompt for transaction schema and rules generation
   */
  private buildTransactionSchemaPrompt(
    naturalLanguageRules: string,
    databaseSchema: CustomerDatabaseSchema
  ): string {
    return `You are an expert data engineer specializing in loyalty campaign data processing. Based on the natural language rules and database schema, generate a complete transaction processing system.

Natural Language Rules:
${naturalLanguageRules}

Database Schema:
${JSON.stringify(databaseSchema, null, 2)}

Please provide the following JSON format:
{
  "transactionSchema": {
    "tableName": "campaign_transactions",
    "description": "Transaction table for campaign processing",
    "fields": [
      {
        "name": "field_name",
        "type": "data_type",
        "required": true,
        "description": "Field description",
        "sourceField": "original_database_field",
        "transformation": "any_transformation_logic",
        "validation": "validation_rules"
      }
    ],
    "indexes": ["index1", "index2"],
    "constraints": ["constraint1", "constraint2"]
  },
  "ruleSet": {
    "campaignId": "campaign_id",
    "version": "1.0",
    "rules": {
      "eligibility": [
        {
          "id": "rule_1",
          "name": "Premium Line Eligibility",
          "description": "Only Premium line products qualify",
          "condition": {
            "type": "fieldComparison",
            "field": "productLine",
            "operator": "equals",
            "value": "Premium"
          },
          "priority": 1,
          "enabled": true
        }
      ],
      "accrual": [
        {
          "id": "accrual_1",
          "name": "Points per MXN",
          "description": "1 point per 1000 MXN spent",
          "condition": {
            "type": "fieldComparison",
            "field": "orderStatus",
            "operator": "equals",
            "value": "completed"
          },
          "calculation": {
            "type": "mathematical",
            "formula": "orderAmount * 0.001",
            "fields": ["orderAmount"],
            "multiplier": 0.001,
            "rounding": "floor"
          },
          "priority": 1,
          "enabled": true
        }
      ],
      "bonus": [
        {
          "id": "bonus_1",
          "name": "Individual Goal Bonus",
          "description": "Bonus points for reaching individual goal",
          "condition": {
            "type": "aggregate",
            "aggregation": "sum",
            "field": "orderAmount",
            "operator": "gte",
            "value": 200000
          },
          "calculation": {
            "type": "fixed",
            "points": 50000
          },
          "priority": 2,
          "enabled": true
        }
      ]
    }
  },
  "dataExtractionQueries": {
    "oneTimeLoad": {
      "description": "Initial data load for campaign",
      "sql": "SELECT o.id as orderId, o.customer_id as customerId, o.total_amount as orderAmount, oi.product_category as productLine, o.created_at as orderDate, o.status as orderStatus FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31' AND oi.product_category = 'Premium'",
      "parameters": {
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "productCategory": "Premium"
      }
    },
    "incrementalLoad": {
      "description": "Incremental data load",
      "sql": "SELECT o.id as orderId, o.customer_id as customerId, o.total_amount as orderAmount, oi.product_category as productLine, o.created_at as orderDate, o.status as orderStatus FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.created_at > (SELECT MAX(orderDate) FROM campaign_transactions WHERE campaignId = :campaignId) AND oi.product_category = 'Premium'",
      "parameters": {
        "campaignId": "campaign_id_placeholder"
      }
    }
  }
}

Focus on:
1. Creating a comprehensive transaction schema that captures all data needed for rule processing
2. Generating executable JSON rules that can be parsed and applied at runtime
3. Creating efficient data extraction queries for both one-time and incremental loads
4. Ensuring the schema supports all rule types (eligibility, accrual, bonus)
5. Making rules flexible and configurable

Return only valid JSON, no additional text.`;
  }

  /**
   * Parse generated rules from Anthropic response
   */
  private parseGeneratedRules(response: string, campaignId: string): GeneratedRules {
    try {
      // Extract JSON from response (remove markdown if present)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate and transform the parsed data
      return {
        campaignId,
        schema: parsed.schema || null,
        rules: {
          goalRules: parsed.rules?.goalRules || [],
          eligibilityRules: parsed.rules?.eligibilityRules || [],
          prizeRules: parsed.rules?.prizeRules || []
        },
        generatedCode: parsed.generatedCode || {},
        understandingScore: parsed.understandingScore || 0.5,
        feedback: parsed.feedback || 'No feedback provided'
      };
    } catch (error) {
      logger.error('Failed to parse generated rules:', error);
      throw new Error(`Failed to parse generated rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse schema analysis from Anthropic response
   */
  private parseSchemaAnalysis(response: string): CustomerDatabaseSchema {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        tables: parsed.tables || [],
        relationships: parsed.relationships || [],
        understandingScore: parsed.understandingScore || 0.5,
        feedback: parsed.feedback || 'No feedback provided'
      };
    } catch (error) {
      logger.error('Failed to parse schema analysis:', error);
      throw new Error(`Failed to parse schema analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse generated code from Anthropic response
   */
  private parseGeneratedCode(response: string): GeneratedCode {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        dataExtractionQuery: parsed.dataExtractionQuery || '',
        rulesApplicationLogic: parsed.rulesApplicationLogic || '',
        tlpIntegrationCode: parsed.tlpIntegrationCode || '',
        microserviceCode: parsed.microserviceCode || '',
        testCode: parsed.testCode || '',
        typescript: parsed.typescript || '',
        sql: parsed.sql || '',
        validation: parsed.validation || '',
        documentation: parsed.documentation || ''
      };
    } catch (error) {
      logger.error('Failed to parse generated code:', error);
      throw new Error(`Failed to parse generated code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse transaction schema and rules from Anthropic response
   */
  private parseTransactionSchemaAndRules(
    response: string, 
    campaignId: string
  ): {
    transactionSchema: TransactionJSONSchema;
    ruleSet: JSONRuleSet;
    dataExtractionQueries: DataExtractionQueries;
  } {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        transactionSchema: parsed.transactionSchema,
        ruleSet: parsed.ruleSet,
        dataExtractionQueries: parsed.dataExtractionQueries
      };
    } catch (error) {
      logger.error('Failed to parse transaction schema and rules:', error);
      throw new Error(`Failed to parse transaction schema and rules: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
