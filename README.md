# 🚀 Incentiva - AI-Powered Loyalty Campaign Management System

[![Node.js](https://img.shields.io/badge/Node.js-21.7-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue.svg)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

## 📋 Overview

Incentiva is a comprehensive AI-powered loyalty campaign management platform that enables businesses to create, manage, and execute sophisticated loyalty programs. The system integrates with Pravici TLP for point management and uses AI models (Anthropic Claude, OpenAI GPT, Google Gemini) for intelligent campaign rule generation and execution.

## ✨ Key Features

### 🎯 **Campaign Management**
- **Multi-Step Campaign Creation**: 6-step wizard for comprehensive campaign setup
- **Points Allocation System**: Configurable points per value, bonuses, and currency support
- **Goal Management**: Individual and overall campaign goals with multiple currency support
- **Eligibility Rules**: Custom criteria for participant qualification
- **Rewards Configuration**: Detailed redemption options and point values
- **Campaign Lifecycle**: Draft → Review → Execute → Monitor workflow

### 🤖 **AI Integration**
- **Schema Analysis**: AI-powered database schema understanding and mapping
- **Rule Generation**: Natural language to executable campaign rules
- **Code Generation**: Automated microservice creation for campaign execution
- **Multi-Model Support**: Anthropic Claude, OpenAI GPT, Google Gemini
- **Intelligent Processing**: Automated point allocation and goal tracking

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

## 🏗️ Architecture

### **Frontend (React 18 + TypeScript)**
- **UI Framework**: Material-UI with custom theme
- **State Management**: Zustand for local state, React Query for server state
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router with protected routes
- **Real-Time**: WebSocket integration for live updates

### **Backend (Node.js + Express + TypeScript)**
- **API Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with JWT tokens
- **Database ORM**: Prisma with PostgreSQL
- **Validation**: Zod schema validation
- **Rate Limiting**: Express rate limit protection

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

# Start the system
docker-compose up --build -d

# Wait for services to be healthy
docker-compose ps

# Access the application
open http://localhost:3001
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
# Backend (.env)
DATABASE_URL=postgresql://incentiva:incentiva@localhost:5432/incentiva_dev
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
```

### **Database Configuration**

```bash
# Main Application Database
Database: incentiva_dev
User: incentiva
Password: incentiva
Port: 5432

# Goodyear Sample Database
Database: goodyear_mexico_db
User: goodyear_ai_user
Password: GoodyearAI2025!
Port: 5432
```

## 📱 User Interface

### **Admin Dashboard**
- **User Management**: Create, edit, delete users and participants
- **Campaign Management**: View, edit, and execute campaigns
- **AI Model Configuration**: Manage AI service providers and API keys
- **System Settings**: Global configuration and preferences

### **Campaign Creation Wizard**
1. **Basic Information**: Name, description, dates
2. **Goals & Rewards**: Individual/overall goals, points allocation
3. **Eligibility & Rules**: Participant criteria and campaign rules
4. **TLP Configuration**: Pravici TLP API integration
5. **Database Connection**: External database configuration
6. **Review & Create**: Final validation and campaign creation

### **Participant Dashboard**
- **My Campaigns**: Enrolled campaigns and progress
- **Redemption Options**: Available rewards and point values
- **Transaction History**: Complete point accrual and redemption log

## 🔌 API Endpoints

### **Authentication**
```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### **Campaigns**
```http
GET /api/campaigns
POST /api/campaigns
GET /api/campaigns/:id
PUT /api/campaigns/:id
POST /api/campaigns/:id/execute
DELETE /api/campaigns/:id
```

### **Users**
```http
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
POST /api/users/:id/reset-password
```

### **AI Services**
```http
POST /api/ai/analyze-schema
POST /api/ai/generate-rules
POST /api/ai/generate-code
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
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── assets/         # Images and static files
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
├── shared/                  # Shared TypeScript types and utilities
└── docker-compose.yml       # Development environment
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
- **Database**: Prisma test utilities
- **Integration**: End-to-end testing

### **Running Tests**
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

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

# Start production
docker-compose -f docker-compose.prod.yml up -d
```

### **Environment Variables**
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=production-secret-key
```

## 📊 Monitoring & Logging

### **Health Checks**
- **Application**: `/health` endpoint
- **Database**: Connection pool monitoring
- **AI Services**: API availability checks

### **Logging**
- **Structured Logging**: JSON format for production
- **Log Levels**: Error, Warn, Info, Debug
- **Log Rotation**: Daily log files with compression

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

### **Phase 2: AI Integration** 🚧
- [x] Anthropic Claude integration
- [x] Schema analysis and mapping
- [x] Rule generation
- [ ] Code generation and microservices

### **Phase 3: Advanced Features** 📋
- [ ] Real-time campaign monitoring
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] API marketplace

### **Phase 4: Enterprise Features** 📋
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

**Built with ❤️ for modern loyalty program management**

**Ready to revolutionize your loyalty campaigns with AI! 🚀** 