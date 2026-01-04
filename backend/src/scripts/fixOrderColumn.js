import { sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const fixOrderColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');
    
    // Check if order column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'test_cases'
      AND COLUMN_NAME = 'order'
    `);
    
    if (results.length === 0) {
      // Add order column with backticks
      await sequelize.query(`
        ALTER TABLE test_cases 
        ADD COLUMN \`order\` INTEGER NOT NULL DEFAULT 0
      `);
      console.log('✓ Added order column to test_cases');
    } else {
      console.log('- Order column already exists');
    }
    
    // Update supported_languages defaults
    await sequelize.query(`
      UPDATE problems 
      SET supported_languages = '["c", "cpp", "python"]' 
      WHERE supported_languages IS NULL OR supported_languages = ''
    `).catch(() => {});
    console.log('✓ Updated supported_languages defaults');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

fixOrderColumn();

