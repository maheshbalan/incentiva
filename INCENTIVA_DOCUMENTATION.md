# INCENTIVA - Complete Campaign Execution System
## The Developer's Bible

> **Welcome to Incentiva!** This comprehensive documentation is your complete guide to understanding, developing, and maintaining the Incentiva Loyalty Campaign Management System. Whether you're a new developer joining the project or an experienced team member looking for specific details, this document contains everything you need to know.

---

## 📚 Table of Contents

### **Chapter 1: Feature Implementation Summary** 
*What has been built and how it works*

### **Chapter 2: System Architecture & Technical Deep Dive**
*How the system is structured and implemented*

### **Chapter 3: Development, Deployment & Operations**
*How to work with, deploy, and maintain the system*

---

## 🎯 **Chapter 1: Feature Implementation Summary**

### **What is Incentiva?**

Incentiva is a **revolutionary loyalty campaign management system** that transforms natural language business rules into automated transaction processing workflows. Think of it as a "smart translator" that takes business requirements like "Premium line products get 1 point per 200 MXN spent" and automatically creates:

- Database schemas for transaction processing
- Executable JSON rules for runtime evaluation  
- TLP API integrations for point allocation
- Complete campaign execution workflows

### **Why This Matters for Developers**

As a developer working on Incentiva, you need to understand that this isn't just another CRUD application. This is a **rule engine** that processes real customer transactions and automatically allocates loyalty points based on complex business logic. The system needs to be:

- **Reliable**: Processing thousands of transactions without errors
- **Scalable**: Handling multiple campaigns simultaneously
- **Intelligent**: Using AI to understand and implement business rules
- **Secure**: Protecting sensitive customer and financial data

---

### **✅ What Has Been Built (The Complete Picture)**

#### **1. Campaign Creation & Management System**

**The Multi-Step Wizard Approach**
We've implemented a sophisticated campaign creation system that guides administrators through a logical, step-by-step process. This isn't just a form - it's a **business logic validation engine** that ensures campaigns are properly configured before they go live.

**Step 1: Basic Information**
- Campaign name, description, and date ranges
- Target audience identification
- **Why This Matters**: This establishes the foundation for all subsequent steps. The date ranges determine when rules are active, and the target audience defines who can participate.

**Step 2: Goals & Rewards (Simplified & Powerful)**
- **Single Campaign Currency**: Instead of complex multi-currency setups, we use one currency per campaign (e.g., MXN for Mexico, USD for US)
- **Amount per Point**: Simple concept - "How much does someone need to sell to earn 1 point?" (e.g., 200 MXN = 1 point)
- Individual and overall campaign goals
- Bonus structures for goal achievement

**Why This Design Choice?**
The original system had three separate currency fields and complex point calculations. We simplified this to:
- **One currency per campaign** (realistic business scenario)
- **One point allocation rule** (easy to understand and maintain)
- **Automatic rounding up** (ensures participants always get points for their efforts)

**Step 3: Eligibility & Rules**
- Natural language rule descriptions
- AI-powered rule interpretation
- **Why This Matters**: Business users can write rules like "Only active employees can participate" and the AI will understand and implement this logic.

**Step 4: TLP Configuration**
- Pravici TLP API endpoint configuration
- API key management
- **Why This Matters**: This is where the magic happens - the system will automatically create TLP artifacts (point types, offers, members) based on campaign rules.

**Step 5: Database Connection**
- Customer database connection details
- Schema analysis capabilities
- **Why This Matters**: The system needs to read from your customer's database to process transactions and calculate points.

**Step 6: Review & Create**
- Comprehensive summary of all configurations
- Validation before campaign activation
- **Why This Matters**: Prevents misconfigured campaigns from going live and causing issues.

#### **2. Administration & User Management**

**AI Model Configuration System**
We've built a flexible AI provider system that can work with multiple AI services:

- **Anthropic Claude** (Primary implementation)
- **OpenAI GPT** (Ready for integration)
- **Google Gemini** (Ready for integration)
- **Azure OpenAI** (Ready for integration)

**Why Multiple AI Providers?**
Different AI providers have different strengths:
- **Claude**: Excellent at understanding business logic and generating structured outputs
- **GPT**: Great at creative content and natural language
- **Gemini**: Strong at technical tasks and code generation
- **Azure OpenAI**: Enterprise-grade security and compliance

