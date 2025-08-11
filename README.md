# Incentiva Loyalty Campaign Management System

A comprehensive AI-powered loyalty campaign management platform that integrates with Pravici TLP APIs to create, manage, and execute sophisticated loyalty programs. Built with modern web technologies and containerized deployment support.

## 🎨 Design Philosophy

Built with **Bauhaus-inspired design principles** featuring:
- **Geometric simplicity** with clean lines and structured layouts
- **Functional aesthetics** prioritizing usability and clarity
- **Incentiva branding** with a sophisticated color palette
- **Modern typography** using Inter font family
- **Gradient accents** and subtle shadows for depth

## 🚀 Features

### Core Functionality
- **AI-Powered Campaign Design** - Natural language campaign definition using Claude 3.5 Sonnet
- **Schema Analysis** - AI-driven database schema understanding and optimization
- **Rules Engine** - Automatic code generation for campaign execution
- **TLP Integration** - Complete Pravici TLP API integration for loyalty program execution
- **Real-time Monitoring** - Live campaign progress tracking with WebSocket support
- **Multi-language Support** - English, Portuguese, Spanish localization ready

### User Interfaces
- **Admin Dashboard** - Comprehensive campaign creation and management interface
- **Participant Dashboard** - Progress tracking and redemption interface
- **Responsive Design** - Mobile-first approach with Material-UI components
- **Bauhaus Styling** - Modern, clean interface with consistent design language

### Authentication & Security
- **Multi-provider OAuth** - Google, Microsoft integration with Passport.js
- **JWT Authentication** - Secure token-based authentication system
- **Role-based Access Control** - Admin vs Participant role management
- **Encrypted Storage** - Secure data handling with bcrypt password hashing
- **Rate Limiting** - API protection with express-rate-limit

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL 15 with automated migrations
- **AI Integration**: Claude 3.5 Sonnet via Anthropic API
- **Real-time**: Socket.io + WebSocket for live updates
- **Authentication**: Passport.js + JWT + OAuth providers
- **State Management**: Zustand for frontend, React Query for server state
- **Validation**: Zod schema validation throughout the stack
- **Containerization**: Docker + Docker Compose for deployment

### Project Structure
```
incentiva/
├── frontend/          # React TypeScript frontend with Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── main.tsx       # Application entry point
│   └── package.json
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── shared/            # Shared TypeScript types and utilities
│   ├── src/
│   │   ├── types.ts       # Common type definitions
│   │   └── utils.ts       # Shared utility functions
│   └── package.json
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
├── DOCKER_README.md        # Docker-specific documentation
└── package.json            # Root workspace configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** database (or use Docker container)
- **Redis** (optional, for Bull queues and caching)

### Quick Start

#### Option 1: Local Development (Recommended for developers)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd incentiva
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   # At minimum, set DATABASE_URL and JWT_SECRET
   ```

4. **Set up the database**
   ```bash
   # Option A: Use Docker for PostgreSQL only
   npm run docker:up
   
   # Option B: Use your local PostgreSQL
   # Update DATABASE_URL in backend/.env accordingly
   
   # Setup database schema and seed data
   npm run setup:db
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend    # Frontend on http://localhost:5173
   npm run dev:backend     # Backend on http://localhost:3001
   ```

#### Option 2: Full Docker Deployment

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd incentiva
   ```

2. **Build and start all services**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

3. **Access the application**
   - **Application**: http://localhost:3001
   - **Database**: localhost:5432
   - **Default Admin**: incentiva-admin@incentiva.me / exatatech

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/incentiva_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3001
NODE_ENV=development

# AI Service (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Redis (for Bull queues and caching)
REDIS_URL="redis://localhost:6379"

# TLP API Configuration
TLP_DEFAULT_ENDPOINT="https://exata-customer.pravici.io"
TLP_DEFAULT_API_KEY="your-default-tlp-api-key"

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
UPLOAD_PATH="./uploads"

# Logging
LOG_LEVEL="info"
```

