# CMAMSys - CompetiMath AutoModel System

<div align="center">

**CompetiMath AutoModel System**

An enterprise-grade automated mathematical modeling competition platform for teams and individuals.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)

[Website](https://cmamsys.com) | [Documentation](#) | [Demo](#)

</div>

---

## 📋 Overview

CMAMSys is a full-stack enterprise platform designed for mathematical modeling competitions, including:
- MCM/ICM (Mathematical Contest in Modeling)
- CUMCM (China Undergraduate Mathematical Contest in Modeling)
- Shenzhen Cup
- IMMC (International Mathematical Modeling Challenge)
- MathorCup
- EMMC (Electric Mathematical Modeling Competition)
- TeddyCup
- BlueBridge Math
- And other regional competitions

### 🎯 Key Features

- **Automated Modeling Pipeline**: From data preprocessing to model training, evaluation, and report generation
- **Multi-Algorithm Support**: Scikit-learn, XGBoost, LightGBM, PyTorch integration
- **Competition-Specific Templates**: Pre-configured for different competition types
- **AI Integration**: Multiple AI providers support (DeepSeek, VolcEngine Doubao, Aliyun Qwen, OpenAI, etc.)
- **Streaming Output**: Real-time AI response streaming with SSE support
- **Team Collaboration**: Multi-user support with role-based access control
- **Daily Learning Module**: Automated learning from Bilibili and user-provided materials
- **Beautiful Visualizations**: Competition-themed charts (MCM red, CUMCM blue) with UML and business flow diagrams
- **Enterprise Security**: JWT authentication, MFA, SSO, anti-attack measures
- **API-First Design**: REST API for third-party integrations
- **Docker Deployment**: One-click deployment to NAS/servers
- **Bilibili Learning System**: Automated learning from Bilibili videos to build knowledge base

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- pnpm 9.0.0+
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cmamsys.git
cd cmamsys

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
pnpm prisma migrate dev

# Start development server
coze dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Production Build

```bash
# Build for production
coze build

# Start production server
coze start
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Framework: Next.js 16 (App Router)
- UI Library: React 19 + shadcn/ui
- Styling: Tailwind CSS 4
- State Management: React Hooks + Context API
- Dark Mode: next-themes

**Backend**
- Runtime: Next.js API Routes
- Authentication: JWT + BCrypt + MFA
- Rate Limiting: Token bucket algorithm
- Validation: Zod

**Database**
- ORM: Prisma
- Database: PostgreSQL
- Caching: Redis (optional)

**Deployment**
- Containerization: Docker + Docker Compose
- Platform: Linux (NAS/Server compatible)

---

## 📁 Project Structure

```
cmamsys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (microservices)
│   │   │   ├── auth/          # Authentication service
│   │   │   ├── modeling/      # Modeling pipeline service
│   │   │   ├── learning/      # Bilibili learning system
│   │   │   ├── competitions/  # Competition management
│   │   │   ├── teams/         # Team management
│   │   │   ├── ai-providers/  # AI provider management
│   │   │   ├── settings/      # System settings
│   │   │   └── init/          # App initialization
│   │   ├── dashboard/         # Main dashboard
│   │   │   ├── competitions/  # Competition page
│   │   │   ├── teams/         # Team page
│   │   │   └── ai-providers/  # AI providers page
│   │   ├── learning/          # Learning module
│   │   │   ├── knowledge/     # Knowledge base page
│   │   │   └── settings/      # Learning settings page
│   │   ├── settings/          # System settings
│   │   ├── auth/              # Login/Registration
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility libraries
│   ├── services/              # Business logic
│   │   ├── bilibili-learning.ts # Bilibili learning service
│   │   └── learning-cron.ts  # Scheduled learning tasks
│   └── hooks/                 # Custom hooks
├── prisma/                    # Database schema
│   └── schema.prisma
├── docker/                    # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
└── docs/                      # Documentation
```

---

## 🔐 Security Features

### Authentication & Authorization
- **Password Hashing**: BCrypt/Argon2 with salt
- **Token Management**: JWT (Access Token + Refresh Token)
- **Multi-Factor Authentication**: SMS/Email verification codes
- **Single Sign-On (SSO)**: Unified authentication center
- **Session Management**: Redis cluster support
- **Account Lockout**: Failed attempt limits

### Anti-Attack Measures
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Input sanitization + CSP
- **CSRF Protection**: CSRF Token + SameSite Cookie
- **Rate Limiting**: Token bucket (≤10 requests/minute per IP)
- **Input Validation**: Zod schema validation

---

## 🐳 Docker Deployment

CMAMSys supports two editions with Docker deployment:

### Editions

| Edition | Features | License | Deployment |
|---------|----------|---------|------------|
| **Community** | Basic modeling, team collaboration, report generation | MIT (Free) | Self-hosted |
| **Enterprise** | All features + SSO + unlimited storage + priority support | Commercial | Self-hosted (paid) |

### Quick Start with Docker

```bash
cd docker

# Community Edition (Free)
cp .env.community.example .env.community
./deploy.sh community up

# Enterprise Edition (Requires license)
cp .env.enterprise.example .env.enterprise
./deploy.sh enterprise up --with-redis --with-minio
```

Access the application at http://localhost:5000

### Deployment Options

**Community Edition:**
```bash
# Basic deployment (PostgreSQL + App)
./deploy.sh community up

# With Redis (caching)
./deploy.sh community up --with-redis

# View logs
./deploy.sh community logs

# Stop services
./deploy.sh community down
```

**Enterprise Edition:**
```bash
# Full deployment (PostgreSQL + Redis + MinIO + App)
./deploy.sh enterprise up --with-redis --with-minio

# With Nginx (HTTPS + reverse proxy)
./deploy.sh enterprise up --with-redis --with-minio --with-nginx

# View logs
./deploy.sh enterprise logs

# Stop services
./deploy.sh enterprise down
```

### Environment Configuration

Copy the appropriate environment file and configure:

```bash
# Community Edition
cp docker/.env.community.example docker/.env.community

# Enterprise Edition
cp docker/.env.enterprise.example docker/.env.enterprise
```

**Important**: Change the default passwords and JWT secrets in production!

### Build Custom Images

```bash
cd docker

# Build Community Edition
./build.sh community v1.0.0

# Build Enterprise Edition
./build.sh enterprise v1.0.0

# Build and push to registry
REGISTRY=your-registry.com ./build.sh enterprise v1.0.0 --push
```

### Detailed Deployment Guide

See [docs/deployment-guide.md](docs/deployment-guide.md) for detailed deployment instructions.

---

## 📋 Modeling Pipeline

### Data Preprocessing
- Automatic data type detection
- Missing value handling
- Outlier detection and treatment
- Feature engineering templates
- Exploratory data analysis

### Model Factory
- Classification models: Random Forest, XGBoost, LightGBM, Neural Networks
- Regression models: Linear Regression, SVR, Gradient Boosting
- Optimization models: Linear Programming, Integer Programming
- Evaluation-specific models: Bayesian models, Shapley values, Z-test
- Competition-specific: Grey prediction, Operations research optimization

### Evaluation & Visualization
- Multiple metrics: Accuracy, RMSE, F1-score, etc.
- Competition-themed charts: MCM red, CUMCM blue
- Interactive visualizations: Matplotlib + Seaborn + Plotly
- Model interpretation: SHAP values
- Flow diagrams: UML + Business flow

### Report Generation
- Markdown templates: English (MCM/ICM), Chinese (CUMCM)
- Mathematical justification for each decision
- Competition-specific adaptation reasons
- Version control support

---

## 🎓 Daily Learning Module

- **Automated Learning**: Daily Bilibili content extraction
- **User Materials**: Process uploaded PDFs, videos, documents
- **Knowledge Base**: Structured storage in `data/knowledge_base.json`
- **Categorized Storage**: Organized by topic and competition type
- **Learning Reports**: Daily summaries and insights

---

## 🏆 Competition Support

Supported competitions with standardized naming:

| Competition | Folder Format | Example |
|-------------|---------------|---------|
| MCM | `{year}-MCM/{problem-id}` | `data/competitions/2026-MCM/A/` |
| ICM | `{year}-ICM/{problem-id}` | `data/competitions/2026-ICM/D/` |
| CUMCM | `{year}-CUMCM/{problem-id}` | `data/competitions/2026-CUMCM/A/` |
| Shenzhen Cup | `{year}-ShenzhenCup/{problem-id}` | `data/competitions/2026-ShenzhenCup/A/` |
| IMMC | `{year}-IMMC/{problem-id}` | `data/competitions/2026-IMMC/A/` |
| MathorCup | `{year}-MathorCup/{problem-id}` | `data/competitions/2026-MathorCup/A/` |
| EMMC | `{year}-EMMC/{problem-id}` | `data/competitions/2026-EMMC/A/` |
| TeddyCup | `{year}-TeddyCup/{problem-id}` | `data/competitions/2026-TeddyCup/A/` |
| BlueBridge Math | `{year}-BlueBridgeMath/{problem-id}` | `data/competitions/2026-BlueBridgeMath/A/` |

Multiple approaches supported: `2026-MCM/A-1/`, `2026-MCM/A-2/`

---

## 📦 Deployment

### Docker Deployment

```bash
# Build and start with Docker Compose
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### NAS Deployment (Synology)

```bash
# Install Docker and Docker Compose on Synology
# Copy project files to NAS
# Run:
docker-compose -f docker/docker-compose.nas.yml up -d
```

### Server Deployment (Linux)

```bash
# Copy project files to server
# Set environment variables
# Run deployment script:
bash docker/deploy.sh
```

---

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm ts-check
```

---

## 📚 Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Modeling Guide](docs/modeling-guide.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Project Summary](docs/project-summary.md)
- [Contributing](CONTRIBUTING.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## 📄 License

- **Community Edition**: MIT License - Free for personal and commercial use
- **Enterprise Edition**: Commercial License - Requires purchase for advanced features

For licensing inquiries, please contact [license@cmamsys.com](mailto:license@cmamsys.com)

---

## 📞 Support

- 📧 Email: [support@cmamsys.com](mailto:support@cmamsys.com)
- 📚 Documentation: [docs.cmamsys.com](https://docs.cmamsys.com)
- 💬 Community: [community.cmamsys.com](https://community.cmamsys.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/cmamsys/issues)

---

## 📞 Support

- Email: support@cmamsys.com
- Website: https://cmamsys.com
- Documentation: https://docs.cmamsys.com

---

<div align="center">

**Built with ❤️ for the mathematical modeling community**

[⬆ Back to Top](#cmamsys---competimath-automodel-system)

</div>
