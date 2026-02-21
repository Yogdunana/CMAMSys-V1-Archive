> ⚠️ **Archived Repository**
>
> This repository has been archived and is no longer actively maintained.
> This quick start guide is provided for reference and learning purposes only.
> For educational use, please ensure you:
> - Replace all hardcoded configurations with your own secure settings
> - Do not use default credentials in production
> - Review and update all security configurations
>
> **Attribution**: If you use this code as a reference or in your projects, please attribute to:
> - **Project**: CMAMSys (CompetiMath AutoModel System)
> - **Repository**: https://github.com/Yogdunana/CMAMSys-V1-Archive

---

# 快速开始

本指南帮助你在 5 分钟内快速部署 CMAMSys。

## 前置要求

- **Node.js** 18.0+ (推荐 20.0+)
- **PostgreSQL** 12.0+ (推荐 15.0+)
- **pnpm** 8.0+

## 快速开始（Web 安装）

### 1. 安装依赖

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
pnpm install
```

### 2. 启动应用

```bash
pnpm dev
```

### 3. 打开浏览器

访问 `http://localhost:5000/install`，按照向导完成安装。

**安装向导包含以下步骤**：

1. 环境检查
2. 数据库配置（支持新建或连接现有数据库）
3. 管理员账户创建
4. 应用配置（名称、URL、端口）
5. **邮件配置**（可选，配置 SMTP 用于发送通知和密码重置）
6. **路径配置**（配置文件存储路径）
7. 安全密钥配置（自动生成或手动设置）
8. 安装进度

**提示**：邮件服务是可选的，可以在安装后配置。路径支持绝对路径和相对路径。

### 4. 完成！

安装完成后，访问 `http://localhost:5000/login` 登录系统。

---

## 快速开始（Docker）

### 1. 配置环境变量

```bash
git clone https://github.com/your-org/cmamsys.git
cd cmamsys
cp .env.docker.example .env
```

### 2. 启动服务

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh start
```

### 3. 初始化数据库

```bash
./docker-deploy.sh migrate
./docker-deploy.sh seed
```

### 4. 完成！

访问 `http://localhost:5000/login` 登录系统。

---

## 默认账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | （安装时设置） | 管理员 |

---

## 下一步

- 阅读完整 [部署文档](DEPLOYMENT.md)
- 查看 [用户指南](USER_GUIDE.md)
- 探索 [API 文档](API.md)

---

## 常见问题

**Q: 端口被占用怎么办？**
A: 修改 `.env` 文件中的 `APP_PORT` 环境变量。

**Q: 数据库连接失败？**
A: 检查 PostgreSQL 是否已启动，以及 `DATABASE_URL` 配置是否正确。

**Q: 如何重置系统？**
A: 删除 `.env` 文件并重新运行安装向导。

---

需要更多帮助？查看 [完整文档](DEPLOYMENT.md) 或提交 [Issue](https://github.com/your-org/cmamsys/issues)。
