# Incentiva Loyalty Campaign Management System

A comprehensive, AI-powered platform for creating, managing, and executing loyalty campaigns with real-time participant tracking and TLP integration.

## 🚀 Features

### Core Campaign Management
- **Multi-Step Campaign Creation**: Comprehensive 5-step campaign setup process
- **Multi-Currency Support**: Individual and overall goals in MXN, USD, EUR, BRL, and more
- **AI-Powered Rule Generation**: Natural language campaign criteria processing
- **Real-Time Progress Tracking**: Live updates on campaign performance and participant progress
- **TLP Integration**: Seamless connection with Pravici TLP for point management

### Administration & Control
- **AI Model Management**: Support for Anthropic Claude, OpenAI GPT, Google Gemini, and Azure OpenAI
- **User Management**: Complete user lifecycle with password reset functionality
- **Participant Assignment**: Multi-select participant management for campaigns
- **System Configuration**: Global settings and notification preferences
- **Role-Based Access Control**: Admin and Participant role management

### Participant Experience
- **Personal Dashboard**: Campaign enrollment and progress tracking
- **Points Management**: Real-time balance, earning history, and redemption options
- **In-Portal Redemption**: Direct redemption processing from the participant dashboard
- **Transaction History**: Complete accrual and redemption transaction logs
- **Campaign Analytics**: Individual goal progress and performance metrics

### Database Integration
- **Customer Database Connection**: Read-only integration with customer sales systems
- **Schema Analysis**: AI-powered understanding of customer database structures
- **Sample Data**: Complete Goodyear Mexico sales database with 6 months of realistic data
- **Campaign Goal Alignment**: Data structured to meet individual (200,000 MXN) and overall (2,000,000 MXN) goals

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI, Vite, Zustand, React Query
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Authentication**: Passport.js, JWT, OAuth (Google, Microsoft), bcrypt
- **Real-Time**: Socket.io for live updates and notifications
- **AI Integration**: Claude 3.5 Sonnet, OpenAI GPT, Google Gemini, Azure OpenAI
- **Containerization**: Docker, Docker Compose for development and production

### Project Structure
```
incentiva/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   │   ├── CreateCampaignPage.tsx    # Multi-step campaign creation
│   │   │   ├── AdminPage.tsx             # Administration panel
│   │   │   ├── ParticipantDashboardPage.tsx # Participant views
│   │   │   └── ...         # Other pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # API endpoint controllers
│   │   ├── services/       # Business logic services
│   │   │   ├── aiService.ts        # AI integration service
│   │   │   └── tlpService.ts       # TLP API integration
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   └── prisma/             # Database schema and migrations
│       └── goodyear_sample_schema.sql  # Sample customer database
├── shared/                  # Shared types and utilities
│   └── src/
│       ├── types.ts        # Common TypeScript interfaces
│       └── utils.ts        # Shared utility functions
└── docker-compose.yml       # Development environment setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 21.7+ (recommended)
- Docker and Docker Compose
- PostgreSQL database
- AI API keys (Anthropic, OpenAI, etc.)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd incentiva
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp backend/env.example backend/.env
   # Edit .env with your database and API credentials
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL
   docker-compose up -d postgres
   
   # Run migrations
   cd backend
   npx prisma migrate dev
   npx prisma generate
   
   # Seed sample data
   npx prisma db seed
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend
   npm run dev:frontend
   
   # Terminal 3: Shared package
   npm run dev:shared
   ```

### Docker Setup

1. **Start All Services**
   ```bash
   docker-compose up -d
   ```

2. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Database: localhost:5432

## 📊 Sample Campaign: Goodyear Mexico

### Campaign Configuration
- **Name**: Premium Line Sales Campaign
- **Period**: January 2025 - June 2025
- **Individual Goal**: 200,000 MXN per salesperson
- **Overall Goal**: 2,000,000 MXN total
- **Focus**: Premium Line tire sales

