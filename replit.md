# Car Insurance Claims AI Prototype

## Overview

This is a React-based web application prototype for AI-powered car insurance claims assessment. The system allows claims agents to upload vehicle damage photos and receive automated damage analysis and cost estimations, streamlining the traditional manual review process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Build Tool**: Vite for frontend bundling, esbuild for backend bundling
- **Development**: tsx for TypeScript execution in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured but not yet implemented)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Current Storage**: In-memory storage implementation (MemStorage class)
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Database Schema
- **Users**: Basic user authentication structure
- **Claims**: Core claim information (claim number, policyholder, vehicle, status)
- **Damage Assessments**: AI-generated damage analysis with confidence scores
- **Cost Estimations**: Repair cost breakdowns and estimates
- **Uploaded Images**: Image metadata and storage references

### API Structure
- RESTful API endpoints for claims management
- Image upload functionality
- CRUD operations for all major entities
- Error handling middleware

### UI Components
- **Claims Dashboard**: Main interface for claim processing
- **Image Upload**: Drag-and-drop image upload component
- **Analysis Display**: Damage assessment and cost estimation views
- **Progress Tracking**: Visual indicators for claim processing status

## Data Flow

1. **Claim Initiation**: Claims agent accesses existing claim or creates new one
2. **Image Upload**: Agent uploads vehicle damage photos through the UI
3. **AI Processing**: System simulates AI analysis of uploaded images
4. **Results Display**: Damage assessment and cost estimation are presented
5. **Review Process**: Agent can review, modify, and approve estimates

## External Dependencies

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for icons
- Class Variance Authority for component variants

### Development Tools
- Vite with React plugin for development server
- TypeScript for type safety
- ESLint and Prettier (configured via package.json scripts)
- PostCSS with Autoprefixer

### Database and Storage
- Drizzle ORM for database operations
- Neon Database for serverless PostgreSQL
- pg (PostgreSQL client) for database connections

## Deployment Strategy

### Development
- Vite dev server for frontend hot reload
- tsx for TypeScript execution in development
- Express server serves both API and static files

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single deployment artifact with embedded static file serving

### Environment Configuration
- Database URL configuration via environment variables
- Development vs production mode switching
- Replit-specific plugins for development environment

### Current Limitations
- Using in-memory storage (MemStorage) instead of actual database
- AI functionality is mocked/simulated
- No authentication system implemented yet
- Image storage is handled via base64 encoding rather than file system

The architecture is designed to be easily extensible, with clear separation between frontend, backend, and data layers. The use of TypeScript throughout ensures type safety, while the component-based React architecture allows for easy UI modifications and extensions.