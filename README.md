# Incentiva - Complete Campaign Execution System

## 🎯 Overview

Incentiva is a **complete loyalty campaign management and execution system** that transforms natural language business rules into automated transaction processing workflows. The system automatically generates database schemas, executable JSON rules, and TLP API integrations to process customer transactions and allocate loyalty points in real-time.

## 🚀 Key Features

### **Campaign Management**
- **Natural Language Rule Definition**: Write business rules in plain English
- **AI-Powered Schema Generation**: Automatically creates transaction database schemas
- **JSON Rule Generation**: Converts natural language to executable runtime rules
- **Total Points Minted**: Configure campaign point allocation budgets
- **Campaign Lifecycle Management**: Draft → Approved → Active → Completed

### **AI Integration**
- **Anthropic Claude 3.5 Sonnet**: Advanced AI for rule and schema generation
- **TLP Documentation Integration**: AI uses Pravici TLP API documentation for accurate integration
- **Automatic Code Generation**: Generates SQL, TypeScript, and validation code
- **Schema Analysis**: Analyzes customer database structures for optimal data extraction

### **Transaction Processing (NEW!)**
- **JSON Schema Generation**: AI creates complete transaction table schemas
- **Runtime Rule Engine**: Parses and executes JSON rules at runtime
- **Data Extraction**: One-time and incremental loads from customer databases
- **Automatic Point Calculation**: Applies rules to calculate loyalty points
- **TLP API Generation**: Creates all necessary API calls for point allocation

### **TLP Integration**
- **Point Type Creation**: Automatically creates TLP point types
- **Point Issuance**: Mints campaign points based on rules
- **Accrual Offers**: Generates individual and overall bonus offers
- **Redemption Offers**: Creates redemption options based on rewards
- **Member Management**: Automatically creates TLP members for participants

## 🏗️ System Architecture

