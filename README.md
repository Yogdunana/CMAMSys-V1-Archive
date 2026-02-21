> ⚠️ **Security Notice**
>
> This repository is an archived version and may contain hardcoded test configurations (such as database passwords and local paths). It is intended for learning and reference only. Please do not deploy directly to production.
> Before using in production, replace all hardcoded configurations with your own secure configurations.
>
> ⚠️ **Archived Repository**
>
> This repository has been archived and is no longer actively maintained.
> - No issues or pull requests will be accepted
> - No technical support is provided
> - Use at your own risk
> - For learning and reference purposes only

---

## 🌍 Language / 语言

- [English](./README.md) (Current)
- [中文](./README.zh-CN.md)

---

# CMAMSys - Competitive Mathematics AutoModel System

<div align="center">

**Enterprise-Grade Mathematical Modeling Competition Platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)

</div>

---

## 📖 Introduction

CMAMSys is a fully functional enterprise-grade mathematical modeling competition platform, supporting comprehensive workflow management including competition organization, team collaboration, AI-assisted modeling, project submission, and evaluation scoring.

### Core Features

- 🔐 **Authentication** - Complete authentication system with email registration, MFA, and password reset
- 👥 **User Management** - Role-based access control, team management, and user profile management
- 📊 **Competition Management** - Create competitions, set rules, and manage participants
- 🤖 **AI Assistance** - Integrate multiple AI providers to assist with modeling tasks
- 📝 **Project Management** - Online editing, document management, and version control
- 📈 **Data Analytics** - Statistical analysis and visualization reports
- 🔍 **Audit Logs** - Complete operation log tracking
- 🌐 **Internationalization** - Support for i18n

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- PostgreSQL 16
- pnpm 9+
- Redis 7+ (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Yogdunana/CMAMSys-V1-Archive.git
cd CMAMSys-V1-Archive
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. **Initialize database**

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate deploy

# Seed initial data
pnpm prisma seed
```

5. **Start development server**

```bash
pnpm dev
```

Visit http://localhost:5000

### Default Account

- Email: `admin@cmamsys.com`
- Password: `REDACTED_PASSWORD`

**⚠️ Please change the default password immediately in production!**

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **State Management**: React Context + Hooks

### Backend

- **Framework**: Next.js API Routes
- **ORM**: Prisma 6
- **Database**: PostgreSQL 16
- **Cache**: Redis (optional)
- **Authentication**: JWT + Refresh Tokens

### Development Tools

- **Package Manager**: pnpm
- **Code Style**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Testing**: Vitest

---

## 📁 Project Structure

```
CMAMSys/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── auth/         # Auth pages
│   │   ├── dashboard/    # Dashboard
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions
│   ├── services/         # Business logic
│   └── styles/           # Styles
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
├── docs/                 # Documentation
├── scripts/              # Scripts
└── docker/               # Docker configuration
```

---

## 🔧 Development Guide

### Code Standards

- Use TypeScript for type checking
- Follow ESLint rules
- Format code with Prettier
- Use PascalCase for components
- Use kebab-case for files

### Git Workflow

1. Create a feature branch from main
2. Run tests before committing
3. Create a Pull Request
4. Wait for Code Review
5. Merge to main

### Commit Convention

Follow Conventional Commits:

```
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: code refactoring
test: test related
chore: build/tool
```

---

## 📚 Documentation

- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Quick Start](./QUICKSTART.md)

---

## 🤝 Contributing

Contributions are welcome! Please check the [Contributing Guide](./CONTRIBUTING.md) for details.

### How to Contribute

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Attribution

If you use this project for learning or reference, please kindly mention the original author:

**In your project's README or documentation:**

```markdown
This project was inspired by/uses code from [CMAMSys](https://github.com/Yogdunana/CMAMSys-V1-Archive) by [Yogdunana](https://github.com/Yogdunana).
```

**In your academic work:**

```
CMAMSys (Competitive Mathematics AutoModel System) - Enterprise-Grade Mathematical Modeling Competition Platform
Copyright (c) 2025-2026 Yogdunana
Repository: https://github.com/Yogdunana/CMAMSys-V1-Archive
```

**In your blog post or article:**

> This work references [CMAMSys](https://github.com/Yogdunana/CMAMSys-V1-Archive), an enterprise-grade mathematical modeling competition platform developed by [Yogdunana](https://github.com/Yogdunana).

**Social Media Mention:**

> Just learned about [CMAMSys](https://github.com/Yogdunana/CMAMSys-V1-Archive) by [@Yogdunana](https://github.com/Yogdunana) - great reference for building mathematical modeling competition platforms! #coding #opensource

---

## 📮 Contact

- Author: [Yogdunana](https://github.com/Yogdunana)
- Repository: [https://github.com/Yogdunana/CMAMSys-V1-Archive](https://github.com/Yogdunana/CMAMSys-V1-Archive)
- Issues: [GitHub Issues](https://github.com/Yogdunana/CMAMSys-V1-Archive/issues)

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

Made with ❤️ by Yogdunana (https://github.com/Yogdunana)

</div>
