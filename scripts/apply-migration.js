#!/usr/bin/env node

/**
 * Simplified Migration Test (Fixed)
 */

const { Client } = require('pg');
const crypto = require('crypto');

async function testMigration() {
  const client = new Client({
    connectionString: 'postgresql://***REDACTED_DB_USER***:***REDACTED_DB_PASSWORD***@***REDACTED_DB_IP***:5632/cmamsys?sslmode=disable',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Test 1: Add cacheKeyHash column
    console.log('\n--- Test 1: Adding cacheKeyHash column ---');
    await client.query(`
      ALTER TABLE "discussion_cache"
      ADD COLUMN IF NOT EXISTS "cacheKeyHash" VARCHAR(64)
    `);
    console.log('✓ cacheKeyHash column added');

    // Test 2: Fetch all records and update cacheKeyHash in Node.js
    console.log('\n--- Test 2: Updating cacheKeyHash ---');
    const result = await client.query('SELECT id, "problemType", "cacheKey" FROM "discussion_cache" WHERE "cacheKeyHash" IS NULL');
    console.log(`Found ${result.rows.length} records to update`);

    for (const row of result.rows) {
      const key = `${row.problemType || ''}:${row.cacheKey || ''}`;
      const hash = crypto.createHash('sha256').update(key).digest('hex');

      await client.query(
        'UPDATE "discussion_cache" SET "cacheKeyHash" = $1 WHERE id = $2',
        [hash, row.id]
      );
    }
    console.log('✓ cacheKeyHash updated');

    // Test 3: Set NOT NULL
    console.log('\n--- Test 3: Setting cacheKeyHash NOT NULL ---');
    await client.query(`
      ALTER TABLE "discussion_cache"
      ALTER COLUMN "cacheKeyHash" SET NOT NULL
    `);
    console.log('✓ cacheKeyHash set to NOT NULL');

    // Test 4: Add index
    console.log('\n--- Test 4: Adding index ---');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_discussion_cache_cacheKeyHash"
      ON "discussion_cache"("cacheKeyHash")
    `);
    console.log('✓ Index added');

    // Test 5: Add performance columns
    console.log('\n--- Test 5: Adding performance columns ---');
    await client.query(`
      ALTER TABLE "ai_requests"
      ADD COLUMN IF NOT EXISTS "responseTime" INTEGER
    `);
    await client.query(`
      ALTER TABLE "ai_providers"
      ADD COLUMN IF NOT EXISTS "errorRate" DECIMAL(5,4) DEFAULT 0.0000
    `);
    await client.query(`
      ALTER TABLE "ai_providers"
      ADD COLUMN IF NOT EXISTS "successRate" DECIMAL(5,4) DEFAULT 1.0000
    `);
    console.log('✓ Performance columns added');

    // Test 6: Add audit trail columns
    console.log('\n--- Test 6: Adding audit trail columns ---');
    await client.query(`
      ALTER TABLE "ai_providers"
      ADD COLUMN IF NOT EXISTS "updatedById" VARCHAR(255)
    `);
    await client.query(`
      ALTER TABLE "modeling_tasks"
      ADD COLUMN IF NOT EXISTS "updatedById" VARCHAR(255)
    `);
    console.log('✓ Audit trail columns added');

    // Test 7: Add composite indexes
    console.log('\n--- Test 7: Adding composite indexes ---');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_ai_providers_createdById_status"
      ON "ai_providers"("createdById", "status")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_modeling_tasks_createdById_status"
      ON "modeling_tasks"("createdById", "status")
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_ai_requests_providerId_createdAt"
      ON "ai_requests"("providerId", "createdAt" DESC)
    `);
    console.log('✓ Composite indexes added');

    console.log('\n✅ Database migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testMigration();