```
                    Incentiva System
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐  ┌─────────────────┐ │
│  │        Backend + Frontend       │  │  Rules Engine   │ │
│  │         (Port 3001)             │  │   (Port 3002)   │ │
│  │  ┌─────────────┐ ┌─────────────┐ │  └─────────────────┘ │
│  │  │  Backend    │ │  Frontend   │ │                    │
│  │  │   API       │ │   (React)   │ │                    │
│  │  └─────────────┘ └─────────────┘ │                    │
│  └─────────────────────────────────┘ │                    │
│           │                    │       │                    │
│           └────────────────────┼───────┘                    │
│                                │                            │
│                    ┌─────────────────┐                      │
│                    │   PostgreSQL    │                      │
│                    │   (Port 5432)   │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Complete Transaction Processing Flow

### **Phase 1: Campaign Setup**
1. **Natural Language Input**: Admin writes rules like "Premium line products get 1 point per 1000 MXN"
2. **AI Analysis**: Anthropic analyzes rules and customer database schema
3. **Schema Generation**: Creates transaction table structure with field mappings
4. **Rule Generation**: Converts natural language to executable JSON rules
5. **Query Generation**: Creates SQL for data extraction (one-time + incremental)

### **Phase 2: Data Extraction**
1. **One-Time Load**: Extracts historical data from customer database
2. **Data Transformation**: Applies schema mappings and transformations
3. **Transaction Creation**: Populates transaction table with JSON data
4. **Incremental Scheduling**: Sets up recurring data extraction

### **Phase 3: Transaction Processing**
1. **Rule Evaluation**: Runtime engine processes each transaction
2. **Eligibility Check**: Applies eligibility rules first
3. **Point Calculation**: Calculates points based on accrual rules
4. **Bonus Application**: Applies individual and overall bonus rules
5. **API Generation**: Creates TLP API calls for point allocation

### **Phase 4: TLP Integration**
1. **Point Allocation**: Executes TLP API calls to allocate points
2. **Member Creation**: Creates TLP members for campaign participants
3. **Offer Generation**: Creates accrual and redemption offers
4. **Status Tracking**: Monitors API call success/failure

## 🎨 Campaign Creation Wizard

### **Step 1: Basic Information**
- Campaign name, description, dates
- Target audience and participant selection

### **Step 2: Goals & Rewards**
- Individual and overall campaign goals
- **Campaign Currency** (single currency for entire campaign)
- **Amount to sell to get one point** (simplified points allocation)
- Individual and overall goal bonuses
- Total Points Minted for Campaign
- Rewards & Redemption Options

## 🔐 Authentication & Security (Latest Updates)

### **JWT Token Management**
- **Centralized Authentication**: All API calls use authenticated `axios` instance
- **Automatic Token Handling**: JWT tokens automatically included in all requests
- **Token Expiration**: Automatic redirect to login on 401 errors
- **Secure API Access**: All campaign endpoints properly protected

### **Frontend Authentication Service**
- **Unified API Client**: Single `authService.api` instance for all authenticated calls
- **Request Interceptors**: Automatic token injection and error handling
- **Response Interceptors**: Automatic logout on authentication failures
- **Consistent Error Handling**: Standardized error messages and user feedback

### **Recent Fixes Applied**
- **Campaign Edit Authentication**: Fixed 401 errors when editing campaigns
- **Campaigns List**: Resolved authentication issues in campaigns listing
- **Campaign Execution**: Fixed API authentication in execution workflow
- **Form Field Population**: All campaign fields now properly display with authentication
- **Database Schema**: Added missing fields for complete campaign data display

### **Step 3: Eligibility & Rules**
- Natural language rule definition
- AI-powered rule analysis and validation
- Database connection configuration

### **Step 4: TLP Configuration**
- API keys and endpoint URLs
- **Automatically prefilled from environment**
- TLP API documentation URL integration

### **Step 5: Database Connection**
- Database type, host, port, name
- Username and password for customer database access

### **Step 6: Review & Create**
- Complete campaign summary
- AI-generated rule preview
- Campaign creation confirmation

## 🎛️ Campaign Management Interface

### **Campaigns Screen**
- **Lists all campaigns** with status and details
- **View Campaign**: See complete campaign information
- **Edit Campaign**: Modify campaign settings
- **Execute Campaign**: Launch campaign execution workflow
- **Manage Participants**: Assign and manage campaign participants
- **View Transactions**: Monitor transaction processing

### **Campaign Execution Workflow**
1. **TLP Artifacts Creation**: Point types, point issues, accruals, redemptions
2. **Database Schema Analysis**: Customer database structure analysis
3. **Transaction Schema Generation**: JSON schema for transaction table
4. **Data Extraction Setup**: One-time and incremental load configuration
5. **Rule Editor**: Review and approve AI-generated rules
6. **SQL Artifacts**: Data load queries and scheduling
7. **Execution Confirmation**: Campaign activation

### **Transaction Table**
- **JSON Transaction Data**: Complete transaction information
- **Processing Status**: Pending, Processing, Completed, Failed
- **Actions Field**: Shows rule evaluation results and TLP API calls
- **Action Response**: TLP API call responses and status

## 🔧 Technical Implementation

### **Core Services**

#### **1. Enhanced AI Service (`aiService.ts`)**
```typescript
// Generates complete transaction processing system
const result = await aiService.generateTransactionSchemaAndRules(
  campaignId,
  naturalLanguageRules,
  databaseSchema
);

// Returns:
// - transactionSchema: Complete table structure
// - ruleSet: Executable JSON rules
// - dataExtractionQueries: SQL for data extraction
```

**Key Capabilities:**
- **Schema Generation**: Creates transaction table schemas with field mappings
- **Rule Generation**: Converts natural language to executable JSON rules
- **Query Generation**: Creates SQL for one-time and incremental data loads
- **TLP Integration**: Generates TLP API integration code

#### **2. Data Extraction Service (`dataExtractionService.ts`)**
```typescript
// One-time data load
await dataExtractionService.executeOneTimeLoad(
  campaignId,
  extractionQueries,
  customerDbConnection,
  transactionSchema
);

