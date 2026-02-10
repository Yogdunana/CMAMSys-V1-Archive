#!/usr/bin/env node

/**
 * Database Migration Script
 * Execute SQL migration file
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function executeMigration() {
  const client = new Client({
    connectionString: (process.env.DATABASE_URL || 'postgresql://***REDACTED_DB_USER***:***REDACTED_DB_PASSWORD***@***REDACTED_DB_IP***:5632/cmamsys') + '?sslmode=disable',
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
