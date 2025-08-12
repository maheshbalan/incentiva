import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT'
}

export enum OAuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft'
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RuleType {
  GOAL = 'GOAL',
  ELIGIBILITY = 'ELIGIBILITY',
  PRIZE = 'PRIZE'
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum GoalType {
  INDIVIDUAL = 'INDIVIDUAL',
  OVERALL = 'OVERALL',
  REGIONAL = 'REGIONAL'
}

export enum AIProvider {
  ANTHROPIC = 'ANTHROPIC',
  OPENAI = 'OPENAI',
  GOOGLE = 'GOOGLE',
  AZURE = 'AZURE'
}

export enum TransactionProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRY = 'RETRY'
}

export enum RulesEngineJobType {
  INITIAL_DATA_LOAD = 'INITIAL_DATA_LOAD',
  INCREMENTAL_UPDATE = 'INCREMENTAL_UPDATE',
  RULES_PROCESSING = 'RULES_PROCESSING',
  TLP_SYNC = 'TLP_SYNC'
}

export enum RulesEngineJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SCHEDULED = 'SCHEDULED'
}

export enum RulesEngineExecutionType {
  DATA_EXTRACTION = 'DATA_EXTRACTION',
  RULES_APPLICATION = 'RULES_APPLICATION',
  TLP_INTEGRATION = 'TLP_INTEGRATION',
  FULL_PROCESSING = 'FULL_PROCESSING'
}

export enum RulesEngineExecutionStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  oauthProvider?: OAuthProvider
  oauthId?: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: CampaignStatus
  
  // Campaign Goals
  individualGoal?: number
  individualGoalCurrency: string
  overallGoal?: number
  overallGoalCurrency: string
  
  // TLP Configuration
  tlpApiKey?: string
  tlpEndpointUrl?: string
  backendConnectionConfig?: any
  
  // Campaign Rules
  eligibilityCriteria?: string
  
  createdById: string
  createdAt: string
  updatedAt: string
  
  // Relations
  createdBy?: User
  rules?: CampaignRule[]
  executions?: CampaignExecution[]
  schemas?: CampaignSchema[]
  userCampaigns?: UserCampaign[]
  redemptions?: CampaignRedemption[]
  goals?: CampaignGoal[]
}

export interface CampaignGoal {
  id: string
  campaignId: string
  goalType: GoalType
  targetValue: number
  currency: string
  description?: string
  isAchieved: boolean
  achievedAt?: string
  createdAt: string
}

export interface CampaignRule {
  id: string
  campaignId: string
  ruleType: RuleType
  ruleDefinition: any
  generatedCode?: string
  schemaUnderstandingScore?: number
  schemaFeedback?: string
  createdAt: string
}

export interface CampaignExecution {
  id: string
  campaignId: string
  salespersonId?: string
  regionId?: string
  pointsAllocated: number
  goalAchieved: boolean
  executionDate: string
  
  // Execution details
  transactionAmount?: number
  transactionCurrency?: string
  transactionType?: string
}

export interface CampaignSchema {
  id: string
  campaignId: string
  schemaDefinition: any
  understandingScore?: number
  feedbackText?: string
  uploadedAt: string
}

export interface UserCampaign {
  id: string
  userId: string
  campaignId: string
  participantId?: string
  currentPoints: number
  goalProgress: number
  isEnrolled: boolean
  enrolledAt: string
  createdAt: string
  updatedAt: string
  
  // Relations
  user?: User
  campaign?: Campaign
}

export interface CampaignRedemption {
  id: string
  campaignId: string
  userId: string
  offerId: string
  offerName?: string
  offerDescription?: string
  pointsRedeemed: number
  redemptionDate: string
  status: RedemptionStatus
  
  // Redemption details
  tlpTransactionId?: string
}

// ============================================================================
// SYSTEM & CONFIGURATION
// ============================================================================

export interface SystemConfiguration {
  id: string
  key: string
  value: string
  description?: string
  updatedAt: string
  updatedBy?: string
}

