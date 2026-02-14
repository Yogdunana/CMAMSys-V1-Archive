-- 修复任务状态的 SQL 脚本

-- 1. 查询当前任务状态
SELECT
    id,
    "taskId",
    "problemTitle",
    "overallStatus",
    "discussionStatus",
    "validationStatus",
    "paperStatus",
    "codeGenerationId",
    progress,
    "createdAt",
    "updatedAt"
FROM "auto_modeling_tasks"
WHERE id = 'cmlhktmot0000uguh5r4wpvgy';

-- 2. 查询代码生成记录
SELECT
    id,
    "autoTaskId",
    "discussionId",
    "codeLanguage",
    "executionStatus",
    "createdAt"
FROM "code_generations"
WHERE "autoTaskId" = 'cmlhktmot0000uguh5r4wpvgy'
ORDER BY "createdAt" DESC;

-- 3. 查询验证记录
SELECT
    id,
    "autoTaskId",
    "codeGenerationId",
    "validationType",
    "status",
    "createdAt"
FROM "code_validations"
WHERE "autoTaskId" = 'cmlhktmot0000uguh5r4wpvgy'
ORDER BY "createdAt" DESC
LIMIT 10;

-- 4. 修复任务状态（根据实际情况选择执行）

-- 方案 1: 重置到讨论阶段（如果没有任何代码生成记录）
UPDATE "auto_modeling_tasks"
SET
    "overallStatus" = 'DISCUSSING',
    "discussionStatus" = 'IN_PROGRESS',
    "validationStatus" = 'NOT_STARTED',
    "paperStatus" = 'NOT_STARTED',
    "codeGenerationId" = NULL,
    progress = 20,
    "errorLog" = NULL,
    "updatedAt" = NOW()
WHERE id = 'cmlhktmot0000uguh5r4wpvgy'
    AND "codeGenerationId" IS NULL;

-- 方案 2: 重置到编码阶段（如果有讨论记录但没有代码生成）
UPDATE "auto_modeling_tasks"
SET
    "overallStatus" = 'CODING',
    "discussionStatus" = 'COMPLETED',
    "validationStatus" = 'NOT_STARTED',
    "paperStatus" = 'NOT_STARTED',
    "codeGenerationId" = NULL,
    progress = 50,
    "errorLog" = NULL,
    "updatedAt" = NOW()
WHERE id = 'cmlhktmot0000uguh5r4wpvgy'
    AND EXISTS (
        SELECT 1 FROM "group_discussions"
        WHERE id = "auto_modeling_tasks"."discussionId"
    );

-- 5. 删除孤立的代码生成记录（如果有的话）
DELETE FROM "code_generations"
WHERE "autoTaskId" = 'cmlhktmot0000uguh5r4wpvgy'
    AND id NOT IN (
        SELECT "codeGenerationId"
        FROM "auto_modeling_tasks"
        WHERE "codeGenerationId" IS NOT NULL
    );

-- 6. 删除孤立的验证记录（如果有的话）
DELETE FROM "code_validations"
WHERE "autoTaskId" = 'cmlhktmot0000uguh5r4wpvgy'
    AND "codeGenerationId" IS NULL;
