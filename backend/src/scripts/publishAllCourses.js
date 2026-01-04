/**
 * Script to publish all draft courses
 * Run with: node src/scripts/publishAllCourses.js
 */

import { Course, sequelize } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const publishAllCourses = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    console.log('\nUpdating all courses to PUBLISHED status...');
    
    const [updatedCount] = await Course.update(
      { status: 'PUBLISHED' },
      { where: { status: 'DRAFT' } }
    );

    console.log(`✓ Updated ${updatedCount} courses to PUBLISHED status.`);

    // Verify
    const publishedCount = await Course.count({ where: { status: 'PUBLISHED' } });
    const draftCount = await Course.count({ where: { status: 'DRAFT' } });
    
    console.log(`\nCurrent status:`);
    console.log(`  - PUBLISHED: ${publishedCount}`);
    console.log(`  - DRAFT: ${draftCount}`);

    console.log('\n✓ All courses are now published!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error updating courses:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
    process.exit(1);
  }
};

publishAllCourses();