export interface AIConfiguration {
  id: string
  provider: AIProvider
  modelName: string
  apiKey: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// TLP INTEGRATION
// ============================================================================

export interface TLPPointType {
  id?: string
  name: string
  description: string
  rank: number
  enabled: boolean
  options: {
    showZeroPointBalance: boolean
  }
}

export interface TLPOffer {
  id?: string
  name: string
  description: string
  // For redemption offers
  pointCost: number
  // For accrual offers
  points?: number
  imageUrl?: string
  isActive: boolean
  redemptionLimit?: number
  currentRedemptions: number
  offerType?: 'accrual' | 'redemption'
  offerSubtype?: 'dynamic' | 'product' | 'service'
  pointType?: string
  minimumSpend?: number
  enabled?: boolean
  online?: boolean
  location?: boolean
}

export interface TLPPointBalance {
  userId: string
  campaignId: string
  currentPoints: number
  totalEarned: number
  totalRedeemed: number
  lastUpdated: string
}

export interface TLPTransaction {
  id?: string
  userId?: string
  campaignId?: string
  transactionType: 'ACCRUAL' | 'REDEMPTION'
  points: number
  description: string
  transactionDate?: string
  referenceId?: string
  memberId?: string
  pointType?: string
  metadata?: Record<string, any>
}

// ============================================================================
// RULES ENGINE INTERFACES
// ============================================================================

export interface CampaignTransaction {
  id: string
  campaignId: string
  externalId?: string
  externalType?: string
  
  // Transaction data (JSON structure from customer system)
  transactionData: any
  processedData?: any
  
  // Rules engine processing
  rulesApplied: boolean
  pointsAllocated: number
  processingStatus: TransactionProcessingStatus
  
  // TLP integration
  tlpAccrualPayload?: any
  tlpTransactionId?: string
  tlpResponse?: any
  
  // Processing metadata
  processedAt?: string
  errorMessage?: string
  retryCount: number
  maxRetries: number
  
  createdAt: string
  updatedAt: string
}

export interface RulesEngineJob {
  id: string
  campaignId: string
  jobType: RulesEngineJobType
  status: RulesEngineJobStatus
  
  // Job configuration
  schedule?: string
  isRecurring: boolean
  lastRunAt?: string
  nextRunAt?: string
  
  // Data source configuration
  dataSourceConfig: any
  
  // Processing configuration
  batchSize: number
  maxConcurrency: number
  
  // Execution tracking
  totalRecords: number
  processedRecords: number
  failedRecords: number
  
  // Job metadata
  startedAt?: string
  completedAt?: string
  errorMessage?: string
  
  createdAt: string
  updatedAt: string
}

export interface RulesEngineExecution {
  id: string
  jobId: string
  campaignId: string
  
  // Execution details
  executionType: RulesEngineExecutionType
  status: RulesEngineExecutionStatus
  
  // Data processing
  recordsProcessed: number
  recordsSucceeded: number
  recordsFailed: number
  
  // Performance metrics
  startTime: string
  endTime?: string
  durationMs?: number
  
  // Error handling
  errorMessage?: string
  stackTrace?: string
  
  // Logs and metadata
  executionLog?: any
  
