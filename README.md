<h1 align="center">HR System - Payroll Subsystem</h1>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-99. 6%25-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/NestJS-11.x-red" alt="NestJS">
  <img src="https://img.shields.io/badge/Next.js-15.x-black" alt="Next.js">
  <img src="https://img.shields.io/badge/MongoDB-8.x-green" alt="MongoDB">
</p>

## Overview

The **Payroll Subsystem** is a comprehensive component of the HR System designed to manage the entire employee lifecycle with a focus on payroll operations. This full-stack application provides a unified platform for managing recruitment, employee profiles, payroll processing, leave management, time tracking, performance evaluation, and more.

Built with modern technologies including **NestJS** (backend), **Next.js** (frontend), and **MongoDB** (database), this system centralizes all HR operations to ensure data consistency, security, and efficiency.

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure session management

### Payroll Management
- **Payroll Configuration**: Configure salary structures, allowances, deductions, and tax rules
- **Payroll Execution**:  Automated payroll processing with calculation engines
- **Payroll Tracking**: Monitor payroll cycles, history, and audit trails

### Employee Management
- **Employee Profiles**: Comprehensive employee data management
- **Onboarding**:  Streamlined new hire processes
- **Offboarding**: Structured employee exit procedures

### HR Operations
- **Recruitment**:  Manage job postings, applications, and hiring workflows
- **Leaves Management**: Track leave requests, approvals, and balances
- **Time Management**:  Attendance tracking and timesheet management
- **Performance**:  Performance reviews and goal tracking

### Organization Structure
- Department and team hierarchy management
- Position and role definitions
- Reporting relationships

## Architecture

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/                      # Authentication & authorization
│   ├── payroll-configuration/     # Payroll setup and configuration
│   ├── payroll-execution/         # Payroll processing engine
│   ├── payroll-tracking/          # Payroll history and audit
│   ├── employee-profile/          # Employee data management
│   ├── recruitment/               # Recruitment workflows
│   ├── onboarding/               # Onboarding processes
│   ├── offboarding/              # Offboarding processes
│   ├── leaves/                   # Leave management
│   ├── time-management/          # Time tracking
│   ├── performance/              # Performance management
│   ├── organization-structure/   # Org hierarchy
│   ├── seeds/                    # Database seeding
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
```

### Frontend (Next.js)
- Modern React-based UI with Next.js 15
- Server-side rendering (SSR) and static generation
- Responsive design for all devices
- Real-time data updates

### Database (MongoDB)
- Document-based NoSQL database
- Flexible schema for evolving requirements
- Efficient querying and indexing

## Getting Started

### Prerequisites

Ensure you have the following installed: 
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (v6 or higher) - running locally or cloud instance

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/moussa101/Payroll-Subsystem.git
cd Payroll-Subsystem
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Configuration

#### Backend Setup

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/payroll-system

# Server Port
PORT=3000

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

> **Note:** For MongoDB Atlas (cloud), use the connection string format:
> `mongodb+srv://username:password@cluster. mongodb.net/payroll-system`

#### Frontend Setup

Create a `.env. local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running the Application

#### Start the Backend

```bash
cd backend
npm run start:dev
```

The backend will run on **http://localhost:3000**

#### Start the Frontend

In a new terminal window: 

```bash
cd frontend
npm run dev
```

The frontend will run on **http://localhost:3001** (or next available port)

#### Seed the Database (Optional)

To populate the database with sample data: 

```bash
cd backend
npm run seed
```

## Development

### Available Scripts

#### Backend
```bash
npm run start          # Start in production mode
npm run start:dev      # Start in development mode with hot reload
npm run start:debug    # Start in debug mode
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run seed           # Seed database with sample data
```

#### Frontend
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

## Testing

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test: cov
```

## Tech Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Database**:  MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport
- **Validation**: class-validator, class-transformer
- **Scheduling**:  @nestjs/schedule
- **Security**: bcrypt for password hashing

### Frontend
- **Framework**:  Next.js 15.x
- **Language**: TypeScript
- **UI**: React with modern hooks
- **Styling**: CSS Modules / Tailwind CSS
- **State Management**: React Context / Zustand
- **HTTP Client**: Fetch API / Axios

### DevOps
- **Version Control**:  Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, Supertest

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the UNLICENSED - see the LICENSE file for details. 

## Author

**moussa101**
- GitHub: [@moussa101](https://github.com/moussa101)

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [Next. js](https://nextjs.org/)
- Database by [MongoDB](https://www.mongodb.com/)

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

<p align="center">Made with care for efficient HR management</p>
