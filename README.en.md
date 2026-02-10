# CMAMSys - CompetiMath AutoModel System

<div align="center">

**CompetiMath AutoModel System v1.0.0**

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![React](https://img.shields.io/badge/React-19.2.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg)

</div>

**Enterprise-Grade Automated Mathematical Modeling Competition Platform**

One-stop solution providing full-cycle automation from data preprocessing, model training, and evaluation to report generation for teams and individuals.

[Website](https://cmamsys.com) | [Documentation](https://docs.cmamsys.com) | [Demo](https://demo.cmamsys.com) | [GitHub](https://github.com/your-org/cmamsys)

</div>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Feature Modules](#feature-modules)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Quick Start](#quick-start)
- [Detailed Installation Guide](#detailed-installation-guide)
- [Configuration Guide](#configuration-guide)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [Testing Guide](#testing-guide)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Changelog](#changelog)
- [Contributing Guide](#contributing-guide)
- [License](#license)
- [Contact](#contact)

---

## 📖 Project Overview

### Background and Vision

CMAMSys (CompetiMath AutoModel System) is an enterprise-grade platform for mathematical modeling competitions, designed to provide a one-stop solution for participants, streamlining the modeling process and improving competition efficiency.

Mathematical modeling competitions (such as MCM/ICM, CUMCM, etc.) typically require participants to complete the following tasks within a limited time:
1. Understand the problem and develop strategy
2. Data collection and preprocessing
3. Model building and solving
4. Result analysis and visualization
5. Paper writing

This process is time-consuming and complex. CMAMSys uses automation and intelligent techniques to significantly reduce repetitive work, allowing participants to focus on core problems.

### Design Philosophy

- **Automation First**: Automate repetitive tasks whenever possible
- **Intelligent Assistance**: AI-driven recommendations and optimizations
- **Team Collaboration**: Multi-user support with role-based access control
- **Ready to Use**: Competition-specific templates and presets
- **Enterprise Quality**: Comprehensive testing, documentation, and deployment solutions

### Supported Competitions

| Competition Name | Acronym | Organizer | Difficulty | Template Support |
|-----------------|---------|-----------|------------|------------------|
| Mathematical Contest in Modeling | MCM/ICM | COMAP | ⭐⭐⭐⭐⭐ | ✅ Full Support |
| China Undergraduate Mathematical Contest in Modeling | CUMCM | CSIAM | ⭐⭐⭐⭐ | ✅ Full Support |
| Shenzhen Cup Mathematical Modeling Challenge | Shenzhen Cup | Shenzhen Association for Science and Technology | ⭐⭐⭐⭐ | ✅ Full Support |
| International Mathematical Modeling Challenge | IMMC | IMMC Committee | ⭐⭐⭐⭐⭐ | ✅ Full Support |
| MathorCup Mathematical Modeling Challenge | MathorCup | CSOR | ⭐⭐⭐ | ✅ Basic Support |
| Electric Mathematical Modeling Competition | EMMC | CSEE | ⭐⭐⭐ | ✅ Basic Support |
| Teddy Cup Data Mining Challenge | Teddy Cup | Teddy Cup Committee | ⭐⭐⭐⭐ | ✅ Full Support |
| BlueBridge Cup Mathematical Modeling | BlueBridge | MIIT | ⭐⭐ | ✅ Basic Support |

### Editions

#### Community Edition

**Free and Open Source, MIT License**

- ✅ Basic modeling features
- ✅ Team collaboration (up to 10 members)
- ✅ Report generation
- ✅ 3 AI Providers
- ✅ Basic template library
- ✅ Community support

**Best for**: Personal learning, small teams, educational demonstrations

#### Enterprise Edition

**Commercial License, Paid**

- ✅ All Community Edition features
- ✅ Unlimited team members
- ✅ Unlimited AI Providers
- ✅ Advanced template library
- ✅ SSO (Single Sign-On)
- ✅ Private deployment
- ✅ Priority technical support
- ✅ Custom development
- ✅ SLA guarantee

**Best for**: University labs, training institutions, corporate R&D teams

---

## ✨ Key Features

### 1. Automated Modeling Pipeline

CMAMSys provides end-to-end automated modeling workflow from data input to report output with minimal human intervention.

#### Pipeline Stages

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Problem      │ →  │ Data         │ →  │ Model        │ →  │ Result       │
│ Analysis     │    │ Preprocess   │    │ Training     │    │ Evaluation   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        ↓                   ↓                   ↓                   ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Strategy     │    │ Feature      │    │ Hyperparameter│   │ Visualization│
│ Formulation  │    │ Engineering  │    │ Optimization  │   │              │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              ↓
                                                    ┌─────────────┐
                                                    │ Report      │
                                                    │ Generation  │
                                                    └─────────────┘
```

#### Supported Modeling Types

| Modeling Type | Supported Algorithms | Use Cases | Templates |
|---------------|---------------------|-----------|-----------|
| **Prediction Models** | Linear Regression, XGBoost, LightGBM, LSTM, Transformer | Time series forecasting, sales prediction | ✅ |
| **Classification Models** | Logistic Regression, Random Forest, SVM, Deep Learning | Image recognition, text classification | ✅ |
| **Clustering Models** | K-Means, DBSCAN, Hierarchical Clustering | Customer segmentation, anomaly detection | ✅ |
| **Optimization Models** | Linear Programming, Integer Programming, Genetic Algorithms | Resource scheduling, path optimization | ✅ |
| **Evaluation Models** | AHP, TOPSIS, Fuzzy Comprehensive Evaluation | Scheme evaluation, decision support | ✅ |
| **Simulation Models** | Monte Carlo, Cellular Automata, System Dynamics | Risk assessment, trend prediction | ✅ |

### 2. Multi-Algorithm Support

Integrated with mainstream machine learning and deep learning libraries:

#### Traditional Machine Learning

- **Scikit-learn**: 100+ traditional algorithms
  - Supervised learning: regression, classification
  - Unsupervised learning: clustering, dimensionality reduction
  - Model selection: cross-validation, grid search

- **XGBoost**: Gradient Boosting Decision Trees
  - GPU acceleration support
  - Automatic missing value handling
  - Feature importance analysis

- **LightGBM**: Lightweight Gradient Boosting
  - Low memory footprint
  - Fast training speed
  - Categorical feature support

#### Deep Learning

- **PyTorch**: Flexible deep learning framework
  - Custom network architecture
  - Distributed training
  - Model export (ONNX)

- **TensorFlow/Keras**: User-friendly deep learning interface
  - Pre-trained model library
  - Automatic differentiation
  - Model deployment tools

#### Statistical Modeling

- **Statsmodels**: Statistical modeling and econometrics
  - Linear regression, time series analysis
  - Hypothesis testing, ANOVA
  - Strong interpretability

### 3. AI Integration

#### Supported AI Providers

| Provider | Models | Usage | Billing |
|----------|--------|-------|---------|
| **DeepSeek** | DeepSeek-V3 | General chat, code generation | By Tokens |
| **VolcEngine (Doubao)** | Doubao-Pro | Chinese optimized, multimodal | By requests |
| **Aliyun Qwen** | Qwen-Max | Chinese understanding, long text | By calls |
| **OpenAI** | GPT-4 | General reasoning, complex tasks | By Tokens |
| **Zhipu AI** | ChatGLM-4 | Chinese dialogue, knowledge Q&A | By calls |
| **Moonshot AI** | Kimi | Long text processing | By input length |

#### AI Features

- **Intelligent Strategy Formulation**: Auto-recommend modeling strategy based on problem description
- **Code Generation**: Auto-generate modeling code (Python/Matlab)
- **Result Interpretation**: AI-assisted explanation of model results
- **Paper Polishing**: Grammar and logic optimization for papers
- **Scheme Comparison**: Multi-scheme comparison and recommendation

#### Streaming Output

Uses SSE (Server-Sent Events) technology for real-time streaming output:

```javascript
// Client-side example
const eventSource = new EventSource('/api/ai/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content); // Real-time output
};
```

**Advantages**:
- Real-time feedback, better user experience
- Reduced server memory pressure
- Support for long text output
- Automatic reconnection on disconnection

### 4. Team Collaboration

#### Role System

| Role | Permissions | Description |
|------|-------------|-------------|
| **Administrator (ADMIN)** | All permissions | System management, user management, configuration |
| **Captain (CAPTAIN)** | Team management | Create teams, invite members, assign tasks |
| **Member (MEMBER)** | Basic permissions | Participate in tasks, view results, submit code |
| **Observer (OBSERVER)** | Read-only permissions | View progress, read reports |

#### Collaboration Features

- **Real-time Collaboration**: Multiple users editing the same document simultaneously
- **Task Assignment**: Decompose modeling tasks and assign to members
- **Progress Tracking**: Visual display of task progress
- **Code Sharing**: Version control for code repository
- **Message Notifications**: Real-time notifications for task changes
- **Comment System**: Discuss and provide feedback on results

### 5. Daily Learning Module

#### Bilibili Learning System

Automatically learns mathematical modeling knowledge from Bilibili to build a professional knowledge base.

**Features**:

1. **Automatic Crawling**: Periodically crawl videos from specified UP hosts
2. **Content Parsing**: Extract video titles, descriptions, bullet comments (danmu)
3. **Knowledge Extraction**: AI extracts key knowledge points
4. **Smart Classification**: Categorize by algorithm and competition type
5. **Progress Tracking**: Record learning progress
6. **Knowledge Graph**: Build knowledge point relationship graph

**Configuration Example**:

```typescript
// bilibili-learning-config.json
{
  "upUsers": [
    "数学建模学习交流",
    "老哥教你学建模"
  ],
  "keywords": [
    "数学建模",
    "Matlab",
    "Python",
    "机器学习"
  ],
  "schedule": {
    "frequency": "daily",
    "time": "02:00"
  }
}
```

#### User Material Learning

Support users uploading their own learning materials (PDF, videos, documents), automatically organized and categorized by the system.

### 6. Beautiful Visualizations

#### Competition-Themed Charts

Automatically apply different theme colors based on competition type:

```typescript
// Theme configuration
const competitionThemes = {
  MCM: { primary: '#DC2626', secondary: '#FECACA' },      // Red
  CUMCM: { primary: '#2563EB', secondary: '#DBEAFE' },     // Blue
  SHENZHEN: { primary: '#7C3AED', secondary: '#DDD6FE' },  // Purple
  IMMC: { primary: '#059669', secondary: '#D1FAE5' },      // Green
  MathorCup: { primary: '#EA580C', secondary: '#FFEDD5' }, // Orange
};
```

#### Supported Chart Types

| Chart Type | Usage | Library |
|------------|-------|---------|
| **Line Chart** | Trend analysis, time series | Recharts |
| **Bar Chart** | Comparative analysis, categorical statistics | Recharts |
| **Scatter Plot** | Correlation analysis, clustering visualization | Recharts |
| **Heatmap** | Data distribution, correlation matrix | Recharts |
| **Pie Chart** | Proportion analysis, composition analysis | Recharts |
| **Radar Chart** | Multi-dimensional evaluation | Recharts |
| **3D Charts** | Spatial data, complex models | Three.js |
| **Flowchart** | Business process, algorithm flow | React Flow |
| **UML Diagrams** | System design, class diagrams | Mermaid |
| **Gantt Chart** | Project management, progress tracking | Recharts |

### 7. Enterprise-Grade Security

#### Authentication and Authorization

**Authentication Methods**:

1. **JWT Authentication**
   - Access Token: 15 minutes expiration
   - Refresh Token: 7 days expiration
   - Automatic refresh mechanism

2. **Multi-Factor Authentication (MFA)**
   - SMS verification code
   - Email verification code
   - TOTP (Time-based One-Time Password)

3. **Single Sign-On (SSO)**
   - OAuth 2.0 / OpenID Connect
   - SAML 2.0 support (Enterprise Edition)
   - LDAP integration (Enterprise Edition)

**Access Control**:

```typescript
// Role-Based Access Control (RBAC)
const permissions = {
  ADMIN: ['*'], // All permissions
  CAPTAIN: [
    'team:create',
    'team:invite',
    'task:assign',
    'task:delete',
  ],
  MEMBER: [
    'task:view',
    'task:update',
    'result:view',
  ],
  OBSERVER: [
    'task:view',
    'result:view',
  ],
};
```

#### Anti-Attack Measures

| Threat Type | Protection Measures | Implementation |
|-------------|-------------------|----------------|
| **SQL Injection** | Parameterized queries | Prisma ORM |
| **XSS Attacks** | Input sanitization + CSP | DOMPurify + Helmet |
| **CSRF Attacks** | CSRF Token + SameSite | Middleware validation |
| **Brute Force** | Rate limiting + account lockout | Token bucket algorithm |
| **DDoS Attacks** | CDN + rate limiting | Cloudflare |
| **Sensitive Data Leakage** | Encrypted storage | AES-256-GCM |

#### Data Encryption

```typescript
// API Key encrypted storage
const encryptedKey = await encrypt(apiKey, {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 12,
});

// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);
```

### 8. API-First Design

Comprehensive REST API support for third-party integration.

#### API Versions

- **v1**: Stable version, long-term maintenance
- **v2**: Latest version, recommended

#### API Features

- RESTful style
- JSON data format
- JWT authentication
- Rate limiting (100 requests/minute)
- Automatic documentation generation (OpenAPI)
- SDK support (Python, Java, JavaScript)

### 9. Docker One-Click Deployment

Supports Docker and Docker Compose for rapid deployment to any environment.

#### Supported Platforms

- Linux (x86_64, ARM64)
- macOS
- Windows (WSL2)
- NAS (Synology, QNAP)

#### Deployment Methods

```bash
# Quick deployment
cd docker
./deploy.sh community up

# Custom configuration
./deploy.sh enterprise up --with-redis --with-minio
```

### 10. Internationalization Support

#### Supported Languages

- 🇨🇳 Simplified Chinese (Default)
- 🇺🇸 English
- 🇯🇵 日本語 (Planned)
- 🇰🇷 한국어 (Planned)

#### Internationalization Implementation

```typescript
// next-intl configuration
const locales = ['zh', 'en'] as const;
const defaultLocale = 'zh';

// Translation files
// messages/zh.json
{
  "common": {
    "login": "登录",
    "register": "注册",
  }
}

// messages/en.json
{
  "common": {
    "login": "Login",
    "register": "Register",
  }
}
```

---

## 🏗️ Technical Architecture

### Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Web Browser  │  Mobile (Planned)  │  Desktop (Planned)      │
│  (React 19)   │  (React Native)   │  (Electron)             │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS
┌────────────▼────────────────────────────────────────────────┐
│                   Gateway Layer (Nginx)                      │
│  SSL Termination │ Load Balancer │ Static Files │ Rate Limit │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                  Application Layer (Next.js 16)               │
├─────────────────────────────────────────────────────────────┤
│  Frontend Render │ API Routes │ Middleware │ Server Components│
│  (SSR/ISR)       │  (REST)    │   (Auth)   │     (RSC)        │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│ Auth Service │ Modeling Service │ Learning │ Team │ AI Service│
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                   Data Access Layer (Prisma)                 │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Data Storage Layer                        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis (Cache)  │  S3 (Object Storage)        │
└─────────────────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                   External Service Layer                      │
├─────────────────────────────────────────────────────────────┤
│  AI Provider  │  Bilibili  │  SMS Service  │  Email Service  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

#### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)              │
├─────────────────────────────────────────────────────────┤
│  React 19              │  TypeScript 5                 │
├─────────────────────────────────────────────────────────┤
│  State Management                                    │
│  ├─ React Hooks      │  ├─ Context API                │
│  ├─ Zustand (Optional)│  └─ React Query (Data Fetching) │
├─────────────────────────────────────────────────────────┤
│  UI Component Library                              │
│  ├─ shadcn/ui         │  ├─ Radix UI                  │
│  ├─ Lucide Icons      │  └─ Tailwind CSS 4            │
├─────────────────────────────────────────────────────────┤
│  Data Visualization                              │
│  ├─ Recharts          │  ├─ Three.js                  │
│  ├─ React Flow        │  └─ Mermaid                   │
├─────────────────────────────────────────────────────────┤
│  Form Handling                                    │
│  ├─ React Hook Form   │  ├─ Zod (Validation)          │
│  └─ TanStack Form     │                               │
├─────────────────────────────────────────────────────────┤
│  Internationalization                             │
│  └─ next-intl                                         │
└─────────────────────────────────────────────────────────┘
```

#### Page Structure

```
src/app/
├── (auth)/                 # Authentication pages
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/            # Dashboard layout
│   ├── dashboard/          # Main dashboard
│   ├── competitions/       # Competition management
│   ├── modeling/           # Modeling tasks
│   ├── teams/              # Team management
│   ├── learning/           # Learning module
│   ├── ai-providers/       # AI Provider management
│   └── settings/           # System settings
├── api/                    # API routes
│   ├── auth/
│   ├── competitions/
│   ├── modeling/
│   ├── teams/
│   └── ...
├── admin/                  # Admin pages
│   └── users/
├── layout.tsx              # Root layout
└── page.tsx                # Homepage
```

### Backend Architecture

#### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js API Routes                     │
├─────────────────────────────────────────────────────────┤
│  Authentication & Authorization                     │
│  ├─ JWT               │  ├─ BCrypt                     │
│  ├─ OAuth 2.0         │  └─ MFA                        │
├─────────────────────────────────────────────────────────┤
│  Data Validation                                 │
│  └─ Zod Schema                                       │
├─────────────────────────────────────────────────────────┤
│  ORM Layer                                       │
│  └─ Prisma 5                                         │
├─────────────────────────────────────────────────────────┤
│  Cache Layer                                     │
│  └─ Redis (Optional)                                 │
├─────────────────────────────────────────────────────────┤
│  File Storage                                   │
│  └─ AWS S3 / MinIO                                   │
├─────────────────────────────────────────────────────────┤
│  Task Queue                                     │
│  └─ BullMQ (Planned)                                 │
└─────────────────────────────────────────────────────────┘
```

#### API Route Design

```
/api
├── v1/                     # API v1 (Stable)
│   ├── auth/              # Authentication
│   │   ├── login
│   │   ├── register
│   │   ├── refresh
│   │   └── logout
│   ├── user/              # User
│   │   └── profile
│   ├── competitions/      # Competitions
│   ├── modeling-tasks/    # Modeling tasks
│   ├── teams/             # Teams
│   ├── ai-providers/      # AI Provider
│   ├── dashboard/         # Dashboard
│   └── learning/          # Learning
└── /                      # Versionless API (Internal)
    ├── init/
    ├── settings/
    └── ...
```

### Database Architecture

#### Database Selection

- **Primary Database**: PostgreSQL 14+
  - Relational data
  - JSON support
  - Full-text search
  - Transaction support

- **Cache Database**: Redis 7+ (Optional)
  - Session storage
  - API caching
  - Rate limiting
  - Pub/Sub

- **Object Storage**: S3 / MinIO
  - File uploads
  - Report storage
  - Static assets

#### Connection Pool Configuration

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Connection pool configuration
  pool_timeout = 10
  connection_limit = 10
}
```

### Deployment Architecture

#### Production Deployment

```
┌─────────────────────────────────────────────────────────┐
│                Load Balancer (Nginx)                     │
│        SSL Termination / Reverse Proxy / Static Files   │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼─────┐
│  Container 1│  │Container 2│
│  Next.js    │  │Next.js   │
└───┬────────┘  └────┬─────┘
    │                 │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────────┐  ┌────▼─────┐
│ PostgreSQL │  │ Redis    │
│ (Primary)  │  │ (Cache)  │
└────────────┘  └──────────┘
```

---

## 📦 Feature Modules

### 1. Competition Management Module

#### Features

- Create and edit competitions
- Competition template management
- Problem bank management
- Solution library
- Competition progress tracking
- Historical competition queries

#### Data Model

```prisma
model Competition {
  id          String    @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  startDate   DateTime
  endDate     DateTime
  status      CompetitionStatus
  description String?   @db.Text
  ownerId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  owner       User      @relation("UserCompetitions", fields: [ownerId], references: [id])
  problems    Problem[]
  solutions   Solution[]

  @@index([type])
  @@index([year])
  @@map("competitions")
}
```

### 2. Modeling Task Module

#### Features

- Create and manage tasks
- Task status tracking
- Subtask decomposition
- Task assignment
- Task logs
- Result export

#### Task Flow

```
PENDING (Pending)
    ↓
RUNNING (Running)
    ↓
PAUSED (Paused)
    ↓
COMPLETED (Completed)
    ↓
FAILED (Failed)
```

#### Data Model

```prisma
model ModelingTask {
  id            String          @id @default(cuid())
  title         String
  description   String?         @db.Text
  competitionId String?
  userId        String
  status        TaskStatus      @default(PENDING)
  progress      Int             @default(0)
  config        Json?
  result        Json?
  errorLog      String?         @db.Text
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  user          User            @relation("UserTasks", fields: [userId], references: [id])
  competition   Competition?    @relation(fields: [competitionId], references: [id])

  @@index([status])
  @@index([userId])
  @@map("modeling_tasks")
}
```

### 3. AI Provider Module

#### Features

- Provider configuration management
- Encrypted API Key storage
- Provider connection testing
- Usage statistics
- Cost control
- Automatic switching

#### Supported Providers

```typescript
enum AIProviderType {
  DEEPSEEK = 'DEEPSEEK',
  DOUBAO = 'DOUBAO',
  QWEN = 'QWEN',
  OPENAI = 'OPENAI',
  CHATGLM = 'CHATGLM',
  KIMI = 'KIMI',
}
```

#### API Key Encryption

```typescript
// Using AES-256-GCM encryption
const encrypted = await encrypt(apiKey, {
  key: process.env.ENCRYPTION_KEY!,
  algorithm: 'aes-256-gcm',
});

// Decrypt
const decrypted = await decrypt(encrypted, {
  key: process.env.ENCRYPTION_KEY!,
});
```

### 4. Learning Module

#### Features

- Bilibili video learning
- Knowledge point extraction
- Knowledge base management
- Learning progress tracking
- Personalized recommendations
- Learning reports

#### Scheduled Tasks

```typescript
// Execute daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await bilibiliLearningService.fetchNewVideos();
  await bilibiliLearningService.extractKnowledge();
  await bilibiliLearningService.updateProgress();
});
```

### 5. Team Management Module

#### Features

- Team creation and joining
- Member management
- Role assignment
- Access control
- Team messaging
- Activity logs

#### Team Roles

```typescript
enum TeamRole {
  CAPTAIN = 'CAPTAIN',  // Team leader
  MEMBER = 'MEMBER',    // Member
  OBSERVER = 'OBSERVER', // Observer
}
```

### 6. System Settings Module

#### Features

- User settings
- System configuration
- Database configuration
- AI Provider configuration
- Notification settings
- Security settings

---

## 💾 Database Design

### Core Data Models

#### 1. User (User Table)

```prisma
model User {
  id                  String         @id @default(cuid())
  email               String         @unique
  username            String         @unique
  passwordHash        String?
  role                UserRole       @default(USER)
  authProvider        AuthProvider   @default(LOCAL)
  isVerified          Boolean        @default(false)
  isMfaEnabled        Boolean        @default(false)
  mfaSecret           String?
  avatar              String?
  bio                 String?
  organization        String?
  failedLoginAttempts Int            @default(0)
  lockedUntil         DateTime?
  lastLoginAt         DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
  deletedAt           DateTime?

  aiProviders         AIProvider[]
  competitions        Competition[]
  modelingTasks       ModelingTask[]
  refreshTokens       RefreshToken[]
  teamMemberships     TeamMember[]
  ownedTeams          Team[]

  @@index([email])
  @@index([username])
  @@map("users")
}
```

**Field Descriptions**:

- `id`: Unique user identifier (CUID)
- `email`: Email address (unique)
- `username`: Username (unique)
- `passwordHash`: Password hash (BCrypt)
- `role`: User role (USER/ADMIN)
- `authProvider`: Authentication provider (LOCAL/OAUTH)
- `isVerified`: Email verified status
- `isMfaEnabled`: Multi-factor authentication enabled
- `mfaSecret`: MFA secret key (TOTP)
- `failedLoginAttempts`: Failed login attempts count
- `lockedUntil`: Account lock expiration time
- `lastLoginAt`: Last login time

**Indexes**:
- `email`: Accelerate email queries
- `username`: Accelerate username queries

#### 2. AIProvider (AI Provider Table)

```prisma
model AIProvider {
  id               String           @id @default(cuid())
  name             String
  type             AIProviderType
  apiKey           String
  endpoint         String?
  region           String?
  priority         Int              @default(0)
  isDefault        Boolean          @default(false)
  status           AIProviderStatus @default(ACTIVE)
  supportedModels  String[]
  capabilities     String[]
  config           Json?
  totalRequests    Int              @default(0)
  totalTokensUsed  Int              @default(0)
  lastUsedAt       DateTime?
  userId           String
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([type])
  @@index([status])
  @@index([userId])
  @@map("ai_providers")
}
```

**Field Descriptions**:

- `id`: Provider unique identifier
- `name`: Provider name
- `type`: Provider type (DEEPSEEK/DOUBAO/QWEN, etc.)
- `apiKey`: API Key (encrypted storage)
- `endpoint`: Custom endpoint
- `region`: Region
- `priority`: Priority (used for automatic switching)
- `isDefault`: Is default provider
- `status`: Status (ACTIVE/INACTIVE)
- `supportedModels`: Supported model list
- `capabilities`: Capability list (chat/code/image, etc.)
- `config`: Additional configuration (JSON)
- `totalRequests`: Total request count
- `totalTokensUsed`: Total tokens used
- `lastUsedAt`: Last usage time

**Enum Types**:

```typescript
enum AIProviderType {
  DEEPSEEK = 'DEEPSEEK',
  DOUBAO = 'DOUBAO',
  QWEN = 'QWEN',
  OPENAI = 'OPENAI',
  CHATGLM = 'CHATGLM',
  KIMI = 'KIMI',
}

enum AIProviderStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}
```

#### 3. Competition (Competition Table)

```prisma
model Competition {
  id          String             @id @default(cuid())
  name        String
  type        CompetitionType
  year        Int
  startDate   DateTime
  endDate     DateTime
  status      CompetitionStatus  @default(UPCOMING)
  description String?            @db.Text
  ownerId     String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  owner       User               @relation("UserCompetitions", fields: [ownerId], references: [id])
  problems    Problem[]
  solutions   Solution[]

  @@index([type])
  @@index([year])
  @@index([status])
  @@map("competitions")
}
```

**Enum Types**:

```typescript
enum CompetitionType {
  MCM = 'MCM',
  ICM = 'ICM',
  CUMCM = 'CUMCM',
  SHENZHEN = 'SHENZHEN',
  IMMC = 'IMMC',
  MATHORCUP = 'MATHORCUP',
  EMMC = 'EMMC',
  TEDDYCUP = 'TEDDYCUP',
  BLUEBRIDGE = 'BLUEBRIDGE',
}

enum CompetitionStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
```

#### 4. ModelingTask (Modeling Task Table)

```prisma
model ModelingTask {
  id            String      @id @default(cuid())
  title         String
  description   String?     @db.Text
  competitionId String?
  userId        String
  status        TaskStatus  @default(PENDING)
  progress      Int         @default(0)
  config        Json?
  result        Json?
  errorLog      String?     @db.Text
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation("UserTasks", fields: [userId], references: [id])
  competition   Competition? @relation(fields: [competitionId], references: [id])

  @@index([status])
  @@index([userId])
  @@map("modeling_tasks")
}
```

**Enum Types**:

```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
```

#### 5. Team (Team Table)

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String
  description String?
  ownerId     String
  maxMembers  Int      @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     TeamMember[]
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId])
  @@map("teams")
}
```

#### 6. TeamMember (Team Member Table)

```prisma
model TeamMember {
  id       String   @id @default(cuid())
  teamId   String
  userId   String
  role     TeamRole @default(MEMBER)
  joinedAt DateTime @default(now())

  team     Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
  @@map("team_members")
}
```

**Enum Types**:

```typescript
enum TeamRole {
  CAPTAIN = 'CAPTAIN',
  MEMBER = 'MEMBER',
  OBSERVER = 'OBSERVER',
}
```

#### 7. RefreshToken (Refresh Token Table)

```prisma
model RefreshToken {
  id        String    @id @default(cuid())
  token     String    @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime  @default(now())
  revokedAt DateTime?

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("refresh_tokens")
}
```

### Database Relationship Diagram

```
User (Users)
├── RefreshToken (1:N)
├── AIProvider (1:N)
├── Competition (1:N)
├── ModelingTask (1:N)
├── Team (1:N, as owner)
└── TeamMember (1:N)

Team (Teams)
└── TeamMember (1:N)

Competition (Competitions)
├── Problem (1:N)
└── Solution (1:N)
```

### Indexing Strategy

#### Primary Index

- All tables use `@id` to define primary keys
- Use `cuid()` to generate unique identifiers

#### Unique Indexes

- `User.email`: Email unique
- `User.username`: Username unique
- `RefreshToken.token`: Token unique
- `TeamMember.teamId + userId`: Team member unique

#### Regular Indexes

- `User.email`: Accelerate email login
- `User.username`: Accelerate username queries
- `AIProvider.type`: Accelerate queries by type
- `AIProvider.status`: Accelerate queries by status
- `Competition.type`: Accelerate queries by type
- `ModelingTask.status`: Accelerate queries by status

### Database Migration

#### Create Migration

```bash
# Development environment
pnpm prisma migrate dev --name add_user_preferences

# Production environment
pnpm prisma migrate deploy
```

#### Rollback Migration

```bash
# View migration history
pnpm prisma migrate status

# Rollback to specific migration
pnpm prisma migrate resolve --rolled-back [migration-name]
```

#### Reset Database

```bash
# Development environment: delete all data and reapply migrations
pnpm prisma migrate reset

# Production environment: Use with caution! Will delete all data
```

---

## 🔌 API Documentation

### API Overview

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token
- **Data Format**: JSON
- **Character Encoding**: UTF-8
- **Rate Limiting**: 100 requests/minute

### Authentication

#### Get Token

**Request**:

```http
POST /api/v1/auth/login
Content-Type: application/json
X-CSRF-Token: <csrf-token>

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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    }
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### Refresh Token

**Request**:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### User API

#### Get User Profile

**Request**:

```http
GET /api/v1/user/profile
Authorization: Bearer <access-token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Math modeling enthusiast",
    "organization": "Tsinghua University",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### Update User Profile

**Request**:

```http
PUT /api/v1/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "username": "newusername",
  "bio": "New bio",
  "organization": "Peking University"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "newusername",
    "bio": "New bio",
    "organization": "Peking University"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### Modeling Tasks API

#### Get Task List

**Request**:

```http
GET /api/v1/modeling-tasks?status=RUNNING&page=1&limit=20
Authorization: Bearer <access-token>
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "task-123",
      "title": "MCM 2026 Problem A",
      "description": "...",
      "status": "RUNNING",
      "progress": 45,
      "createdAt": "2026-02-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### Create Task

**Request**:

```http
POST /api/v1/modeling-tasks
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "title": "New Modeling Task",
  "description": "Task description",
  "competitionId": "comp-123",
  "config": {
    "algorithm": "xgboost",
    "parameters": {
      "max_depth": 6,
      "learning_rate": 0.1
    }
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "task-456",
    "title": "New Modeling Task",
    "status": "PENDING",
    "createdAt": "2026-02-10T12:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### AI Provider API

#### Get Provider List

**Request**:

```http
GET /api/v1/ai-providers
Authorization: Bearer <access-token>
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "provider-123",
      "name": "DeepSeek",
      "type": "DEEPSEEK",
      "status": "ACTIVE",
      "isDefault": true,
      "supportedModels": ["deepseek-chat", "deepseek-coder"],
      "totalRequests": 1000,
      "totalTokensUsed": 500000
    }
  ],
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### Create Provider

**Request**:

```http
POST /api/v1/ai-providers
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "My DeepSeek",
  "type": "DEEPSEEK",
  "apiKey": "sk-xxx",
  "endpoint": "https://api.deepseek.com",
  "isDefault": false
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "provider-456",
    "name": "My DeepSeek",
    "type": "DEEPSEEK",
    "status": "ACTIVE",
    "createdAt": "2026-02-10T12:00:00.000Z"
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### Dashboard API

#### Get Statistics

**Request**:

```http
GET /api/v1/dashboard/stats?days=7
Authorization: Bearer <access-token>
```

**Response**:

```json
{
  "success": true,
  "data": {
    "activeCompetitions": 5,
    "modelingTasks": 20,
    "teamMembers": 3,
    "aiRequests": 1500,
    "aiProviders": 3,
    "totalTasks": 100,
    "completedTasks": 80,
    "successRate": 0.8,
    "avgProgress": 0.65,
    "period": {
      "days": 7,
      "startDate": "2026-02-03T00:00:00.000Z",
      "endDate": "2026-02-10T00:00:00.000Z"
    }
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

#### Get Activity Logs

**Request**:

```http
GET /api/v1/dashboard/activities?type=tasks&limit=10
Authorization: Bearer <access-token>
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-123",
      "type": "task",
      "action": "created",
      "message": "Created task 'MCM 2026 Problem A'",
      "userId": "user-123",
      "createdAt": "2026-02-10T11:00:00.000Z"
    }
  ],
  "meta": {
    "count": 10,
    "type": "tasks",
    "limit": 10
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### Error Codes

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `SUCCESS` | 200 | Success |
| `UNAUTHORIZED` | 401 | Unauthorized |
| `FORBIDDEN` | 403 | Forbidden |
| `NOT_FOUND` | 404 | Not Found |
| `VALIDATION_ERROR` | 400 | Validation Error |
| `TOO_MANY_REQUESTS` | 429 | Too Many Requests |
| `INTERNAL_ERROR` | 500 | Internal Error |

**Error Response Format**:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": {}
  },
  "timestamp": "2026-02-10T12:00:00.000Z"
}
```

### Rate Limiting

- **Limit Rule**: Maximum 100 requests per minute per IP
- **Response Headers**:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1644480000
```

- **Exceeded Limit**: Returns `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24.0.0 or higher
- **pnpm**: 9.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Redis**: 7.0 or higher (optional, for caching)
- **Docker**: 20.10 or higher (for deployment)

### Verify Environment

```bash
# Check Node.js version
node --version  # Should output v24.x.x

# Check pnpm version
pnpm --version  # Should output 9.x.x

# Check PostgreSQL version
psql --version  # Should output 14.x or higher

# Check Redis version (optional)
redis-server --version  # Should output 7.x or higher
```

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Configure Environment Variables

```bash
# Copy environment variable template
cp .env.example .env

# Edit .env file
nano .env
```

**Required Environment Variables**:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cmamsys"

# JWT
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:5000"
NEXT_PUBLIC_APP_NAME="CMAMSys"

# AI Provider (Optional)
DEEPSEEK_API_KEY=""
DOUBAO_API_KEY=""
```

#### 4. Initialize Database

```bash
# Run database migrations
pnpm prisma migrate dev

# (Optional) Populate test data
pnpm prisma seed
```

#### 5. Start Development Server

```bash
pnpm dev
```

Server will run at `http://localhost:5000`

#### 6. Access Application

Open `http://localhost:5000` in your browser

Default admin account:
- Email: `admin@cmamsys.com`
- Password: `admin123`

**⚠️ Please change the default password immediately!**

### Docker Quick Start

#### Using Docker Compose

```bash
# Start all services (including database)
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Start Application Only

```bash
# Build image
docker build -t cmamsys:latest .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/cmamsys" \
  -e JWT_SECRET="your-secret" \
  cmamsys:latest
```

---

## 📖 Detailed Installation Guide

### Prerequisites Installation

#### Install Node.js

**Using nvm (Recommended)**:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js 24
nvm install 24
nvm use 24

# Set as default version
nvm alias default 24
```

**Official Installer**:

Visit [Node.js website](https://nodejs.org/) to download and install.

#### Install pnpm

```bash
# Install using npm
npm install -g pnpm@latest

# Or use corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@latest --activate
```

#### Install PostgreSQL

**Ubuntu/Debian**:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew)**:

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows**:

Download [PostgreSQL installer](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE cmamsys;
CREATE USER cmamsys_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cmamsys TO cmamsys_user;

# Exit
\q
```

### Detailed Configuration

#### Environment Variables Explained

```env
# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:5000"
NEXT_PUBLIC_APP_NAME="CMAMSys"
NODE_ENV="development"

# ============================================
# Database Configuration
# ============================================
DATABASE_URL="postgresql://cmamsys_user:password@localhost:5432/cmamsys"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# ============================================
# Encryption Configuration
# ============================================
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# ============================================
# Redis Configuration (Optional)
# ============================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# ============================================
# AI Provider Configuration
# ============================================
# DeepSeek
DEEPSEEK_API_KEY="sk-xxx"
DEEPSEEK_ENDPOINT="https://api.deepseek.com"

# VolcEngine (Doubao)
DOUBAO_API_KEY="xxx"
DOUBAO_ENDPOINT="https://ark.cn-beijing.volces.com/api/v3"

# Aliyun Qwen
QWEN_API_KEY="sk-xxx"
QWEN_ENDPOINT="https://dashscope.aliyuncs.com/api/v1"

# OpenAI
OPENAI_API_KEY="sk-xxx"
OPENAI_ENDPOINT="https://api.openai.com/v1"

# ============================================
# Bilibili Learning Configuration
# ============================================
BILIBILI_LEARNING_ENABLED="true"
BILIBILI_LEARNING_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# ============================================
# Object Storage Configuration (Optional)
# ============================================
# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET="cmamsys-uploads"

# MinIO
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="cmamsys"
MINIO_USE_SSL="false"

# ============================================
# Email Configuration (Optional)
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="noreply@cmamsys.com"

# ============================================
# SMS Configuration (Optional)
# ============================================
SMS_PROVIDER="aliyun"  # aliyun / tencent
SMS_ACCESS_KEY="your-access-key"
SMS_SECRET_KEY="your-secret-key"
SMS_SIGN_NAME="CMAMSys"
SMS_TEMPLATE_CODE="SMS_123456789"

# ============================================
# Sentry Error Tracking (Optional)
# ============================================
SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ENVIRONMENT="development"

# ============================================
# Security Configuration
# ============================================
CSRF_SECRET="your-csrf-secret-key"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# ============================================
# Log Configuration
# ============================================
LOG_LEVEL="info"  # debug / info / warn / error
LOG_FORMAT="json"  # json / pretty

# ============================================
# Feature Flags
# ============================================
ENABLE_REGISTRATION="true"
ENABLE_MFA="false"
ENABLE_SSO="false"
ENABLE_BILIBILI_LEARNING="true"
```

#### Generate Keys

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32

# Generate CSRF_SECRET
openssl rand -base64 32
```

### Database Migration

#### Create Migration

```bash
# Create new migration
pnpm prisma migrate dev --name add_user_preferences

# View migration status
pnpm prisma migrate status
```

#### Apply Migration

```bash
# Development environment
pnpm prisma migrate dev

# Production environment
pnpm prisma migrate deploy
```

#### Reset Database

```bash
# Delete all data and reapply migrations (development only)
pnpm prisma migrate reset

# Populate with seed data
pnpm prisma db seed
```

### Verify Installation

```bash
# Run type checking
pnpm ts-check

# Run unit tests
pnpm test

# Run E2E tests
pnpm exec playwright test

# Start development server
pnpm dev
```

Visit `http://localhost:5000`, if you see the login page, installation is successful!

---

## ⚙️ Configuration Guide

### Application Configuration

#### App Settings

Located at `src/config/app.ts`:

```typescript
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'CMAMSys',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};
```

#### Feature Flags

Located at `src/config/features.ts`:

```typescript
export const features = {
  registration: process.env.ENABLE_REGISTRATION === 'true',
  mfa: process.env.ENABLE_MFA === 'true',
  sso: process.env.ENABLE_SSO === 'true',
  bilibiliLearning: process.env.ENABLE_BILIBILI_LEARNING === 'true',
};
```

### Database Configuration

#### Prisma Configuration

Located at `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Connection pool configuration
  pool_timeout = 10
  connection_limit = 10
}

generator client {
  provider = "prisma-client-js"
}
```

#### Optimization Configuration

```prisma
// Index optimization
@@index([field1, field2])

// Composite unique index
@@unique([field1, field2])

// Ignore fields (not generated)
@@ignore([deprecatedField])
```

### Redis Configuration

#### Redis Client Configuration

Located at `src/lib/redis.ts`:

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export default redis;
```

#### Cache Strategies

```typescript
// Session cache (15 minutes)
await redis.setex(`session:${userId}`, 900, sessionData);

// API cache (5 minutes)
await redis.setex(`api:${url}`, 300, responseData);

// Rate limiting (100 requests per minute)
const key = `ratelimit:${ip}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 60);
}
```

### AI Provider Configuration

#### Provider Configuration Example

```typescript
// DeepSeek configuration
const deepseekConfig = {
  type: 'DEEPSEEK',
  apiKey: process.env.DEEPSEEK_API_KEY,
  endpoint: process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com',
  models: ['deepseek-chat', 'deepseek-coder'],
};

// Doubao configuration
const doubaoConfig = {
  type: 'DOUBAO',
  apiKey: process.env.DOUBAO_API_KEY,
  endpoint: process.env.DOUBAO_ENDPOINT,
  models: ['doubao-pro', 'doubao-lite'],
};
```

#### Encrypted Storage

```typescript
// Encrypt API Key
import { encrypt } from '@/lib/encryption';

const encryptedKey = await encrypt(apiKey, {
  key: process.env.ENCRYPTION_KEY!,
  algorithm: 'aes-256-gcm',
});

// Store in database
await prisma.aIProvider.create({
  data: {
    name: 'My DeepSeek',
    type: 'DEEPSEEK',
    apiKey: encryptedKey,
  },
});
```

### Logging Configuration

#### Pino Configuration

Located at `src/lib/logger.ts`:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
        },
      }
    : undefined,
});

