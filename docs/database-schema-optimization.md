# 数据库 Schema 优化方案

**优化日期**: 2026-02-08
**版本**: v2.4.0

---

## 1. GroupDiscussion 和 AutoModelingTask 强制一对一关系

### 当前状态

```prisma
// AutoModelingTask
model AutoModelingTask {
  discussionId      String?               @unique // 可选
  discussion        GroupDiscussion?      @relation(fields: [discussionId], references: [id])
}

// GroupDiscussion
model GroupDiscussion {
  autoTaskId        String?               @unique // 可选
  autoTask          AutoModelingTask?     @relation
}
```

**问题**：
- 两个字段都是可选的，可能导致数据不一致
- 业务逻辑上，讨论是自动化流程的第一步，应该是强关联

### 优化方案

```prisma
// AutoModelingTask - 修改后
model AutoModelingTask {
  id                String                @id @default(cuid())
  taskId            String?               @unique
  competitionType   CompetitionType
  problemType       ProblemType
  problemTitle      String
  problemContent    String               @db.Text
  discussionId      String                @unique // 改为必填
  discussionStatus  DiscussionStatus      @default(PENDING)
  codeGenerationId  String?               @unique
  validationStatus  ValidationStatus      @default(PENDING)
  validationRounds  Int                   @default(0)
  paperId           String?               @unique
  paperStatus       PaperStatus           @default(DRAFT)
  overallStatus     OverallStatus         @default(PENDING)
  errorLog          String?               @db.Text
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt

  discussion        GroupDiscussion       @relation(fields: [discussionId], references: [id]) // 去掉可选
  codeGeneration    CodeGeneration?      @relation(fields: [codeGenerationId], references: [id])
  validations       CodeValidation[]
  paper             GeneratedPaper?       @relation(fields: [paperId], references: [id])

  @@index([discussionStatus])
  @@index([validationStatus])
  @@index([overallStatus])
  @@map("auto_modeling_tasks")
}

// GroupDiscussion - 修改后
model GroupDiscussion {
  id                String              @id @default(cuid())
  autoTaskId        String              @unique // 改为必填
  discussionTitle   String
  problemTitle      String
  competitionType   CompetitionType
  problemType       ProblemType
  status            DiscussionStatus    @default(PENDING)
  currentRound      Int                 @default(0)
  maxRounds         Int                 @default(2)
  participants      Json
  summary           Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  autoTask          AutoModelingTask    @relation(fields: [autoTaskId], references: [id], onDelete: Cascade) // 添加级联删除
  messages          DiscussionMessage[]

  @@index([status])
  @@map("group_discussions")
}
```

**优势**：
- ✅ 数据一致性保证
- ✅ 避免孤儿记录
- ✅ 简化业务逻辑
- ✅ 级联删除保护

### 迁移步骤

```sql
-- Step 1: 创建临时表备份
CREATE TABLE auto_modeling_tasks_backup AS SELECT * FROM auto_modeling_tasks;
CREATE TABLE group_discussions_backup AS SELECT * FROM group_discussions;

-- Step 2: 删除孤立记录（没有关联的记录）
DELETE FROM auto_modeling_tasks WHERE discussion_id IS NULL;
DELETE FROM group_discussions WHERE auto_task_id IS NULL;

-- Step 3: 修改字段为 NOT NULL（先确保没有 NULL 值）
-- Prisma migrate 会自动处理这一步

-- Step 4: 应用 Prisma 迁移
npx prisma migrate dev --name enforce_one_to_one_discussion
```

---

## 2. 缓存键哈希优化

### 当前状态

```prisma
model DiscussionCache {
  id                String              @id @default(cuid())
  cacheKey          String              @unique // 可能很长
  problemType       String
  problemContent    String              @db.Text
  discussionResult  Json
  codeResult        Json?
  createdAt         DateTime            @default(now())
  expiresAt         DateTime

  @@index([problemType])
  @@index([expiresAt])
  @@map("discussion_cache")
}
```

**问题**：
- `cacheKey` 直接存储字符串，可能很长（包含 problemContent）
- 占用较多存储空间
- 查询效率不高

### 优化方案