**User Management with Role-Based Access**
- **Admin Users**: Full system access, can create campaigns, manage users, configure AI
- **Participant Users**: Can view their campaigns, track progress, redeem points
- **Password Management**: Secure password reset system ready for backend integration

#### **3. Participant Experience & Dashboard**

**Real-Time Progress Tracking**
Participants can see:
- Which campaigns they're enrolled in
- Their individual goal progress
- Overall campaign status
- Real-time point balances

**TLP Integration Views**
- Current point balance from Pravici TLP
- Transaction history (earned and redeemed points)
- Available redemption offers
- Direct redemption capabilities

**Why This Matters for Development**
The participant dashboard isn't just displaying data - it's **real-time synchronized** with the TLP system. When points are earned through transactions, they appear immediately. When points are redeemed, the balance updates in real-time.

#### **4. Sample Customer Database (Goodyear Mexico)**

**Complete Sales System Schema**
We've created a realistic sample database that includes:
- **Product Lines**: Premium Line, Standard Line, Commercial Line, Off-Road Line
- **Products**: Realistic tire products with MXN pricing
- **Salespeople**: 10 employees across Mexico with realistic performance data
- **Customers**: 10 major auto parts retailers
- **Sales Data**: 6 months of realistic transaction data

**Why This Sample Data Matters**
This isn't just test data - it's **realistic business data** that allows developers to:
- Test campaign logic with real-world scenarios
- Validate point calculations with actual sales amounts
- Understand how the system handles edge cases
- Demonstrate the system to stakeholders with realistic examples

---

### **🔧 Technical Implementation Details**

#### **Frontend Architecture (React + TypeScript)**
- **React 18**: Latest React features for optimal performance
- **TypeScript**: Full type safety across the entire application
- **Material-UI**: Professional, accessible component library
- **React Hook Form**: Efficient form handling with validation
- **React Router**: Client-side routing for smooth navigation

#### **Backend Architecture (Node.js + Express)**
- **Node.js 21.7.3**: Latest LTS version for performance and security
- **Express.js**: Fast, unopinionated web framework
- **Prisma ORM**: Type-safe database access with auto-generated types
- **JWT Authentication**: Secure, stateless authentication system
- **TypeScript**: Full type safety on the backend

#### **Database Design (PostgreSQL)**
- **PostgreSQL**: Robust, scalable relational database
- **Prisma Schema**: Type-safe database schema definition
- **Proper Indexing**: Optimized for campaign and transaction queries
- **Migration System**: Version-controlled database schema changes

---

### **🚀 What Happens When a Campaign Runs**

#### **Phase 1: Campaign Setup**
1. **Admin creates campaign** with natural language rules
2. **AI analyzes rules** and generates transaction schema
3. **System creates TLP artifacts** (point types, offers, members)
4. **Database connections** are established to customer systems

#### **Phase 2: Data Extraction**
1. **One-time load** extracts historical data
2. **Incremental loads** keep data current
3. **Data transformation** applies business rules
4. **Transaction table** is populated with JSON data

#### **Phase 3: Transaction Processing**
1. **Rules engine** processes each transaction
2. **Eligibility check** determines if transaction qualifies
3. **Point calculation** applies accrual rules
4. **TLP API calls** allocate points to participants

#### **Phase 4: Real-Time Updates**
1. **Participant dashboards** update immediately
2. **Progress tracking** shows real-time goal achievement
3. **Point balances** reflect latest transactions
4. **Redemption options** become available as goals are met

---

### **🎯 Success Metrics & Business Value**

#### **Campaign Effectiveness**
- **Individual Goal Achievement**: How many participants meet their personal targets
- **Overall Campaign Success**: Whether the campaign achieves its collective goals
- **Participant Engagement**: How actively participants track their progress
- **Point Redemption Rates**: How quickly participants use their earned points

#### **System Performance**
- **Campaign Creation Time**: How quickly admins can set up new campaigns
- **Rule Generation Accuracy**: How well AI understands and implements business logic
- **Transaction Processing Speed**: How quickly the system processes customer data
- **User Experience Metrics**: How intuitive and efficient the system is to use

---

### **🔒 Security & Compliance Considerations**