export default logger;
```

#### Usage Example

```typescript
import logger from '@/lib/logger';

// Info log
logger.info({ userId, action: 'login' }, 'User logged in');

// Error log
logger.error({ error, userId }, 'Login failed');

// Debug log
logger.debug({ data }, 'Processing request');
```

### Sentry Configuration

#### Sentry Initialization

Located at `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive information
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

#### Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Operation that might fail
} catch (error) {
  Sentry.captureException(error);
  logger.error({ error }, 'Operation failed');
}
```

---

## 🛠️ Development Guide

### Development Environment Setup

#### Install Development Dependencies

```bash
# Install all dependencies
pnpm install

# Install Playwright browsers (for E2E testing)
pnpm exec playwright install --with-deps chromium
```

#### Code Style

```bash
# ESLint check
pnpm lint

# Auto fix
pnpm lint --fix

# TypeScript type checking
pnpm ts-check
```

### Project Structure

```
cmamsys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── dashboard/
│   │   │   ├── competitions/
│   │   │   ├── modeling/
│   │   │   ├── teams/
│   │   │   ├── learning/
│   │   │   ├── ai-providers/
│   │   │   └── settings/
│   │   ├── api/               # API routes
│   │   │   ├── v1/           # API v1
│   │   │   │   ├── auth/
│   │   │   │   ├── user/
│   │   │   │   ├── modeling-tasks/
│   │   │   │   ├── ai-providers/
│   │   │   │   └── dashboard/
│   │   │   └── init/
│   │   ├── admin/             # Admin pages
│   │   │   └── users/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── modeling/          # Modeling components
│   │   └── common/            # Common components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication logic
│   │   ├── db.ts             # Prisma client
│   │   ├── cache.ts          # Cache utilities
│   │   ├── encryption.ts     # Encryption utilities
│   │   ├── logger.ts         # Logging utilities
│   │   └── validators.ts     # Validators
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── modeling.service.ts
│   │   ├── ai.service.ts
│   │   └── learning.service.ts
│   ├── types/                 # TypeScript types
│   │   ├── auth.ts
│   │   ├── modeling.ts
│   │   └── api.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useModeling.ts
│   │   └── useAI.ts
│   ├── store/                 # State management (optional)
│   │   └── auth.ts
│   ├── config/                # Configuration files
│   │   ├── app.ts
│   │   ├── features.ts
│   │   └── ai.ts
│   ├── middleware.ts          # Next.js middleware
│   └── __tests__/            # Unit tests
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Data seed
├── e2e/                       # E2E tests
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── ...
├── public/                    # Static assets
│   ├── images/
│   └── fonts/
├── docs/                      # Documentation
├── docker/                    # Docker configuration
├── scripts/                   # Scripts
├── .env.example              # Environment variable example
├── .coze                     # Coze configuration
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

