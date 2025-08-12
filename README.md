# 🚀 Incentiva - AI-Powered Loyalty Campaign Management System

[![Node.js](https://img.shields.io/badge/Node.js-21.7-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

## 📋 Overview

Incentiva is a comprehensive AI-powered loyalty campaign management platform that enables businesses to create, manage, and execute sophisticated loyalty programs. The system integrates with Pravici TLP for point management and uses AI models (Anthropic Claude, OpenAI GPT, Google Gemini) for intelligent campaign rule generation and execution.

**🚀 NEW: Complete Campaign Execution System** - The system now includes a comprehensive campaign execution workflow with TLP integration, transaction processing, and real-time monitoring. See [Campaign Execution Features](#-campaign-execution-system-new) for complete details.

## ✨ Key Features

### 🎯 **Campaign Management**
- **Multi-Step Campaign Creation**: 6-step wizard for comprehensive campaign setup
- **Points Allocation System**: Configurable points per value, bonuses, and currency support
- **Goal Management**: Individual and overall campaign goals with multiple currency support
- **Total Points Minted**: NEW! Specify total campaign points allocation
- **Eligibility Rules**: Custom criteria for participant qualification
- **Rewards Configuration**: Detailed redemption options and point values
- **Campaign Lifecycle**: Draft → Review → Execute → Monitor workflow

### 🚀 **Campaign Execution System (NEW!)**
- **7-Step Execution Process**: Complete workflow from TLP setup to transaction processing
- **TLP Point Type Creation**: Automated point type and value setup
- **Point Minting**: Campaign-specific point allocation
- **Accrual Offers**: Dynamic offers based on campaign rules
- **Redemption Offers**: AI-generated reward options
- **Member Creation**: Automated TLP member setup
- **Transaction Schema Analysis**: AI-powered database understanding
- **SQL Artifacts Generation**: One-time and incremental load scripts
- **Data Load Scheduling**: Automated processing schedules

### 🤖 **AI Integration**
- **Schema Analysis**: AI-powered database schema understanding and mapping
- **Rule Generation**: Natural language to executable campaign rules
- **Code Generation**: Automated microservice creation for campaign execution
- **Multi-Model Support**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Intelligent Processing**: Automated point allocation and goal tracking
- **TLP Documentation Integration**: Uses TLP API documentation for intelligent offer generation

### 🚀 **Rules Engine**
- **AI-Powered Rule Processing**: Converts natural language to executable TypeScript rules
- **Microservice Architecture**: Separate container for high-performance transaction processing
- **Automated Code Generation**: Creates complete microservices using Anthropic Claude
- **Batch Processing**: Configurable batch sizes with concurrency control
- **Real-Time Execution**: Live campaign processing with progress tracking
- **TLP Integration**: Automated point allocation via Pravici TLP APIs
- **Error Recovery**: Comprehensive retry mechanisms and error handling

### 🗄️ **Database Integration**
- **Multi-Database Support**: PostgreSQL, MySQL, MongoDB
- **Read-Only Access**: Secure connection to customer databases
- **Schema Mapping**: AI-powered understanding of external data structures
- **Real-Time Processing**: Live campaign execution and monitoring

### 👥 **User Management**
- **Role-Based Access**: Admin and Participant roles
- **OAuth Integration**: Google and Microsoft authentication
- **Participant Management**: Bulk user creation and assignment
- **Password Management**: Secure reset and management tools

### 🎁 **Loyalty Program Features**
- **Point Types**: Custom point categories and values
- **Accrual Rules**: Dynamic and fixed point allocation
- **Redemption Options**: Product offers and reward management
- **TLP Integration**: Full Pravici TLP API integration
- **Transaction History**: Complete audit trail and reporting

### 📊 **Transaction Processing (NEW!)**
- **Transaction Table**: Comprehensive view of all campaign transactions
- **Status Tracking**: PENDING, PROCESSING, COMPLETED, FAILED, RETRY
- **Action Management**: Track all actions taken on transactions
- **Response Logging**: Store TLP API calls and responses
- **JSON Metadata**: Rich transaction data with expandable details
- **Rules Engine Integration**: Background processing through AI-powered rules
- **Real-Time Updates**: Live status and action tracking

## 🏗️ Architecture

### **System Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                    Incentiva System                        │
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

### **Frontend (React 18 + TypeScript)**
- **UI Framework**: Material-UI with custom theme
- **State Management**: React hooks for local state and API integration
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router with protected routes
- **Real-Time**: Live updates and progress tracking
- **Serving**: Frontend is built and served through the backend container on port 3001

### **Backend (Node.js + Express + TypeScript)**
- **API Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with JWT tokens
- **Database ORM**: Prisma with PostgreSQL
- **Validation**: Zod schema validation
- **Rate Limiting**: Express rate limit protection

### **Rules Engine Microservice**
- **Container**: Dedicated microservice (Port 3002)
- **Framework**: Express.js with TypeScript
- **AI Integration**: Anthropic Claude 3.5 Sonnet
- **Job Management**: Scheduled and on-demand execution
- **Transaction Processing**: Batch processing with retry mechanisms
- **TLP Integration**: Automated point allocation and tracking
- **Performance**: Configurable batch sizes and concurrency control
- **Health Monitoring**: `/health` and `/health/detailed` endpoints
- **API Documentation**: Complete REST API for rules processing

### **Database Layer**
- **Primary Database**: PostgreSQL for application data
- **Sample Database**: Goodyear Mexico sales data (6.3M MXN, 8 months)
- **Schema Management**: Prisma migrations and seeding
- **Connection Pooling**: Optimized database connections

### **AI Services**
- **Claude Integration**: Anthropic API for intelligent processing
- **Code Generation**: Automated microservice creation
- **Schema Analysis**: Database structure understanding
- **Rule Processing**: Natural language to executable logic

## 🚀 Quick Start

### **Prerequisites**
- Node.js 21.7+ (use `nvm install 21.7`)
- Docker and Docker Compose
- Git

### **Option 1: Docker (Recommended)**

```bash
# Clone the repository
git clone https://github.com/maheshbalan/incentiva.git
cd incentiva

# Start the system (includes rules engine)
docker-compose up --build -d

# Wait for services to be healthy
docker-compose ps

# Access the application
open http://localhost:3001

# Check rules engine health
curl http://localhost:3002/health
```

#### Bring up only Postgres + Rules Engine (for debugging)

```bash
# Start only database and rules engine services
docker-compose up -d postgres rules-engine

# Follow logs
docker-compose logs -f postgres rules-engine
```

### **Option 2: Local Development**

```bash
# Install dependencies
npm install

# Set up environment
cp backend/env.example backend/env.dev

# Start PostgreSQL (or use Docker)
docker-compose up postgres -d

# Run database migrations
cd backend && npx prisma migrate deploy

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev

# Start rules engine (in new terminal)
cd rules-engine && npm run dev
```

## 🗄️ Database Setup

### **Goodyear Mexico Sample Database**

The system includes a comprehensive sample database for testing:

```bash
# Database details
Database: goodyear_mexico_db
Schema: goodyear_mexico
User: goodyear_ai_user
Password: GoodyearAI2025!

# Connection details for campaign creation
Host: localhost
Port: 5432
Database: goodyear_mexico_db
Username: goodyear_ai_user
Password: GoodyearAI2025!
```

### **Sample Data Includes**
- **10 Salespeople** with varying performance levels
- **8 Months of Data** (Jan-Aug 2025)
- **Premium Line Focus** (99.66% of sales)
- **Campaign Goals Met**: 
  - Overall: >2,000,000 MXN ✅
  - Individual: 5 out of 10 exceed 200,000 MXN ✅

### **Setup Commands**

```bash
# Create and populate Goodyear database
docker exec -i incentiva-postgres psql -U incentiva -d incentiva_dev < backend/prisma/setup_goodyear_complete.sql
docker exec -i incentiva-postgres psql -U incentiva -d goodyear_mexico_db < backend/prisma/complete_goodyear_data_fixed.sql

# Add Goodyear participants to main system
docker exec -i incentiva-postgres psql -U incentiva -d incentiva_dev < backend/prisma/add_goodyear_participants.sql
```

## 🔧 Configuration

### **Environment Variables**

```bash
# docker-compose root .env (project root: incentiva/.env)
# These are injected into both app and rules-engine containers
ANTHROPIC_API_KEY=your_anthropic_key
TLP_API_KEY=your_tlp_api_key
TLP_ENDPOINT_URL=https://exata-customer.pravici.io
TLP_API_DOCUMENTATION_URL=https://www.dropbox.com/scl/fi/iejr38e2qsyrlu3eoiqy1/Pravici_TLP_API_Reference.pdf

# Backend (for local dev only, not used by docker-compose)
DATABASE_URL=postgresql://incentiva:incentiva@localhost:5432/incentiva_dev
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

#### Notes
- docker-compose reads environment variables from the project root `.env` (same directory as `docker-compose.yml`).
- Service names in compose: `postgres`, `app`, `rules-engine`.
- Rules Engine runs on Node.js 21.7.3 (base image `node:21.7.3-alpine`).
- Anthropic/TLP configuration is currently read from environment variables. The `ai_configurations` table exists for future DB-backed config.

### **Database Configuration**

```bash
# Main Application Database
Database: incentiva_dev
User: incentiva
Password: incentiva123
Port: 5432

# Goodyear Sample Database
Database: goodyear_mexico_db
User: goodyear_ai_user
Password: GoodyearAI2025!
Port: 5432
```

### **Troubleshooting**

#### Prisma P1000 (DB auth failed)

If you see `P1000: Authentication failed` from the app:

```bash
# Ensure compose uses the same credentials that Postgres expects
# docker-compose.yml uses: user=incentiva, password=incentiva123

# You can reset the password inside the Postgres container:
docker exec -it incentiva-postgres psql -U incentiva -d incentiva_dev -c "ALTER USER incentiva WITH PASSWORD 'incentiva123';"

# Then restart the app
docker-compose restart app
```

#### Build issues with shared package (TypeScript)

If TypeScript fails building `@incentiva/shared` due to mixed `.js` and `.ts` in `shared/src`, clean the compiled files:

```bash
cd shared && rm -rf src/*.js src/*.d.ts src/*.map dist/ tsconfig.tsbuildinfo && npm run build
```

## 📱 User Interface

### **Admin Dashboard**
- **User Management**: Create, edit, delete users and participants
- **Campaign Management**: View, edit, execute, and monitor campaigns
- **AI Model Configuration**: Manage AI service providers and API keys
- **System Settings**: Global configuration and preferences

### **Campaign Creation Wizard**
1. **Basic Information**: Name, description, dates
2. **Goals & Rewards**: Individual/overall goals, points allocation, **Total Points Minted**
3. **Eligibility & Rules**: Participant criteria and campaign rules
4. **TLP Configuration**: Pravici TLP API integration (auto-prefilled with default endpoint)
5. **Database Connection**: External database configuration
6. **Review & Create**: Final validation and campaign creation

### **Campaign Management Interface (NEW!)**
- **Campaign List**: Table view with status, progress, and action buttons
- **Execute Campaign**: Launch comprehensive campaign execution workflow
- **View Transactions**: Access transaction table and processing status
- **Manage Participants**: Assign and track campaign participants
- **Edit Campaign**: Modify campaign settings and rules

### **Campaign Execution Workflow (NEW!)**
- **7-Step Process**: Visual stepper showing execution progress
- **TLP Artifacts Table**: Complete record of all TLP API calls and responses
- **Transaction Schema Analysis**: AI-generated database understanding
- **SQL Artifacts**: One-time and incremental load scripts
- **Data Load Scheduling**: Automated processing configuration

### **Transaction Table (NEW!)**
- **Comprehensive View**: All campaign transactions with status tracking
- **Action Management**: Track all actions taken on each transaction
- **Response Logging**: Store TLP API calls and responses
- **JSON Metadata**: Rich transaction data with expandable details
- **Rules Engine Integration**: Background processing through AI-powered rules

### **Participant Dashboard**
- **My Campaigns**: Enrolled campaigns and progress
- **Redemption Options**: Available rewards and point values
- **Transaction History**: Complete point accrual and redemption log

## 🔌 API Endpoints

### **Main Application API**
```http
# Authentication
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile

# Campaigns
GET /api/campaigns
POST /api/campaigns
GET /api/campaigns/:id
PUT /api/campaigns/:id
POST /api/campaigns/:id/execute
PATCH /api/campaigns/:id/status
DELETE /api/campaigns/:id

# Users
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
POST /api/users/:id/reset-password

# AI Services
POST /api/ai/analyze-schema
POST /api/ai/generate-rules
POST /api/ai/generate-code

# TLP Integration
POST /api/tlp/configure
GET /api/tlp/health
```

### **Rules Engine API (Port 3002)**
```http
# Health & Monitoring
GET /health
GET /health/detailed

# Rules Engine
POST /api/rules-engine/generate-rules
POST /api/rules-engine/analyze-schema
POST /api/rules-engine/generate-code
GET /api/rules-engine/campaign/:campaignId/rules
GET /api/rules-engine/campaign/:campaignId/schema
POST /api/rules-engine/test-rules

# Job Management
POST /api/jobs
GET /api/jobs/campaign/:campaignId
GET /api/jobs/:jobId
POST /api/jobs/:jobId/start
POST /api/jobs/:jobId/stop
PUT /api/jobs/:jobId
DELETE /api/jobs/:jobId

# Transaction Management
GET /api/transactions/campaign/:campaignId
GET /api/transactions/:transactionId
POST /api/transactions/:transactionId/retry
POST /api/transactions/:transactionId/process
GET /api/transactions/campaign/:campaignId/stats
GET /api/transactions/campaign/:campaignId/queue
```

## 🎨 Design System

### **Color Palette**
- **Primary**: #FF6B35 (Orange)
- **Secondary**: #FF8E53 (Light Orange)
- **Success**: #4CAF50 (Green)
- **Warning**: #FF9800 (Orange)
- **Error**: #F44336 (Red)

### **Typography**
- **Headings**: Roboto, bold weights
- **Body**: Roboto, regular weights
- **Monospace**: 'Courier New' for code

### **Components**
- **Material-UI**: Base component library
- **Custom Theme**: Incentiva-branded styling
- **Responsive Design**: Mobile-first approach

## 🚀 Development

### **Project Structure**
```
incentiva/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   │   ├── CampaignsPage.tsx           # Campaign listing and management
│   │   │   ├── CreateCampaignPage.tsx      # Campaign creation wizard
│   │   │   ├── CampaignExecutionPage.tsx   # 🚀 NEW: Campaign execution workflow
│   │   │   └── TransactionTablePage.tsx    # 🚀 NEW: Transaction processing view
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── assets/         # Images and static files
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   │   └── campaignController.ts       # Enhanced with execution endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
│       ├── schema.prisma                   # Updated with totalPointsMinted
│       └── migrations/                     # Database schema evolution
├── rules-engine/            # Rules Engine Microservice
│   ├── src/
│   │   ├── controllers/    # Rules engine API endpoints
│   │   ├── services/       # AI, job, and transaction services
│   │   ├── middleware/     # Authentication and error handling
│   │   └── utils/          # Logging and utilities
│   ├── Dockerfile          # Container configuration
│   └── package.json        # Dependencies and scripts
├── shared/                  # Shared TypeScript types and utilities
│   └── src/
│       └── types.ts                        # Enhanced with new interfaces
├── docker-compose.yml       # Development environment
└── RULES_ENGINE_README.md   # 📚 Complete rules engine documentation
```

### **Development Commands**

```bash
# Frontend development
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend development
cd backend
npm run dev          # Start with nodemon
npm run build        # Build TypeScript
npm start           # Start production server

# Rules Engine development
cd rules-engine
npm run dev          # Start with ts-node-dev
npm run build        # Build TypeScript
npm start           # Start production server

# Database management
cd backend
npx prisma studio   # Database GUI
npx prisma migrate dev  # Create migration
npx prisma db seed     # Seed database
```

### **Code Quality**
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

## 🧪 Testing

### **Test Coverage**
- **Frontend**: React Testing Library + Jest
- **Backend**: Jest + Supertest
- **Rules Engine**: Jest + integration tests
- **Database**: Prisma test utilities
- **Integration**: End-to-end testing

### **Running Tests**
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Rules Engine tests
cd rules-engine && npm test

# All tests
npm run test:all
```

## 🚀 Deployment

### **Production Build**
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Build rules engine
cd rules-engine && npm run build

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

### **Environment Variables**
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=production-secret-key
ANTHROPIC_API_KEY=your_production_api_key
TLP_API_KEY=your_production_tlp_key
TLP_ENDPOINT_URL=https://exata-customer.pravici.io
TLP_API_DOCUMENTATION_URL=your_tlp_api_docs_url
```

## 📊 Monitoring & Logging

### **Health Checks**
- **Frontend**: Built-in React error boundaries
- **Backend**: `/health` endpoint
- **Rules Engine**: `/health` and `/health/detailed` endpoints
- **Database**: Connection pool monitoring
- **AI Services**: API availability checks

### **Logging**
- **Structured Logging**: JSON format for production
- **Log Levels**: Error, Warn, Info, Debug
- **Log Rotation**: Daily log files with compression
- **Rules Engine**: Dedicated logging with Winston

## 🔒 Security

### **Authentication**
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request throttling
- **CORS**: Cross-origin resource sharing

### **Data Protection**
- **Input Validation**: Zod schema validation
- **SQL Injection**: Prisma ORM protection
- **XSS Prevention**: React built-in protection
- **HTTPS**: SSL/TLS encryption

## 🗺️ Roadmap

### **Phase 1: Core Platform** ✅
- [x] User authentication and management
- [x] Campaign creation and management
- [x] Basic TLP integration
- [x] Database connectivity

### **Phase 2: AI Integration** ✅
- [x] Anthropic Claude integration
- [x] Schema analysis and mapping
- [x] Rule generation
- [x] Code generation and microservices
- [x] Complete Rules Engine Implementation

### **Phase 3: Campaign Execution System** ✅
- [x] **NEW: 7-Step Campaign Execution Workflow**
- [x] **NEW: TLP Artifacts Creation and Management**
- [x] **NEW: Transaction Schema Analysis**
- [x] **NEW: SQL Artifacts Generation**
- [x] **NEW: Data Load Scheduling**
- [x] **NEW: Transaction Table with Processing**
- [x] **NEW: Total Points Minted Field**
- [x] **NEW: Enhanced Campaign Management Interface**

### **Phase 4: Advanced Features** 🚧
- [x] Real-time campaign monitoring
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] API marketplace

### **Phase 5: Enterprise Features** 📋
- [ ] Advanced security and compliance
- [ ] Performance optimization
- [ ] Scalability improvements
- [ ] Enterprise integrations

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### **Code Standards**
- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for functions
- Maintain test coverage above 80%

## 📞 Support

### **Documentation**
- **Main README**: This comprehensive overview
- **Rules Engine**: [Complete Rules Engine Documentation](RULES_ENGINE_README.md)
- **API Reference**: `/api/docs` (when implemented)
- **User Guide**: Comprehensive documentation
- **Developer Guide**: Technical implementation details

### **Community**
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for detailed guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pravici TLP**: Loyalty program execution platform
- **Anthropic**: Claude AI model integration
- **Material-UI**: React component library
- **Prisma**: Database ORM and tools

---

## 🎉 **System Status: Complete Campaign Execution System!**

Your Incentiva system now includes:

✅ **Core Platform**: User management, campaign creation, TLP integration  
✅ **AI Integration**: Schema analysis, rule generation, code creation  
✅ **Rules Engine**: Complete microservice for campaign execution  
✅ **🚀 Campaign Execution System**: 7-step workflow with TLP integration  
✅ **Transaction Processing**: Real-time transaction table and processing  
✅ **Enhanced UI**: Comprehensive campaign management interface  
✅ **Sample Database**: Goodyear Mexico with 6.3M MXN sales data  
✅ **Documentation**: Comprehensive guides and API references  

**Ready to revolutionize your loyalty campaigns with AI-powered intelligence and complete execution workflows! 🚀**

**Next Steps:**
1. Read the [Rules Engine Documentation](RULES_ENGINE_README.md)
2. Configure your Anthropic API key and TLP credentials
3. Create campaigns with the new Total Points Minted field
4. Execute campaigns through the comprehensive 7-step workflow
5. Monitor transactions and processing in real-time
6. Let AI generate and execute your loyalty programs automatically 