# Overview

InspiraNet Cakrawala is a modern digital attendance management system built for educational institutions. The application features a comprehensive student attendance form with real-time validation and an administrative dashboard for data management. The system implements glassmorphism design with floating animations and provides both student-facing attendance submission and admin-side data management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React 18** with **TypeScript** and follows a component-based architecture:

- **Routing**: Uses Wouter for lightweight client-side routing with two main routes:
  - `/` - Student attendance form
  - `/admin` - Administrative dashboard
- **State Management**: React Query (@tanstack/react-query) for server state management with automatic caching and synchronization
- **UI Framework**: Radix UI components with shadcn/ui design system providing accessible, customizable components
- **Styling**: Tailwind CSS with custom CSS variables for theming, featuring glassmorphism effects and dark theme
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The backend follows an **Express.js** server architecture with TypeScript:

- **Server Framework**: Express.js with custom middleware for logging and error handling
- **API Design**: RESTful API endpoints under `/api` namespace
- **Data Storage**: Flexible storage interface supporting both in-memory storage (development) and PostgreSQL (production)
- **Schema Management**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Simple credential-based admin authentication with bcrypt password hashing
- **Validation**: Server-side validation using Zod schemas shared between frontend and backend

## Data Storage Solutions

**Database Schema**:
- **attendance table**: Core attendance records with student information, contact details, school data, and branch selection
- **admin_users table**: Administrative user accounts with authentication credentials
- **activity_logs table**: Audit trail for administrative actions

**Storage Strategy**:
- Development: In-memory storage for rapid prototyping and testing
- Production: PostgreSQL with Neon Database serverless hosting
- Real-time features: Auto-sync every 10 seconds with optimistic updates
- Duplicate Prevention: Database constraints and validation for phone numbers, Instagram usernames, and name+school combinations

## Authentication and Authorization

**Admin Authentication**:
- Simple username/password authentication stored securely with bcrypt hashing
- Session-based authentication with secure cookie management
- Default admin credentials embedded in code for initial access
- Activity logging for audit trails of admin actions

**Security Measures**:
- Input validation and sanitization on both client and server
- SQL injection prevention through parameterized queries
- XSS protection through proper data encoding
- CSRF protection through SameSite cookie policies

## Design System

**Glassmorphism UI**:
- Backdrop blur effects with semi-transparent backgrounds
- CSS custom properties for consistent theming
- Animated floating orbs for visual engagement
- Responsive design optimized for mobile and desktop
- Smooth transitions and micro-interactions throughout the interface

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend UI library with hooks and concurrent features
- **Express.js**: Backend web server framework
- **TypeScript**: Type safety across the entire stack

## Database and ORM
- **Drizzle ORM**: Type-safe database toolkit with schema management
- **@neondatabase/serverless**: PostgreSQL serverless database driver
- **pg (PostgreSQL)**: Database connection and query execution

## UI and Styling
- **Radix UI**: Headless UI component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Form and Validation
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library shared between frontend and backend
- **@hookform/resolvers**: Integration layer for React Hook Form and Zod

## Data Fetching and State
- **@tanstack/react-query**: Server state management with caching
- **Wouter**: Lightweight client-side routing

## Development and Build Tools
- **Vite**: Build tool and development server
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server

## Authentication and Security
- **bcrypt**: Password hashing and verification
- **connect-pg-simple**: PostgreSQL session store for Express

## Data Visualization
- **Chart.js**: Interactive charts for attendance statistics
- **date-fns**: Date manipulation and formatting utilities

## Additional Utilities
- **clsx**: Conditional className utility
- **class-variance-authority**: Type-safe variant management for components
- **nanoid**: Unique ID generation for records