#### **Data Protection**
- **Secure API Key Storage**: AI and TLP credentials are encrypted
- **Read-Only Database Access**: Customer databases are never modified
- **JWT Token Security**: Stateless authentication with proper expiration
- **Role-Based Access Control**: Users only see what they're authorized to see

#### **Integration Security**
- **TLP API Security**: Secure communication with Pravici systems
- **Database Connection Security**: Encrypted connections to customer databases
- **Audit Logging**: Complete trail of all system operations
- **User Permission Validation**: Every action is validated against user permissions

---

## 🏗️ **Chapter 2: System Architecture & Technical Deep Dive**

### **Understanding the System Architecture**

Now that you understand **what** Incentiva does, let's dive deep into **how** it's built. This chapter will give you the technical foundation you need to work effectively with the codebase.

---

### **🎯 High-Level System Architecture**

```
                    Incentiva System Architecture
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Frontend (React)                     │   │
│  │              Built into Backend                     │   │
│  │              Port 3001                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Backend (Node.js)                    │   │
│  │              Express + Prisma                       │   │
│  │              Port 3001                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Rules Engine                           │   │
│  │            Transaction Processing                   │   │
│  │              Port 3002                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                    │   │
│  │              Port 5432                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why This Architecture?**

1. **Frontend Built into Backend**: This approach simplifies deployment and ensures the frontend and backend are always in sync. No CORS issues, no version mismatches.

2. **Separate Rules Engine**: The rules engine runs independently because:
   - It needs to process transactions asynchronously
   - It can scale independently based on transaction volume
   - It isolates the complex rule processing logic

3. **Single Database**: All services share the same PostgreSQL database, ensuring data consistency and simplifying transactions.

---

### **🔧 Container Architecture (Docker)**

#### **Container Structure**
```
incentiva/
├── incentiva-app/          # Backend + Frontend (Port 3001)
├── incentiva-postgres/     # PostgreSQL Database (Port 5432)
└── incentiva-rules-engine/ # Rules Processing Engine (Port 3002)
```

#### **Why Docker?**
- **Consistency**: Same environment across development, staging, and production
- **Isolation**: Each service runs in its own container with defined dependencies
- **Scalability**: Easy to scale individual services independently
- **Portability**: Works the same way on any machine with Docker

#### **Container Communication**
- **Backend ↔ Database**: Direct connection via `DATABASE_URL`
- **Backend ↔ Rules Engine**: HTTP API calls between containers
- **Frontend ↔ Backend**: Same container, no network calls needed

---

### **📁 Project Structure Deep Dive**

#### **Root Directory Structure**
```
incentiva/
├── backend/                 # Backend Node.js application
├── frontend/               # React frontend application
├── shared/                 # Shared TypeScript types and utilities
├── rules-engine/           # Rules processing engine
├── docker-compose.yml      # Main Docker Compose configuration
├── docker-compose.dev.yml  # Development-specific configuration
└── README.md               # This documentation
```

#### **Backend Structure (`backend/`)**
```
backend/
├── src/
│   ├── controllers/        # API endpoint handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware (auth, validation)
│   └── utils/             # Utility functions and helpers
├── prisma/                # Database schema and migrations
├── Dockerfile             # Backend container definition
└── package.json           # Backend dependencies
```

**Key Backend Components:**

1. **Controllers**: Handle HTTP requests and responses
   - `authController.ts`: User authentication and management
   - `campaignController.ts`: Campaign CRUD operations
   - `participantController.ts`: Participant management
   - `tlpController.ts`: TLP integration endpoints

2. **Services**: Contain business logic
   - `aiService.ts`: AI integration for rule generation
   - `tlpService.ts`: Pravici TLP API integration
   - `logger.ts`: Centralized logging system

3. **Middleware**: Request processing pipeline
   - `auth.ts`: JWT token validation
   - `errorHandler.ts`: Global error handling
   - `validation.ts`: Request data validation

#### **Frontend Structure (`frontend/`)**
```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   └── utils/             # Frontend utilities
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

**Key Frontend Components:**

1. **Pages**: Main application views
   - `CreateCampaignPage.tsx`: Campaign creation wizard
   - `CampaignEditPage.tsx`: Campaign editing interface
   - `CampaignsPage.tsx`: Campaign listing and management
   - `CampaignExecutionPage.tsx`: Campaign execution workflow
   - `ParticipantDashboardPage.tsx`: Participant view