// Incremental data load
await dataExtractionService.executeIncrementalLoad(
  campaignId,
  extractionQueries,
  customerDbConnection,
  transactionSchema
);
```

**Key Capabilities:**
- **Database Connection**: Connects to customer databases (PostgreSQL, MySQL, etc.)
- **Query Execution**: Executes AI-generated SQL queries
- **Data Transformation**: Applies schema mappings and transformations
- **Transaction Creation**: Populates transaction table with JSON data
- **Scheduling**: Sets up recurring incremental data loads

#### **3. Runtime Rule Processing Service (`rulesProcessingService.ts`)**
```typescript
// Process transactions with JSON rules
const rulesProcessor = new RulesProcessingService(ruleSet);
const result = await rulesProcessor.processTransaction(transaction);

// Result includes:
// - Points allocated
// - Rules evaluated
// - Accrual API calls generated
```

**Key Capabilities:**
- **Rule Parsing**: Parses JSON rules at runtime
- **Condition Evaluation**: Evaluates complex rule conditions
- **Point Calculation**: Calculates points based on rule calculations
- **API Generation**: Generates TLP API calls for point allocation

### **Data Flow Architecture**

```
Natural Language Rules
         ↓
   AI Service (Anthropic)
         ↓
┌─────────────────────────────────┐
│ Transaction Schema + JSON Rules │
│ + Data Extraction Queries      │
└─────────────────────────────────┘
         ↓
   Data Extraction Service
         ↓
┌─────────────────────────────────┐
│ Transaction Table (JSON Data)  │
└─────────────────────────────────┘
         ↓
   Runtime Rule Processing
         ↓
┌─────────────────────────────────┐
│ TLP API Calls + Point Results  │
└─────────────────────────────────┘
         ↓
   TLP Integration Service
         ↓
   Point Allocation Complete
```

## 📊 Generated Artifacts

### **1. Transaction JSON Schema**
```json
{
  "tableName": "campaign_transactions",
  "description": "Transaction table for campaign processing",
  "fields": [
    {
      "name": "orderId",
      "type": "string",
      "required": true,
      "description": "Customer order identifier",
      "sourceField": "id",
      "transformation": null,
      "validation": "non-empty string"
    },
    {
      "name": "productLine",
      "type": "string", 
      "required": true,
      "description": "Product line category",
      "sourceField": "product_category",
      "transformation": "toUpperCase",
      "validation": "one of: Premium, Standard, Economy"
    },
    {
      "name": "orderAmount",
      "type": "decimal",
      "required": true,
      "description": "Order total amount",
      "sourceField": "total_amount",
      "transformation": "parseFloat",
      "validation": "positive number"
    }
  ],
  "indexes": ["idx_campaign_id", "idx_external_id", "idx_status"],
  "constraints": ["fk_campaign_id", "chk_positive_amount"]
}
```

### **2. Executable JSON Rules**
```json
{
  "campaignId": "campaign_123",
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
}
```

### **3. Data Extraction Queries**
```sql
-- One-time load
SELECT 
  o.id as orderId,
  o.customer_id as customerId,
  o.total_amount as orderAmount,
  oi.product_category as productLine,
  o.created_at as orderDate,
  o.status as orderStatus
FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31' 
  AND oi.product_category = 'Premium'

-- Incremental load
SELECT 
  o.id as orderId,
  o.customer_id as customerId,
  o.total_amount as orderAmount,
  oi.product_category as productLine,
  o.created_at as orderDate,
  o.status as orderStatus
FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.created_at > (
  SELECT MAX(orderDate) 
  FROM campaign_transactions 
  WHERE campaignId = :campaignId
) 
  AND oi.product_category = 'Premium'