### Development Workflow

#### Creating New Features

1. **Create Branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Develop Feature**

```bash
# Start development server
pnpm dev

# Run tests in another terminal
pnpm test:watch
```

3. **Commit Code**

```bash
# Add files
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/your-feature-name
```

4. **Create Pull Request**

#### Code Review Checklist

- [ ] Code follows ESLint standards
- [ ] TypeScript type checking passes
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Code has appropriate comments
- [ ] Documentation updated

### Debugging Tips

#### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5000"
    }
  ]
}
```

#### Log Debugging

```typescript
import logger from '@/lib/logger';

// Output detailed information in development
if (process.env.NODE_ENV === 'development') {
  logger.debug({ data }, 'Detailed debug info');
}

// Output only key information in production
logger.info({ userId, action }, 'User action');
```

#### Database Debugging

```bash
# View SQL queries
pnpm prisma studio

# Enable query logging
# Add to .env
DIRECT_URL="postgresql://user:password@localhost:5432/cmamsys?statement_cache_size=0"
```

### Testing

#### Unit Testing

Using Vitest:

```typescript
// src/__tests__/lib/auth.test.ts
import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '@/lib/auth';

describe('Auth Utils', () => {
  it('should generate and verify token', () => {
    const payload = { userId: '123' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe('123');
  });
});
```

Run tests:

```bash
# Run all tests
pnpm test

# Run specific file
pnpm test auth.test.ts

# Watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

#### E2E Testing

Using Playwright:

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

Run tests:

```bash
# Run all E2E tests
pnpm exec playwright test

# Run specific test
pnpm exec playwright test login.spec.ts

# UI mode
pnpm exec playwright test --ui
```

### Performance Optimization

#### Code Splitting

```typescript
// Dynamic import for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  loading="lazy"
/>
```

#### Caching Strategies

```typescript
// API route caching
export const revalidate = 60; // Cache for 60 seconds

// ISR incremental static regeneration
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

---

## 🚀 Deployment Guide

### Development Environment Deployment

```bash
# Start development server
pnpm dev

# Access http://localhost:5000
```

### Production Environment Deployment

#### Method 1: Direct Deployment

```bash
# Build production version
pnpm build

# Start production server
pnpm start
```

#### Method 2: Docker Deployment

**Build Image**:

```bash
docker build -t cmamsys:latest .
```

**Run Container**:

```bash
docker run -d \
  --name cmamsys \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/cmamsys" \
  -e JWT_SECRET="your-secret" \
  cmamsys:latest
```

**Docker Compose**:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/cmamsys
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=cmamsys
      - POSTGRES_USER=cmamsys
      - POSTGRES_PASSWORD=cmamsys
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

#### Method 3: PM2 Deployment

```bash
# Install PM2
pnpm add -g pm2

# Start application
pm2 start pnpm --name "cmamsys" -- start

# View status
pm2 status

# View logs
pm2 logs cmamsys

# Restart
pm2 restart cmamsys
```

**PM2 Configuration File**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cmamsys',
    script: 'pnpm',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
  }],
};
```

### Nginx Reverse Proxy

#### Configuration Example

```nginx
# /etc/nginx/sites-available/cmamsys
upstream cmamsys {
    server localhost:5000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://cmamsys;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Enable Configuration

```bash
sudo ln -s /etc/nginx/sites-available/cmamsys /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL/HTTPS Configuration

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d example.com

# Auto renewal
sudo certbot renew --dry-run
```

#### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        proxy_pass http://cmamsys;
        # ... other configurations
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### Load Balancing

#### Nginx Load Balancing

```nginx
upstream cmamsys_cluster {
    least_conn;
    server localhost:5001 weight=3;
    server localhost:5002 weight=2;
    server localhost:5003 weight=1;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://cmamsys_cluster;
        # ... other configurations
    }
}
```

### Monitoring and Logging

#### Log Management

```bash
# View application logs
pm2 logs cmamsys

