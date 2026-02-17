# CMAMSys - Enterprise-Grade Mathematical Modeling Competition Automation Platform

**English** | [简体中文](README.md)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)
![React](https://img.shields.io/badge/React-19.2.4-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-6.19.2-2D3748.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)

**CompetiMath AutoModel System**

One-stop solution providing full-cycle automation from data preprocessing, model training, and evaluation to report generation for teams and individuals.

[Documentation](#documentation) | [Demo](#demo) | [GitHub](https://github.com/Yogdunana/CMAMSys)

</div>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Feature Modules](#feature-modules)
- [Database Design](#database-design)
- [Quick Start](#quick-start)
- [Detailed Installation Guide](#detailed-installation-guide)
- [Configuration Guide](#configuration-guide)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [API Documentation](#api-documentation)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 📖 Project Overview

### What is CMAMSys?

**CMAMSys (CompetiMath AutoModel System)** is an enterprise-grade platform for mathematical modeling competitions, designed to provide a one-stop solution for participants, streamlining the modeling process and improving competition efficiency.

Mathematical modeling competitions (such as MCM/ICM, CUMCM, etc.) typically require participants to complete the following tasks within a limited time:

1. **Problem Analysis & Strategy Development** - Understand requirements and develop modeling approach
2. **Data Collection & Preprocessing** - Acquire, clean, and transform data
3. **Model Building & Solving** - Select algorithms, train models
4. **Result Analysis & Visualization** - Evaluate models and display results
5. **Paper Writing** - Write papers that meet competition requirements

CMAMSys uses automation and intelligent techniques to significantly reduce repetitive work, allowing participants to focus on core problems.

### Core Value Proposition

- 🤖 **AI-Powered**: Integration of multiple AI Providers for intelligent modeling and code generation assistance
- 🔄 **Automated Workflow**: End-to-end automation from discussion to paper generation
- 👥 **Team Collaboration**: Real-time multi-user collaboration with clear role division
- 📊 **Data Visualization**: Rich chart and report generation capabilities
- 🔒 **Enterprise Security**: Comprehensive permission control and data encryption
- 🌐 **Multi-language Support**: Supports Chinese, English, and other languages

### Supported Competitions

| Competition Name | Acronym | Support Level |
|-----------------|---------|---------------|
| Mathematical Contest in Modeling | MCM/ICM | ✅ Full Support |
| China Undergraduate Mathematical Contest in Modeling | CUMCM | ✅ Full Support |
| Shenzhen Cup Mathematical Modeling Challenge | Shenzhen Cup | ✅ Full Support |
| International Mathematical Modeling Challenge | IMMC | ✅ Full Support |
| MathorCup Mathematical Modeling Challenge | MathorCup | ✅ Basic Support |
| Electric Mathematical Modeling Competition | EMMC | ✅ Basic Support |

---

## ✨ Key Features

### 1. Automated Modeling Workflow

CMAMSys provides end-to-end automated modeling workflow with 4 core phases:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Discussion  │ →  │    Code     │ →  │ Validation  │ →  │    Paper    │
│ AI Analysis │    │ Code Gen &  │    │ Result      │    │ Paper Gen   │
│             │    │ Execution   │    │ Validation  │    │ & Export    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Detailed Phase Descriptions

**Phase 1: Discussion**
- AI-driven problem analysis
- Modeling strategy recommendations
- Team discussion records
- Literature and resource retrieval

**Phase 2: Code**
- Automatic modeling code generation (Python)
- Code execution and result collection
- Multiple algorithm support (XGBoost, LightGBM, LSTM, etc.)
- Code version management

**Phase 3: Validation**
- Automatic result validation
- Model performance evaluation
- Anomaly detection and handling
- Result visualization

**Phase 4: Paper**
- Automatic academic paper generation
- Support for Chinese/English papers
- PDF export
- Competition-compliant formatting

### 2. AI Provider Integration

The system supports multiple AI Providers with flexible switching based on requirements:

| Provider | Model | Use Case | Configuration |
|----------|-------|----------|---------------|
| DeepSeek | DeepSeek-V3 | General dialogue, code generation | `DEEPSEEK_API_KEY` |
| OpenAI | GPT-4 / GPT-3.5 | High-quality text generation | `OPENAI_API_KEY` |
| Aliyun | Qwen | Chinese optimization | `ALIYUN_API_KEY` |
| Volcengine | Doubao | Chinese dialogue | `VOLCENGINE_API_KEY` |

**Smart Fallback Mechanism**: When an AI Provider fails, the system automatically switches to a backup provider, ensuring task completion.

### 3. Team Collaboration Features

- **Team Management**: Create and manage teams
- **Member Management**: Add/remove members, assign roles
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Access Control**: Role-Based Access Control (RBAC)

### 4. Video Learning Module

- **Bilibili Integration**: Import Bilibili video tutorials
- **Knowledge Base Management**: Extract and associate video knowledge points
- **Learning Progress Tracking**: Record learning progress
- **Note-taking**: Add notes for videos

### 5. System Administration

- **User Management**: View, disable, and delete users
- **Log Monitoring**: View login logs and operation logs
- **System Configuration**: Adjust system settings
- **Database Management**: Database backup and recovery
- **Cost Statistics**: Track AI service usage costs

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.6 | React framework |
| **React** | 19.2.4 | UI framework |
| **TypeScript** | 5.9.3 | Type system |
| **Tailwind CSS** | 4.0.0 | Styling framework |
| **shadcn/ui** | Latest | UI component library |
| **Recharts** | 3.7.0 | Data visualization |
| **React Hook Form** | 7.70.0 | Form management |
| **Zod** | 4.3.5 | Data validation |
| **next-intl** | 4.8.3 | Internationalization |

#### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 24+ | Runtime environment |
| **Prisma** | 6.19.2 | ORM framework |
| **PostgreSQL** | 16 | Database |
| **bcrypt** | 6.0.0 | Password encryption |
| **jsonwebtoken** | 9.0.3 | JWT authentication |
| **jose** | 6.1.3 | JWT processing |
| **nodemailer** | 8.0.1 | Email sending |
| **ioredis** | 5.9.2 | Redis client |

#### AI and Machine Learning

| Technology | Version | Purpose |
|-----------|---------|---------|
| **coze-coding-dev-sdk** | 0.7.15 | AI Provider integration |
| **chart.js** | 4.5.1 | Chart rendering |
| **katex** | 0.16.28 | Mathematical formula rendering |
| **react-katex** | 3.1.0 | React KaTeX components |

#### Tools and Deployment

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker** | Latest | Containerized deployment |
| **pnpm** | 9.0.0 | Package manager |
| **ESLint** | 9+ | Code linting |
| **Vitest** | 4.0.18 | Unit testing |
| **Playwright** | 1.58.2 | E2E testing |
| **Sentry** | 10.39.0 | Error tracking |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Admin  │  │ Dashboard │  │ Team Collab│ │ Learning │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Route Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │  Tasks   │  │   AI     │  │   Admin  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Users  │  │  Models  │  │ AI Integ  │  │ Collab   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Prisma   │  │  Redis   │  │  S3      │  │  Files   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ AI Prov. │  │   Email  │  │  Logging │  │ Monitor  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Feature Modules

### 1. Authentication & Authorization Module

#### Features
- ✅ User registration (email verification)
- ✅ User login (JWT Token)
- ✅ Password reset (email verification)
- ✅ Multi-factor authentication (MFA) - optional
- ✅ Session management (Refresh Token)
- ✅ Login logging
- ✅ Account lockout protection

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/refresh` | POST | Refresh Token |
| `/api/auth/verify` | POST | Verify Token |
| `/api/auth/forgot-password` | POST | Forgot password |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/v1/auth/csrf-token` | GET | Get CSRF Token |

#### Security Mechanisms
- **Password Encryption**: bcrypt (14 rounds)
- **JWT Token**: Access Token (15 min) + Refresh Token (7 days)
- **CSRF Protection**: All POST/PUT/DELETE requests require CSRF Token
- **Rate Limiting**: Prevent brute force attacks (10 requests/minute)
- **Account Lockout**: Lock account after 5 failed attempts for 15 minutes

### 2. AI Provider Management Module

#### Features
- ✅ Add/remove AI Providers
- ✅ Test AI Provider connections
- ✅ View usage statistics
- ✅ Encrypted API Key storage
- ✅ Automatic fallback mechanism

#### Supported Provider Types
- `deepseek` - DeepSeek V3
- `openai` - OpenAI GPT series
- `aliyun` - Aliyun Qwen
- `volcengine` - Volcengine Doubao

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai-providers` | GET | Get all Providers |
| `/api/ai-providers` | POST | Add Provider |
| `/api/ai-providers/[id]` | PUT | Update Provider |
| `/api/ai-providers/[id]` | DELETE | Delete Provider |
| `/api/ai-providers/test` | POST | Test connection |
| `/api/ai-providers/types` | GET | Get supported types |
| `/api/ai-providers/[id]/usage` | GET | Get usage statistics |
| `/api/ai-providers/chat-stream` | POST | Streamed dialogue |

### 3. Auto Modeling Module

#### Features
- ✅ Create modeling tasks
- ✅ 4-phase automated workflow
- ✅ Code generation and execution
- ✅ Result validation and optimization
- ✅ Automatic paper generation
- ✅ Real-time progress tracking
- ✅ Task management (pause/resume/stop)

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auto-modeling/start` | POST | Start modeling task |
| `/api/auto-modeling/latest` | GET | Get latest task |
| `/api/auto-modeling/[id]/status` | GET | Get task status |
| `/api/auto-modeling/[id]/manage` | POST | Manage task (pause/resume) |
| `/api/auto-modeling/[id]/stop` | POST | Stop task |
| `/api/auto-modeling/[id]/task-list` | GET | Get task list |
| `/api/auto-modeling/[id]/generate-paper` | POST | Generate paper |
| `/api/auto-modeling/[id]/paper` | GET | Get paper content |
| `/api/auto-modeling/[id]/regenerate-code` | POST | Regenerate code |
| `/api/auto-modeling/[id]/regenerate-paper` | POST | Regenerate paper |
| `/api/auto-modeling/[id]/execution-logs` | GET | Get execution logs |
| `/api/auto-modeling/[id]/generation-logs` | GET | Get generation logs |
| `/api/auto-modeling/[id]/optimization` | GET | Get optimization results |
| `/api/auto-modeling/[id]/optimization/export` | GET | Export optimization results |

### 4. Team Collaboration Module

#### Features
- ✅ Create teams
- ✅ Add/remove members
- ✅ Member role management
- ✅ Team discussions
- ✅ Real-time collaboration

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET | Get team list |
| `/api/teams` | POST | Create team |
| `/api/teams/[id]/members` | GET | Get member list |
| `/api/teams/[id]/members` | POST | Add member |
| `/api/collaboration/[id]` | GET | Get collaboration info |
| `/api/discussion/[id]/messages` | GET | Get discussion messages |
| `/api/discussion/stream/[id]` | GET | Stream discussion messages |

### 5. Video Learning Module

#### Features
- ✅ Video import (Bilibili)
- ✅ Knowledge base management
- ✅ Video notes
- ✅ Learning progress tracking

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/learning/videos` | GET | Get video list |
| `/api/learning/videos` | POST | Add video |
| `/api/learning/videos/[id]` | PUT | Update video |
| `/api/learning/videos/[id]/knowledge` | GET | Get knowledge points |
| `/api/learning/knowledge` | GET | Get knowledge base |
| `/api/learning/config` | GET | Get configuration |
| `/api/learning/control` | POST | Control playback |
| `/api/learning/tasks` | GET | Get learning tasks |

### 6. System Administration Module

#### Features
- ✅ User management (view, disable, delete)
- ✅ Log viewing (login logs, operation logs)
- ✅ System configuration
- ✅ Database management
- ✅ Cost statistics

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | Get user list |
| `/api/admin/logs` | GET | Get logs |
| `/api/settings/system` | GET | Get system configuration |
| `/api/settings/system` | PUT | Update system configuration |
| `/api/settings/database` | POST | Database operations |
| `/api/cost/stats` | GET | Get cost statistics |
| `/api/cost/anomaly` | GET | Get cost anomalies |

### 7. Installation Wizard Module

#### Features
- ✅ One-click installation wizard
- ✅ Environment checking
- ✅ Database configuration
- ✅ Admin account creation
- ✅ Installation lock mechanism
- ✅ SSE real-time progress

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/install/lock` | GET | Check installation lock |
| `/api/install/check-env` | GET | Check environment |
| `/api/install/test-db` | POST | Test database connection |
| `/api/install` | POST | Execute installation (SSE) |

### 8. Debug Tools Module

#### Features
- ✅ Task status checking
- ✅ Code generation debugging
- ✅ Token cleanup
- ✅ Exception handling

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/debug/tasks-status` | GET | Check task status |
| `/api/debug/test-code-generation` | POST | Test code generation |
| `/api/debug/clear-tokens` | POST | Clear tokens |
| `/api/debug/fix-task-status` | POST | Fix task status |

---

## 🗄️ Database Design

### Data Models

#### Core Tables

**1. User Table**
```prisma
model User {
  id                  String               @id @default(cuid())
  email               String               @unique
  username            String               @unique
  passwordHash        String?
  role                UserRole             @default(USER)
  authProvider        AuthProvider         @default(LOCAL)
  isVerified          Boolean              @default(false)
  isMfaEnabled        Boolean              @default(false)
  avatar              String?
  bio                 String?
  organization        String?
  failedLoginAttempts Int                  @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  deletedAt           DateTime?
  aiProviders         AIProvider[]
  competitions        Competition[]
  loginLogs           LoginLog[]
  passwordResetTokens PasswordResetToken[]
  refreshTokens       RefreshToken[]
  teamMemberships     TeamMember[]
  ownedTeams          Team[]
}
```

**2. AIProvider Table**
```prisma
model AIProvider {
  id          String      @id @default(cuid())
  name        String
  type        AIProviderType
  apiKey      String      // Encrypted storage
  endpoint    String?
  config      Json?
  userId      String
  enabled     Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id])
}
```

**3. Competition Table**
```prisma
model Competition {
  id          String            @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  status      CompetitionStatus @default(DRAFT)
  description String?
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  ownerId     String
  problems    Problem[]
  teams       Team[]
  owner       User              @relation("UserCompetitions", fields: [ownerId], references: [id])
}
```

**4. AutoModelingTask Table**
```prisma
model AutoModelingTask {
  id              String                @id @default(cuid())
  name            String
  description     String?
  status          TaskStatus            @default(PENDING)
  currentPhase    TaskPhase             @default(DISCUSSION)
  config          Json?
  discussionData  Json?
  codeData        Json?
  validationData  Json?
  paperData       Json?
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
  completedAt     DateTime?
  executionLogs   ExecutionLog[]
  generationLogs  GenerationLog[]
}
```

**5. DiscussionMessage Table**
```prisma
model DiscussionMessage {
  id        String   @id @default(cuid())
  content   String
  role      MessageRole @default(USER)
  tokens    Int?
  taskId    String
  createdAt DateTime @default(now())
  task      AutoModelingTask @relation(fields: [taskId], references: [id])
}
```

**6. ExecutionLog Table**
```prisma
model ExecutionLog {
  id          String   @id @default(cuid())
  level       LogLevel @default(INFO)
  message     String
  metadata    Json?
  taskId      String
  createdAt   DateTime @default(now())
  task        AutoModelingTask @relation(fields: [taskId], references: [id])
}
```

#### Enum Types

```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum AuthProvider {
  LOCAL
  GOOGLE
  GITHUB
}

enum AIProviderType {
  DEEPSEEK
  OPENAI
  ALIYUN
  VOLCENGINE
}

enum CompetitionType {
  MCM
  ICM
  CUMCM
  SHENZHEN_CUP
  IMMC
}

enum CompetitionStatus {
  DRAFT
  ONGOING
  COMPLETED
  CANCELLED
}

enum TaskStatus {
  PENDING
  RUNNING
  PAUSED
  COMPLETED
  FAILED
  CANCELLED
}

enum TaskPhase {
  DISCUSSION    // Discussion phase
  CODE          // Code phase
  VALIDATION    // Validation phase
  PAPER         // Paper phase
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}
```

---

## 🚀 Quick Start

### Prerequisites

| Software | Minimum Version | Recommended Version |
|----------|---------------|---------------------|
| Node.js | 20.x | 24.x |
| pnpm | 8.x | 9.0.0+ |
| PostgreSQL | 14.x | 16.x |
| Redis | 6.x | 7.x (optional) |
| Docker | 20.x | Latest (optional) |

### Method 1: Web Installation Wizard (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Access the installation wizard**
   ```
   http://localhost:5000/install
   ```

5. **Follow the wizard to complete installation**
   - Environment check
   - Database configuration
   - Admin account creation
   - System configuration

### Method 2: Command Line Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **Run installation script**
   ```bash
   pnpm install:system
   ```

3. **Enter admin information when prompted**
   ```
   Admin email: admin@example.com
   Admin username: admin
   Admin password: ********
   ```

4. **Start the service**
   ```bash
   pnpm start
   ```

5. **Access the system**
   ```
   http://localhost:5000
   ```

### Method 3: Docker Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yogdunana/CMAMSys.git
   cd CMAMSys
   ```

2. **Configure environment variables**
   ```bash
   cp docker/.env.community docker/.env
   # Edit docker/.env file and fill in your configuration
   ```

3. **Start services**
   ```bash
   docker compose -f docker/docker-compose.community.yml up -d
   ```

4. **Access the system**
   ```
   http://localhost:5000
   ```

---

## 📝 Detailed Installation Guide

### Step 1: Install Dependencies

#### Using pnpm (Recommended)

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm@9.0.0

# Install project dependencies
pnpm install
```

#### Using npm (Not Recommended)

```bash
npm install
```

### Step 2: Configure Environment Variables

1. **Copy environment variable template**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**

   **Required configuration**:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/cmamsys"

   # JWT secrets (generate using the following command)
   # openssl rand -base64 32
   JWT_SECRET="your-jwt-secret-here"
   REFRESH_TOKEN_SECRET="your-refresh-secret-here"

   # Encryption key (very important!)
   # openssl rand -base64 32
   ENCRYPTION_KEY="your-encryption-key-here"

   # CSRF secret
   # openssl rand -base64 32
   CSRF_SECRET="your-csrf-secret-here"

   # Session secret
   # openssl rand -base64 32
   SESSION_SECRET="your-session-secret-here"
   ```

   **Optional configuration**:
   ```env
   # Email service (for password reset)
   SMTP_ENABLED="true"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM="noreply@example.com"
   SMTP_FROM_NAME="CMAMSys"

   # Redis (for caching and session management)
   REDIS_URL="redis://localhost:6379"

   # AI Providers
   DEEPSEEK_API_KEY="your-deepseek-api-key"
   OPENAI_API_KEY="your-openai-api-key"
   ALIYUN_API_KEY="your-aliyun-api-key"
   VOLCENGINE_API_KEY="your-volcengine-api-key"

   # Sentry (error tracking)
   SENTRY_DSN="your-sentry-dsn"
   NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
   ```

### Step 3: Initialize Database

```bash
# Run database migrations
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate
```

### Step 4: Create Admin Account

#### Method 1: Use Installation Wizard

Visit `http://localhost:5000/install` and follow the wizard to create an admin account.

#### Method 2: Use Script

```bash
# Run admin creation script
node scripts/create-admin.js
```

#### Method 3: Manual Creation

```bash
# Open Prisma Studio
pnpm prisma studio

# Manually create admin account in User table
# - role: ADMIN
# - isVerified: true
# - passwordHash: bcrypt-hashed password
```

### Step 5: Build Project

```bash
# Development build
pnpm build

# Production build
NODE_ENV=production pnpm build
```

### Step 6: Start Service

#### Development Environment

```bash
pnpm dev
```

Service will start at `http://localhost:5000`.

#### Production Environment

```bash
pnpm start
```

Service will start at `http://localhost:5000`.

### Step 7: Verify Installation

1. **Access system**
   ```
   http://localhost:5000
   ```

2. **Login with admin account**

3. **Check system status**
   - Visit `/settings/system` to view system configuration
   - Visit `/admin/users` to view user list
   - Visit `/admin/logs` to view system logs

---

## ⚙️ Configuration Guide

### Complete Environment Variables List

#### Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |

#### Authentication Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access Token expiry | `15m` | - |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh Token expiry | `7d` | - |
| `REFRESH_TOKEN_SECRET` | Refresh Token signing secret | - | ✅ |
| `SESSION_SECRET` | Session encryption secret | - | ✅ |
| `SESSION_MAX_AGE` | Session max age (ms) | `604800000` | - |

#### Security Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENCRYPTION_KEY` | Data encryption key | - | ✅ |
| `CSRF_SECRET` | CSRF protection secret | - | ✅ |
| `BCRYPT_ROUNDS` | bcrypt encryption rounds | `14` | - |
| `MAX_LOGIN_ATTEMPTS` | Max login attempts | `5` | - |
| `LOCKOUT_DURATION_MS` | Account lockout duration (ms) | `900000` | - |

#### Application Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `APP_NAME` | Application name | `CMAMSys` | - |
| `APP_URL` | Application URL | `http://localhost:5000` | - |
| `APP_PORT` | Application port | `5000` | - |
| `NODE_ENV` | Runtime environment | `development` | - |

#### Email Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_ENABLED` | Enable email | `false` | - |
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` | - |
| `SMTP_PORT` | SMTP port | `587` | - |
| `SMTP_SECURE` | Use SSL/TLS | `false` | - |
| `SMTP_USER` | SMTP username | - | - |
| `SMTP_PASSWORD` | SMTP password | - | - |
| `SMTP_FROM` | Sender email | `noreply@example.com` | - |
| `SMTP_FROM_NAME` | Sender name | `CMAMSys` | - |

#### Redis Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_URL` | Redis connection string | - | - |

#### AI Provider Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `ALIYUN_API_KEY` | Aliyun API Key | - |
| `VOLCENGINE_API_KEY` | Volcengine API Key | - |

#### Object Storage Configuration (S3)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `S3_ENDPOINT` | S3 endpoint | `https://s3.amazonaws.com` | - |
| `S3_ACCESS_KEY_ID` | S3 access key ID | - | - |
| `S3_SECRET_ACCESS_KEY` | S3 access key | - | - |
| `S3_REGION` | S3 region | `us-east-1` | - |
| `S3_BUCKET` | S3 bucket name | - | - |

#### Monitoring Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SENTRY_DSN` | Sentry DSN | - | - |
| `SENTRY_AUTH_TOKEN` | Sentry auth token | - | - |
| `SENTRY_ENVIRONMENT` | Sentry environment | `production` | - |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry DSN | - | - |

#### Logging Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `LOG_LEVEL` | Log level | `info` | - |
| `LOG_FILE` | Log file path | `/app/work/logs/bypass/app.log` | - |

#### CORS Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ALLOWED_ORIGINS` | Allowed origins | `http://localhost:5000` | - |
| `ALLOWED_METHODS` | Allowed methods | `GET,POST,PUT,DELETE,PATCH,OPTIONS` | - |
| `ALLOWED_HEADERS` | Allowed headers | `Content-Type,Authorization,X-CSRF-Token` | - |

#### File Upload Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MAX_FILE_SIZE` | Max file size (bytes) | `10485760` | - |
| `ALLOWED_FILE_TYPES` | Allowed file types | `.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif` | - |

#### Path Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `INSTALL_PATH` | Installation path | `./` | - |
| `DATA_PATH` | Data path | `./data` | - |
| `LOG_PATH` | Log path | `./logs` | - |
| `UPLOAD_PATH` | Upload path | `./uploads` | - |
| `TEMP_PATH` | Temporary path | `./temp` | - |

### Configuration Files Description

#### `.env` - Environment Variables

Main configuration file containing all environment variables.

#### `prisma/schema.prisma` - Database Models

Define database structure and relationships.

#### `tsconfig.json` - TypeScript Configuration

TypeScript compiler options and path aliases.

#### `next.config.js` - Next.js Configuration

Next.js framework configuration.

#### `tailwind.config.js` - Tailwind CSS Configuration

Tailwind CSS theme and plugin configuration.

---

## 👨‍💻 Development Guide

### Project Structure

```
CMAMSys/
├── .coze/                    # Coze CLI configuration
├── docker/                   # Docker configuration
│   ├── docker-compose.yml    # Docker Compose configuration
│   ├── Dockerfile            # Docker image build file
│   └── .env                  # Docker environment variables
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Database models
│   ├── seed.ts               # Database seed data
│   └── migrations/           # Database migration files
├── public/                   # Static assets
│   ├── logo.svg             # Logo image
│   └── favicon.ico          # Website icon
├── scripts/                  # Script files
│   ├── install.sh           # Installation script
│   ├── build.sh             # Build script
│   ├── start.sh             # Start script
│   └── dev.sh               # Development script
├── src/                      # Source code
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Authentication related pages
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard
│   │   ├── install/         # Installation wizard
│   │   ├── settings/        # System settings
│   │   ├── learning/        # Learning center
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   └── types/              # TypeScript type definitions
├── .env.example             # Environment variables example
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore files
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
├── pnpm-lock.yaml           # pnpm lock file
├── README.md                # Project documentation
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (with hot reload)
pnpm dev

# Build project
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run tests (watch mode)
pnpm test:watch

# Generate test coverage report
pnpm test:coverage

# Run type checking
pnpm ts-check

# Code linting
pnpm lint

# Database migration
pnpm prisma migrate dev

# Database migration (production)
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate

# Open Prisma Studio (database visualization tool)
pnpm prisma studio

# Populate seed data
pnpm prisma seed

# Reset database (delete all data)
pnpm prisma migrate reset

# Docker build
pnpm docker:build

# Docker deployment
pnpm docker:deploy

# Docker development environment
pnpm docker:dev

# Docker production environment
pnpm docker:prod
```

### Code Standards

#### Naming Conventions

- **File names**: kebab-case (e.g., `user-profile.tsx`)
- **Component names**: PascalCase (e.g., `UserProfile`)
- **Function names**: camelCase (e.g., `getUserProfile`)
- **Constant names**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Type names**: PascalCase (e.g., `UserProfile`)

#### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { NextResponse } from 'next/server';

// 2. Internal modules
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

// 3. Type definitions
import type { User } from '@/types';

// 4. Relative imports
import { formatDate } from '../utils';
```

#### TypeScript Standards

```typescript
// Use interfaces for object structures
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type aliases for union types
type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

// Use generics to improve code reusability
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Avoid using any, use unknown or specific types
function processData(data: unknown) {
  if (typeof data === 'string') {
    // ...
  }
}
```

### API Route Development

#### Creating API Routes

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define request validation schema
const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// GET request
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

### Component Development

#### Using shadcn/ui Components

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserProfileForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### State Management

#### Using React Hooks

```typescript
'use client';

import { useState, useEffect } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Error Handling

#### API Error Handling

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process logic
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error
    console.error('API error:', error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

#### Frontend Error Handling

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const data = await response.json();
      toast.success('User created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🐳 Deployment Guide

### Docker Deployment

#### 1. Using Docker Compose (Recommended)

```bash
# Copy environment file
cp docker/.env.community docker/.env

# Edit environment variables
vim docker/.env

# Start services
docker compose -f docker/docker-compose.community.yml up -d

# View logs
docker compose -f docker/docker-compose.community.yml logs -f

# Stop services
docker compose -f docker/docker-compose.community.yml down

# Restart services
docker compose -f docker/docker-compose.community.yml restart
```

#### 2. Custom Deployment

```bash
# Build Docker image
docker build -f docker/Dockerfile -t cmamsys:latest .

# Run container
docker run -d \
  --name cmamsys \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  --restart unless-stopped \
  cmamsys:latest
```

### Server Deployment

#### 1. Prepare Server

```bash
# Install Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm@9.0.0

# Install PostgreSQL 16
sudo apt install -y postgresql-16

# Install Redis (optional)
sudo apt install -y redis-server
```

#### 2. Clone Code

```bash
# Clone repository
git clone https://github.com/Yogdunana/CMAMSys.git
cd CMAMSys

# Install dependencies
pnpm install
```

#### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit environment file
vim .env
```

#### 4. Initialize Database

```bash
# Run database migrations
pnpm prisma migrate deploy

# Generate Prisma Client
pnpm prisma generate
```

#### 5. Build and Start

```bash
# Build project
pnpm build

# Start service
pnpm start
```

#### 6. Use PM2 for Process Management (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name "cmamsys" -- start

# Check status
pm2 status

# View logs
pm2 logs cmamsys

# Restart application
pm2 restart cmamsys

# Stop application
pm2 stop cmamsys

# Start on boot
pm2 startup
pm2 save
```

#### 7. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/cmamsys
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable configuration
sudo ln -s /etc/nginx/sites-available/cmamsys /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 8. Configure SSL (Using Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto renewal
sudo certbot renew --dry-run
```

### Cloud Platform Deployment

#### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

#### 2. Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### 3. Render Deployment

1. Connect GitHub repository
2. Configure environment variables
3. Deploy application

---

## 📚 API Documentation

### Authentication Related

#### User Registration

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### User Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "username": "username"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### AI Provider Related

#### Get All Providers

```http
GET /api/ai-providers
Authorization: Bearer {accessToken}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "DeepSeek",
      "type": "deepseek",
      "enabled": true
    }
  ]
}
```

#### Add Provider

```http
POST /api/ai-providers
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "DeepSeek",
  "type": "deepseek",
  "apiKey": "your-api-key",
  "enabled": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "DeepSeek",
    "type": "deepseek",
    "enabled": true
  }
}
```

#### Test Connection

```http
POST /api/ai-providers/test
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "deepseek",
  "apiKey": "your-api-key"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Connection successful"
  }
}
```

### Auto Modeling Related

#### Start Modeling Task

```http
POST /api/auto-modeling/start
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Math Modeling Task",
  "description": "Task description",
  "config": {
    "competitionType": "MCM",
    "aiProviderId": "cuid",
    "phases": ["discussion", "code", "validation", "paper"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Math Modeling Task",
    "status": "RUNNING",
    "currentPhase": "DISCUSSION"
  }
}
```

#### Get Task Status

```http
GET /api/auto-modeling/{id}/status
Authorization: Bearer {accessToken}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Math Modeling Task",
    "status": "RUNNING",
    "currentPhase": "CODE",
    "progress": 50,
    "createdAt": "2026-02-18T00:00:00Z",
    "updatedAt": "2026-02-18T00:30:00Z"
  }
}
```

#### Generate Paper

```http
POST /api/auto-modeling/{id}/generate-paper
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "language": "english",
  "format": "pdf"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "paperId": "cuid",
    "downloadUrl": "/api/auto-modeling/{id}/paper?download=true"
  }
}
```

---

## 🧪 Testing Guide

### Unit Testing

#### Using Vitest

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-02-18');
    const formatted = formatDate(date);
    expect(formatted).toBe('2026-02-18');
  });
});
```