```prisma
model DiscussionCache {
  id                String              @id @default(cuid())
  cacheKey          String              @unique // 保留原始键（用于调试）
  cacheKeyHash      String              @unique // 新增：哈希键
  problemType       String
  problemContent    String              @db.Text
  discussionResult  Json
  codeResult        Json?
  createdAt         DateTime            @default(now())
  expiresAt         DateTime

  @@unique([cacheKey, cacheKeyHash]) // 复合唯一索引
  @@index([problemType])
  @@index([expiresAt])
  @@index([cacheKeyHash]) // 哈希键索引
  @@map("discussion_cache")
}
```

### 代码实现

```typescript
// src/lib/cache-utils.ts
import crypto from 'crypto';

/**
 * 生成缓存键（原始键 + 哈希）
 */
export function generateCacheKey(problemType: string, problemContent: string): {
  originalKey: string;
  hashKey: string;
} {
  const originalKey = `${problemType}:${problemContent.substring(0, 100)}`;
  const hashKey = crypto.createHash('sha256').update(originalKey).digest('hex');
  
  return {
    originalKey,
    hashKey,
  };
}

/**
 * 创建缓存记录
 */
export async function createCacheEntry(
  problemType: string,
  problemContent: string,
  discussionResult: any,
  codeResult?: any
) {
  const { originalKey, hashKey } = generateCacheKey(problemType, problemContent);
  
  return await prisma.discussionCache.create({
    data: {
      cacheKey: originalKey,
      cacheKeyHash: hashKey,
      problemType,
      problemContent,
      discussionResult,
      codeResult,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时过期
    },
  });
}

/**
 * 查询缓存记录
 */
export async function getCacheEntry(
  problemType: string,
  problemContent: string
) {
  const { hashKey } = generateCacheKey(problemType, problemContent);
  
  return await prisma.discussionCache.findUnique({
    where: {
      cacheKeyHash: hashKey,
    },
  });
}
```

### 迁移步骤

```sql
-- Step 1: 添加新字段
ALTER TABLE discussion_cache ADD COLUMN cache_key_hash VARCHAR(64);

-- Step 2: 为现有数据生成哈希值
UPDATE discussion_cache
SET cache_key_hash = encode(digest(cache_key, 'sha256'), 'hex');

-- Step 3: 添加唯一索引
CREATE UNIQUE INDEX discussion_cache_cache_key_hash_key ON discussion_cache(cache_key_hash);

-- Step 4: 应用 Prisma 迁移
npx prisma migrate dev --name add_cache_key_hash
```

---

## 3. 完整优化后的 Schema 修改

### 修改 prisma/schema.prisma

需要修改以下部分：

#### 3.1 AutoModelingTask

```prisma
model AutoModelingTask {
  id                String                @id @default(cuid())
  taskId            String?               @unique
  competitionType   CompetitionType
  problemType       ProblemType
  problemTitle      String
  problemContent    String               @db.Text
  discussionId      String                @unique  // ✅ 改为必填
  discussionStatus  DiscussionStatus      @default(PENDING)
  codeGenerationId  String?               @unique
  validationStatus  ValidationStatus      @default(PENDING)
  validationRounds  Int                   @default(0)
  paperId           String?               @unique
  paperStatus       PaperStatus           @default(DRAFT)
  overallStatus     OverallStatus         @default(PENDING)
  errorLog          String?               @db.Text
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt

  discussion        GroupDiscussion       @relation(fields: [discussionId], references: [id])  // ✅ 去掉可选
  codeGeneration    CodeGeneration?       @relation(fields: [codeGenerationId], references: [id])
  validations       CodeValidation[]
  paper             GeneratedPaper?       @relation(fields: [paperId], references: [id])

  @@index([discussionStatus])
  @@index([validationStatus])
  @@index([overallStatus])
  @@map("auto_modeling_tasks")
}
```

#### 3.2 GroupDiscussion

```prisma
model GroupDiscussion {
  id                String              @id @default(cuid())
  autoTaskId        String              @unique  // ✅ 改为必填
  discussionTitle   String
  problemTitle      String
  competitionType   CompetitionType
  problemType       ProblemType
  status            DiscussionStatus    @default(PENDING)
  currentRound      Int                 @default(0)
  maxRounds         Int                 @default(2)
  participants      Json
  summary           Json?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  autoTask          AutoModelingTask    @relation(fields: [autoTaskId], references: [id], onDelete: Cascade)  // ✅ 添加级联删除
  messages          DiscussionMessage[]

  @@index([status])
  @@map("group_discussions")
}
```

