# 🚀 Incentiva Rules Engine - AI-Powered Loyalty Campaign Processing

## 📋 Overview

The Incentiva Rules Engine is a sophisticated microservice designed to process loyalty campaign transactions using AI-generated rules and code. It operates as a separate container from the main Incentiva application, providing scalable, high-performance campaign execution capabilities.

## 🏗️ Architecture

### **Container Structure**
```
┌─────────────────────────────────────────────────────────────┐
│                    Incentiva System                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Frontend      │  │    Backend      │  │Rules Engine │ │
│  │   (Port 3000)   │  │   (Port 3001)   │  │(Port 3002)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                    │                    │       │
│           └────────────────────┼────────────────────┘       │
│                                │                            │
│                    ┌─────────────────┐                      │
│                    │   PostgreSQL    │                      │
│                    │   (Port 5432)   │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### **Key Components**

1. **Rules Engine Container** - Dedicated microservice for transaction processing
2. **AI Integration** - Anthropic Claude 3.5 Sonnet for rule generation and code creation
3. **Job Management** - Scheduled and on-demand campaign execution
4. **Transaction Processing** - Batch processing with retry mechanisms
5. **TLP Integration** - Pravici TLP API integration for point allocation

## 🎯 Core Features

### **1. AI-Powered Rule Generation**
- **Natural Language Processing**: Converts English/Portuguese/Spanish campaign descriptions to executable rules
- **Schema Analysis**: Automatically analyzes customer database schemas
- **Code Generation**: Creates TypeScript microservices for campaign execution
- **Multi-Language Support**: Handles multiple languages for international campaigns

### **2. Intelligent Data Processing**
- **Schema Mapping**: Maps campaign rules to customer database structures
- **Data Extraction**: Efficient extraction with pagination and performance optimization
- **Batch Processing**: Configurable batch sizes and concurrency controls
- **Error Handling**: Comprehensive retry mechanisms and error logging

### **3. Campaign Execution Engine**
- **Scheduled Jobs**: Cron-based scheduling for recurring campaigns
- **Real-time Processing**: Immediate execution for urgent campaigns
- **Progress Tracking**: Real-time monitoring of execution progress
- **Performance Metrics**: Detailed analytics and performance insights

### **4. TLP Integration**
- **Point Allocation**: Automated point calculation and allocation
- **Transaction Recording**: Complete audit trail of all TLP operations
- **API Management**: Secure API key management and endpoint configuration
- **Error Recovery**: Automatic retry and recovery for failed TLP operations

## 🔧 Technical Implementation

### **Technology Stack**
- **Runtime**: Node.js 21 with TypeScript
- **Framework**: Express.js with middleware architecture
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Anthropic Claude 3.5 Sonnet API
- **Authentication**: JWT-based authentication with role-based access
- **Logging**: Winston-based structured logging
- **Containerization**: Docker with health checks and monitoring

### **Service Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Rules Engine Service                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Controllers   │  │     Services    │  │  Middleware │ │
│  │                 │  │                 │  │             │ │
│  │ • Rules Engine  │  │ • AI Service    │  │ • Auth      │ │
│  │ • Jobs          │  │ • Job Service   │  │ • Error     │ │
│  │ • Transactions  │  │ • Transaction   │  │ • Logging   │ │
│  │ • Health        │  │ • Data Extract  │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                    │                    │       │
│           └────────────────────┼────────────────────┘       │
│                                │                            │
│                    ┌─────────────────┐                      │
│                    │   Prisma ORM    │                      │
│                    │   PostgreSQL    │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### **Prerequisites**
- Docker and Docker Compose
- Node.js 21+ (for local development)
- PostgreSQL database
- Anthropic API key

### **1. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure environment variables
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TLP_API_KEY=your_tlp_api_key_here
TLP_ENDPOINT_URL=https://exata-customer.pravici.io
JWT_SECRET=your_jwt_secret_here
```

### **2. Build and Run**
```bash
# Build all containers
docker-compose up --build -d

# Check container status
docker-compose ps

# View logs
docker-compose logs rules-engine -f
```

### **3. Health Check**
```bash
# Check rules engine health
curl http://localhost:3002/health

# Detailed health information
curl http://localhost:3002/health/detailed
```

