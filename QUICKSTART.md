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
