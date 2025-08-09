import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';
import { 
  SchemaAnalysis, 
  GeneratedRules, 
  GeneratedCode, 
  TableInfo, 
  FieldInfo, 
  RelationshipInfo 
} from '@incentiva/shared';

export class AIService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  async analyzeSchema(schema: string): Promise<SchemaAnalysis> {
    try {
      const prompt = this.buildSchemaAnalysisPrompt(schema);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = this.parseSchemaAnalysis(response.content[0].text);
      
      logger.info('Schema analysis completed', {
        understandingScore: analysis.understandingScore,
        tablesCount: analysis.tables.length,
        relationshipsCount: analysis.relationships.length
      });

      return analysis;
    } catch (error) {
      logger.error('Schema analysis failed:', error);
      throw new Error('Failed to analyze schema');
    }
  }

  async generateRules(requirements: string, schema: SchemaAnalysis): Promise<GeneratedRules> {
    try {
      const prompt = this.buildRuleGenerationPrompt(requirements, schema);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const rules = this.parseGeneratedRules(response.content[0].text);
      
      logger.info('Rules generation completed', {
        goalsCount: rules.goals.length,
        eligibilityCount: rules.eligibility.length,
        prizesCount: rules.prizes.length,
        validationErrors: rules.validationErrors.length
      });

      return rules;
    } catch (error) {
      logger.error('Rules generation failed:', error);
      throw new Error('Failed to generate rules');
    }
  }

  async generateCode(rules: GeneratedRules, schema: SchemaAnalysis): Promise<GeneratedCode> {
    try {
      const prompt = this.buildCodeGenerationPrompt(rules, schema);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      });

      const code = this.parseGeneratedCode(response.content[0].text);
      
      logger.info('Code generation completed', {
        hasTypeScript: !!code.typescript,
        hasSQL: !!code.sql,
        hasValidation: !!code.validation,
        hasDocumentation: !!code.documentation
      });

      return code;
    } catch (error) {
      logger.error('Code generation failed:', error);
      throw new Error('Failed to generate code');
    }
  }

  async generateGraphics(description: string): Promise<string> {
    try {
      const prompt = this.buildGraphicsPrompt(description);
      
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      // For now, return a placeholder URL
      // In production, this would integrate with an image generation service
      const imageUrl = `https://generated-graphics.incentiva.com/${this.generateSlug(description)}.png`;
      
      logger.info('Graphics generation completed', {
        description,
        imageUrl
      });

      return imageUrl;
    } catch (error) {
      logger.error('Graphics generation failed:', error);
      throw new Error('Failed to generate graphics');
    }
  }

  private buildSchemaAnalysisPrompt(schema: string): string {
    return `Analyze the following database schema and provide a comprehensive understanding:

Schema: ${schema}

Please provide your analysis in the following JSON format:
{
  "tables": [
    {
      "name": "table_name",
      "fields": [
        {
          "name": "field_name",
          "type": "data_type",
          "nullable": true/false,
          "description": "field_description"
        }
      ],
      "primaryKey": "primary_key_field",
      "foreignKeys": [
        {
          "field": "foreign_key_field",
          "referencesTable": "referenced_table",
          "referencesField": "referenced_field"
        }
      ]
    }
  ],
  "relationships": [
    {
      "fromTable": "table_name",
      "fromField": "field_name",
      "toTable": "referenced_table",
      "toField": "referenced_field",
      "relationshipType": "one-to-one|one-to-many|many-to-many"
    }
  ],
  "understandingScore": 0.85,
  "feedback": "Analysis feedback and suggestions",
  "requiredFields": ["field1", "field2", "field3"]
}

Focus on identifying:
1. Sales-related tables (orders, customers, products, etc.)
2. Key relationships between tables
3. Fields needed for loyalty campaign calculations
4. Data types and constraints
5. Potential issues or missing information

Provide a confidence score (0.0 to 1.0) for your understanding of the schema.`;
  }

  private buildRuleGenerationPrompt(requirements: string, schema: SchemaAnalysis): string {
    return `Based on the campaign requirements and database schema, generate loyalty campaign rules:

Campaign Requirements: ${requirements}

Database Schema Analysis: ${JSON.stringify(schema, null, 2)}

Please generate rules in the following JSON format:
{
  "goals": [
    {
      "type": "individual|regional|team",
      "target": 50000,
      "currency": "BRL",
      "description": "Goal description",
      "calculationLogic": "SQL or TypeScript logic for calculation"
    }
  ],
  "eligibility": [
    {
      "condition": "eligibility_condition",
      "description": "Condition description",
      "validationLogic": "Validation code"
    }
  ],
  "prizes": [
    {
      "name": "Prize name",
      "description": "Prize description",
      "pointCost": 50000,
      "imageUrl": "generated_image_url",
      "redemptionCode": "optional_redemption_code"
    }
  ],
  "generatedCode": "Complete TypeScript code for campaign execution",
  "validationErrors": ["error1", "error2"]
}

Focus on:
1. Translating natural language requirements into executable rules
2. Creating appropriate goals based on the schema
3. Defining eligibility criteria
4. Specifying redemption prizes
5. Generating executable code for TLP integration`;
  }

  private buildCodeGenerationPrompt(rules: GeneratedRules, schema: SchemaAnalysis): string {
    return `Generate executable code for the loyalty campaign based on the rules and schema:

Generated Rules: ${JSON.stringify(rules, null, 2)}
Database Schema: ${JSON.stringify(schema, null, 2)}

Please provide code in the following JSON format:
{
  "typescript": "Complete TypeScript class for campaign execution",
  "sql": "SQL queries for data extraction and calculation",
  "validation": "Validation functions for data integrity",
  "documentation": "Comprehensive documentation for the generated code"
}

The TypeScript code should include:
1. Campaign class with goal calculation methods
2. TLP API integration methods
3. Data validation and error handling
4. Real-time progress tracking
5. Point allocation logic

The SQL should include:
1. Queries for extracting relevant data
2. Calculations for goal progress
3. Aggregations for regional/team goals
4. Filters for eligibility criteria`;
  }

  private buildGraphicsPrompt(description: string): string {
    return `Create a professional graphic description for a loyalty campaign offer:

Offer Description: ${description}

Please provide a detailed description for generating a professional graphic that would be suitable for a loyalty campaign offer. Include:
1. Visual style and color scheme
2. Layout and composition
3. Text elements and typography
4. Imagery and icons
5. Professional branding elements

The graphic should be appealing and motivate users to participate in the campaign.`;
  }

  private parseSchemaAnalysis(text: string): SchemaAnalysis {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      
      return {
        tables: data.tables || [],
        relationships: data.relationships || [],
        understandingScore: data.understandingScore || 0.5,
        feedback: data.feedback || 'No feedback provided',
        requiredFields: data.requiredFields || []
      };
    } catch (error) {
      logger.error('Failed to parse schema analysis:', error);
      throw new Error('Failed to parse schema analysis response');
    }
  }

  private parseGeneratedRules(text: string): GeneratedRules {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      
      return {
        goals: data.goals || [],
        eligibility: data.eligibility || [],
        prizes: data.prizes || [],
        generatedCode: data.generatedCode || '',
        validationErrors: data.validationErrors || []
      };
    } catch (error) {
      logger.error('Failed to parse generated rules:', error);
      throw new Error('Failed to parse rules response');
    }
  }

  private parseGeneratedCode(text: string): GeneratedCode {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      
      return {
        typescript: data.typescript || '',
        sql: data.sql || '',
        validation: data.validation || '',
        documentation: data.documentation || ''
      };
    } catch (error) {
      logger.error('Failed to parse generated code:', error);
      throw new Error('Failed to parse code response');
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

export const aiService = new AIService(); 