  createdAt: string
  updatedAt: string
}

// ============================================================================
// RULES ENGINE DATA STRUCTURES
// ============================================================================

export interface CustomerDatabaseSchema {
  tables: TableInfo[]
  relationships: RelationshipInfo[]
  understandingScore: number
  feedback: string
}

export interface TableInfo {
  name: string
  description?: string
  fields: FieldInfo[]
  primaryKey: string
  indexes: string[]
  estimatedRowCount: number
}

export interface FieldInfo {
  name: string
  type: string
  nullable: boolean
  description?: string
  sampleValues?: any[]
  isForeignKey: boolean
  referencedTable?: string
  referencedField?: string
}

export interface RelationshipInfo {
  fromTable: string
  fromField: string
  toTable: string
  toField: string
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many'
  description?: string
}

export interface GeneratedRules {
  campaignId: string
  schema: CustomerDatabaseSchema
  rules: {
    goalRules: GoalRule[]
    eligibilityRules: EligibilityRule[]
    prizeRules: PrizeRule[]
  }
  generatedCode: GeneratedCode
  understandingScore: number
  feedback: string
}

export interface GoalRule {
  type: 'INDIVIDUAL' | 'OVERALL' | 'REGIONAL'
  targetValue: number
  currency: string
  description: string
  calculationLogic: string
  applicableTables: string[]
  applicableFields: string[]
}

export interface EligibilityRule {
  description: string
  conditions: string[]
  applicableTables: string[]
  applicableFields: string[]
  exclusionCriteria: string[]
}

export interface PrizeRule {
  description: string
  pointValue: number
  conditions: string[]
  applicableTables: string[]
  applicableFields: string[]
}

export interface GeneratedCode {
  dataExtractionQuery?: string
  rulesApplicationLogic?: string
  tlpIntegrationCode?: string
  microserviceCode?: string
  testCode?: string
}

// ============================================================================
// AI SERVICE
// ============================================================================

export interface SchemaAnalysis {
  tables: TableInfo[]
  relationships: RelationshipInfo[]
  understandingScore: number
  feedback: string
  requiredFields: string[]
}







export interface GeneratedCode {
  typescript?: string
  sql?: string
  validation?: string
  documentation?: string
}

// ============================================================================
// CURRENCY SUPPORT
// ============================================================================

export interface Currency {
  code: string
  name: string
  symbol: string
  decimalPlaces: number
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 }
]

// ============================================================================
// FORM & CONFIGURATION TYPES
// ============================================================================

export interface CampaignFormData {
  name: string
  description?: string
  startDate: string
  endDate: string
  individualGoal?: number
  individualGoalCurrency: string
  overallGoal?: number
  overallGoalCurrency: string
  eligibilityCriteria?: string
  tlpApiKey?: string
  tlpEndpointUrl?: string
  
  // Points allocation and rewards
  pointsPerDollar?: number
  pointValue?: number
  pointValueCurrency?: string
  individualGoalBonus?: number
  overallGoalBonus?: number
  rewards?: string
  
  // Database connection for campaign execution
  databaseType?: string
  databaseHost?: string
  databasePort?: number
  databaseName?: string
  databaseUsername?: string
  databasePassword?: string
}

export interface AIModelConfig {
  provider: AIProvider
  modelName: string
  apiKey: string
  isActive: boolean
}

export interface ParticipantAssignment {
  userId: string
  campaignId: string
  isEnrolled: boolean
}

export interface DatabaseConnection {
  host: string
  port: number
  database: string
  username: string
  password: string
  schema?: string
  ssl?: boolean
}

export interface CampaignExecutionResult {
  success: boolean
  message: string
  pointsAllocated: number
  participantsUpdated: number
  goalsAchieved: number
  errors?: string[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// REAL-TIME TYPES
// ============================================================================

export interface ProgressUpdate {
  campaignId: string
  userId: string
  currentPoints: number
  goalProgress: number
  recentTransactions: TLPTransaction[]
  timestamp: Date
}

export interface WebSocketMessage {
  type: 'progress-update' | 'campaign-status-change' | 'point-allocation' | 'redemption-complete'
  payload: any
  timestamp: Date
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(UserRole),
  oauthProvider: z.nativeEnum(OAuthProvider).optional(),
  oauthId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  individualGoal: z.number().positive().optional(),
  individualGoalCurrency: z.string().default('MXN'),
  overallGoal: z.number().positive().optional(),
  overallGoalCurrency: z.string().default('MXN'),
  eligibilityCriteria: z.string().optional(),
  tlpApiKey: z.string().optional(),
  tlpEndpointUrl: z.string().url().optional(),
  backendConnectionConfig: z.record(z.any()).optional(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const CampaignFormSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  individualGoal: z.number().positive().optional(),
  individualGoalCurrency: z.string().default('MXN'),
  overallGoal: z.number().positive().optional(),
  overallGoalCurrency: z.string().default('MXN'),
  eligibilityCriteria: z.string().optional(),
  tlpApiKey: z.string().optional(),
  tlpEndpointUrl: z.string().url().optional()
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserFromSchema = z.infer<typeof UserSchema>
export type CampaignFromSchema = z.infer<typeof CampaignSchema>
export type CampaignFormDataFromSchema = z.infer<typeof CampaignFormSchema> 