## 📊 API Endpoints

### **Rules Engine API**
```bash
# Generate campaign rules
POST /api/rules-engine/generate-rules
{
  "campaignId": "campaign_id",
  "naturalLanguageRules": "Campaign description in natural language",
  "databaseSchema": "optional_schema_analysis"
}

# Analyze database schema
POST /api/rules-engine/analyze-schema
{
  "campaignId": "campaign_id",
  "databaseConnection": "connection_details",
  "sampleQueries": ["query1", "query2"]
}

# Generate microservice code
POST /api/rules-engine/generate-code
{
  "campaignId": "campaign_id",
  "rulesId": "rules_id",
  "schemaId": "schema_id"
}
```

### **Job Management API**
```bash
# Create a new job
POST /api/jobs
{
  "campaignId": "campaign_id",
  "jobType": "INITIAL_DATA_LOAD",
  "schedule": "0 0 * * *",
  "isRecurring": true,
  "dataSourceConfig": "database_connection_config",
  "batchSize": 1000,
  "maxConcurrency": 5
}

# Start job execution
POST /api/jobs/{jobId}/start

# Stop job execution
POST /api/jobs/{jobId}/stop
```

### **Transaction Management API**
```bash
# Get campaign transactions
GET /api/transactions/campaign/{campaignId}?limit=100&offset=0&status=COMPLETED

# Retry failed transaction
POST /api/transactions/{transactionId}/retry

# Get transaction statistics
GET /api/transactions/campaign/{campaignId}/stats
```

## 🎯 Campaign Workflow

### **1. Campaign Creation**
```
User creates campaign → Frontend sends to Backend → Backend stores campaign
```

### **2. Rule Generation**
```
Admin describes rules → AI analyzes → Generates structured rules → Stores in database
```

### **3. Schema Analysis**
```
Connect to customer DB → AI analyzes schema → Maps to campaign rules → Stores analysis
```

### **4. Code Generation**
```
AI generates → Microservice code → TLP integration → Test code → Stores generated code
```

### **5. Campaign Execution**
```
Create execution job → Extract data → Apply rules → Allocate points → TLP integration
```

## 🔍 AI Integration Details

### **Anthropic Claude 3.5 Sonnet**
- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 4000 per request
- **Capabilities**: Complex reasoning, code generation, schema analysis
- **Multi-language**: English, Portuguese, Spanish support

### **Prompt Engineering**
- **Structured Output**: JSON-only responses for consistency
- **Context Awareness**: Includes schema and rule context
- **Error Handling**: Comprehensive error messages and feedback
- **Validation**: Built-in response validation and parsing

### **Generated Artifacts**
- **Campaign Rules**: Structured goal, eligibility, and prize rules
- **Database Queries**: Optimized SQL with pagination
- **TypeScript Code**: Complete microservice implementation
- **TLP Integration**: API integration code and error handling
- **Test Code**: Unit tests for generated rules

## 📈 Performance & Scalability

### **Batch Processing**
- **Configurable Batch Sizes**: 100-10,000 records per batch
- **Concurrency Control**: 1-10 concurrent processing threads
- **Memory Management**: Efficient memory usage with streaming
- **Progress Tracking**: Real-time progress updates

### **Database Optimization**
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: AI-generated optimized queries
- **Indexing**: Automatic index recommendations
- **Pagination**: Efficient large dataset handling

### **Monitoring & Metrics**
- **Health Checks**: Comprehensive health monitoring
- **Performance Metrics**: Processing time, throughput, error rates
- **Logging**: Structured logging with different levels
- **Alerting**: Error notification and monitoring

## 🔐 Security Features

### **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Admin and Participant role management
- **API Security**: Rate limiting and request validation
- **Secure Headers**: Helmet.js security middleware

### **Data Protection**
- **Encryption**: Sensitive data encryption at rest
- **Access Control**: Database-level access restrictions
- **Audit Logging**: Complete audit trail of all operations
- **Error Handling**: Secure error messages without data leakage

## 🚨 Error Handling & Recovery

### **Retry Mechanisms**
- **Automatic Retries**: Configurable retry attempts for failed operations
- **Exponential Backoff**: Intelligent retry timing
- **Dead Letter Queues**: Failed transaction handling
- **Manual Recovery**: Admin-initiated retry and recovery

