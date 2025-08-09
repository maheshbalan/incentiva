import { z } from 'zod';

// User and Authentication Types
export enum UserRole {
  ADMIN = 'ADMIN',
  PARTICIPANT = 'PARTICIPANT'
}

export enum OAuthProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft'
}

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
});

export type User = z.infer<typeof UserSchema>;

// Campaign Types
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

export const CampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
  tlpApiKey: z.string().optional(),
  tlpEndpointUrl: z.string().url().optional(),
  backendConnectionConfig: z.record(z.any()).optional(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const CampaignRuleSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  ruleType: z.nativeEnum(RuleType),
  ruleDefinition: z.record(z.any()),
  generatedCode: z.string().optional(),
  schemaUnderstandingScore: z.number().min(0).max(1).optional(),
  schemaFeedback: z.string().optional(),
  createdAt: z.date()
});

export type CampaignRule = z.infer<typeof CampaignRuleSchema>;

export const CampaignExecutionSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  salespersonId: z.string().optional(),
  regionId: z.string().optional(),
  pointsAllocated: z.number().default(0),
  goalAchieved: z.boolean().default(false),
  executionDate: z.date()
});

export type CampaignExecution = z.infer<typeof CampaignExecutionSchema>;

export const CampaignSchemaSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  schemaDefinition: z.record(z.any()),
  understandingScore: z.number().min(0).max(1).optional(),
  feedbackText: z.string().optional(),
  uploadedAt: z.date()
});

export type CampaignSchema = z.infer<typeof CampaignSchemaSchema>;

// User Campaign Participation
export const UserCampaignSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  participantId: z.string().optional(), // TLP member ID
  currentPoints: z.number().default(0),
  goalProgress: z.number().min(0).max(100).default(0), // Percentage
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserCampaign = z.infer<typeof UserCampaignSchema>;

// Redemption Types
export const CampaignRedemptionSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  userId: z.string().uuid(),
  offerId: z.string(), // TLP offer ID
  pointsRedeemed: z.number(),
  redemptionDate: z.date(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending')
});

export type CampaignRedemption = z.infer<typeof CampaignRedemptionSchema>;

// TLP Integration Types
export interface TLPPointType {
  id?: string;
  name: string;
  description: string;
  rank: number;
  enabled: boolean;
  options: {
    showZeroPointBalance: boolean;
  };
}

export interface TLPOffer {
  id?: string;
  offerType: 'accrual' | 'redemption';
  offerSubtype: 'dynamic' | 'product' | 'service';
  name: string;
  description: string;
  points: number;
  pointType: string;
  minimumSpend?: number;
  enabled: boolean;
  online: boolean;
  location: boolean;
  imageUrl?: string;
}

export interface TLPTransaction {
  id?: string;
  memberId: string;
  pointType: string;
  points: number;
  transactionType: 'accrue' | 'redeem' | 'issue';
  description: string;
  metadata?: Record<string, any>;
}

export interface TLPMember {
  id?: string;
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  metadata?: Record<string, any>;
}

// AI Service Types
export interface SchemaAnalysis {
  tables: TableInfo[];
  relationships: RelationshipInfo[];
  understandingScore: number;
  feedback: string;
  requiredFields: string[];
}

export interface TableInfo {
  name: string;
  fields: FieldInfo[];
  primaryKey: string;
  foreignKeys: ForeignKeyInfo[];
}

export interface FieldInfo {
  name: string;
  type: string;
  nullable: boolean;
  description?: string;
}

export interface RelationshipInfo {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface ForeignKeyInfo {
  field: string;
  referencesTable: string;
  referencesField: string;
}

export interface GeneratedRules {
  goals: GoalRule[];
  eligibility: EligibilityRule[];
  prizes: PrizeRule[];
  generatedCode: string;
  validationErrors: string[];
}

export interface GoalRule {
  type: 'individual' | 'regional' | 'team';
  target: number;
  currency: string;
  description: string;
  calculationLogic: string;
}

export interface EligibilityRule {
  condition: string;
  description: string;
  validationLogic: string;
}

export interface PrizeRule {
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  redemptionCode?: string;
}

export interface GeneratedCode {
  typescript: string;
  sql: string;
  validation: string;
  documentation: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Real-time Types
export interface ProgressUpdate {
  campaignId: string;
  userId: string;
  currentPoints: number;
  goalProgress: number;
  recentTransactions: TLPTransaction[];
  timestamp: Date;
}

export interface WebSocketMessage {
  type: 'progress-update' | 'campaign-status-change' | 'point-allocation' | 'redemption-complete';
  payload: any;
  timestamp: Date;
}

// Form Types (defined by zod schemas below)

// Validation Schemas
export const CampaignFormSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  goals: z.object({
    individual: z.number().positive(),
    regional: z.number().positive(),
    currency: z.string().min(1)
  }),
  eligibility: z.string().min(1, 'Eligibility criteria is required'),
  prizes: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    pointCost: z.number().positive()
  })),
  tlpConfig: z.object({
    apiKey: z.string().min(1),
    endpointUrl: z.string().url()
  }),
  backendConfig: z.object({
    host: z.string().min(1),
    port: z.number().positive(),
    database: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1)
  })
});

export type CampaignFormData = z.infer<typeof CampaignFormSchema>;

// Export all types
export * from './types'; 