import sequelize from '../config/database.js';
import { Sequelize } from 'sequelize';
import User from './User.js';
import Problem from './Problem.js';
import TestCase from './TestCase.js';
import Submission from './Submission.js';
import Course from './Course.js';
import Enrollment from './Enrollment.js';
import Lesson from './Lesson.js';
import CourseProblem from './CourseProblem.js';
import LessonProgress from './LessonProgress.js';

// Define relationships
Problem.hasMany(TestCase, { foreignKey: 'problem_id', as: 'testCases' });
TestCase.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Problem.hasMany(Submission, { foreignKey: 'problem_id', as: 'submissions' });
Submission.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Course.hasMany(Lesson, { foreignKey: 'course_id', as: 'lessons' });
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Enrollment.belongsTo(Lesson, { foreignKey: 'last_lesson_id', as: 'lastLesson' });
Enrollment.belongsTo(Lesson, { foreignKey: 'current_lesson_id', as: 'currentLesson' });

Enrollment.hasMany(LessonProgress, { foreignKey: 'enrollment_id', as: 'lessonProgress' });
LessonProgress.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

Lesson.hasMany(LessonProgress, { foreignKey: 'lesson_id', as: 'progress' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

Course.hasMany(CourseProblem, { foreignKey: 'course_id', as: 'courseProblems' });
CourseProblem.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Lesson.hasMany(CourseProblem, { foreignKey: 'lesson_id', as: 'problems' });
CourseProblem.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

Problem.hasMany(CourseProblem, { foreignKey: 'problem_id', as: 'courseProblems' });
CourseProblem.belongsTo(Problem, { foreignKey: 'problem_id', as: 'problem' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models - use alter: false in production to avoid index issues
    // Only sync structure, don't alter existing tables to prevent "too many keys" errors
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: false } 
      : { alter: false }; // Changed to false to prevent index issues
    
    await sequelize.sync(syncOptions);
    console.log('Database models synchronized.');
  } catch (error) {
    // Log error but don't crash - allow server to start even if sync fails
    console.error('Database sync warning:', error.message);
    if (error.code === 'ER_TOO_MANY_KEYS') {
      console.warn('⚠️  Too many keys error detected. This is usually safe to ignore if tables already exist.');
      console.warn('⚠️  If you need to alter tables, do it manually or use migrations.');
    } else {
      console.error('Unable to connect to the database:', error);
      // Only exit in development, in production log and continue
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    }
  }
};

export { User, Problem, TestCase, Submission, Course, Enrollment, Lesson, CourseProblem, LessonProgress, sequelize, syncDatabase };
export { Sequelize };