### **Error Classification**
- **Transient Errors**: Network issues, temporary failures
- **Permanent Errors**: Invalid data, configuration issues
- **System Errors**: Infrastructure, database issues
- **Business Logic Errors**: Rule validation failures

## 📊 Monitoring & Observability

### **Health Monitoring**
```bash
# Basic health check
GET /health

# Detailed health information
GET /health/detailed

# Metrics endpoint
GET /metrics
```

### **Logging Levels**
- **ERROR**: System errors and failures
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### **Performance Metrics**
- **Response Times**: API endpoint performance
- **Throughput**: Transactions processed per second
- **Error Rates**: Success/failure ratios
- **Resource Usage**: CPU, memory, database usage

## 🔧 Configuration

### **Environment Variables**
```bash
# Service Configuration
NODE_ENV=production
PORT=3002

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db

# AI Configuration
ANTHROPIC_API_KEY=your_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# TLP Configuration
TLP_API_KEY=your_tlp_api_key
TLP_ENDPOINT_URL=https://exata-customer.pravici.io

# Security
JWT_SECRET=your_jwt_secret
```

### **Job Configuration**
```json
{
  "batchSize": 1000,
  "maxConcurrency": 5,
  "retryAttempts": 3,
  "retryDelay": 5000,
  "timeout": 300000
}
```

## 🧪 Testing

### **Unit Tests**
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Rules Engine"
```

### **Integration Tests**
```bash
# Test with real database
npm run test:integration

# Test AI integration
npm run test:ai

# Test TLP integration
npm run test:tlp
```

### **Load Testing**
```bash
# Run load tests
npm run test:load

# Performance benchmarks
npm run test:performance
```

## 🚀 Deployment

### **Docker Deployment**
```bash
# Build image
docker build -t incentiva-rules-engine .

# Run container
docker run -d \
  --name rules-engine \
  -p 3002:3002 \
  -e DATABASE_URL=postgresql://... \
  -e ANTHROPIC_API_KEY=... \
  incentiva-rules-engine
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rules-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rules-engine
  template:
    metadata:
      labels:
        app: rules-engine
    spec:
      containers:
      - name: rules-engine
        image: incentiva-rules-engine:latest
        ports:
        - containerPort: 3002
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## 🔮 Future Enhancements

### **Planned Features**
- **Multi-AI Provider Support**: OpenAI GPT-4, Google Gemini integration
- **Advanced Scheduling**: Cron expressions and calendar-based scheduling
- **Real-time Streaming**: WebSocket-based real-time updates
- **Machine Learning**: Predictive analytics and optimization
- **Multi-region Support**: Global deployment and data localization

### **Performance Improvements**
- **Horizontal Scaling**: Auto-scaling based on load
- **Caching Layer**: Redis-based caching for performance
- **Async Processing**: Event-driven architecture
- **Database Sharding**: Horizontal database scaling

## 📞 Support & Troubleshooting

### **Common Issues**
1. **AI API Errors**: Check Anthropic API key and rate limits
2. **Database Connection**: Verify PostgreSQL connection string
3. **Memory Issues**: Adjust batch sizes and concurrency
4. **Performance Issues**: Monitor database indexes and query optimization

### **Debug Mode**
```bash
# Enable debug logging
NODE_ENV=development npm run dev

# View detailed logs
docker-compose logs rules-engine -f --tail=100
```

### **Support Channels**
- **Documentation**: This README and API docs
- **Logs**: Container logs and application logs
- **Metrics**: Health endpoints and monitoring
- **Community**: GitHub issues and discussions

---

## 🎉 **Rules Engine Ready!**

Your Incentiva Rules Engine is now fully configured and ready to process loyalty campaigns with AI-powered intelligence. The system will automatically:

1. **Analyze** customer database schemas
2. **Generate** executable campaign rules
3. **Create** optimized microservices
4. **Process** transactions efficiently
5. **Integrate** with Pravici TLP seamlessly

**Next Steps:**
1. Configure your Anthropic API key
2. Create your first campaign with natural language rules
3. Let AI analyze your customer database
4. Execute campaigns with automated point allocation

**Happy Campaigning! 🚀**