2. **Components**: Reusable UI elements
   - `Layout.tsx`: Main application layout
   - Form components for different campaign steps
   - Data display components (tables, charts, etc.)

3. **Services**: API communication layer
   - `authService.ts`: Authentication and API client
   - Centralized axios instance with interceptors

#### **Shared Structure (`shared/`)**
```
shared/
├── src/
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Shared utility functions
│   └── index.ts           # Main export file
└── package.json           # Shared package configuration
```

**Why Shared Package?**
- **Type Safety**: Ensures frontend and backend use the same data structures
- **Code Reuse**: Common utilities shared between services
- **Consistency**: Single source of truth for interfaces and types
- **Maintenance**: Update types in one place, affects all services

#### **Rules Engine Structure (`rules-engine/`)**
```
rules-engine/
├── src/
│   ├── controllers/       # Rules engine API endpoints
│   ├── services/          # Core processing services
│   ├── middleware/        # Rules engine middleware
│   └── utils/             # Rules engine utilities
├── rules/                 # Rule definition files
└── package.json           # Rules engine dependencies
```

**Key Rules Engine Components:**

1. **Controllers**: Handle rules engine requests
   - `rulesEngineController.ts`: Rule processing endpoints
   - `jobController.ts`: Background job management
   - `transactionController.ts`: Transaction processing

2. **Services**: Core rule processing logic
   - `rulesProcessingService.ts`: JSON rule evaluation
   - `dataExtractionService.ts`: Database data extraction
   - `aiService.ts`: AI-powered rule generation
   - `tlpIntegrationService.ts`: TLP API integration

---

### **🗄️ Database Architecture Deep Dive**

#### **Core Database Schema**

**Campaign Management Tables**
```sql
-- Main campaign table
campaigns (
  id, name, description, startDate, endDate, status,
  campaignCurrency, amountPerPoint, individualGoal, overallGoal,
  individualGoalBonus, overallGoalBonus, totalPointsMinted,
  eligibilityCriteria, rewards,
  tlpApiKey, tlpEndpointUrl,
  databaseType, databaseHost, databasePort, databaseName,
  databaseUsername, databasePassword,
  createdById, createdAt, updatedAt
)

-- Campaign participants
campaign_participants (
  id, campaignId, userId, enrolledAt, status
)

-- Campaign rules
campaign_rules (
  id, campaignId, ruleType, ruleDefinition, status
)
```

**User Management Tables**
```sql
-- Users table
users (
  id, email, firstName, lastName, role, passwordHash,
  createdAt, updatedAt
)

-- AI configurations
ai_configurations (
  id, provider, model, apiKey, endpointUrl, isActive
)
```

**Transaction Processing Tables**
```sql
-- Campaign transactions
campaign_transactions (
  id, campaignId, participantId, transactionData,
  eligibilityStatus, pointsEarned, tlpResponse,
  processedAt, status
)

-- TLP artifacts created
tlp_artifacts (
  id, campaignId, artifactType, artifactName,
  apiCall, response, status, createdAt
)
```

#### **Why This Schema Design?**

1. **Flexible Campaign Configuration**: The `campaigns` table stores all campaign settings in a flexible way that can accommodate different business requirements.

2. **JSON Transaction Data**: `transactionData` field stores the actual customer transaction as JSON, allowing for different database schemas without changing the Incentiva schema.

3. **Audit Trail**: Every action is timestamped and tracked, providing complete audit capabilities.

4. **TLP Integration**: Dedicated tables for tracking TLP API calls and responses, ensuring transparency and debugging capabilities.

---

### **🔐 Authentication & Security Architecture**

#### **JWT Token Flow**
```
1. User Login → Backend validates credentials
2. Backend generates JWT token with user info
3. Frontend stores token in localStorage
4. Frontend includes token in all API requests
5. Backend validates token on each request
6. Token expires → User redirected to login
```

#### **Security Layers**

1. **Frontend Security**
   - JWT tokens stored securely
   - Automatic token refresh handling
   - Role-based UI rendering
   - Input validation and sanitization

2. **Backend Security**
   - JWT token validation middleware
   - Role-based endpoint protection
   - SQL injection prevention via Prisma
   - Rate limiting and request validation

