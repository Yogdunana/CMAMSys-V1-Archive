#!/usr/bin/env node

/**
 * Check existing tables in database
 */

const { Client } = require('pg');

async function checkTables() {
  // 使用环境变量或默认连接字符串
  const connectionString = process.env.DATABASE_URL ||
    'postgresql://username:password@localhost:5432/cmamsys?schema=public';

  const client = new Client({
    connectionString,
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