```

## 🔄 Runtime Processing

### **Transaction Processing Flow**

#### **1. Rule Evaluation**
```typescript
// Process each transaction
for (const transaction of transactions) {
  // Evaluate eligibility rules first
  const eligibilityResults = await evaluateEligibilityRules(transaction);
  
  if (!eligibilityResults.every(result => result.passed)) {
    // Transaction failed eligibility - skip processing
    continue;
  }
  
  // Process accrual rules
  const accrualResults = await evaluateAccrualRules(transaction);
  
  // Calculate total points
  let totalPoints = 0;
  for (const result of accrualResults) {
    if (result.passed) {
      totalPoints += result.pointsAllocated;
    }
  }
  
  // Process bonus rules
  const bonusResults = await evaluateBonusRules(transaction);
  for (const result of bonusResults) {
    if (result.passed) {
      totalPoints += result.pointsAllocated;
    }
  }
}
```

#### **2. Condition Evaluation**
```typescript
// Field comparison
if (condition.type === 'fieldComparison') {
  const fieldValue = getTransactionFieldValue(transaction, condition.field);
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'greaterThan':
      return Number(fieldValue) > Number(condition.value);
    case 'contains':
      return String(fieldValue).includes(String(condition.value));
    // ... more operators
  }
}

// Aggregate conditions
if (condition.type === 'aggregate') {
  const aggregateValue = await calculateAggregate(condition);
  return evaluateComparison(aggregateValue, condition.operator, condition.value);
}

// Logical conditions
if (condition.type === 'logical') {
  const subResults = condition.subConditions.map(sub => 
    evaluateRuleCondition(sub, transaction)
  );
  
  switch (condition.logicalOperator) {
    case 'AND':
      return subResults.every(result => result);
    case 'OR':
      return subResults.some(result => result);
  }
}
```

#### **3. Point Calculation**
```typescript
// Mathematical calculation
if (calculation.type === 'mathematical') {
  let totalValue = 0;
  for (const field of calculation.fields) {
    const fieldValue = getTransactionFieldValue(transaction, field);
    totalValue += Number(fieldValue) || 0;
  }
  
  let result = totalValue * calculation.multiplier;
  
  // Apply rounding
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
  
  return Math.max(0, result);
}

// Fixed points
if (calculation.type === 'fixed') {
  return calculation.points || 0;
}