### Docker Configuration

The project includes two Docker Compose configurations:

- **`docker-compose.yml`** - Production setup with full application stack
- **`docker-compose.dev.yml`** - Development setup with PostgreSQL only

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get authenticated user profile
- `POST /api/auth/logout` - User logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/microsoft` - Microsoft OAuth login

### Campaign Management
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns` - List all campaigns with pagination
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/approve` - Approve campaign for execution
- `POST /api/campaigns/:id/execute` - Execute campaign

### Schema & Rules Engine
- `POST /api/campaigns/:id/schema` - Upload database schema
- `POST /api/campaigns/:id/rules` - Generate campaign rules using AI
- `GET /api/campaigns/:id/schema` - Get schema analysis results
- `GET /api/campaigns/:id/rules` - Get generated rules

### Participant Features
- `GET /api/participants/campaigns` - Get user's available campaigns
- `GET /api/participants/:campaignId/progress` - Track campaign progress
- `GET /api/participants/:campaignId/offers` - View available offers
- `POST /api/participants/:campaignId/redeem` - Redeem points/offers

### TLP Integration
- `POST /api/tlp/configure` - Configure TLP API endpoints
- `GET /api/tlp/health` - Check TLP API health
- `POST /api/tlp/generate-graphics` - Generate offer graphics
- `POST /api/tlp/execute-campaign` - Execute campaign via TLP

### Health & Monitoring
- `GET /health` - Application health check
- `GET /api/status` - Detailed system status

## 🎨 Design System

### Color Palette
- **Primary**: `#2E3440` (Dark slate)
- **Secondary**: `#D08770` (Warm orange)
- **Success**: `#A3BE8C` (Green)
- **Warning**: `#EBCB8B` (Yellow)
- **Error**: `#BF616A` (Red)
- **Info**: `#81A1C1` (Blue)
- **Background**: `#ECEFF4` (Light gray)

### Typography
- **Font Family**: Inter
- **Weights**: 300, 400, 500, 600, 700
- **Letter Spacing**: Optimized for readability

### Components
- **Cards**: Subtle shadows with border accents
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Rounded inputs with focus states
- **Progress**: Custom styled progress indicators
- **Charts**: Material-UI X Charts integration

## 🔄 Development Workflow

### Available Scripts

#### Root Level Commands
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build all packages
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend
npm run build:shared     # Build shared package

# Testing
npm run test             # Run all tests
npm run test:frontend    # Test frontend
npm run test:backend     # Test backend
npm run test:shared      # Test shared package

# Linting
npm run lint             # Lint all packages
npm run lint:frontend    # Lint frontend
npm run lint:backend     # Lint backend
npm run lint:shared      # Lint shared package

# Database Operations
npm run setup:db         # Setup database (generate + push + seed)
npm run migrate          # Run database migrations
npm run seed             # Seed database with initial data

# Docker Operations
npm run docker:build     # Build Docker images
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:restart   # Restart services
npm run docker:logs      # View service logs
npm run docker:clean     # Clean up containers and volumes

# Utilities
npm run install:all      # Install dependencies for all packages
```

#### Package-Specific Commands
```bash
# Backend
cd backend
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database

# Frontend
cd frontend
npm run type-check       # TypeScript type checking
npm run preview          # Preview production build

# Shared
cd shared
npm run dev              # Watch mode for development
```

### Development Best Practices

1. **Type Safety**: Use TypeScript throughout the stack
2. **Code Quality**: Run linting before commits
3. **Testing**: Write tests for new functionality
4. **Database**: Use migrations for schema changes
5. **Environment**: Keep sensitive data in .env files
6. **Dependencies**: Use workspace dependencies for shared packages

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test             # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test             # Run Vitest tests
npm run test:ui          # UI test runner
npm run test:coverage    # Coverage report
```

### Shared Package Testing
```bash
cd shared
npm run test             # Run Jest tests
```

## 🚀 Deployment

