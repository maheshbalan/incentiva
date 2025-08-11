# Incentiva - AI-Powered Loyalty Campaign Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-username/incentiva)
[![Node.js](https://img.shields.io/badge/node-21.7-blue)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Overview

Incentiva is a comprehensive, AI-powered loyalty campaign management platform that enables businesses to create, manage, and execute sophisticated loyalty programs. Built with modern technologies and integrated with Pravici TLP (Transaction Loyalty Platform), it provides a seamless experience for both administrators and participants.

## ✨ Key Features

### 🎯 **Campaign Management**
- **Multi-Step Campaign Creation**: Intuitive wizard for setting up comprehensive loyalty campaigns
- **Multi-Currency Goals**: Support for individual and overall campaign goals in multiple currencies (MXN, USD, EUR, etc.)
- **AI-Powered Rule Generation**: Natural language campaign definition with intelligent rule generation
- **TLP Integration**: Seamless integration with Pravici TLP for point allocation and redemption

### 🤖 **AI Integration**
- **Multiple AI Providers**: Support for Anthropic Claude, OpenAI GPT, Google Gemini, and Azure OpenAI
- **Intelligent Campaign Rules**: AI-generated campaign rules based on natural language descriptions
- **Schema Analysis**: Automated database schema understanding and campaign rule generation
- **Configurable Models**: Easy switching between AI providers with API key management

### 👥 **User Management & Roles**
- **Role-Based Access Control**: Admin and Participant roles with appropriate permissions
- **User Administration**: Create, edit, and manage user accounts
- **Password Reset**: Secure password reset functionality for administrators
- **Participant Assignment**: Multi-selection participant assignment to campaigns

### 📊 **Participant Experience**
- **Personal Dashboard**: Comprehensive view of enrolled campaigns and progress
- **Point Tracking**: Real-time point balance and transaction history
- **Redemption Portal**: In-app redemption of points for various rewards
- **Progress Monitoring**: Visual progress indicators and goal achievement tracking

### 🏗️ **Technical Architecture**
- **Modern Tech Stack**: React 18, TypeScript, Material-UI, Node.js, Express
- **Database**: PostgreSQL with Prisma ORM and automated migrations
- **Containerization**: Docker and Docker Compose for easy deployment
- **Real-time Updates**: WebSocket integration for live campaign progress
- **Security**: JWT authentication, rate limiting, and secure API endpoints

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: React 18, TypeScript, Material-UI, Vite, Zustand, React Query
- **Backend**: Node.js 21.7, Express, TypeScript, Prisma ORM, Passport.js
- **Database**: PostgreSQL 15 with automated migrations
- **AI Services**: Claude 3.5 Sonnet, GPT-4, Gemini, Azure OpenAI
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT, OAuth 2.0 (Google, Microsoft), bcrypt

### **Project Structure**
```
incentiva/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── assets/         # Static assets (logos, images)
│   └── dist/               # Built frontend assets
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # API route controllers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── public/             # Served frontend assets
├── shared/                  # Shared types and utilities
│   └── src/
│       ├── types.ts        # TypeScript interfaces
│       └── utils.ts        # Shared utility functions
└── docker-compose.yml      # Container orchestration
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 21.7+ (use `nvm install 21.7` and `nvm use 21.7`)
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### **Option 1: Docker (Recommended)**
```bash
# Clone the repository
git clone https://github.com/your-username/incentiva.git
cd incentiva

# Start the system
docker-compose up --build -d

# Access the application
open http://localhost:3001
```

### **Option 2: Local Development**
```bash
# Install dependencies
npm install

# Build shared package
npm run build:shared

# Start backend
cd backend && npm run dev

# Start frontend (in new terminal)
cd frontend && npm run dev
```

## ⚙️ Configuration

### **Environment Variables**
Create `.env` files in the backend directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/incentiva_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# AI Services
ANTHROPIC_API_KEY="your-claude-api-key"
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_API_KEY="your-gemini-api-key"

# TLP Integration
TLP_DEFAULT_API_KEY="your-tlp-api-key"
TLP_DEFAULT_ENDPOINT="https://your-tlp-endpoint.com"
```

### **Docker Configuration**
- **Development**: `docker-compose.dev.yml`
- **Production**: `docker-compose.yml`
- **Custom**: Modify environment variables in docker-compose files

## 📚 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
GET  /api/auth/profile        # Get user profile
POST /api/auth/logout         # User logout
```

### **Campaign Management**
```http
POST   /api/campaigns                    # Create campaign
GET    /api/campaigns                    # List campaigns
GET    /api/campaigns/:id               # Get campaign details
PUT    /api/campaigns/:id               # Update campaign
DELETE /api/campaigns/:id               # Delete campaign
POST   /api/campaigns/:id/execute       # Execute campaign
POST   /api/campaigns/:id/allocate      # Allocate points
```

### **AI Services**
```http
POST /api/ai/analyze-schema            # Analyze database schema
POST /api/ai/generate-rules            # Generate campaign rules
POST /api/ai/validate-campaign         # Validate campaign configuration
```

### **TLP Integration**
```http
POST /api/tlp/point-types              # Create point type
POST /api/tlp/offers                   # Create redemption offer
POST /api/tlp/transactions             # Record point transaction
GET  /api/tlp/balances                 # Get point balances
```

## 🎨 Design System

### **Color Palette**
- **Primary**: #FF6B35 (Incentiva Orange)
- **Secondary**: #FF8E53 (Light Orange)
- **Accent**: #FFAB71 (Warm Yellow)
- **Neutral**: #2E3440 (Dark Gray)
- **Background**: #ECEFF4 (Light Gray)

### **Typography**
- **Headings**: Inter, 700 weight
- **Body**: Inter, 400 weight
- **Monospace**: JetBrains Mono for code

### **Components**
- **Material-UI**: Base component library
- **Custom**: Incentiva-specific components with consistent styling
- **Responsive**: Mobile-first design approach

## 🔧 Development

### **Available Scripts**
```bash
# Root level
npm run build              # Build all packages
npm run dev                # Start development environment
npm run test               # Run tests
npm run lint               # Lint code
npm run format             # Format code

# Frontend
npm run build:frontend     # Build frontend only
npm run dev:frontend       # Start frontend dev server

# Backend
npm run build:backend      # Build backend only
npm run dev:backend        # Start backend dev server

# Shared
npm run build:shared       # Build shared package
```

### **Code Quality**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### **Testing Strategy**
- **Unit Tests**: Jest for backend, Vitest for frontend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user journey testing
- **Coverage**: Minimum 80% code coverage

## 🚀 Deployment

### **Production Build**
```bash
# Build production assets
npm run build:production

# Start production containers
docker-compose -f docker-compose.yml up -d
```

### **Environment-Specific Configs**
- **Development**: `docker-compose.dev.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.yml`

### **Monitoring & Logging**
- **Application Logs**: Structured logging with Winston
- **Health Checks**: `/health` endpoint for monitoring
- **Metrics**: Prometheus metrics collection
- **Error Tracking**: Sentry integration

## 📈 Roadmap

### **Phase 1: Core Platform ✅**
- [x] User authentication and authorization
- [x] Campaign creation and management
- [x] Basic TLP integration
- [x] AI-powered rule generation
- [x] Participant dashboard

### **Phase 2: Advanced Features 🚧**
- [ ] Real-time campaign monitoring
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced AI features

### **Phase 3: Enterprise Features 📋**
- [ ] Multi-tenant architecture
- [ ] Advanced security features
- [ ] API rate limiting and quotas
- [ ] Enterprise SSO integration
- [ ] Advanced reporting and analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Standards**
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check this README and the `/docs` folder
- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions on GitHub
- **Email**: support@incentiva.me

### **Community**
- **GitHub**: [github.com/your-username/incentiva](https://github.com/your-username/incentiva)
- **Discord**: [Join our Discord server](https://discord.gg/incentiva)
- **Twitter**: [@IncentivaApp](https://twitter.com/IncentivaApp)

## 🙏 Acknowledgments

- **Pravici**: For TLP integration and loyalty platform expertise
- **Anthropic**: For Claude AI integration
- **OpenAI**: For GPT integration
- **Material-UI**: For the excellent component library
- **Community**: All contributors and users of Incentiva

---

**Made with ❤️ by the Incentiva Team**

*Empowering businesses to create meaningful loyalty experiences through AI-powered campaign management.* 