3. **Database Security**
   - Encrypted connections
   - Read-only access to customer databases
   - User permission validation
   - Audit logging for all operations

---

### **🤖 AI Integration Architecture**

#### **AI Service Flow**
```
1. Admin writes natural language rules
2. Frontend sends rules to backend
3. Backend calls AI service with rules + context
4. AI generates structured output (JSON schema, rules)
5. Backend stores AI-generated artifacts
6. Rules engine uses artifacts for processing
```

#### **AI Provider Abstraction**
```typescript
interface AIProvider {
  generateTransactionSchema(rules: string): Promise<TransactionSchema>
  generateJSONRules(rules: string): Promise<JSONRuleSet>
  generateDataExtractionQueries(schema: DatabaseSchema): Promise<SQLQueries>
}
```

**Why This Design?**
- **Provider Agnostic**: Easy to switch between AI providers
- **Consistent Interface**: Same API regardless of underlying AI service
- **Fallback Capability**: Can use multiple providers for redundancy
- **Cost Optimization**: Use different providers for different tasks

---

### **🔄 Rules Engine Architecture**

#### **Transaction Processing Flow**
```
1. Data Extraction Service pulls data from customer database
2. Data is transformed and stored in campaign_transactions table
3. Rules Processing Service evaluates each transaction
4. Rules are applied based on campaign configuration
5. Points are calculated and TLP API calls are generated
6. Results are stored and participant dashboards updated
```

#### **Rule Evaluation Engine**
```typescript
interface RuleEngine {
  evaluateEligibility(transaction: Transaction, rules: JSONRuleSet): boolean
  calculatePoints(transaction: Transaction, rules: JSONRuleSet): number
  applyBonusRules(participant: Participant, campaign: Campaign): number
  generateTLPCalls(points: number, participant: Participant): TLPCall[]
}
```

**Key Features:**
- **JSON-Based Rules**: Rules are stored as JSON and evaluated at runtime
- **Dynamic Rule Loading**: Rules can be updated without restarting the system
- **Transaction Isolation**: Each transaction is processed independently
- **Error Handling**: Failed transactions are logged and can be retried

---

### **🔌 TLP Integration Architecture**

#### **TLP API Integration Flow**
```
1. Campaign creation → Generate TLP point types
2. Campaign activation → Create TLP members
3. Transaction processing → Generate accrual offers
4. Goal achievement → Create bonus offers
5. Redemption → Process redemption requests
```

#### **TLP Service Architecture**
```typescript
interface TLPService {
  createPointType(campaign: Campaign): Promise<PointType>
  createMember(participant: Participant): Promise<Member>
  createAccrualOffer(points: number, participant: Participant): Promise<Offer>
  createBonusOffer(bonus: number, participant: Participant): Promise<Offer>
  processRedemption(redemption: RedemptionRequest): Promise<RedemptionResponse>
}
```

**Integration Points:**
- **Point Type Creation**: Each campaign gets its own point type in TLP
- **Member Management**: Participants are automatically created as TLP members
- **Offer Generation**: Accrual and bonus offers are created dynamically
- **Real-Time Sync**: All TLP operations are synchronized in real-time

---

### **📊 Data Flow Architecture**

#### **Complete System Data Flow**
```
Customer Database → Data Extraction → Transaction Table → Rules Engine → TLP API → Participant Dashboard
     ↓                    ↓              ↓              ↓           ↓           ↓
  Read-Only           Transform      JSON Store     Evaluate    Allocate    Real-Time
  Access              & Validate     Transactions   Rules      Points      Updates
```

#### **Data Transformation Pipeline**
```
1. Raw Customer Data → Schema Analysis → Field Mapping
2. Field Mapping → Data Extraction → JSON Transformation  
3. JSON Transformation → Validation → Storage
4. Storage → Rule Processing → Point Calculation
5. Point Calculation → TLP Integration → Dashboard Update
```

**Why This Pipeline?**
- **Schema Flexibility**: Can work with any customer database structure
- **Data Validation**: Ensures data quality before processing
- **Audit Trail**: Complete visibility into data transformation
- **Error Handling**: Failed transformations are logged and can be retried

---