# View error logs
pm2 logs cmamsys --err

# Clear logs
pm2 flush
```

#### Performance Monitoring

Use PM2 Plus:

```bash
# Install PM2 Plus
pm2 link <public_key> <secret_key>
```

### Backup and Recovery

#### Database Backup

```bash
# Backup
pg_dump -U cmamsys cmamsys > backup.sql

# Restore
psql -U cmamsys cmamsys < backup.sql
```

#### Automatic Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cmamsys_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump -U cmamsys cmamsys > $BACKUP_FILE

# Keep backups from last 7 days
find $BACKUP_DIR -name "cmamsys_*.sql" -mtime +7 -delete
```

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🧪 Testing Guide

### Unit Testing

#### Running Tests

```bash
# Run all tests
pnpm test

# Run specific file
pnpm test auth.test.ts

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

#### Writing Tests

```typescript
// src/__tests__/lib/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('Password Utils', () => {
  it('should hash and verify password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'test123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword('wrong', hash);

    expect(isValid).toBe(false);
  });
});
```

### E2E Testing

#### Running Tests

```bash
# Run all tests
pnpm exec playwright test

# Run specific test
pnpm exec playwright test login.spec.ts

# UI mode
pnpm exec playwright test --ui

# Debug mode
pnpm exec playwright test --debug
```

#### Writing Tests

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="active-competitions"]')).toBeVisible();
    await expect(page.locator('[data-testid="modeling-tasks"]')).toBeVisible();
  });
});
```