#### 3.3 DiscussionCache

```prisma
model DiscussionCache {
  id                String              @id @default(cuid())
  cacheKey          String              @unique
  cacheKeyHash      String              @unique  // ✅ 新增字段
  problemType       String
  problemContent    String              @db.Text
  discussionResult  Json
  codeResult        Json?
  createdAt         DateTime            @default(now())
  expiresAt         DateTime

  @@index([problemType])
  @@index([expiresAt])
  @@index([cacheKeyHash])  // ✅ 新增索引
  @@map("discussion_cache")
}
```

---

## 4. 迁移脚本

### 创建迁移

```bash
# 开发环境
npx prisma migrate dev --name schema_optimization_v2_4_0

# 生产环境
npx prisma migrate deploy
```

### 迁移内容

Prisma 会自动生成以下 SQL：

```sql
-- 修改 AutoModelingTask.discussionId 为 NOT NULL
ALTER TABLE "auto_modeling_tasks" ALTER COLUMN "discussion_id" SET NOT NULL;

-- 修改 GroupDiscussion.autoTaskId 为 NOT NULL
ALTER TABLE "group_discussions" ALTER COLUMN "auto_task_id" SET NOT NULL;

-- 添加级联删除
ALTER TABLE "group_discussions" DROP CONSTRAINT "group_discussions_autoTaskId_fkey";
ALTER TABLE "group_discussions" ADD CONSTRAINT "group_discussions_autoTaskId_fkey" 
  FOREIGN KEY ("auto_task_id") REFERENCES "auto_modeling_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 添加 cacheKeyHash 字段
ALTER TABLE "discussion_cache" ADD COLUMN "cache_key_hash" TEXT NOT NULL DEFAULT '';

-- 生成哈希值
UPDATE "discussion_cache" SET "cache_key_hash" = encode(digest("cache_key", 'sha256'), 'hex');

-- 添加唯一约束
ALTER TABLE "discussion_cache" ADD CONSTRAINT "discussion_cache_cache_key_hash_key" UNIQUE ("cache_key_hash");

-- 添加索引
CREATE INDEX "discussion_cache_cacheKeyHash_idx" ON "discussion_cache"("cache_key_hash");
```

---

## 5. 回滚方案

如果需要回滚，执行以下步骤：

```bash
# 回滚迁移
npx prisma migrate resolve --rolled-back [migration-name]
```

或手动执行：

```sql
-- 回滚 AutoModelingTask 修改
ALTER TABLE "auto_modeling_tasks" ALTER COLUMN "discussion_id" DROP NOT NULL;

-- 回滚 GroupDiscussion 修改
ALTER TABLE "group_discussions" ALTER COLUMN "auto_task_id" DROP NOT NULL;

-- 回滚 GroupDiscussion 外键级联删除
ALTER TABLE "group_discussions" DROP CONSTRAINT "group_discussions_autoTaskId_fkey";
ALTER TABLE "group_discussions" ADD CONSTRAINT "group_discussions_autoTaskId_fkey" 
  FOREIGN KEY ("auto_task_id") REFERENCES "auto_modeling_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 删除 cacheKeyHash 相关
ALTER TABLE "discussion_cache" DROP CONSTRAINT "discussion_cache_cache_key_hash_key";
DROP INDEX IF EXISTS "discussion_cache_cacheKeyHash_idx";
ALTER TABLE "discussion_cache" DROP COLUMN IF EXISTS "cache_key_hash";
```

---

## 6. 测试验证

迁移完成后，执行以下测试：