*This completes Chapter 2. You now have a deep technical understanding of how Incentiva is architected and implemented. In the next chapter, we'll cover development workflows, deployment procedures, and operational considerations.*

---

## 🚀 **Chapter 3: Development, Deployment & Operations**

### **Getting Started as a Developer**

Now that you understand the architecture, let's get you up and running with the development environment. This chapter covers everything you need to know to work effectively with Incentiva.

---

### **🛠️ Development Environment Setup**

#### **Prerequisites**
Before you start, ensure you have:
- **Docker & Docker Compose**: Latest versions for container management
- **Node.js 21.7.3**: Exact version for consistency (use nvm)
- **Git**: For version control and collaboration
- **VS Code or similar**: Recommended IDE with TypeScript support

#### **Initial Setup Steps**

**1. Clone the Repository**
```bash
git clone https://github.com/maheshbalan/incentiva.git
cd incentiva
```

**2. Set Up Node.js Version**
```bash
# Install nvm if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install 21.7.3
nvm use 21.7.3
nvm alias default 21.7.3
```

**3. Environment Configuration**
```bash
# Copy the environment template
cp backend/env.example .env

# Edit .env with your configuration
nano .env
```

**Key Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://incentiva:incentiva123@localhost:5432/incentiva_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# AI Services
ANTHROPIC_API_KEY="your-anthropic-api-key"
TLP_DEFAULT_ENDPOINT="https://your-tlp-endpoint.com"
TLP_DEFAULT_API_KEY="your-tlp-api-key"

# Application
NODE_ENV="development"
PORT=3001
```

---

### **🐳 Docker Development Workflow**

#### **Starting the Development Environment**

**Option 1: Full Containerized Development (Recommended)**
```bash
# Build and start all services
docker-compose up --build

# Or start in background
docker-compose up -d --build

# View logs
docker-compose logs -f
```

**Option 2: Database Only + Local Development**
```bash
# Start only PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Run backend locally
cd backend
npm install
npm run dev

# Run frontend locally (in another terminal)
cd frontend  
npm install
npm run dev
```

#### **Development Commands**

**Container Management**
```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f rules-engine

# Restart specific service
docker-compose restart app

# Stop all services
docker-compose down

# Clean up everything (containers, volumes, images)
docker-compose down -v --rmi all
```

**Database Operations**
```bash
# Access PostgreSQL container
docker exec -it incentiva-postgres psql -U incentiva -d incentiva_dev

# Run migrations
docker exec -it incentiva-app npx prisma migrate deploy

# Seed database
docker exec -it incentiva-app npx prisma db seed

# Reset database
docker exec -it incentiva-app npx prisma migrate reset
```

---

### **🔧 Development Workflow**

#### **Making Code Changes**

**1. Frontend Changes**
```bash
# Edit files in frontend/ directory
# Changes are automatically detected and hot-reloaded
# No rebuild needed for development
```

**2. Backend Changes**
```bash
# Edit files in backend/ directory
# nodemon automatically restarts the server
# Check logs for any errors
docker-compose logs -f app
```

**3. Database Schema Changes**
```bash
# Edit backend/prisma/schema.prisma
# Generate new migration
docker exec -it incentiva-app npx prisma migrate dev --name your_migration_name

# Apply migration to database
docker exec -it incentiva-app npx prisma migrate deploy
```

**4. Rules Engine Changes**
```bash
# Edit files in rules-engine/ directory
# Rebuild container to apply changes
docker-compose build rules-engine
docker-compose up -d rules-engine
```

#### **Code Quality & Standards**

**TypeScript Configuration**
- All code must be written in TypeScript
- Strict type checking is enabled
- Use shared types from `shared/src/types.ts`
- Avoid `any` types - use proper interfaces

**Code Style**
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow the existing code structure and patterns
- Use async/await instead of promises where possible

**Error Handling**
- Always wrap async operations in try-catch blocks
- Log errors with context using the logger service
- Return meaningful error messages to users
- Handle edge cases gracefully

---

### **🧪 Testing & Debugging**

#### **Testing Strategies**

**1. Manual Testing**
- Use the sample Goodyear Mexico database for realistic testing
- Test all campaign creation steps
- Verify participant dashboard functionality
- Test TLP integration endpoints

**2. API Testing**
```bash
# Test backend health
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@incentiva.me","password":"password"}'

