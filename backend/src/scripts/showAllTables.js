import sequelize from '../config/database.js';
import { User, Problem, TestCase, Submission, Course, Enrollment, Lesson, CourseProblem, LessonProgress } from '../models/index.js';

async function showAllTables() {
  try {
    console.log('='.repeat(80));
    console.log('DATABASE TABLES OVERVIEW');
    console.log('='.repeat(80));
    
    // Get all table names
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log(`\nFound ${tableNames.length} tables: ${tableNames.join(', ')}\n`);
    
    // Show data from each table
    for (const tableName of tableNames) {
      console.log('\n' + '='.repeat(80));
      console.log(`TABLE: ${tableName.toUpperCase()}`);
      console.log('='.repeat(80));
      
      try {
        const [rows] = await sequelize.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
        
        if (rows.length === 0) {
          console.log('  (No data)');
        } else {
          console.log(`  Total rows: ${rows.length}\n`);
          
          // Display each row
          rows.forEach((row, index) => {
            console.log(`  Row ${index + 1}:`);
            Object.entries(row).forEach(([key, value]) => {
              // Format the value for display
              let displayValue = value;
              if (value === null) {
                displayValue = '(null)';
              } else if (typeof value === 'object') {
                displayValue = JSON.stringify(value);
              } else if (typeof value === 'string' && value.length > 100) {
                displayValue = value.substring(0, 100) + '...';
              }
              console.log(`    ${key}: ${displayValue}`);
            });
            console.log('');
          });
        }
      } catch (error) {
        console.error(`  Error reading table ${tableName}:`, error.message);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    
    const userCount = await User.count();
    const problemCount = await Problem.count();
    const courseCount = await Course.count();
    const submissionCount = await Submission.count();
    const enrollmentCount = await Enrollment.count();
    const lessonCount = await Lesson.count();
    const testCaseCount = await TestCase.count();
    const courseProblemCount = await CourseProblem.count();
    const lessonProgressCount = await LessonProgress.count();
    
    console.log(`\nUsers: ${userCount}`);
    console.log(`Problems: ${problemCount}`);
    console.log(`Courses: ${courseCount}`);
    console.log(`Submissions: ${submissionCount}`);
    console.log(`Enrollments: ${enrollmentCount}`);
    console.log(`Lessons: ${lessonCount}`);
    console.log(`Test Cases: ${testCaseCount}`);
    console.log(`Course Problems: ${courseProblemCount}`);
    console.log(`Lesson Progress: ${lessonProgressCount}`);
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('Error showing tables:', error);
  } finally {
    await sequelize.close();
  }
}

showAllTables();