### API Testing

#### Using curl

```bash
# Test login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/v1/user/profile \
  -H "Authorization: Bearer <token>"
```

#### Using Postman

Import API collection: `docs/postman-collection.json`

### Test Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View report
open coverage/index.html
```

Target coverage:
- Statement coverage: > 80%
- Branch coverage: > 75%
- Function coverage: > 80%
- Line coverage: > 80%

---

## ⚡ Performance Optimization

### Frontend Optimization

#### Code Splitting

```typescript
// Route-level code splitting (automatic)
// Next.js App Router automatically splits

// Component-level code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

#### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

#### Caching Strategies

```typescript
// Static asset caching
// next.config.ts
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
};

// API caching
export const revalidate = 60; // Cache for 60 seconds
```

### Backend Optimization

#### Database Optimization

```prisma
// Add indexes
@@index([field1, field2])

// Selective queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
  },
});
```

#### Redis Caching

```typescript
// Cache query results
const cacheKey = `users:page:${page}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const users = await prisma.user.findMany();
await redis.setex(cacheKey, 300, JSON.stringify(users));

return users;
```

#### Connection Pool Optimization

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  pool_timeout = 10
  connection_limit = 10
}
```

### Performance Monitoring

#### Lighthouse

```bash
# Install Lighthouse
pnpm add -g lighthouse

# Run audit
lighthouse http://localhost:5000 --view
```