# Test campaign endpoints (with auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/campaigns
```

**3. Database Testing**
```sql
-- Check campaign data
SELECT * FROM campaigns;

-- Check user data  
SELECT * FROM users;

-- Check transaction data
SELECT * FROM campaign_transactions;
```

#### **Debugging Techniques**

**1. Backend Logging**
```typescript
// Use the logger service for consistent logging
import { logger } from '../utils/logger'

logger.info('Processing campaign', { campaignId, userId })
logger.error('Failed to process transaction', { error: err.message, transactionId })
logger.warn('Campaign goal nearly reached', { campaignId, progress: 95 })
```

**2. Frontend Debugging**
```typescript
// Use console.log for development debugging
console.log('Campaign data:', campaign)
console.log('Form values:', formValues)

// Check browser console for errors
// Use React DevTools for component inspection
```

**3. Database Debugging**
```sql
-- Check recent transactions
SELECT * FROM campaign_transactions 
ORDER BY processedAt DESC 
LIMIT 10;

-- Check campaign status
SELECT id, name, status, "campaignCurrency", "amountPerPoint" 
FROM campaigns;
```

---

### **📦 Building & Deployment**

#### **Development Builds**

**1. Frontend Build**
```bash
# Build frontend for development
cd frontend
npm run build

# Build frontend for production
npm run build:prod
```

**2. Backend Build**
```bash
# Build backend with TypeScript
cd backend
npm run build

# Run in development mode
npm run dev

# Run in production mode
npm start
```

#### **Production Deployment**

**1. Environment Preparation**
```bash
# Update environment variables for production
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@prod-db:5432/incentiva_prod"
JWT_SECRET="production-jwt-secret"
```

**2. Docker Production Build**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

**3. Database Migration**
```bash
# Apply migrations to production database
docker exec -it incentiva-app npx prisma migrate deploy

# Verify database connection
docker exec -it incentiva-app npx prisma db seed
```

---

### **🔍 Monitoring & Operations**

#### **Health Monitoring**

**1. Application Health**
```bash
# Check application status
curl http://localhost:3001/health

# Check database connection
docker exec -it incentiva-app npx prisma db execute --stdin
```

**2. Container Health**
```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# Check container logs
docker-compose logs --tail=100 app
```

**3. Database Health**
```sql
-- Check database connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### **Performance Monitoring**

**1. API Response Times**
- Monitor `/api/campaigns` endpoint response times
- Track transaction processing performance
- Monitor TLP API call response times

**2. Database Performance**
- Monitor query execution times
- Check for slow queries
- Monitor connection pool usage

**3. Resource Usage**
- Monitor container CPU and memory usage
- Track disk I/O for database operations
- Monitor network usage for API calls

---

### **🚨 Troubleshooting Common Issues**

#### **Container Won't Start**

**Problem**: Container fails to start with exit code 1
```bash
# Check container logs
docker-compose logs app

# Check if port is already in use
lsof -i :3001

# Check Docker daemon status
docker info
```

**Solution**: Usually a configuration issue or port conflict
```bash
# Stop conflicting services
sudo lsof -ti:3001 | xargs kill -9

# Restart Docker daemon
sudo systemctl restart docker

# Rebuild and start containers
docker-compose down
docker-compose up --build
```

#### **Database Connection Issues**

**Problem**: Backend can't connect to PostgreSQL
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test database connection
docker exec -it incentiva-postgres psql -U incentiva -d incentiva_dev
```

**Solution**: Usually environment variable or network issue
```bash
# Verify environment variables
docker exec -it incentiva-app env | grep DATABASE

# Check network connectivity
docker exec -it incentiva-app ping postgres

# Reset database container
docker-compose restart postgres
```

#### **Frontend Not Loading**

**Problem**: Frontend shows blank page or errors
```bash
# Check if frontend was built correctly
docker exec -it incentiva-app ls -la /app/backend/public

# Check backend logs for static file serving
docker-compose logs app | grep "static"

# Verify backend is serving on correct port
curl http://localhost:3001
```

**Solution**: Usually build or static file serving issue
```bash
# Rebuild frontend
docker-compose build app

# Restart backend container
docker-compose restart app

