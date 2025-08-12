# Incentiva - Complete Campaign Execution System

## 🎯 Overview

Incentiva is a **complete loyalty campaign management and execution system** that transforms natural language business rules into automated transaction processing workflows. The system automatically generates database schemas, executable JSON rules, and TLP API integrations to process customer transactions and allocate loyalty points.

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

## 🏗️ Architecture

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
- **Total Points Minted for Campaign** (NEW!)
- Points per dollar, point values, currencies
- Individual and overall goal bonuses

### **Step 3: Eligibility & Rules**
- Natural language rule definition
- AI-powered rule analysis and validation
- Database connection configuration

### **Step 4: TLP Configuration**
- API keys and endpoint URLs
- **Automatically prefilled from environment** (NEW!)
- TLP API documentation URL integration

### **Step 5: Review & Create**
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

## 🔌 API Endpoints

### **Campaigns**
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `PATCH /api/campaigns/:id/status` - Update campaign status

### **TLP Integration**
- `POST /api/tlp/point-types` - Create TLP point type
- `POST /api/tlp/point-issues` - Mint campaign points
- `POST /api/tlp/accruals` - Create accrual offers
- `POST /api/tlp/redemptions` - Create redemption offers
- `POST /api/tlp/members` - Create TLP members

### **Rules Engine**
- `POST /api/rules/generate` - Generate rules from natural language
- `POST /api/rules/validate` - Validate generated rules
- `POST /api/rules/execute` - Execute rules against transactions

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
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  external_id VARCHAR(255),
  external_type VARCHAR(100),
  transaction_data JSONB, -- Flexible JSON schema
  status VARCHAR(50),
  processing_priority INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
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

From natural language rules to automated TLP integration, the system handles the entire lifecycle of loyalty campaigns with AI-powered automation and real-time transaction processing. 