#### Web Vitals

```typescript
// Use next/web-vitals
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
  });

  return null;
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error Message**:
```
Error: Can't reach database server at `localhost:5432`
```

**Solution**:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection
psql -U cmamsys -d cmamsys -c "SELECT 1"
```

#### 2. Invalid JWT Token

**Error Message**:
```
Error: Invalid or expired token
```

**Solution**:

1. Check if JWT_SECRET is configured correctly
2. Check if token has expired
3. Re-login to get new token

#### 3. Port Already in Use

**Error Message**:
```
Error: Port 5000 is already in use
```

**Solution**:

```bash
# Find process using the port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use a different port
PORT=5001 pnpm dev
```

#### 4. Memory Overflow

**Error Message**:
```
JavaScript heap out of memory
```

**Solution**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev
```

#### 5. API Rate Limiting

**Error Message**:
```
429 Too Many Requests
```

**Solution**:

1. Wait for rate limit reset
2. Increase rate limit (with caution)
3. Use Redis cache to reduce requests

### Log Analysis

#### View Application Logs

```bash
# Development environment logs
pnpm dev 2>&1 | tee app.log

# Production environment logs (PM2)
pm2 logs cmamsys

# Docker logs
docker logs cmamsys
```

#### View Database Logs

```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### Error Tracking