# Check if static files are being served
curl http://localhost:3001/static/js/main.js
```

#### **Authentication Issues**

**Problem**: 401 Unauthorized errors
```bash
# Check if JWT_SECRET is set
docker exec -it incentiva-app env | grep JWT

# Check authentication middleware logs
docker-compose logs app | grep "auth"

# Verify token in browser localStorage
# Check browser console for errors
```

**Solution**: Usually JWT configuration or token issue
```bash
# Regenerate JWT secret
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# Restart backend
docker-compose restart app

# Clear browser localStorage and login again
```

---

### **📚 Development Resources**

#### **Key Files to Understand**

**1. Database Schema**
- `backend/prisma/schema.prisma` - Complete database schema
- `backend/prisma/migrations/` - Database migration history

**2. API Endpoints**
- `backend/src/controllers/` - All API endpoint handlers
- `backend/src/middleware/` - Authentication and validation

**3. Frontend Components**
- `frontend/src/pages/` - Main application pages
- `frontend/src/components/` - Reusable UI components
- `frontend/src/services/` - API communication layer

**4. Shared Types**
- `shared/src/types.ts` - TypeScript interfaces and types
- `shared/src/utils.ts` - Common utility functions

#### **Useful Commands Reference**

**Development Commands**
```bash
# Start development environment
docker-compose up --build

# View logs
docker-compose logs -f

# Access database
docker exec -it incentiva-postgres psql -U incentiva -d incentiva_dev

# Run migrations
docker exec -it incentiva-app npx prisma migrate deploy

# Seed database
docker exec -it incentiva-app npx prisma db seed
```

**Git Commands**
```bash
# Push to both repositories
./push-to-both-repos.sh "Your commit message"

# Check status
git status

# View recent commits
git log --oneline -10
```

---

### **🎯 Next Steps for Developers**

#### **Immediate Development Priorities**

1. **Complete TLP Integration**
   - Implement real TLP API calls
   - Add error handling and retry logic
   - Implement real-time synchronization

2. **AI Rule Generation**
   - Connect to Anthropic Claude API
   - Implement rule validation
   - Add rule testing capabilities

3. **Transaction Processing**
   - Implement real data extraction
   - Add transaction validation
   - Implement error recovery

#### **Testing & Quality Assurance**

1. **Unit Tests**
   - Add Jest tests for services
   - Test rule engine logic
   - Validate API endpoints

2. **Integration Tests**
   - Test complete campaign workflows
   - Validate TLP integration
   - Test error scenarios

3. **Performance Testing**
   - Load test transaction processing
   - Validate database performance
   - Test concurrent campaign execution

#### **Documentation & Knowledge Sharing**

1. **API Documentation**
   - Document all endpoints
   - Add request/response examples
   - Include error codes and messages

2. **User Guides**
   - Admin user manual
   - Participant user guide
   - System administrator guide

3. **Developer Onboarding**
   - Setup guide for new developers
   - Architecture decision records
   - Troubleshooting guide

---

## 🎉 **Conclusion**

Congratulations! You now have a comprehensive understanding of the Incentiva system. This documentation covers:

- ✅ **What Incentiva does** and why it matters
- ✅ **How the system is architected** and implemented  
- ✅ **How to develop, deploy, and operate** the system

### **Key Takeaways for Developers**

1. **This is a Rule Engine**: Not just a CRUD app - it processes real business logic
2. **AI-Powered**: Uses AI to understand and implement business rules
3. **Real-Time Processing**: Processes transactions and updates dashboards in real-time
4. **Enterprise Integration**: Integrates with Pravici TLP and customer databases
5. **Scalable Architecture**: Built to handle multiple campaigns and high transaction volumes

### **Getting Help**

- **Check the logs**: Most issues can be diagnosed from container logs
- **Verify configuration**: Environment variables and database connections
- **Test incrementally**: Start with simple operations and build complexity
- **Use the sample data**: The Goodyear Mexico database provides realistic testing scenarios

### **Contributing to Incentiva**

- Follow the established code patterns and architecture
- Add comprehensive logging for debugging
- Test your changes thoroughly before committing
- Update this documentation when adding new features
- Use the dual-repository push script for version control

**Happy coding! 🚀**

---

*This completes the INCENTIVA_DOCUMENTATION. You now have everything you need to understand, develop, and maintain the Incentiva system.*
