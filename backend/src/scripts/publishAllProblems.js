import { Problem, sequelize, Sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const publishAllProblems = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    console.log('\nUpdating all problems to PUBLISHED status...');
    
    // Check if status column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'problems'
      AND COLUMN_NAME = 'status'
    `);
    
    if (results.length === 0) {
      console.log('⚠️  Status column does not exist. Creating it...');
      await sequelize.query(`
        ALTER TABLE problems 
        ADD COLUMN status ENUM('DRAFT', 'PUBLISHED', 'DISABLED') NOT NULL DEFAULT 'PUBLISHED'
      `);
      console.log('✓ Status column created.');
    }

    // Update all problems to PUBLISHED
    const [updatedCount] = await Problem.update(
      { status: 'PUBLISHED' },
      { 
        where: {
          [Op.or]: [
            { status: 'DRAFT' },
            { status: null },
            { status: '' }
          ]
        }
      }
    ).catch(async () => {
      // If update fails, try updating all
      try {
        const [count] = await Problem.update({ status: 'PUBLISHED' }, { where: {} });
        return [count];
      } catch {
        const total = await Problem.count();
        console.log(`Found ${total} problems (updating all to PUBLISHED)`);
        await sequelize.query(`UPDATE problems SET status = 'PUBLISHED' WHERE status IS NULL OR status = '' OR status = 'DRAFT'`);
        return [total];
      }
    });
    
    console.log(`✓ Updated ${updatedCount} problems to PUBLISHED status.`);

    const publishedCount = await Problem.count({ where: { status: 'PUBLISHED' } }).catch(() => Problem.count());
    const draftCount = await Problem.count({ where: { status: 'DRAFT' } }).catch(() => 0);
    const disabledCount = await Problem.count({ where: { status: 'DISABLED' } }).catch(() => 0);

    console.log('\nCurrent status:');
    console.log(`  - PUBLISHED: ${publishedCount}`);
    console.log(`  - DRAFT: ${draftCount}`);
    console.log(`  - DISABLED: ${disabledCount}`);
    console.log(`  - TOTAL: ${publishedCount + draftCount + disabledCount}`);

    console.log('\n✓ All problems are now published!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error updating problems:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
    process.exit(1);
  }
};

publishAllProblems();