View Sentry error reports: `https://sentry.io/`

### Performance Issues

#### Slow Database Queries

```bash
# Enable query logging
# prisma/schema.prisma
datasource db {
  logLevel = "query"
}
```

#### Slow Frontend Loading

```bash
# Analyze bundle size
pnpm build
pnpm analyze
```

---

## ❓ FAQ

### Q1: How to upgrade to the latest version?

```bash
# Pull latest code
git pull origin main

# Update dependencies
pnpm install

# Run database migrations
pnpm prisma migrate deploy

# Rebuild
pnpm build

# Restart service
pm2 restart cmamsys
```

### Q2: How to backup data?

```bash
# Backup database
pg_dump -U cmamsys cmamsys > backup.sql

# Backup uploaded files
tar -czf uploads-backup.tar.gz public/uploads/
```

### Q3: How to change admin password?

```bash
# Use Prisma Studio
pnpm prisma studio

# Or use script
node scripts/reset-admin-password.js
```

### Q4: How to enable HTTPS?

Refer to [SSL/HTTPS Configuration](#sslhttps-configuration) section.

### Q5: How to add new AI Provider?

1. Create new Provider in `src/lib/ai/`
2. Implement unified interface
3. Add configuration in database
4. Test connection

### Q6: How to customize theme?

Edit `src/styles/globals.css` and `tailwind.config.ts`.

### Q7: How to disable certain features?

Set feature flags in `.env` file:

```env
ENABLE_REGISTRATION="false"
ENABLE_MFA="false"
ENABLE_BILIBILI_LEARNING="false"
```

---

## 📝 Changelog

### v1.0.0 (2026-02-10)

#### New Features

- ✨ Complete automated modeling pipeline
- ✨ Multi AI Provider support (DeepSeek, Doubao, Qwen, OpenAI)
- ✨ Bilibili learning system
- ✨ Team collaboration features
- ✨ Competition management
- ✨ Beautiful visualizations
- ✨ Enterprise-grade security
- ✨ Internationalization support (Chinese and English)
- ✨ Docker deployment

#### Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Prisma 5
- PostgreSQL
- shadcn/ui
- Tailwind CSS 4

#### Testing

- 126 unit tests all passed
- E2E testing framework completed

#### Documentation

- Complete API documentation
- Detailed deployment guide
- Development guide

---

## 🤝 Contributing Guide

### How to Contribute

We welcome contributions in all forms!

1. **Report Bugs**: Submit issues at [GitHub Issues](https://github.com/your-org/cmamsys/issues)
2. **Suggest Features**: Discuss at [GitHub Discussions](https://github.com/your-org/cmamsys/discussions)
3. **Submit Code**: Submit Pull Requests
4. **Improve Documentation**: Improve docs and examples

### Contribution Process

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add some feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit Pull Request

### Code Standards

- Use ESLint and Prettier for code formatting
- Follow TypeScript strict mode
- Write unit tests
- Update related documentation

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

---

## 📄 License

### Community Edition

MIT License - See [LICENSE](LICENSE) file for details.

**Free to use, modify, and distribute**

### Enterprise Edition

Commercial License - Requires commercial authorization.

**Contact licensing**: [license@cmamsys.com](mailto:license@cmamsys.com)

---

## 📞 Contact

### Technical Support

- 📧 Email: [support@cmamsys.com](mailto:support@cmamsys.com)
- 📚 Documentation: [docs.cmamsys.com](https://docs.cmamsys.com)
- 🐛 Issue Reporting: [GitHub Issues](https://github.com/your-org/cmamsys/issues)

### Business Cooperation

- 💼 Business: [business@cmamsys.com](mailto:business@cmamsys.com)
- 🔐 Enterprise License: [license@cmamsys.com](mailto:license@cmamsys.com)

### Community

- 💬 Discussions: [GitHub Discussions](https://github.com/your-org/cmamsys/discussions)
- 📱 WeChat Group: Scan QR code to join

---

## 🙏 Acknowledgments

Thanks to the following open source projects and services:

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Prisma](https://www.prisma.io/) - ORM
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type system
- [Vitest](https://vitest.dev/) - Testing framework
- [Playwright](https://playwright.dev/) - E2E testing
- And all contributors

---

<div align="center">

**Built with ❤️ for the Mathematical Modeling Community**

[⬆ Back to Top](#cmamsys---competimath-automodel-system)

**If this project helps you, please give it a ⭐ Star!**

</div>
