import { logger } from '../utils/logger'
import { 
  TransactionJSONSchema, 
  JSONRuleSet, 
  DataExtractionQueries,
  RuleDefinition,
  RuleCondition,
  RuleCalculation
} from '@incentiva/shared'

export interface AIConfig {
  apiKey: string
  model: string
  endpoint: string
}

export interface AIGenerationResult {
  success: boolean
  data?: any
  error?: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalCost: number
  }
}

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  private async callAnthropic(prompt: string, systemPrompt?: string): Promise<AIGenerationResult> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          system: systemPrompt || 'You are an expert business rules analyst and database schema designer. Generate precise, executable JSON schemas and rule sets based on natural language business requirements.'
        })
      })

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      
      logger.info('Anthropic API call successful', {
        model: this.config.model,
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
        responseLength: data.content?.[0]?.text?.length || 0
      })

      return {
        success: true,
        data: data.content?.[0]?.text,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalCost: this.calculateCost(data.usage?.input_tokens || 0, data.usage?.output_tokens || 0)
        }
      }
    } catch (error: any) {
      logger.error('Anthropic API call failed', {
        error: error.message,
        model: this.config.model,
        promptLength: prompt.length
      })

      return {
        success: false,
        error: error.message
      }
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude 3.5 Sonnet pricing (as of 2024)
    const inputCostPer1K = 0.003
    const outputCostPer1K = 0.015
    
    return (inputTokens * inputCostPer1K / 1000) + (outputTokens * outputCostPer1K / 1000)
  }

  /**
   * Generate transaction JSON schema from natural language rules
   */
  async generateTransactionSchema(rules: string, databaseSchema?: string): Promise<AIGenerationResult> {
    try {
      logger.info('Generating transaction schema', { rulesLength: rules.length })

      const prompt = `
Generate a comprehensive JSON schema for transaction processing based on the following business rules:

BUSINESS RULES:
${rules}

${databaseSchema ? `EXISTING DATABASE SCHEMA:
${databaseSchema}` : ''}

REQUIREMENTS:
1. Create a JSON schema that captures all fields needed for transaction processing
2. Include field types, validation rules, and descriptions
3. Ensure the schema supports the business rules specified
4. Add any computed fields that might be needed for rule evaluation
5. Include metadata fields for tracking and auditing

OUTPUT FORMAT:
Return ONLY a valid JSON schema object with no additional text or explanation.

EXAMPLE STRUCTURE:
{
  "type": "object",
  "properties": {
    "transactionId": { "type": "string", "description": "Unique transaction identifier" },
    "amount": { "type": "number", "description": "Transaction amount in campaign currency" },
    "productLine": { "type": "string", "description": "Product line category" },
    "participantId": { "type": "string", "description": "Participant who made the sale" },
    "transactionDate": { "type": "string", "format": "date-time", "description": "Transaction timestamp" }
  },
  "required": ["transactionId", "amount", "participantId", "transactionDate"]
}
`

      const result = await this.callAnthropic(prompt)
      
      if (result.success && result.data) {
        try {
          const schema = JSON.parse(result.data)
          logger.info('Transaction schema generated successfully', {
            schemaFields: Object.keys(schema.properties || {}).length,
            requiredFields: schema.required?.length || 0
          })
          
          return {
            ...result,
            data: schema
          }
        } catch (parseError: any) {
          logger.error('Failed to parse generated schema JSON', {
            error: parseError.message,
            rawResponse: result.data
          })
          
          return {
            success: false,
            error: `Generated schema is not valid JSON: ${parseError.message}`
          }
        }
      }
      
      return result
    } catch (error: any) {
      logger.error('Failed to generate transaction schema', {
        error: error.message,
        rules: rules.substring(0, 100) + '...'
      })
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate executable JSON rules from natural language
   */
  async generateJSONRules(rules: string, transactionSchema: any): Promise<AIGenerationResult> {
    try {
      logger.info('Generating JSON rules', { rulesLength: rules.length })

      const prompt = `
Generate executable JSON rules based on the following business rules and transaction schema:

BUSINESS RULES:
${rules}

TRANSACTION SCHEMA:
${JSON.stringify(transactionSchema, null, 2)}

REQUIREMENTS:
1. Create a JSON rule set that can be executed at runtime
2. Include eligibility rules, accrual rules, and bonus rules
3. Use the transaction schema fields for rule evaluation
4. Make rules flexible and configurable
5. Include validation and error handling logic

OUTPUT FORMAT:
Return ONLY a valid JSON object with no additional text or explanation.

EXAMPLE STRUCTURE:
{
  "eligibilityRules": [
    {
      "id": "active_employee",
      "condition": "participant.status === 'ACTIVE'",
      "description": "Only active employees can participate"
    }
  ],
  "accrualRules": [
    {
      "id": "premium_line_points",
      "condition": "productLine === 'Premium Line'",
      "calculation": "Math.ceil(amount / 200)",
      "description": "1 point per 200 MXN for Premium Line products"
    }
  ],
  "bonusRules": [
    {
      "id": "individual_goal_bonus",
      "condition": "individualGoal >= 200000",
      "bonus": 50000,
      "description": "50,000 bonus points for achieving individual goal"
    }
  ]
}
`

      const result = await this.callAnthropic(prompt)
      
      if (result.success && result.data) {
        try {
          const rules = JSON.parse(result.data)
          logger.info('JSON rules generated successfully', {
            eligibilityRules: rules.eligibilityRules?.length || 0,
            accrualRules: rules.accrualRules?.length || 0,
            bonusRules: rules.bonusRules?.length || 0
          })
          
          return {
            ...result,
            data: rules
          }
        } catch (parseError: any) {
          logger.error('Failed to parse generated rules JSON', {
            error: parseError.message,
            rawResponse: result.data
          })
          
          return {
            success: false,
            error: `Generated rules are not valid JSON: ${parseError.message}`
          }
        }
      }
      
      return result
    } catch (error: any) {
      logger.error('Failed to generate JSON rules', {
        error: error.message,
        rules: rules.substring(0, 100) + '...'
      })
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate data extraction queries from database schema
   */
  async generateDataExtractionQueries(databaseSchema: string, campaignRules: string): Promise<AIGenerationResult> {
    try {
      logger.info('Generating data extraction queries', { 
        schemaLength: databaseSchema.length,
        rulesLength: campaignRules.length
      })

      const prompt = `
Generate SQL queries for data extraction based on the following database schema and campaign rules:

DATABASE SCHEMA:
${databaseSchema}

CAMPAIGN RULES:
${campaignRules}

REQUIREMENTS:
1. Create a one-time load query to extract historical data
2. Create an incremental load query for ongoing data extraction
3. Ensure queries are optimized for performance
4. Include proper filtering based on campaign rules
5. Add data transformation logic if needed
6. Include error handling and logging

OUTPUT FORMAT:
Return ONLY a valid JSON object with no additional text or explanation.

EXAMPLE STRUCTURE:
{
  "oneTimeLoad": {
    "query": "SELECT ... FROM ... WHERE ...",
    "description": "Extract historical data for campaign initialization",
    "estimatedRows": 10000,
    "executionTime": "5-10 minutes"
  },
  "incrementalLoad": {
    "query": "SELECT ... FROM ... WHERE ... AND ... > $1",
    "description": "Extract new/updated data since last run",
    "parameters": ["lastExtractionTimestamp"],
    "estimatedRows": "100-1000 per run",
    "executionTime": "1-2 minutes"
  },
  "dataTransformation": {
    "fieldMappings": {
      "customer_id": "participantId",
      "sale_amount": "amount",
      "product_category": "productLine"
    },
    "calculations": [
      "points = Math.ceil(amount / 200)"
    ]
  }
}
`

      const result = await this.callAnthropic(prompt)
      
      if (result.success && result.data) {
        try {
          const queries = JSON.parse(result.data)
          logger.info('Data extraction queries generated successfully', {
            hasOneTimeLoad: !!queries.oneTimeLoad,
            hasIncrementalLoad: !!queries.incrementalLoad,
            hasTransformation: !!queries.dataTransformation
          })
          
          return {
            ...result,
            data: queries
          }
        } catch (parseError: any) {
          logger.error('Failed to parse generated queries JSON', {
            error: parseError.message,
            rawResponse: result.data
          })
          
          return {
            success: false,
            error: `Generated queries are not valid JSON: ${parseError.message}`
          }
        }
      }
      
      return result
    } catch (error: any) {
      logger.error('Failed to generate data extraction queries', {
        error: error.message
      })
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate complete campaign artifacts (schema, rules, and queries)
   */
  async generateCampaignArtifacts(
    campaignRules: string, 
    databaseSchema?: string
  ): Promise<{
    transactionSchema: AIGenerationResult
    jsonRules: AIGenerationResult
    dataQueries: AIGenerationResult
  }> {
    try {
      logger.info('Starting campaign artifact generation', {
        rulesLength: campaignRules.length,
        hasDatabaseSchema: !!databaseSchema
      })

      // Step 1: Generate transaction schema
      const transactionSchema = await this.generateTransactionSchema(campaignRules, databaseSchema)
      
      if (!transactionSchema.success) {
        throw new Error(`Failed to generate transaction schema: ${transactionSchema.error}`)
      }

      // Step 2: Generate JSON rules using the schema
      const jsonRules = await this.generateJSONRules(campaignRules, transactionSchema.data)
      
      if (!jsonRules.success) {
        throw new Error(`Failed to generate JSON rules: ${jsonRules.error}`)
      }

      // Step 3: Generate data extraction queries
      const dataQueries = await this.generateDataExtractionQueries(
        databaseSchema || 'No database schema provided',
        campaignRules
      )

      logger.info('Campaign artifact generation completed', {
        schemaSuccess: transactionSchema.success,
        rulesSuccess: jsonRules.success,
        queriesSuccess: dataQueries.success
      })

      return {
        transactionSchema,
        jsonRules,
        dataQueries
      }
    } catch (error: any) {
      logger.error('Campaign artifact generation failed', {
        error: error.message
      })
      
      throw error
    }
  }

  /**
   * Validate generated rules against transaction schema
   */
  async validateRulesAgainstSchema(rules: any, schema: any): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check if rules reference schema fields that don't exist
      const schemaFields = Object.keys(schema.properties || {})
      
      // Extract field references from rules
      const ruleText = JSON.stringify(rules)
      
      // Simple validation - check for obvious field mismatches
      if (rules.accrualRules) {
        for (const rule of rules.accrualRules) {
          if (rule.condition) {
            // Check if condition references valid schema fields
            const fieldMatches = schemaFields.filter(field => 
              rule.condition.includes(field)
            )
            
            if (fieldMatches.length === 0) {
              warnings.push(`Accrual rule condition may reference non-existent fields: ${rule.condition}`)
            }
          }
        }
      }

      // Check for required fields in schema
      const requiredFields = schema.required || []
      if (requiredFields.length === 0) {
        warnings.push('Schema has no required fields - this may cause validation issues')
      }

      // Check for common field types
      const hasParticipantId = schemaFields.some(field => 
        field.toLowerCase().includes('participant') || field.toLowerCase().includes('user')
      )
      if (!hasParticipantId) {
        warnings.push('Schema may be missing participant/user identification field')
      }

      const hasAmount = schemaFields.some(field => 
        field.toLowerCase().includes('amount') || field.toLowerCase().includes('value')
      )
      if (!hasAmount) {
        warnings.push('Schema may be missing transaction amount/value field')
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error: any) {
      errors.push(`Validation failed: ${error.message}`)
      return {
        valid: false,
        errors,
        warnings
      }
    }
  }
}

export default AIService 