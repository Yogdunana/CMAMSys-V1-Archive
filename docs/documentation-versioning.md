# CMAMSys 文档版本管理规范

本文档定义了 CMAMSys 项目文档的版本管理规范，确保文档的维护和更新有序进行。

## 📋 目录

- [版本号规范](#版本号规范)
- [文档分类](#文档分类)
- [更新流程](#更新流程)
- [版本发布](#版本发布)
- [维护责任](#维护责任)
- [更新日志](#更新日志)

---

## 版本号规范

### 语义化版本 (Semantic Versioning)

文档版本遵循语义化版本规范：`MAJOR.MINOR.PATCH`

- **MAJOR**：主版本号 - 文档结构重大变更或不兼容的更新
- **MINOR**：次版本号 - 向下兼容的功能性新增
- **PATCH**：修订号 - 向下兼容的问题修正

**示例**：
- `2.0.0` → `3.0.0`：文档结构重大重组
- `2.0.0` → `2.1.0`：新增 API 文档
- `2.0.0` → `2.0.1`：修复文档中的错误

### 文档版本与代码版本对应

文档版本应与对应代码版本保持一致：

| 文档版本 | 代码版本 | 说明 |
|---------|---------|------|
| v2.0.0 | v2.0.0 | 初始版本 |
| v2.1.0 | v2.1.0 | 新增功能 |
| v2.0.1 | v2.0.1 | Bug 修复 |

---

## 文档分类

### 按重要性分类

#### 核心文档 (⭐⭐⭐)

必须随每个版本更新，版本号与代码版本严格对应：

- README.md
- README.en.md
- DEPLOYMENT.md
- DEVELOPMENT.md
- CONTRIBUTING.md

#### 技术文档 (⭐⭐)

重大更新时需要更新，小版本可选：

- docs/installation-guide.md
- docs/deployment-guide.md
- docs/architecture-diagrams.md
- docs/api-reference.md
- docs/testing-guide.md
- docs/project-summary.md

#### 功能文档 (⭐)

功能变更时需要更新：

- docs/providers-config-summary.md
- docs/api-key-encryption.md
- docs/aliyun-integration-guide.md
- docs/volcengine-integration-guide.md
- docs/volcengine-quick-start.md

#### 修复文档 (⭐⭐⭐)

问题修复时需要更新：

- docs/volcengine-404-fix.md
- docs/volcengine-troubleshooting.md
- docs/security-fixes-summary.md

#### 报告文档 (⭐⭐⭐)

不随版本变化，独立维护：

- docs/documentation-review-report.md
- docs/documentation-checklist.md

### 按生命周期分类

#### 永久文档

长期维护，版本号与代码版本一致：

- README.md
- DEVELOPMENT.md
- CONTRIBUTING.md
- docs/api-reference.md

#### 临时文档

问题解决后可归档：

- docs/volcengine-404-fix.md
- docs/volcengine-setup-complete.md
- docs/auth-test-report.md

---

## 更新流程

### 更新触发条件

1. **代码发布**：代码新版本发布时，必须更新对应文档
2. **功能变更**：新增、修改或删除功能时
3. **Bug 修复**：修复影响文档描述的 Bug 时
4. **用户反馈**：根据用户反馈改进文档时
5. **定期审查**：每季度进行一次文档审查

### 更新步骤

#### 1. 创建更新分支

```bash
git checkout -b docs/update-v2.1.0
```

#### 2. 更新文档内容

- 修改相关文档文件
- 更新文档版本号
- 添加变更说明

#### 3. 更新更新日志

在 `CHANGELOG.md` 中记录所有变更：

```markdown
## [2.1.0] - 2026-02-08

### Added
- 新增 API 参考文档
- 新增架构图和流程图文档
- 新增测试指南文档
- 新增英文版 README

### Changed
- 更新安装指南，添加故障排查章节
- 更新部署指南，扩展常见问题

### Fixed
- 修复 README.md Docker 部署部分截断问题
- 修复 installation-guide.md 页面鉴权部分截断问题
```

#### 4. 提交变更

```bash
git add .
git commit -m "docs: update documentation for v2.1.0"
```

#### 5. 合并分支

```bash
git checkout main
git merge docs/update-v2.1.0
```

#### 6. 打标签

```bash
git tag -a docs-v2.1.0 -m "Documentation version 2.1.0"
git push origin docs-v2.1.0
```

### 文档审查清单

在发布文档更新前，确保：

- [ ] 所有变更已记录在 CHANGELOG.md 中
- [ ] 文档版本号已更新
- [ ] 所有链接有效
- [ ] 代码示例可运行
- [ ] 截图和图表清晰
- [ ] 拼写和语法正确
- [ ] 文档格式统一
- [ ] 更新日期已更新

---

## 版本发布

### 发布类型

#### 主版本发布 (Major)

触发条件：
- 文档结构重大重组
- 不兼容的变更

流程：
1. 创建主要更新分支
2. 全面更新文档
3. 更新所有版本号
4. 发布公告
5. 迁移指南（如有必要）

#### 次版本发布 (Minor)

触发条件：
- 新增功能文档
- 向下兼容的变更

流程：
1. 创建功能更新分支
2. 更新相关文档
3. 更新版本号
4. 发布说明

#### 修订版本发布 (Patch)

触发条件：
- 修复文档错误
- 小的改进

流程：
1. 直接修改文档
2. 更新版本号
3. 更新 CHANGELOG.md

### 发布公告

发布新版本时，创建发布公告：

```markdown
# 📚 文档更新公告 v2.1.0

## 🎉 更新内容

### 新增文档
- ✅ docs/architecture-diagrams.md - 架构图和流程图
- ✅ docs/testing-guide.md - 测试指南
- ✅ docs/api-reference.md - API 参考文档
- ✅ README.en.md - 英文版 README

### 改进文档
- ✅ README.md - 补充 FAQ 和联系信息
- ✅ docs/installation-guide.md - 添加故障排查
- ✅ docs/deployment-guide.md - 扩展常见问题

### 修复问题
- ✅ 修复文档截断问题
- ✅ 更新过时的代码示例

## 📖 详细变更

详见 [CHANGELOG.md](CHANGELOG.md)

## 🔗 相关链接

- [GitHub Release](https://github.com/your-org/cmamsys/releases/tag/docs-v2.1.0)
- [文档在线版本](https://docs.cmamsys.com/v2.1.0)

---

**发布日期：2026-02-08**
```

---

## 维护责任

### 文档维护团队

| 角色 | 职责 |
|------|------|
| 文档主管 | 制定文档策略，审核重大更新 |
| 技术文档工程师 | 维护技术文档，确保准确性 |
| API 文档工程师 | 维护 API 文档，保持同步 |
| 社区文档协调员 | 处理社区贡献，审查 PR |

### 维护频率

| 文档类型 | 更新频率 | 负责人 |
|---------|---------|--------|
| 核心文档 | 每次代码发布 | 文档主管 |
| 技术文档 | 功能变更时 | 技术文档工程师 |
| API 文档 | API 变更时 | API 文档工程师 |
| 功能文档 | 功能变更时 | 对应功能负责人 |

### 质量标准

- **准确性**：所有信息必须准确无误
- **完整性**：覆盖所有功能和场景
- **可读性**：语言清晰，易于理解
- **及时性**：及时更新，保持同步
- **一致性**：格式和风格保持一致

---

## 更新日志

### v2.1.0 (2026-02-08)

#### 新增 (Added)
- ✅ docs/architecture-diagrams.md - 完整的架构图和流程图
- ✅ docs/testing-guide.md - 详细的测试指南
- ✅ docs/api-reference.md - 完整的 API 参考文档和 OpenAPI 规范
- ✅ README.en.md - 英文版 README
- ✅ docs/documentation-review-report.md - 文档完整性检查报告

#### 改进 (Changed)
- ✅ README.md - 补充 Docker 部署、FAQ 和联系信息
- ✅ docs/installation-guide.md - 添加详细的故障排查章节（15+ 问题）
- ✅ docs/deployment-guide.md - 扩展常见问题（从 6 个到 15+ 个）

#### 修复 (Fixed)
- ✅ 修复 README.md Docker 部署部分截断问题
- ✅ 修复 docs/installation-guide.md 页面鉴权部分截断问题
- ✅ 修复 docs/deployment-guide.md 环境变量配置部分截断问题

#### 文档质量提升
- 文档完整度：75% → 95%+
- 总体评分：⭐⭐⭐⭐ (4/5) → ⭐⭐⭐⭐⭐ (4.8/5)
- 新增 FAQ：20+ 个
- 新增故障排查方案：15+ 个
- 新增代码示例：50+ 个

### v2.0.0 (2026-01-15)

#### 新增 (Added)
- ✅ 完整的项目架构和功能说明
- ✅ Docker 部署指南
- ✅ AI Provider 集成文档
- ✅ 用户认证系统文档
- ✅ 建模任务流程文档
- ✅ 学习模块文档

#### 改进 (Changed)
- ✅ 统一文档格式和风格
- ✅ 添加代码示例和配置说明
- ✅ 完善安装和部署流程

### v1.0.0 (2025-12-01)

#### 新增 (Added)
- ✅ 初始文档结构
- ✅ 基础安装指南
- ✅ 快速开始指南
- ✅ 项目概览

---

## 文档模板

### 新文档模板

```markdown
# 文档标题

**文档版本**：v2.0.0
**最后更新**：2026-02-08
**维护者**：Your Name
**适用版本**：CMAMSys v2.0.0+

---

## 📋 概述

简要说明本文档的目的和适用范围。

---

## 目录

- [章节 1](#章节-1)
- [章节 2](#章节-2)
- [章节 3](#章节-3)

---

## 章节 1

### 内容

详细内容...

---

**相关文档**：
- [文档 1](./doc1.md)
- [文档 2](./doc2.md)

**反馈**：如有问题或建议，请提交 [Issue](https://github.com/your-org/cmamsys/issues)。
```

### 更新日志模板

```markdown
## [版本号] - YYYY-MM-DD

### Added
- 新增功能 1
- 新增功能 2

### Changed
- 改进功能 1
- 改进功能 2

### Deprecated
- 即将弃用的功能

### Removed
- 已移除的功能

### Fixed
- 修复的问题 1
- 修复的问题 2

### Security
- 安全修复
```

---

## 最佳实践

### 1. 文档写作

- 使用清晰、简洁的语言
- 避免使用技术术语，或提供解释
- 提供实际可用的代码示例
- 使用图表和示意图辅助说明

### 2. 版本控制

- 每次重大更新打标签
- 保持更新日志的完整性
- 使用语义化版本号
- 清晰描述变更内容

### 3. 协作流程

- 使用 Pull Request 进行更新
- 确保审查通过后合并
- 保持更新历史的可追溯性
- 及时处理反馈和建议

### 4. 质量保证

- 定期审查文档准确性
- 检查链接有效性
- 验证代码示例
- 收集用户反馈

---

## 工具和资源

### 文档工具

- **Markdown 编辑器**：Typora, VS Code
- **图表工具**：Mermaid, PlantUML, draw.io
- **API 文档**：Swagger UI, OpenAPI
- **版本管理**：Git, GitHub

### 参考资源

- [Google Technical Writing](https://developers.google.com/tech-writing)
- [Write the Docs](https://www.writethedocs.org/)
- [Documentation Style Guides](https://github.com/Documentation-Style-Guides)

---

**最后更新：2026-02-08**
**下次审查时间：2026-05-01**
