# CMAMSys - CompetiMath AutoModel System (English)

<div align="center">

**CompetiMath AutoModel System**

An enterprise-grade automated mathematical modeling competition platform for teams and individuals.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)

</div>

---

## 📋 Overview

CMAMSys is a full-stack enterprise platform designed for mathematical modeling competitions, including MCM/ICM, CUMCM, Shenzhen Cup, IMMC, MathorCup, EMMC, TeddyCup, BlueBridge Math, and other regional competitions.

### 🎯 Key Features

- **Automated Modeling Pipeline**: From data preprocessing to model training, evaluation, and report generation
- **Multi-Algorithm Support**: Scikit-learn, XGBoost, LightGBM, PyTorch integration
- **AI Integration**: Multiple AI providers support (DeepSeek, VolcEngine Doubao, Aliyun Qwen, OpenAI, etc.)
- **Streaming Output**: Real-time AI response streaming with SSE support
- **Team Collaboration**: Multi-user support with role-based access control
- **Daily Learning Module**: Automated learning from Bilibili and user-provided materials
- **Enterprise Security**: JWT authentication, MFA, SSO, anti-attack measures
- **Docker Deployment**: One-click deployment to NAS/servers

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

# Initialize database
pnpm prisma migrate dev

# Start development server
coze dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, shadcn/ui, Tailwind CSS 4
- **Backend**: Next.js API Routes, JWT, BCrypt, Zod
- **Database**: PostgreSQL, Prisma ORM
- **Deployment**: Docker, Docker Compose

---

## 🐳 Docker Deployment

```bash
cd docker

# Community Edition
./deploy.sh community up

# Enterprise Edition
./deploy.sh enterprise up --with-redis --with-minio
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📚 Documentation

- [Installation Guide](docs/installation-guide.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Development Guide](DEVELOPMENT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Architecture Diagrams](docs/architecture-diagrams.md)
- [Testing Guide](docs/testing-guide.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

---

## 📄 License

- **Community Edition**: MIT License
- **Enterprise Edition**: Commercial License

For licensing inquiries: [license@cmamsys.com](mailto:license@cmamsys.com)

---

## 📞 Support

- 📧 Email: [support@cmamsys.com](mailto:support@cmamsys.com)
- 📚 Documentation: [docs.cmamsys.com](https://docs.cmamsys.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/cmamsys/issues)

---

<div align="center">

**Built with ❤️ for the mathematical modeling community**

</div>
