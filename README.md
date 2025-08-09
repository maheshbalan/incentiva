# Incentiva Loyalty Campaign Management System

A comprehensive AI-powered loyalty campaign management platform that integrates with Pravici TLP APIs to create, manage, and execute sophisticated loyalty programs.

## 🎨 Design Philosophy

Built with **Bauhaus-inspired design principles** featuring:
- **Geometric simplicity** with clean lines and structured layouts
- **Functional aesthetics** prioritizing usability and clarity
- **Incentiva branding** with a sophisticated color palette
- **Modern typography** using Inter font family
- **Gradient accents** and subtle shadows for depth

## 🚀 Features

### Core Functionality
- **AI-Powered Campaign Design** - Natural language campaign definition
- **Schema Analysis** - AI-driven database schema understanding
- **Rules Engine** - Automatic code generation for campaign execution
- **TLP Integration** - Complete Pravici TLP API integration
- **Real-time Monitoring** - Live campaign progress tracking
- **Multi-language Support** - English, Portuguese, Spanish

### User Interfaces
- **Admin Dashboard** - Campaign creation and management
- **Participant Dashboard** - Progress tracking and redemption
- **Responsive Design** - Mobile-first approach
- **Bauhaus Styling** - Modern, clean interface

### Authentication & Security
- **Multi-provider OAuth** - Google, Microsoft integration
- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Admin vs Participant roles
- **Encrypted Storage** - Secure data handling

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **AI Integration**: Claude 3.5 Sonnet
- **Real-time**: Socket.io + WebSocket
- **Authentication**: Passport.js + JWT

### Project Structure
```
incentiva-system/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
├── shared/            # Shared types and utilities
├── package.json       # Root workspace configuration
└── README.md          # This file
```

## 🛠️ Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database
- Redis (for queues and caching)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd incentiva-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   cd backend && npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

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

# Redis
REDIS_URL="redis://localhost:6379"

# TLP API Configuration
TLP_DEFAULT_ENDPOINT="https://exata-customer.pravici.io"
TLP_DEFAULT_API_KEY="your-default-tlp-api-key"
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Campaign Management
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/approve` - Approve campaign
- `POST /api/campaigns/:id/execute` - Execute campaign

### Schema & Rules
- `POST /api/campaigns/:id/schema` - Upload schema
- `POST /api/campaigns/:id/rules` - Generate rules
- `GET /api/campaigns/:id/schema` - Get schema analysis

### Participant Features
- `GET /api/participants/campaigns` - User campaigns
- `GET /api/participants/:campaignId/progress` - Progress tracking
- `GET /api/participants/:campaignId/offers` - Available offers
- `POST /api/participants/:campaignId/redeem` - Redeem points

### TLP Integration
- `POST /api/tlp/configure` - Configure TLP API
- `GET /api/tlp/health` - Health check
- `POST /api/tlp/generate-graphics` - Generate offer graphics

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

## 🔄 Development Workflow

### Available Scripts
```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Building
npm run build            # Build all packages
npm run build:frontend   # Build frontend
npm run build:backend    # Build backend

# Testing
npm run test             # Run all tests
npm run test:frontend    # Test frontend
npm run test:backend     # Test backend

# Linting
npm run lint             # Lint all packages
npm run lint:frontend    # Lint frontend
npm run lint:backend     # Lint backend

# Database
npm run setup:db         # Setup database
npm run migrate          # Run migrations
npm run seed             # Seed data
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test
```

### Frontend Testing
```bash
cd frontend
npm run test
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
```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] React frontend with TypeScript
- [x] Express backend with TypeScript
- [x] PostgreSQL database with Prisma
- [x] Authentication system
- [x] Basic UI components

### Phase 2: Admin Dashboard 🚧
- [x] Campaign creation interface
- [x] Schema upload and analysis
- [x] TLP configuration
- [ ] Campaign management workflow
- [ ] Real-time progress monitoring

### Phase 3: Rules Engine 🚧
- [x] AI service integration
- [x] Schema analysis
- [x] Natural language processing
- [ ] Code generation
- [ ] TLP API integration

### Phase 4: Participant Dashboard 📋
- [ ] Participant authentication
- [ ] Progress visualization
- [ ] Point balance tracking
- [ ] Redemption interface
- [ ] Real-time updates

### Phase 5: AI Recommendations 📋
- [ ] Campaign recommendations
- [ ] Performance analytics
- [ ] Learning system
- [ ] Optimization features

### Phase 6: Testing & Deployment 📋
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

---

**Incentiva** - Empowering loyalty campaigns through AI-driven innovation. 