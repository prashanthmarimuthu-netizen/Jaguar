import { Problem, TestCase, Submission, sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateProblems = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    console.log('\nMigrating problems table...');
    
    // Check if columns exist and add them if they don't
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'problems'
    `);
    
    const existingColumns = results.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);

    const newColumns = [
      { name: 'short_description', type: 'VARCHAR(500)', nullable: true },
      { name: 'category', type: "ENUM('DSA', 'EMBEDDED_C', 'COMMUNICATION_PROTOCOLS', 'FREERTOS', 'OTHER')", nullable: true, default: "'OTHER'" },
      { name: 'input_format', type: 'TEXT', nullable: true },
      { name: 'output_format', type: 'TEXT', nullable: true },
      { name: 'assumptions', type: 'TEXT', nullable: true },
      { name: 'sample_explanation', type: 'TEXT', nullable: true },
      { name: 'supported_languages', type: 'TEXT', nullable: true },
      { name: 'time_limit', type: 'INTEGER', nullable: true, default: '1000' },
      { name: 'memory_limit', type: 'INTEGER', nullable: true, default: '256' },
      { name: 'reference_solution', type: 'LONGTEXT', nullable: true },
      { name: 'editorial', type: 'LONGTEXT', nullable: true },
      { name: 'code_templates', type: 'LONGTEXT', nullable: true },
      { name: 'status', type: "ENUM('DRAFT', 'PUBLISHED', 'DISABLED')", nullable: false, default: "'DRAFT'" },
      { name: 'is_free', type: 'BOOLEAN', nullable: false, default: 'true' },
      { name: 'updated_at', type: 'DATETIME', nullable: true }
    ];

    for (const col of newColumns) {
      if (!existingColumns.includes(col.name)) {
        try {
          let alterQuery = `ALTER TABLE problems ADD COLUMN ${col.name} ${col.type}`;
          if (col.nullable === false) {
            alterQuery += ' NOT NULL';
          }
          if (col.default) {
            alterQuery += ` DEFAULT ${col.default}`;
          }
          
          await sequelize.query(alterQuery);
          console.log(`✓ Added column: ${col.name}`);
        } catch (err) {
          if (err.message.includes('Duplicate column')) {
            console.log(`- Column ${col.name} already exists, skipping...`);
          } else {
            console.error(`✗ Error adding column ${col.name}:`, err.message);
          }
        }
      } else {
        console.log(`- Column ${col.name} already exists, skipping...`);
      }
    }

    // Migrate test_cases table
    console.log('\nMigrating test_cases table...');
    const [testCaseResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'test_cases'
    `);
    
    const existingTestCaseColumns = testCaseResults.map(r => r.COLUMN_NAME);
    
    const newTestCaseColumns = [
      { name: 'explanation', type: 'TEXT', nullable: true },
      { name: '`order`', type: 'INTEGER', nullable: false, default: '0' }
    ];

    for (const col of newTestCaseColumns) {
      if (!existingTestCaseColumns.includes(col.name)) {
        try {
          let alterQuery = `ALTER TABLE test_cases ADD COLUMN ${col.name} ${col.type}`;
          if (col.nullable === false) {
            alterQuery += ' NOT NULL';
          }
          if (col.default) {
            alterQuery += ` DEFAULT ${col.default}`;
          }
          
          await sequelize.query(alterQuery);
          console.log(`✓ Added column to test_cases: ${col.name}`);
        } catch (err) {
          if (err.message.includes('Duplicate column')) {
            console.log(`- Column ${col.name} already exists in test_cases, skipping...`);
          } else {
            console.error(`✗ Error adding column ${col.name} to test_cases:`, err.message);
          }
        }
      } else {
        console.log(`- Column ${col.name} already exists in test_cases, skipping...`);
      }
    }

    // Migrate submissions table
    console.log('\nMigrating submissions table...');
    const [submissionResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'submissions'
    `);
    
    const existingSubmissionColumns = submissionResults.map(r => r.COLUMN_NAME);
    
    const newSubmissionColumns = [
      { name: 'memory_usage', type: 'INTEGER', nullable: true },
      { name: 'error_message', type: 'TEXT', nullable: true },
      { name: 'test_cases_passed', type: 'INTEGER', nullable: true },
      { name: 'total_test_cases', type: 'INTEGER', nullable: true }
    ];

    // Update status enum if needed
    try {
      await sequelize.query(`
        ALTER TABLE submissions 
        MODIFY COLUMN status ENUM('ACCEPTED', 'WRONG_ANSWER', 'ERROR', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR') NOT NULL
      `);
      console.log('✓ Updated submissions status enum');
    } catch (err) {
      if (!err.message.includes('Duplicate column')) {
        console.log('- Status enum may already be updated:', err.message);
      }
    }

    for (const col of newSubmissionColumns) {
      if (!existingSubmissionColumns.includes(col.name)) {
        try {
          await sequelize.query(`ALTER TABLE submissions ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✓ Added column to submissions: ${col.name}`);
        } catch (err) {
          if (err.message.includes('Duplicate column')) {
            console.log(`- Column ${col.name} already exists in submissions, skipping...`);
          } else {
            console.error(`✗ Error adding column ${col.name} to submissions:`, err.message);
          }
        }
      } else {
        console.log(`- Column ${col.name} already exists in submissions, skipping...`);
      }
    }

    // Update existing problems to have default values
    console.log('\nUpdating existing problems with default values...');
    await sequelize.query(`
      UPDATE problems 
      SET status = 'PUBLISHED' 
      WHERE status IS NULL OR status = ''
    `).catch(() => {});
    
    await sequelize.query(`
      UPDATE problems 
      SET is_free = true 
      WHERE is_free IS NULL
    `).catch(() => {});
    
    await sequelize.query(`
      UPDATE problems 
      SET category = 'OTHER' 
      WHERE category IS NULL
    `).catch(() => {});

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
    process.exit(1);
  }
};

migrateProblems();