### Integration Testing

#### Testing API Routes

```typescript
// src/app/api/__tests__/users.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('User API', () => {
  beforeAll(async () => {
    // Initialize test database
    await prisma.$executeRawUnsafe('TRUNCATE TABLE users CASCADE');
  });

  it('should create a user', async () => {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
      }),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test User');
  });
});
```

### E2E Testing

#### Using Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:5000/auth/login');

  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('http://localhost:5000/dashboard');
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests
pnpm test --run

# Run tests (watch mode)
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run E2E tests
npx playwright test
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Problem**: `Error: P1001: Can't reach database server`

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check DATABASE_URL configuration
echo $DATABASE_URL
```

#### 2. Prisma Client Generation Failed

**Problem**: `Error: P5006`

**Solution**:
```bash
# Regenerate Prisma Client
pnpm prisma generate

# Clear cache
rm -rf node_modules/.prisma
pnpm prisma generate
```

#### 3. Dependency Installation Failed

**Problem**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Use pnpm (recommended)
pnpm install

# Or force resolve dependency conflicts
npm install --legacy-peer-deps
```

#### 4. Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find process occupying the port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 pnpm dev
```

#### 5. JWT Token Invalid

**Problem**: `Error: Invalid token`

**Solution**:
```bash
# Check JWT_SECRET configuration
echo $JWT_SECRET

