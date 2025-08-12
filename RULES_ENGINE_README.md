# Rules Engine - Complete Transaction Processing System

## 🎯 Overview

The Incentiva Rules Engine is a **complete transaction processing system** that transforms natural language business rules into automated workflows. It automatically generates database schemas, executable JSON rules, and TLP API integrations to process customer transactions and allocate loyalty points in real-time.

## 🏗️ Container Structure

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

## 🚀 Complete Transaction Processing Flow

### **Phase 1: Natural Language → Executable System**
1. **Input**: Admin writes rules like "Premium line products get 1 point per 1000 MXN"
2. **AI Analysis**: Anthropic analyzes rules and customer database schema
3. **Output**: Complete transaction processing system with:
   - Transaction table schema
   - Executable JSON rules
   - Data extraction queries
   - TLP integration code

### **Phase 2: Data Extraction & Transformation**
1. **One-Time Load**: Extract historical data from customer database
2. **Data Transformation**: Apply schema mappings and field transformations
3. **Transaction Creation**: Populate transaction table with JSON data
4. **Incremental Scheduling**: Set up recurring data extraction

### **Phase 3: Runtime Rule Execution**
1. **Rule Parsing**: Parse JSON rules at runtime
2. **Transaction Processing**: Evaluate each transaction against rules
3. **Point Calculation**: Calculate loyalty points based on rules
4. **API Generation**: Create TLP API calls for point allocation

### **Phase 4: TLP Integration & Execution**
1. **Point Allocation**: Execute TLP API calls to allocate points
2. **Member Creation**: Create TLP members for campaign participants
3. **Offer Generation**: Create accrual and redemption offers
4. **Status Tracking**: Monitor API call success/failure

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

## 🗄️ Database Schema

### **Transaction Table**
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

## 🔌 API Endpoints

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

### **Environment Variables**
```bash
# AI Service
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# TLP Integration
TLP_API_KEY=your_tlp_api_key
TLP_ENDPOINT_URL=https://exata-customer.pravici.io
TLP_API_DOCUMENTATION_URL=your_tlp_docs_url

# Performance
BATCH_SIZE=1000
MAX_CONCURRENCY=5
PROCESSING_TIMEOUT=30000
```

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
CMD ["npm", "start"]
```

### **Docker Compose**
```yaml
rules-engine:
  build:
    context: .
    dockerfile: rules-engine/Dockerfile
  container_name: incentiva-rules-engine
  restart: unless-stopped
  environment:
    NODE_ENV: production
    DATABASE_URL: postgresql://incentiva:incentiva123@postgres:5432/incentiva_dev
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    TLP_API_KEY: ${TLP_API_KEY}
    TLP_ENDPOINT_URL: ${TLP_ENDPOINT_URL}
  ports:
    - "3002:3002"
  depends_on:
    postgres:
      condition: service_healthy
  volumes:
    - ./logs:/app/logs
    - ./rules:/app/rules
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

---

**🎉 The Rules Engine is now a complete, production-ready transaction processing system!**

From natural language rules to automated TLP integration, it handles the entire lifecycle of loyalty campaign execution with AI-powered intelligence and real-time processing capabilities.
