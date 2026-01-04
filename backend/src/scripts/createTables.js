// Script to create database tables
// Run with: node src/scripts/createTables.js

import sequelize from '../config/database.js';
import { User, Problem, TestCase, Submission, Course, Enrollment } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    console.log('\nCreating tables...');
    await sequelize.sync({ alter: true });
    console.log('✓ All tables created/updated successfully!');

    console.log('\nTables created:');
    console.log('  - users');
    console.log('  - problems');
    console.log('  - test_cases');
    console.log('  - submissions');
    console.log('  - courses');
    console.log('  - enrollments');

    console.log('\n✓ Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating tables:', error.message);
    
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
    
    if (error.message.includes('Access denied')) {
      console.error('\nTip: Check your MySQL credentials in .env file');
    } else if (error.message.includes('Unknown database')) {
      console.error('\nTip: Create the database first: CREATE DATABASE coding_platform;');
    }
    
    process.exit(1);
  }
};

createTables();

