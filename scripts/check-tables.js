#!/usr/bin/env node

/**
 * Check existing tables in database
 */

const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: 'postgresql://***REDACTED_DB_USER***:***REDACTED_DB_PASSWORD***@***REDACTED_DB_IP***:5632/cmamsys?sslmode=disable',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('\nExisting tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkTables();