### Sample Database Features
- **10 Salespeople** across Mexico regions
- **10 Major Customers** (AutoZone, O'Reilly, NAPA, etc.)
- **6 Months of Sales Data** with realistic patterns
- **Premium Line Focus** to meet campaign objectives
- **Performance Variability** ensuring realistic goal achievement

## 🔧 API Endpoints

### Campaign Management
```
POST   /api/campaigns              # Create new campaign
GET    /api/campaigns              # List all campaigns
GET    /api/campaigns/:id          # Get campaign details
PUT    /api/campaigns/:id          # Update campaign
DELETE /api/campaigns/:id          # Delete campaign
POST   /api/campaigns/:id/execute  # Execute campaign
GET    /api/campaigns/:id/progress # Get campaign progress
```

### Participant Management
```
POST   /api/campaigns/:id/participants     # Add participants
GET    /api/campaigns/:id/participants     # List participants
DELETE /api/campaigns/:id/participants/:userId # Remove participant
```

### AI Services
```
POST   /api/ai/analyze-schema     # Analyze customer database
POST   /api/ai/generate-rules     # Generate campaign rules
POST   /api/ai/validate-criteria  # Validate eligibility criteria
```

### TLP Integration
```
GET    /api/tlp/point-balance     # Get user point balance
GET    /api/tlp/offers            # List redemption offers
POST   /api/tlp/redemptions       # Process redemption
GET    /api/tlp/transactions      # Get transaction history
```

## 🎨 Design System

### UI Components
- **Material-UI Integration**: Consistent design language
- **Responsive Layout**: Mobile-first approach
- **Theme Customization**: Brand-specific color schemes
- **Accessibility**: WCAG 2.1 AA compliance

### User Experience
- **Intuitive Navigation**: Clear information architecture
- **Progressive Disclosure**: Step-by-step complex processes
- **Real-Time Feedback**: Immediate user response
- **Error Handling**: Graceful failure management

## 🔒 Security Features

### Authentication & Authorization
- **Multi-Provider OAuth**: Google, Microsoft integration
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Admin vs. Participant permissions
- **Password Security**: bcrypt hashing, rate limiting

### Data Protection
- **API Key Encryption**: Secure storage of external API credentials
- **Database Security**: Read-only access to customer databases
- **Input Validation**: Zod schema validation throughout
- **Audit Logging**: Complete operation tracking

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing

### Quality Assurance
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

## 🚀 Deployment

### Production Environment
- **Docker Containers**: Consistent deployment
- **Environment Variables**: Secure configuration
- **Health Checks**: Application monitoring
- **Logging**: Centralized log management

### CI/CD Pipeline
- **Automated Testing**: Build validation
- **Security Scanning**: Vulnerability detection
- **Deployment Automation**: Zero-downtime updates
- **Rollback Capability**: Quick recovery

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Campaign creation and management
- ✅ Participant dashboard and tracking
- ✅ AI model configuration
- ✅ Sample database integration

### Phase 2 (Next)
- 🔄 Backend API integration
- 🔄 Real TLP API connection
- 🔄 AI-powered rule generation
- 🔄 Database schema analysis

### Phase 3 (Future)
- 📋 Advanced analytics and reporting
- 📋 Machine learning optimization
- 📋 Multi-tenant architecture
- 📋 Mobile application

## 🤝 Contributing

### Development Guidelines
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: TypeScript, ESLint, Prettier
4. **Write tests**: Ensure coverage for new functionality
5. **Submit a pull request**: Detailed description of changes

### Code Standards
- **TypeScript**: Strict mode enabled
- **React Hooks**: Functional components with hooks
- **Error Handling**: Comprehensive error management
- **Documentation**: JSDoc comments for all functions

## 📞 Support

### Getting Help
- **Documentation**: Comprehensive guides and examples
- **Issues**: GitHub issue tracking
- **Discussions**: Community support forum
- **Email**: Direct support contact

### Community
- **Contributors**: Open source collaboration
- **Feedback**: Feature requests and improvements
- **Showcase**: Share your campaign success stories

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI**: Component library and design system
- **Prisma**: Database toolkit and ORM
- **Anthropic**: AI model integration
- **Pravici**: TLP integration platform

---

**Incentiva.me** - Transforming loyalty campaigns with AI-powered intelligence and real-time engagement.

*Built with ❤️ for the future of customer loyalty management.* 