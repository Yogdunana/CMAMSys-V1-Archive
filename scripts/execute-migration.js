#!/usr/bin/env node

/**
 * Database Migration Script
 * Execute SQL migration file
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function executeMigration() {
  // 使用环境变量或默认连接字符串
  const defaultConnectionString = 'postgresql://username:password@localhost:5432/cmamsys?schema=public';
  const connectionString = process.env.DATABASE_URL || defaultConnectionString;

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../prisma/migrations/20240101000000_schema_optimization.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await client.query(migrationSQL);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);

    // Check if it's a duplicate constraint error (which is OK)
    if (error.message.includes('already exists')) {
      console.log('Note: Some objects already exist, this is normal for re-running migrations');
      process.exit(0);
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

executeMigration();
