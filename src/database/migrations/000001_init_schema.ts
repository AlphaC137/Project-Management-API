import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export async function up(pool: Pool): Promise<void> {
  const sqlContent = fs.readFileSync(
    path.join(__dirname, '../../../ERD Schema.sql'),
    'utf8'
  );
  
  // Split the SQL into individual statements
  const statements = sqlContent
    .split(';')
    .filter(stmt => stmt.trim().length > 0);
    
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const statement of statements) {
      await client.query(statement);
    }
    
    // Create migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      INSERT INTO migrations (name) VALUES ($1)
    `, ['000001_init_schema']);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function down(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop all tables in reverse dependency order
    await client.query(`
      DROP TABLE IF EXISTS 
        time_entries,
        task_dependencies,
        task_comments,
        task_attachments,
        tasks,
        project_members,
        projects,
        organization_members,
        organizations,
        users,
        migrations
      CASCADE;
    `);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