### Production Build
```bash
# Build all packages
npm run build

# Start production server
cd backend && npm start
```

### Docker Deployment

#### Development Environment
```bash
# Start only PostgreSQL for local development
docker-compose -f docker-compose.dev.yml up -d

# Run application locally
npm run dev
```

#### Production Environment
```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

#### Docker Commands Reference
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up
docker-compose down -v && docker system prune -f
```

### Environment-Specific Configurations

The project supports multiple environments:
- **Development**: Local development with hot reloading
- **Production**: Optimized builds with Docker containers
- **Staging**: Production-like environment for testing

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm run install:all`
4. Set up environment variables
5. Create a feature branch: `git checkout -b feature/your-feature`
6. Make your changes following the coding standards
7. Add tests for new functionality
8. Ensure all tests pass: `npm run test`
9. Run linting: `npm run lint`
10. Commit your changes with descriptive messages
11. Push to your fork and submit a pull request

### Coding Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for public APIs
- Use conventional commit format

### Pull Request Process
1. Ensure all CI checks pass
2. Request review from maintainers
3. Address feedback and make necessary changes
4. Maintainers will merge after approval

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and DOCKER_README.md
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Reach out to the development team

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database
npm run docker:clean
npm run docker:up
npm run setup:db
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install:all
```

#### Docker Issues
```bash
# Clean everything and start fresh
npm run docker:clean
npm run docker:build
npm run docker:up
```

## 🔮 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] React frontend with TypeScript and Vite
- [x] Express backend with TypeScript and Prisma
- [x] PostgreSQL database with automated migrations
- [x] Authentication system with OAuth support
- [x] Basic UI components with Material-UI
- [x] Docker containerization
- [x] Shared package architecture

### Phase 2: Admin Dashboard 🚧
- [x] Campaign creation interface
- [x] Schema upload and analysis
- [x] TLP configuration
- [x] Campaign management workflow
- [ ] Real-time progress monitoring
- [ ] Advanced analytics dashboard

### Phase 3: Rules Engine 🚧
- [x] AI service integration (Claude 3.5 Sonnet)
- [x] Schema analysis and understanding
- [x] Natural language processing
- [x] Basic code generation
- [ ] Advanced TLP API integration
- [ ] Rule optimization and validation

### Phase 4: Participant Dashboard 📋
- [x] Participant authentication
- [ ] Progress visualization
- [ ] Point balance tracking
- [ ] Redemption interface
- [ ] Real-time updates via WebSocket

### Phase 5: AI Recommendations 📋
- [ ] Campaign performance analytics
- [ ] AI-driven optimization suggestions
- [ ] Learning system for campaign improvement
- [ ] Predictive analytics

### Phase 6: Testing & Deployment 📋
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit and penetration testing
- [ ] Production deployment automation
- [ ] Monitoring and alerting

### Phase 7: Advanced Features 📋
- [ ] Multi-tenant architecture
- [ ] Advanced reporting and analytics
- [ ] Integration marketplace
- [ ] Mobile applications
- [ ] API rate limiting and monetization

---

## 🎯 Quick Start Checklist

For developers getting started:

- [ ] Clone repository and install dependencies
- [ ] Set up environment variables
- [ ] Start PostgreSQL (Docker or local)
- [ ] Run database setup
- [ ] Start development servers
- [ ] Access application at http://localhost:3001
- [ ] Login with admin credentials
- [ ] Create your first campaign

## 📊 System Requirements

### Development
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Memory**: 4GB RAM minimum
- **Storage**: 2GB free space

### Production
- **Node.js**: 18.0.0 or higher
- **Memory**: 8GB RAM recommended
- **Storage**: 10GB free space
- **Database**: PostgreSQL 15 or higher
- **Redis**: 6.0 or higher (optional)

---

**Incentiva** - Empowering loyalty campaigns through AI-driven innovation and modern web technologies.

*Built with ❤️ using React, Node.js, TypeScript, and Docker* 