// Percentage calculation
if (calculation.type === 'percentage') {
  let totalValue = 0;
  for (const field of calculation.fields) {
    const fieldValue = getTransactionFieldValue(transaction, field);
    totalValue += Number(fieldValue) || 0;
  }
  
  return Math.max(0, (totalValue * calculation.percentage) / 100);
}
```

### **4. TLP API Generation**
```typescript
// Generate accrual API call
const apiCall = {
  ruleId: result.ruleId,
  ruleName: result.ruleDetails.name,
  points: result.pointsAllocated,
  apiEndpoint: '/api/tlp/accruals',
  requestBody: {
    campaignId: transaction.campaignId,
    userId: transaction.userId,
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
```

## 🔌 API Endpoints

### **Main Application API (Port 3001)**

#### **Campaigns**
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id/status` - Update campaign status

#### **TLP Integration**
- `POST /api/tlp/point-types` - Create TLP point type
- `POST /api/tlp/point-issues` - Mint campaign points
- `POST /api/tlp/accruals` - Create accrual offers
- `POST /api/tlp/redemptions` - Create redemption offers
- `POST /api/tlp/members` - Create TLP members

### **Rules Engine API (Port 3002)**

#### **Health & Monitoring**
```http
GET /health
GET /health/detailed
```

#### **AI-Powered Generation**
```http
POST /api/ai/generate-transaction-schema
POST /api/ai/generate-rules
POST /api/ai/analyze-database-schema
```

#### **Data Extraction**
```http
POST /api/extraction/one-time-load
POST /api/extraction/incremental-load
POST /api/extraction/schedule-loads
GET /api/extraction/status/:campaignId
```

#### **Rule Processing**
```http
POST /api/rules/process-transaction
POST /api/rules/process-batch
GET /api/rules/campaign/:campaignId
GET /api/rules/validate/:ruleSetId
```

#### **Job Management**
```http
POST /api/jobs
GET /api/jobs/:jobId
POST /api/jobs/:jobId/start
POST /api/jobs/:jobId/stop
DELETE /api/jobs/:jobId
```

## 🗄️ Database Schema

### **Core Tables**
- `campaigns` - Campaign definitions and configuration
- `users` - System users and participants
- `campaign_transactions` - **NEW!** Transaction data with JSON schema
- `campaign_rules` - **NEW!** Generated JSON rules
- `campaign_schemas` - **NEW!** Transaction table schemas
- `tlp_artifacts` - **NEW!** TLP API call results and status

### **Transaction Table Structure**
```sql
CREATE TABLE campaign_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  external_id VARCHAR(255) NOT NULL,
  external_type VARCHAR(100) NOT NULL,
  transaction_data JSONB NOT NULL, -- Flexible JSON schema
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  processing_priority INTEGER DEFAULT 1,
  points_allocated INTEGER DEFAULT 0,
  rules_evaluated JSONB, -- Rule evaluation results
  tlp_api_calls JSONB, -- Generated TLP API calls
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaign_transactions_campaign_id ON campaign_transactions(campaign_id);
CREATE INDEX idx_campaign_transactions_external_id ON campaign_transactions(external_id);
CREATE INDEX idx_campaign_transactions_status ON campaign_transactions(status);
CREATE INDEX idx_campaign_transactions_priority ON campaign_transactions(processing_priority);

-- JSONB indexes for querying transaction data
CREATE INDEX idx_campaign_transactions_data_gin ON campaign_transactions USING GIN (transaction_data);
```

### **Rules and Schemas Tables**
```sql
CREATE TABLE campaign_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  rule_set JSONB NOT NULL, -- Complete JSON rule set
  version VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'DRAFT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE campaign_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  transaction_schema JSONB NOT NULL, -- Transaction table schema
  data_extraction_queries JSONB NOT NULL, -- SQL queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Getting Started

### **Prerequisites**
- Docker and Docker Compose
- Node.js 21.7.3+
- PostgreSQL 15+

### **Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://incentiva:incentiva123@localhost:5432/incentiva_dev

# AI Service
ANTHROPIC_API_KEY=your_anthropic_api_key

# TLP Integration
TLP_API_KEY=your_tlp_api_key
TLP_ENDPOINT_URL=https://exata-customer.pravici.io
TLP_API_DOCUMENTATION_URL=your_tlp_docs_url

# JWT
JWT_SECRET=your_jwt_secret
```

### **Quick Start**
```bash
# Clone and setup
git clone <repository>
cd incentiva

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3001
# Backend API: http://localhost:3001/api
# Rules Engine: http://localhost:3002
```

## 📁 Project Structure

```
incentiva/
├── backend/                 # Backend API server
├── frontend/               # React frontend application
├── rules-engine/           # **NEW!** Transaction processing engine
├── shared/                 # Shared types and utilities
├── docker-compose.yml      # Service orchestration
└── README.md              # This file
```

### **Key New Files**
- `rules-engine/src/services/aiService.ts` - **Enhanced AI for schema/rule generation**
- `rules-engine/src/services/dataExtractionService.ts` - **Customer database data extraction**
- `rules-engine/src/services/rulesProcessingService.ts` - **Runtime JSON rule execution**
- `frontend/src/pages/CampaignExecutionPage.tsx` - **Campaign execution workflow**
- `frontend/src/pages/TransactionTablePage.tsx` - **Transaction monitoring**

## 🚀 Performance & Scaling

### **Batch Processing**
- **Configurable Batch Sizes**: Process 100-10,000 transactions per batch
- **Concurrency Control**: Parallel processing with configurable limits
- **Memory Management**: Efficient JSON processing and garbage collection
- **Database Optimization**: Connection pooling and query optimization

### **Real-Time Processing**
- **Streaming**: Process transactions as they arrive
- **Priority Queues**: High-priority transactions processed first
- **Status Updates**: Real-time progress tracking and status updates
- **Error Handling**: Comprehensive retry mechanisms and error recovery

### **Monitoring & Metrics**
- **Performance Metrics**: Processing time, throughput, error rates
- **Health Checks**: Service availability and performance monitoring
- **Logging**: Structured logging with different log levels
- **Alerting**: Automated alerts for failures and performance issues

## 🔧 Configuration

### **Service Configuration**
```typescript
// Rules Engine Configuration
const config = {
  batchSize: process.env.BATCH_SIZE || 1000,
  maxConcurrency: process.env.MAX_CONCURRENCY || 5,
  processingTimeout: process.env.PROCESSING_TIMEOUT || 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  healthCheckInterval: 30000
};
```

## 🧪 Testing & Validation

### **Rule Testing**
```typescript
// Test rules against sample data
const testResult = await rulesProcessor.testRules(
  ruleSet,
  sampleTransactions
);

// Validate rule syntax and logic
const validationResult = await rulesProcessor.validateRules(ruleSet);
```

### **Integration Testing**
```typescript
// Test complete workflow
const workflowResult = await testCompleteWorkflow({
  naturalLanguageRules: "Premium products get 1 point per 1000 MXN",
  sampleDatabase: goodyearDatabase,
  expectedResults: {
    totalPoints: 6300,
    transactionsProcessed: 100,
    tlpApiCalls: 95
  }
});
```

## 🚀 Deployment

### **Docker Configuration**

#### **Main Application (Port 3001)**
```dockerfile
FROM node:21.7.3-alpine

# Install dependencies
RUN apk add --no-cache postgresql-client curl bash

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

WORKDIR /app/shared
RUN npm install

WORKDIR /app/frontend
RUN npm install

WORKDIR /app/backend
RUN npm install

# Copy source code
COPY shared/ /app/shared/
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port and health check
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "run", "dev"]
```

#### **Rules Engine (Port 3002)**
```dockerfile
FROM node:21.7.3-alpine

# Install dependencies
RUN apk add --no-cache postgresql-client curl bash

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY rules-engine/package*.json ./rules-engine/

WORKDIR /app/shared
RUN npm install

WORKDIR /app/rules-engine
RUN npm install

# Copy source code
COPY shared/ /app/shared/
COPY rules-engine/ /app/rules-engine/
COPY backend/prisma/ /app/rules-engine/prisma/

# Build and generate Prisma client
RUN npx tsc -p tsconfig.json
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port and health check
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["npm", "run", "dev"]
```

### **Docker Compose**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: incentiva-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: incentiva_dev
      POSTGRES_USER: incentiva
      POSTGRES_PASSWORD: incentiva123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U incentiva -d incentiva_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: incentiva-app
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://incentiva:incentiva123@postgres:5432/incentiva_dev
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      TLP_API_KEY: ${TLP_API_KEY}
      TLP_ENDPOINT_URL: ${TLP_ENDPOINT_URL}
      TLP_API_DOCUMENTATION_URL: ${TLP_API_DOCUMENTATION_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./logs:/app/backend/logs
    command: sh -c "npx prisma migrate deploy && npm run dev"

  rules-engine:
    build:
      context: .
      dockerfile: rules-engine/Dockerfile
    container_name: incentiva-rules-engine
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://incentiva:incentiva123@postgres:5432/incentiva_dev
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      TLP_API_KEY: ${TLP_API_KEY}
      TLP_ENDPOINT_URL: ${TLP_ENDPOINT_URL}
      TLP_API_DOCUMENTATION_URL: ${TLP_API_DOCUMENTATION_URL}
    ports:
      - "3002:3002"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
      - ./rules:/app/rules

volumes:
  postgres_data:
```

## 🔒 Security

### **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Admin and service roles
- **API Key Management**: Secure storage of external API keys
- **Rate Limiting**: API request throttling and abuse prevention

### **Data Protection**
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **Data Encryption**: Sensitive data encryption at rest and in transit
- **Audit Logging**: Complete audit trail for all operations

## 📊 Monitoring & Observability

### **Logging**
```typescript
// Structured logging with different levels
logger.info('Transaction processing started', {
  campaignId,
  transactionCount,
  batchSize,
  timestamp: new Date().toISOString()
});

logger.error('Rule evaluation failed', {
  transactionId,
  ruleId,
  error: error.message,
  stack: error.stack
});
```

### **Metrics**
- **Processing Metrics**: Transactions per second, success rate, error rate
- **Performance Metrics**: Response time, throughput, resource usage
- **Business Metrics**: Points allocated, campaigns processed, TLP integration success
- **System Metrics**: CPU, memory, disk usage, network I/O

### **Health Checks**
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.json(health);
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const aiHealth = await checkAIHealth();
    const tlpHealth = await checkTLPHealth();
    
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        ai: aiHealth,
        tlp: tlpHealth
      }
    };
    
    res.json(detailedHealth);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## 🗓️ Roadmap

### **✅ Phase 1: Core System (COMPLETED)**
- User authentication and management
- Basic campaign creation and management
- TLP integration foundation

### **✅ Phase 2: AI Integration (COMPLETED)**
- Anthropic AI integration for rule generation
- Natural language processing
- Code and schema generation

### **✅ Phase 3: Campaign Execution System (COMPLETED)**
- **Complete transaction processing workflow**
- **JSON schema and rule generation**
- **Runtime rule execution engine**
- **Data extraction and transformation**
- **TLP artifact creation and management**

### **🔄 Phase 4: Advanced Features (IN PROGRESS)**
- Real-time transaction processing
- Advanced rule conditions and calculations
- Performance optimization and scaling
- Advanced analytics and reporting

### **📋 Phase 5: Enterprise Features (PLANNED)**
- Multi-tenant architecture
- Advanced security and compliance
- Integration with additional loyalty platforms
- Machine learning for rule optimization

## 🔧 System Status

- **✅ Backend API**: Fully functional with enhanced campaign management
- **✅ Frontend**: Complete campaign creation and management interface
- **✅ Rules Engine**: **NEW!** Complete transaction processing system
- **✅ Database**: Enhanced schema with transaction processing support
- **✅ AI Integration**: **Enhanced!** Schema and rule generation
- **✅ TLP Integration**: **Enhanced!** Complete artifact creation workflow

## 🎯 What This Means for You

### **✅ Complete Automation**
- **Natural Language → Executable System**: Write rules in plain English, get a complete processing system
- **Zero Code Required**: No need to write SQL, TypeScript, or API integration code
- **Automatic Schema Generation**: AI creates optimal database schemas for your data
- **Intelligent Rule Processing**: Rules are parsed and executed at runtime

### **✅ Production Ready**
- **Scalable Architecture**: Process thousands of transactions with configurable batch sizes
- **Real-Time Processing**: Live transaction processing with immediate point allocation
- **Comprehensive Monitoring**: Complete visibility into processing status and performance
- **Error Handling**: Robust error handling with retry mechanisms and recovery

### **✅ TLP Integration**
- **Automatic API Generation**: Creates all necessary TLP API calls for point allocation
- **Member Management**: Automatically creates TLP members for campaign participants
- **Offer Generation**: Creates accrual and redemption offers based on campaign rules
- **Status Tracking**: Monitors API call success/failure and provides detailed feedback

## 🚀 Next Steps

1. **Configure Environment**: Set up your Anthropic API key and TLP credentials
2. **Create Campaigns**: Use natural language to define your loyalty campaigns
3. **Execute Campaigns**: Launch the complete execution workflow
4. **Monitor Processing**: Watch real-time transaction processing and point allocation
5. **Scale Up**: Process larger datasets and more complex rule sets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guide in `TROUBLESHOOTING.md`

---

**🎉 Incentiva is now a complete, production-ready loyalty campaign execution system!** 

From natural language rules to automated TLP integration, the system handles the entire lifecycle of loyalty campaigns with AI-powered automation and real-time transaction processing. The Rules Engine provides a complete transaction processing system that transforms natural language business rules into automated workflows, automatically generating database schemas, executable JSON rules, and TLP API integrations. 