# Regenerate secret
openssl rand -base64 32

# Update .env file
# Restart service
```

#### 6. AI Provider Connection Failed

**Problem**: `Error: AI Provider connection failed`

**Solution**:
```bash
# Check if API Key is correct
# Check network connection
# Test connection
curl -X POST http://localhost:5000/api/ai-providers/test \
  -H "Content-Type: application/json" \
  -d '{"type":"deepseek","apiKey":"your-key"}'
```

### Viewing Logs

```bash
# View application logs
tail -f /app/work/logs/bypass/app.log

# View Docker logs
docker compose -f docker/docker-compose.yml logs -f app

# View PM2 logs
pm2 logs cmamsys
```

### Performance Issues

#### 1. Slow Database Queries

**Solution**:
```bash
# Add indexes
# In prisma/schema.prisma add
@@index([fieldName])

# Generate migration
pnpm prisma migrate dev
```

#### 2. High Memory Usage

**Solution**:
```bash
# Check memory usage
node --max-old-space-size=4096 pnpm start

# Or configure in package.json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 node_modules/.bin/next start"
  }
}
```

---

## ❓ FAQ

### General Questions

**Q: Which competitions does CMAMSys support?**

A: Currently supports MCM/ICM, CUMCM, Shenzhen Cup, IMMC, and other mainstream competitions. Other competitions can be supported through custom templates.

**Q: Can it be used offline?**

A: Yes, but AI features require internet access. You can configure local AI Providers or use offline mode.

**Q: How to backup data?**

A: Use PostgreSQL's backup tools:
```bash
pg_dump cmamsys > backup.sql
```

**Q: How to upgrade to a new version?**

A: Pull the latest code and run migrations:
```bash
git pull origin main
pnpm install
pnpm prisma migrate deploy
pnpm build
pnpm start
```

### Technical Questions

**Q: How to customize the theme?**

A: Modify theme configuration in `tailwind.config.js`.

**Q: How to add a new AI Provider?**

A: Add new Provider configuration in `src/lib/ai-providers.ts`.

**Q: How to optimize performance?**

A: 
1. Enable Redis caching
2. Add database indexes
3. Use CDN for static assets
4. Enable Gzip compression

### Deployment Questions

**Q: Cannot access after Docker deployment?**

A: Check port mapping and network configuration:
```bash
docker ps
docker network inspect cmamsys-network
```

**Q: How to configure HTTPS?**

A: Use Nginx + Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 📄 License

MIT License

Copyright (c) 2026 CMAMSys Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 📞 Contact

- **GitHub**: https://github.com/Yogdunana/CMAMSys
- **Issues**: https://github.com/Yogdunana/CMAMSys/issues
- **Email**: support@cmamsys.com

---

## 🙏 Acknowledgments

Thanks to the following open source projects:

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📝 Changelog

### v1.0.0 (2026-02-18)

#### New Features
- ✅ Complete installation wizard
- ✅ AI Provider integration (DeepSeek, OpenAI, Aliyun, Volcengine)
- ✅ Automated modeling workflow (Discussion, Code, Validation, Paper)
- ✅ Team collaboration features
- ✅ Video learning module
- ✅ System administration dashboard
- ✅ JWT authentication system
- ✅ MFA support
- ✅ Docker deployment support

#### Tech Stack
- Next.js 16.1.6
- React 19.2.4
- TypeScript 5.9.3
- Prisma 6.19.2
- PostgreSQL 16

#### Documentation
- ✅ Complete API documentation
- ✅ Deployment guide
- ✅ Development guide
- ✅ Troubleshooting

---

<div align="center">

**If this project helps you, please give us a ⭐️**

Made with ❤️ by CMAMSys Team

</div>