```typescript
// tests/migration.test.ts
import { prisma } from '@/lib/prisma';

async function testSchemaOptimization() {
  // 测试 1: 创建 AutoModelingTask 必须关联 GroupDiscussion
  try {
    await prisma.autoModelingTask.create({
      data: {
        competitionType: 'MCM',
        problemType: 'OPTIMIZATION',
        problemTitle: 'Test',
        problemContent: 'Test content',
        // 缺少 discussionId - 应该失败
      },
    });
    console.error('❌ 测试失败：应该强制要求 discussionId');
  } catch (error) {
    console.log('✅ 测试通过：正确强制要求 discussionId');
  }

  // 测试 2: 创建 GroupDiscussion 必须关联 AutoModelingTask
  try {
    await prisma.groupDiscussion.create({
      data: {
        discussionTitle: 'Test',
        problemTitle: 'Test',
        competitionType: 'MCM',
        problemType: 'OPTIMIZATION',
        // 缺少 autoTaskId - 应该失败
      },
    });
    console.error('❌ 测试失败：应该强制要求 autoTaskId');
  } catch (error) {
    console.log('✅ 测试通过：正确强制要求 autoTaskId');
  }

  // 测试 3: 级联删除
  const task = await prisma.autoModelingTask.create({
    data: {
      competitionType: 'MCM',
      problemType: 'OPTIMIZATION',
      problemTitle: 'Test',
      problemContent: 'Test content',
      discussion: {
        create: {
          discussionTitle: 'Test',
          problemTitle: 'Test',
          competitionType: 'MCM',
          problemType: 'OPTIMIZATION',
        },
      },
    },
  });

  await prisma.autoModelingTask.delete({
    where: { id: task.id },
  });

  const discussion = await prisma.groupDiscussion.findUnique({
    where: { id: task.discussionId! },
  });

  if (!discussion) {
    console.log('✅ 测试通过：级联删除成功');
  } else {
    console.error('❌ 测试失败：级联删除失败');
  }

  // 测试 4: 缓存哈希
  const cache = await prisma.discussionCache.create({
    data: {
      cacheKey: 'test-key',
      cacheKeyHash: crypto.createHash('sha256').update('test-key').digest('hex'),
      problemType: 'OPTIMIZATION',
      problemContent: 'test',
      discussionResult: {},
      expiresAt: new Date(Date.now() + 86400000),
    },
  });

  if (cache.cacheKeyHash) {
    console.log('✅ 测试通过：cacheKeyHash 字段存在');
  } else {
    console.error('❌ 测试失败：cacheKeyHash 字段不存在');
  }
}

testSchemaOptimization();
```

---

## 7. 注意事项

### ⚠️ 重要警告

1. **数据迁移前必须备份**
   ```bash
   pg_dump -U username -d dbname > backup_20260208.sql
   ```

2. **先在开发环境测试**
   - 确保所有测试通过
   - 验证数据完整性
   - 检查性能影响

3. **生产环境迁移时间窗口**
   - 选择低峰期
   - 预计迁移时间：< 5分钟
   - 准备回滚方案

4. **影响范围**
   - 现有数据需要清理孤儿记录
   - 代码需要调整以适应强制关系
   - API 可能需要更新错误处理

---

## 8. 实施时间线

| 步骤 | 任务 | 预计时间 | 负责人 |
|------|------|----------|--------|
| 1 | 备份开发数据库 | 10 分钟 | DBA |
| 2 | 应用开发环境迁移 | 5 分钟 | 开发 |
| 3 | 运行测试验证 | 30 分钟 | 测试 |
| 4 | 代码适配 | 2 小时 | 开发 |
| 5 | 备份生产数据库 | 10 分钟 | DBA |
| 6 | 应用生产环境迁移 | 5 分钟 | DBA |
| 7 | 生产环境验证 | 30 分钟 | 测试 |
| 8 | 监控观察 | 1 天 | 运维 |

**总计**: ~5 小时

---

## 9. 总结

### 优化收益

✅ **数据一致性**
- 强制一对一关系，避免孤儿记录
- 级联删除保护，数据完整性

✅ **查询性能**
- 哈希键索引，缓存查询更快
- 减少存储空间占用

✅ **代码简化**
- 业务逻辑更清晰
- 减少空值判断

### 风险评估

🟡 **中等风险**
- 需要数据迁移
- 现有代码可能需要调整
- 需要充分测试

### 建议

✅ **推荐实施**
- 优化收益大于风险
- 提升系统稳定性和性能
- 为后续功能开发打好基础

---

**文档版本**: 1.0
**最后更新**: 2026-02-08
**审核状态**: 待审核
