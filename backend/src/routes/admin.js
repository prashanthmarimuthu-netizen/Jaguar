import express from 'express';
import { Sequelize, Op } from 'sequelize';
import { User, Problem, TestCase, Course, Submission, Lesson, CourseProblem, Enrollment, LessonProgress, sequelize } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { AppError } from '../utils/errors.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    // Use Promise.allSettled to prevent one failure from crashing the entire stats
    const [
      totalUsersResult,
      studentsResult,
      institutionsResult,
      adminsResult,
      problemsResult,
      coursesResult,
      submissionsResult,
      acceptedResult
    ] = await Promise.allSettled([
      User.count().catch(() => 0),
      User.count({ where: { role: 'STUDENT' } }).catch(() => 0),
      User.count({ where: { role: 'INSTITUTION' } }).catch(() => 0),
      User.count({ where: { role: 'ADMIN' } }).catch(() => 0),
      Problem.count().catch(() => 0),
      Course.count().catch(() => 0),
      Submission.count().catch(() => 0),
      Submission.count({ where: { status: 'ACCEPTED' } }).catch(() => 0)
    ]);

    const totalUsers = totalUsersResult.status === 'fulfilled' ? totalUsersResult.value : 0;
    const studentsCount = studentsResult.status === 'fulfilled' ? studentsResult.value : 0;
    const institutionsCount = institutionsResult.status === 'fulfilled' ? institutionsResult.value : 0;
    const adminsCount = adminsResult.status === 'fulfilled' ? adminsResult.value : 0;
    const totalProblems = problemsResult.status === 'fulfilled' ? problemsResult.value : 0;
    const totalCourses = coursesResult.status === 'fulfilled' ? coursesResult.value : 0;
    const totalSubmissions = submissionsResult.status === 'fulfilled' ? submissionsResult.value : 0;
    const acceptedSubmissions = acceptedResult.status === 'fulfilled' ? acceptedResult.value : 0;

    res.json({
      status: 'success',
      data: {
        totalUsers,
        studentsCount,
        institutionsCount,
        adminsCount,
        totalProblems,
        totalCourses,
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats instead of crashing
    res.json({
      status: 'success',
      data: {
        totalUsers: 0,
        studentsCount: 0,
        institutionsCount: 0,
        adminsCount: 0,
        totalProblems: 0,
        totalCourses: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        acceptanceRate: 0
      }
    });
  }
});

// ========== USER MANAGEMENT ==========

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (!userId || isNaN(userId)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'created_at'],
      include: [{
        model: Submission,
        as: 'submissions',
        required: false, // Left join - don't fail if no submissions
        include: [{
          model: Problem,
          as: 'problem',
          required: false, // Left join - don't fail if problem is deleted
          attributes: ['id', 'title']
        }],
        limit: 10,
        order: [['created_at', 'DESC']]
      }]
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Filter out submissions with deleted problems
    const userData = user.toJSON();
    if (userData.submissions) {
      userData.submissions = userData.submissions.filter(sub => sub.problem !== null);
    }

    res.json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    next(new AppError('Failed to fetch user', 500));
  }
});

// Update user
router.put('/users/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (!userId || isNaN(userId)) {
      return next(new AppError('Invalid user ID', 400));
    }

    const { name, email, role } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (email && email !== user.email) {
      try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return next(new AppError('Email already in use', 400));
        }
        user.email = email;
      } catch (err) {
        console.error('Error checking email:', err);
        return next(new AppError('Failed to validate email', 500));
      }
    }

    if (name) user.name = name;
    if (role && ['STUDENT', 'ADMIN', 'INSTITUTION'].includes(role)) {
      user.role = role;
    }

    try {
      await user.save();
    } catch (err) {
      console.error('Error saving user:', err);
      return next(new AppError('Failed to update user', 500));
    }

    res.json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    next(new AppError('Failed to update user', 500));
  }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = parseInt(req.params.id);
    if (!userId || isNaN(userId)) {
      await transaction.rollback();
      return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return next(new AppError('User not found', 404));
    }

    // Prevent deleting yourself
    if (user.id === req.user.id) {
      await transaction.rollback();
      return next(new AppError('Cannot delete your own account', 400));
    }

    // Delete all related data in transaction
    try {
      // Delete submissions
      await Submission.destroy({ 
        where: { user_id: userId },
        transaction 
      }).catch(() => {});

      // Get enrollments first to delete lesson progress
      const enrollments = await Enrollment.findAll({ 
        where: { user_id: userId }, 
        attributes: ['id'],
        transaction 
      }).catch(() => []);
      
      const enrollmentIds = enrollments.map(e => e.id);
      if (enrollmentIds.length > 0) {
        // Delete lesson progress
        await LessonProgress.destroy({ 
          where: { enrollment_id: { [Op.in]: enrollmentIds } },
          transaction 
        }).catch(() => {});
      }

      // Delete enrollments
      await Enrollment.destroy({ 
        where: { user_id: userId },
        transaction 
      }).catch(() => {});

      // Delete the user
      await user.destroy({ transaction });

      await transaction.commit();

      // Reorder user IDs to be sequential
      try {
        console.log('Starting user ID reordering...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const remainingUsers = await User.findAll({
          order: [['id', 'ASC']],
          attributes: ['id', 'name', 'email']
        });
        
        console.log(`Found ${remainingUsers.length} remaining users`);
        
        if (remainingUsers.length > 0) {
          const idMap = new Map();
          remainingUsers.forEach((user, index) => {
            const newId = index + 1;
            if (user.id !== newId) {
              idMap.set(user.id, newId);
              console.log(`Will reorder user ID ${user.id} -> ${newId} (${user.name})`);
            }
          });
          
          if (idMap.size > 0) {
            const sortedIds = Array.from(idMap.entries()).sort((a, b) => b[0] - a[0]);
            for (const [oldId, newId] of sortedIds) {
              console.log(`Reordering user ${oldId} to ${newId}...`);
              
              await sequelize.query(
                `UPDATE submissions SET user_id = ${newId} WHERE user_id = ${oldId}`
              ).catch(err => console.error(`Error updating submissions for user ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE enrollments SET user_id = ${newId} WHERE user_id = ${oldId}`
              ).catch(err => console.error(`Error updating enrollments for user ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE users SET id = ${newId} WHERE id = ${oldId}`
              ).catch(err => {
                console.error(`Error updating user ${oldId} to ${newId}:`, err.message);
                throw err;
              });
              
              console.log(`Successfully reordered user ${oldId} to ${newId}`);
            }
          } else {
            console.log('No ID reordering needed - IDs are already sequential');
          }
          
          const maxId = remainingUsers.length;
          await sequelize.query(
            `ALTER TABLE users AUTO_INCREMENT = ${maxId + 1}`
          );
          console.log(`Reset AUTO_INCREMENT to ${maxId + 1}`);
        }
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('User IDs reordered successfully');
      } catch (reorderError) {
        console.error('Could not reorder user IDs:', reorderError);
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
      }

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (destroyError) {
      await transaction.rollback();
      console.error('Error deleting user and related data:', destroyError);
      throw destroyError;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to delete user', 500));
  }
});

// ========== PROBLEM MANAGEMENT ==========

// Get all problems (admin view - includes DRAFT and DISABLED)
router.get('/problems', async (req, res, next) => {
  try {
    const { difficulty, search, status } = req.query;
    
    const whereClause = {};
    
    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = difficulty.toUpperCase();
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    // Get all problems - admin can see all statuses
    let problems = [];
    try {
      problems = await Problem.findAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'short_description', 'description', 'difficulty', 
          'category', 'topics', 'is_free', 'status', 'created_at', 'updated_at'
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (err) {
      // Fallback to basic fields if new columns don't exist
      if (err.message && err.message.includes('Unknown column')) {
        console.warn('Some columns missing, using basic fields');
        const basicWhereClause = { ...whereClause };
        delete basicWhereClause.status;
        delete basicWhereClause.category;
        delete basicWhereClause.is_free;
        
        problems = await Problem.findAll({
          where: basicWhereClause,
          attributes: ['id', 'title', 'description', 'difficulty', 'topics', 'created_at'],
          order: [['created_at', 'DESC']]
        });
      } else {
        throw err;
      }
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      problems = problems.filter(p => {
        if (!p || !p.title) return false;
        return p.title.toLowerCase().includes(searchLower) ||
               (p.short_description && p.short_description.toLowerCase().includes(searchLower)) ||
               (p.description && p.description.toLowerCase().includes(searchLower));
      });
    }

    // Add default values for missing fields
    const problemsWithDefaults = problems.map(p => {
      const problemData = p.toJSON();
      return {
        ...problemData,
        short_description: problemData.short_description || null,
        category: problemData.category || 'OTHER',
        is_free: problemData.is_free !== undefined ? problemData.is_free : true,
        status: problemData.status || 'DRAFT'
      };
    });

    res.json({
      status: 'success',
      data: problemsWithDefaults
    });
  } catch (error) {
    console.error('Error fetching admin problems:', error);
    next(new AppError('Failed to fetch problems', 500));
  }
});

// Create problem with all fields
router.post('/problems', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('difficulty').isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Valid difficulty is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      short_description,
      description,
      difficulty,
      category,
      topics,
      input_format,
      output_format,
      constraints,
      assumptions,
      sample_input,
      sample_output,
      sample_explanation,
      supported_languages,
      time_limit,
      memory_limit,
      reference_solution,
      editorial,
      code_templates,
      status,
      is_free,
      test_cases,
      course_ids, // Array of course IDs to assign problem to
      lesson_assignments // Array of {course_id, lesson_id, position}
    } = req.body;

    // Build problem data - handle missing columns gracefully
    const problemData = {
      title,
      description,
      difficulty,
      constraints: constraints || null,
      sample_input: sample_input || null,
      sample_output: sample_output || null,
      topics: topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : null
    };

    // Add optional fields - only if they exist in database
    if (short_description !== undefined) problemData.short_description = short_description;
    if (category !== undefined) problemData.category = category || 'OTHER';
    if (input_format !== undefined) problemData.input_format = input_format;
    if (output_format !== undefined) problemData.output_format = output_format;
    if (assumptions !== undefined) problemData.assumptions = assumptions;
    if (sample_explanation !== undefined) problemData.sample_explanation = sample_explanation;
    if (supported_languages !== undefined) {
      problemData.supported_languages = Array.isArray(supported_languages) 
        ? JSON.stringify(supported_languages) 
        : supported_languages;
    } else {
      // Default if not provided
      problemData.supported_languages = JSON.stringify(['c', 'cpp', 'python']);
    }
    if (time_limit !== undefined) problemData.time_limit = time_limit || 1000;
    if (memory_limit !== undefined) problemData.memory_limit = memory_limit || 256;
    if (reference_solution !== undefined) problemData.reference_solution = reference_solution;
    if (editorial !== undefined) problemData.editorial = editorial;
    if (code_templates !== undefined) {
      problemData.code_templates = typeof code_templates === 'object' 
        ? JSON.stringify(code_templates) 
        : code_templates;
    }
    if (status !== undefined) problemData.status = status || 'DRAFT';
    if (is_free !== undefined) problemData.is_free = is_free;

    const problem = await Problem.create(problemData);

    // Add test cases if provided
    if (test_cases && Array.isArray(test_cases)) {
      for (let i = 0; i < test_cases.length; i++) {
        const testCase = test_cases[i];
        await TestCase.create({
          problem_id: problem.id,
          input: testCase.input,
          expected_output: testCase.expected_output,
          explanation: testCase.explanation || null,
          is_hidden: testCase.is_hidden !== undefined ? testCase.is_hidden : false,
          order: testCase.order !== undefined ? testCase.order : i
        });
      }
    }

    // Assign to courses if provided
    if (course_ids && Array.isArray(course_ids)) {
      for (const courseId of course_ids) {
        await CourseProblem.create({
          course_id: courseId,
          problem_id: problem.id,
          lesson_id: null,
          position: 0
        });
      }
    }

    // Assign to specific lessons if provided
    if (lesson_assignments && Array.isArray(lesson_assignments)) {
      for (const assignment of lesson_assignments) {
        await CourseProblem.create({
          course_id: assignment.course_id,
          lesson_id: assignment.lesson_id || null,
          problem_id: problem.id,
          position: assignment.position || 0
        });
      }
    }

    const problemWithTests = await Problem.findByPk(problem.id, {
      include: [{
        model: TestCase,
        as: 'testCases'
      }]
    });

    res.status(201).json({
      status: 'success',
      data: problemWithTests
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    next(error);
  }
});

// Update problem with all fields
router.put('/problems/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);

    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    const {
      title,
      short_description,
      description,
      difficulty,
      category,
      topics,
      input_format,
      output_format,
      constraints,
      assumptions,
      sample_input,
      sample_output,
      sample_explanation,
      supported_languages,
      time_limit,
      memory_limit,
      reference_solution,
      editorial,
      code_templates,
      status,
      is_free,
      test_cases,
      course_ids,
      lesson_assignments
    } = req.body;

    // Update basic fields
    if (title !== undefined) problem.title = title;
    if (short_description !== undefined) problem.short_description = short_description;
    if (description !== undefined) problem.description = description;
    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      problem.difficulty = difficulty;
    }
    if (category !== undefined) problem.category = category;
    if (topics !== undefined) {
      problem.topics = topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : null;
    }
    if (input_format !== undefined) problem.input_format = input_format;
    if (output_format !== undefined) problem.output_format = output_format;
    if (constraints !== undefined) problem.constraints = constraints;
    if (assumptions !== undefined) problem.assumptions = assumptions;
    if (sample_input !== undefined) problem.sample_input = sample_input;
    if (sample_output !== undefined) problem.sample_output = sample_output;
    if (sample_explanation !== undefined) problem.sample_explanation = sample_explanation;
    if (supported_languages !== undefined) {
      problem.supported_languages = Array.isArray(supported_languages) 
        ? JSON.stringify(supported_languages) 
        : supported_languages;
    }
    if (time_limit !== undefined) problem.time_limit = time_limit;
    if (memory_limit !== undefined) problem.memory_limit = memory_limit;
    if (reference_solution !== undefined) problem.reference_solution = reference_solution;
    if (editorial !== undefined) problem.editorial = editorial;
    if (code_templates !== undefined) {
      problem.code_templates = typeof code_templates === 'object' 
        ? JSON.stringify(code_templates) 
        : code_templates;
    }
    if (status && ['DRAFT', 'PUBLISHED', 'DISABLED'].includes(status)) {
      problem.status = status;
    }
    if (is_free !== undefined) problem.is_free = is_free;

    problem.updated_at = new Date();
    await problem.save();

    // Update test cases if provided
    if (test_cases && Array.isArray(test_cases)) {
      // Delete existing test cases
      await TestCase.destroy({ where: { problem_id: problem.id } });
      
      // Create new test cases
      for (let i = 0; i < test_cases.length; i++) {
        const testCase = test_cases[i];
        await TestCase.create({
          problem_id: problem.id,
          input: testCase.input,
          expected_output: testCase.expected_output,
          explanation: testCase.explanation || null,
          is_hidden: testCase.is_hidden !== undefined ? testCase.is_hidden : false,
          order: testCase.order !== undefined ? testCase.order : i
        });
      }
    }

    // Update course assignments if provided
    if (course_ids !== undefined || lesson_assignments !== undefined) {
      // Delete existing course assignments
      await CourseProblem.destroy({ where: { problem_id: problem.id } });
      
      // Add new course assignments
      if (course_ids && Array.isArray(course_ids)) {
        for (const courseId of course_ids) {
          await CourseProblem.create({
            course_id: courseId,
            problem_id: problem.id,
            lesson_id: null,
            position: 0
          });
        }
      }
      
      // Add lesson assignments
      if (lesson_assignments && Array.isArray(lesson_assignments)) {
        for (const assignment of lesson_assignments) {
          await CourseProblem.create({
            course_id: assignment.course_id,
            lesson_id: assignment.lesson_id || null,
            problem_id: problem.id,
            position: assignment.position || 0
          });
        }
      }
    }

    const updatedProblem = await Problem.findByPk(problem.id, {
      include: [{
        model: TestCase,
        as: 'testCases'
      }]
    });

    res.json({
      status: 'success',
      data: updatedProblem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    next(error);
  }
});

// Delete problem
router.delete('/problems/:id', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const problemId = parseInt(req.params.id);
    
    if (isNaN(problemId)) {
      await transaction.rollback();
      return next(new AppError('Invalid problem ID', 400));
    }

    const problem = await Problem.findByPk(problemId, { transaction });

    if (!problem) {
      await transaction.rollback();
      return next(new AppError('Problem not found', 404));
    }

    // Delete all related data in transaction
    try {
      // Delete submissions related to this problem
      await Submission.destroy({ 
        where: { problem_id: problemId },
        transaction 
      }).catch(() => {});

      // Delete test cases
      await TestCase.destroy({ 
        where: { problem_id: problemId },
        transaction 
      }).catch(() => {});

      // Delete course-problem relationships
      await CourseProblem.destroy({ 
        where: { problem_id: problemId },
        transaction 
      }).catch(() => {});

      // Delete the problem itself
      await problem.destroy({ transaction });

      await transaction.commit();

      // Reorder problem IDs to be sequential
      try {
        console.log('Starting problem ID reordering...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const remainingProblems = await Problem.findAll({
          order: [['id', 'ASC']],
          attributes: ['id']
        });
        
        console.log(`Found ${remainingProblems.length} remaining problems`);
        
        if (remainingProblems.length > 0) {
          const idMap = new Map();
          remainingProblems.forEach((problem, index) => {
            const newId = index + 1;
            if (problem.id !== newId) {
              idMap.set(problem.id, newId);
              console.log(`Will reorder problem ID ${problem.id} -> ${newId}`);
            }
          });
          
          if (idMap.size > 0) {
            // Update in reverse order to avoid conflicts
            const sortedIds = Array.from(idMap.entries()).sort((a, b) => b[0] - a[0]);
            for (const [oldId, newId] of sortedIds) {
              console.log(`Reordering problem ${oldId} to ${newId}...`);
              
              // Update foreign keys first
              await sequelize.query(
                `UPDATE test_cases SET problem_id = ${newId} WHERE problem_id = ${oldId}`
              ).catch(err => console.error(`Error updating test_cases for problem ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE submissions SET problem_id = ${newId} WHERE problem_id = ${oldId}`
              ).catch(err => console.error(`Error updating submissions for problem ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE course_problems SET problem_id = ${newId} WHERE problem_id = ${oldId}`
              ).catch(err => console.error(`Error updating course_problems for problem ${oldId}:`, err.message));
              
              // Update primary key last
              await sequelize.query(
                `UPDATE problems SET id = ${newId} WHERE id = ${oldId}`
              ).catch(err => {
                console.error(`Error updating problem ${oldId} to ${newId}:`, err.message);
                throw err;
              });
              
              console.log(`Successfully reordered problem ${oldId} to ${newId}`);
            }
          } else {
            console.log('No ID reordering needed - IDs are already sequential');
          }
          
          // Reset AUTO_INCREMENT
          const maxId = remainingProblems.length;
          await sequelize.query(
            `ALTER TABLE problems AUTO_INCREMENT = ${maxId + 1}`
          );
          console.log(`Reset AUTO_INCREMENT to ${maxId + 1}`);
        }
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Problem IDs reordered successfully');
      } catch (reorderError) {
        console.error('Could not reorder problem IDs:', reorderError);
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
      }

      res.json({
        status: 'success',
        message: 'Problem deleted successfully'
      });
    } catch (destroyError) {
      await transaction.rollback();
      console.error('Error deleting problem and related data:', destroyError);
      throw destroyError;
    }
  } catch (error) {
    console.error('Error deleting problem:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to delete problem', 500));
  }
});

// Get problem with all test cases and course assignments (admin view)
router.get('/problems/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [
        {
          model: TestCase,
          as: 'testCases',
          order: [[sequelize.literal('`test_cases`.`order`'), 'ASC']]
        },
        {
          model: CourseProblem,
          as: 'courseProblems',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title']
            },
            {
              model: Lesson,
              as: 'lesson',
              attributes: ['id', 'title']
            }
          ]
        }
      ]
    });

    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Parse JSON fields
    const problemData = problem.toJSON();
    problemData.topics = typeof problem.topics === 'string' ? JSON.parse(problem.topics || '[]') : (problem.topics || []);
    problemData.supported_languages = typeof problem.supported_languages === 'string' 
      ? JSON.parse(problem.supported_languages || '["c", "cpp", "python"]') 
      : (problem.supported_languages || ['c', 'cpp', 'python']);
    problemData.code_templates = typeof problem.code_templates === 'string' 
      ? JSON.parse(problem.code_templates || '{}') 
      : (problem.code_templates || {});

    res.json({
      status: 'success',
      data: problemData
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    next(error);
  }
});

// Enable/Disable problem
router.patch('/problems/:id/status', async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    const { status } = req.body;
    
    if (!['DRAFT', 'PUBLISHED', 'DISABLED'].includes(status)) {
      return next(new AppError('Invalid status. Must be DRAFT, PUBLISHED, or DISABLED', 400));
    }

    problem.status = status;
    problem.updated_at = new Date();
    await problem.save();

    res.json({
      status: 'success',
      message: `Problem ${status === 'DISABLED' ? 'disabled' : status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully`,
      data: problem
    });
  } catch (error) {
    console.error('Error updating problem status:', error);
    next(error);
  }
});

// ========== COURSE MANAGEMENT ==========

// Create course
router.post('/courses', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('level').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Valid level is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, short_description, description, level, price, status, duration, image_url, topics } = req.body;

    const course = await Course.create({
      title,
      short_description: short_description || null,
      description,
      level,
      price: price || 0,
      status: status || 'DRAFT',
      duration,
      image_url,
      topics: topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : null,
      created_by: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

// Get all courses with stats (admin)
router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.findAll({
      order: [['created_at', 'DESC']]
    });

    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } });
      const problemCount = await CourseProblem.count({ where: { course_id: course.id } });
      const lessonCount = await Lesson.count({ where: { course_id: course.id } });

      const enrollments = await Enrollment.findAll({
        where: { course_id: course.id },
        attributes: ['progress']
      });
      const avgProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
        : 0;

      return {
        ...course.toJSON(),
        enrollment_count: enrollmentCount,
        lesson_count: lessonCount,
        problem_count: problemCount,
        average_progress: Math.round(avgProgress * 100) / 100
      };
    }));

    res.json({
      status: 'success',
      data: coursesWithStats
    });
  } catch (error) {
    next(error);
  }
});

// Get course with stats
router.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: Lesson,
        as: 'lessons',
        attributes: ['id']
      }]
    });

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } });
    const problemCount = await CourseProblem.count({ where: { course_id: course.id } });
    const lessonCount = await Lesson.count({ where: { course_id: course.id } });

    // Calculate average progress
    const enrollments = await Enrollment.findAll({
      where: { course_id: course.id },
      attributes: ['progress']
    });
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;

    res.json({
      status: 'success',
      data: {
        ...course.toJSON(),
        stats: {
          enrollment_count: enrollmentCount,
          lesson_count: lessonCount,
          problem_count: problemCount,
          average_progress: Math.round(avgProgress * 100) / 100
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update course
router.put('/courses/:id', async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const { title, short_description, description, level, price, status, duration, image_url, topics } = req.body;

    if (title) course.title = title;
    if (short_description !== undefined) course.short_description = short_description;
    if (description) course.description = description;
    if (level && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(level)) {
      course.level = level;
    }
    if (price !== undefined) course.price = price;
    if (status && ['DRAFT', 'PUBLISHED'].includes(status)) {
      course.status = status;
    }
    if (duration !== undefined) course.duration = duration;
    if (image_url !== undefined) course.image_url = image_url;
    if (topics !== undefined) {
      course.topics = topics ? (Array.isArray(topics) ? JSON.stringify(topics) : topics) : null;
    }

    await course.save();

    res.json({
      status: 'success',
      data: course
    });
  } catch (error) {
    next(error);
  }
});

// Delete course
router.delete('/courses/:id', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      await transaction.rollback();
      return next(new AppError('Invalid course ID', 400));
    }

    const course = await Course.findByPk(courseId, { transaction });

    if (!course) {
      await transaction.rollback();
      return next(new AppError('Course not found', 404));
    }

    // Delete all related data in transaction
    try {
      // Get enrollments first
      const enrollments = await Enrollment.findAll({ 
        where: { course_id: courseId }, 
        attributes: ['id'],
        transaction 
      }).catch(() => []);
      
      const enrollmentIds = enrollments.map(e => e.id);
      if (enrollmentIds.length > 0) {
        // Delete lesson progress
        await LessonProgress.destroy({ 
          where: { enrollment_id: { [Op.in]: enrollmentIds } },
          transaction 
        }).catch(() => {});
      }

      // Delete course-problem relationships
      await CourseProblem.destroy({ 
        where: { course_id: courseId },
        transaction 
      }).catch(() => {});

      // Delete lessons
      await Lesson.destroy({ 
        where: { course_id: courseId },
        transaction 
      }).catch(() => {});

      // Delete enrollments
      await Enrollment.destroy({ 
        where: { course_id: courseId },
        transaction 
      }).catch(() => {});

      // Delete the course itself
      await course.destroy({ transaction });

      await transaction.commit();

      // Reorder course IDs to be sequential
      try {
        console.log('Starting course ID reordering...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const remainingCourses = await Course.findAll({
          order: [['id', 'ASC']],
          attributes: ['id', 'title']
        });
        
        console.log(`Found ${remainingCourses.length} remaining courses`);
        
        if (remainingCourses.length > 0) {
          const idMap = new Map();
          remainingCourses.forEach((course, index) => {
            const newId = index + 1;
            if (course.id !== newId) {
              idMap.set(course.id, newId);
              console.log(`Will reorder course ID ${course.id} -> ${newId} (${course.title})`);
            }
          });
          
          if (idMap.size > 0) {
            const sortedIds = Array.from(idMap.entries()).sort((a, b) => b[0] - a[0]);
            for (const [oldId, newId] of sortedIds) {
              console.log(`Reordering course ${oldId} to ${newId}...`);
              
              await sequelize.query(
                `UPDATE enrollments SET course_id = ${newId} WHERE course_id = ${oldId}`
              ).catch(err => console.error(`Error updating enrollments for course ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE lessons SET course_id = ${newId} WHERE course_id = ${oldId}`
              ).catch(err => console.error(`Error updating lessons for course ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE course_problems SET course_id = ${newId} WHERE course_id = ${oldId}`
              ).catch(err => console.error(`Error updating course_problems for course ${oldId}:`, err.message));
              
              await sequelize.query(
                `UPDATE courses SET id = ${newId} WHERE id = ${oldId}`
              ).catch(err => {
                console.error(`Error updating course ${oldId} to ${newId}:`, err.message);
                throw err;
              });
              
              console.log(`Successfully reordered course ${oldId} to ${newId}`);
            }
          } else {
            console.log('No ID reordering needed - IDs are already sequential');
          }
          
          const maxId = remainingCourses.length;
          await sequelize.query(
            `ALTER TABLE courses AUTO_INCREMENT = ${maxId + 1}`
          );
          console.log(`Reset AUTO_INCREMENT to ${maxId + 1}`);
        }
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Course IDs reordered successfully');
      } catch (reorderError) {
        console.error('Could not reorder course IDs:', reorderError);
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
      }

      res.json({
        status: 'success',
        message: 'Course deleted successfully'
      });
    } catch (destroyError) {
      await transaction.rollback();
      console.error('Error deleting course and related data:', destroyError);
      throw destroyError;
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Failed to delete course', 500));
  }
});

// ========== LESSON MANAGEMENT ==========

// Create lesson
router.post('/courses/:courseId/lessons', [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('position').optional().isInt().withMessage('Position must be an integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseId = parseInt(req.params.courseId);
    const { title, content, position } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    let lessonPosition = position;
    if (lessonPosition === undefined) {
      const maxPosition = await Lesson.max('position', {
        where: { course_id: courseId }
      });
      lessonPosition = (maxPosition || -1) + 1;
    }

    const lesson = await Lesson.create({
      course_id: courseId,
      title,
      content,
      position: lessonPosition
    });

    res.status(201).json({
      status: 'success',
      data: lesson
    });
  } catch (error) {
    next(error);
  }
});

// Get all lessons for a course
router.get('/courses/:courseId/lessons', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const course = await Course.findByPk(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [['position', 'ASC']],
      include: [{
        model: CourseProblem,
        as: 'problems',
        include: [{
          model: Problem,
          as: 'problem'
        }],
        order: [['position', 'ASC']]
      }]
    });

    res.json({
      status: 'success',
      data: lessons
    });
  } catch (error) {
    next(error);
  }
});

// Update lesson
router.put('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const { title, content, position } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    if (title) lesson.title = title;
    if (content) lesson.content = content;
    if (position !== undefined) lesson.position = position;

    await lesson.save();

    res.json({
      status: 'success',
      data: lesson
    });
  } catch (error) {
    next(error);
  }
});

// Delete lesson
router.delete('/lessons/:lessonId', async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    await lesson.destroy();

    res.json({
      status: 'success',
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Add problem to lesson
router.post('/lessons/:lessonId/problems', [
  body('problem_id').isInt().withMessage('Problem ID is required'),
  body('position').optional().isInt().withMessage('Position must be an integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lessonId = parseInt(req.params.lessonId);
    const { problem_id, position } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    const existing = await CourseProblem.findOne({
      where: {
        lesson_id: lessonId,
        problem_id: problem_id
      }
    });

    if (existing) {
      return next(new AppError('Problem already added to this lesson', 400));
    }

    let problemPosition = position;
    if (problemPosition === undefined) {
      const maxPosition = await CourseProblem.max('position', {
        where: { lesson_id: lessonId }
      });
      problemPosition = (maxPosition || -1) + 1;
    }

    const courseProblem = await CourseProblem.create({
      course_id: lesson.course_id,
      lesson_id: lessonId,
      problem_id: problem_id,
      position: problemPosition
    });

    res.status(201).json({
      status: 'success',
      data: courseProblem
    });
  } catch (error) {
    next(error);
  }
});

// Remove problem from lesson
router.delete('/lessons/:lessonId/problems/:problemId', async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const problemId = parseInt(req.params.problemId);

    const courseProblem = await CourseProblem.findOne({
      where: {
        lesson_id: lessonId,
        problem_id: problemId
      }
    });

    if (!courseProblem) {
      return next(new AppError('Problem not found in this lesson', 404));
    }

    await courseProblem.destroy();

    res.json({
      status: 'success',
      message: 'Problem removed from lesson successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ========== SUBMISSION MANAGEMENT ==========

// Get all submissions with filters
router.get('/submissions', async (req, res, next) => {
  try {
    const { user_id, problem_id, status, language, page = 1, limit = 50 } = req.query;
    
    const whereClause = {};
    if (user_id) {
      const userId = parseInt(user_id);
      if (!isNaN(userId)) whereClause.user_id = userId;
    }
    if (problem_id) {
      const problemId = parseInt(problem_id);
      if (!isNaN(problemId)) whereClause.problem_id = problemId;
    }
    if (status) whereClause.status = status;
    if (language) whereClause.language = language;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const submissions = await Submission.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          required: false, // Left join - don't fail if user is deleted
          attributes: ['id', 'name', 'email']
        },
        {
          model: Problem,
          as: 'problem',
          required: false, // Left join - don't fail if problem is deleted
          attributes: ['id', 'title', 'difficulty']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    // Filter out submissions with deleted users or problems
    const filteredSubmissions = submissions.rows.filter(sub => {
      const subData = sub.toJSON();
      return subData.user !== null && subData.problem !== null;
    });

    res.json({
      status: 'success',
      data: {
        submissions: filteredSubmissions,
        total: filteredSubmissions.length,
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(filteredSubmissions.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    next(new AppError('Failed to fetch submissions', 500));
  }
});

// Get submission details
router.get('/submissions/:id', async (req, res, next) => {
  try {
    const submissionId = parseInt(req.params.id);
    if (!submissionId || isNaN(submissionId)) {
      return next(new AppError('Invalid submission ID', 400));
    }

    const submission = await Submission.findByPk(submissionId, {
      include: [
        {
          model: User,
          as: 'user',
          required: false, // Left join - don't fail if user is deleted
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: Problem,
          as: 'problem',
          required: false, // Left join - don't fail if problem is deleted
          attributes: ['id', 'title', 'difficulty', 'description']
        }
      ]
    });

    if (!submission) {
      return next(new AppError('Submission not found', 404));
    }

    res.json({
      status: 'success',
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    next(new AppError('Failed to fetch submission', 500));
  }
});

// ========== LEADERBOARD & ANALYTICS ==========

// Get leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;
    
    let dateFilter = {};
    if (timeframe === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { created_at: { [Op.gte]: today } };
    } else if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { created_at: { [Op.gte]: weekAgo } };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { created_at: { [Op.gte]: monthAgo } };
    }

    const leaderboard = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        'role',
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('submissions.id'))), 'solved_count']
      ],
      include: [{
        model: Submission,
        as: 'submissions',
        attributes: [],
        where: {
          status: 'ACCEPTED',
          ...dateFilter
        },
        required: false
      }],
      group: ['User.id'],
      order: [[Sequelize.literal('solved_count'), 'DESC']],
      limit: parseInt(limit),
      subQuery: false
    });

    res.json({
      status: 'success',
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
});

// Get problem analytics
router.get('/analytics/problems', async (req, res, next) => {
  try {
    const problemStats = await Problem.findAll({
      attributes: [
        'id',
        'title',
        'difficulty',
        [Sequelize.fn('COUNT', Sequelize.col('submissions.id')), 'total_submissions'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN submissions.status = 'ACCEPTED' THEN 1 ELSE 0 END")), 'accepted_submissions']
      ],
      include: [{
        model: Submission,
        as: 'submissions',
        attributes: [],
        required: false
      }],
      group: ['Problem.id'],
      order: [[Sequelize.literal('total_submissions'), 'DESC']]
    });

    const stats = problemStats.map((p) => {
      const total = parseInt(p.dataValues.total_submissions) || 0;
      const accepted = parseInt(p.dataValues.accepted_submissions) || 0;
      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        totalSubmissions: total,
        acceptedSubmissions: accepted,
        successRate: total > 0 ? ((accepted / total) * 100).toFixed(2) : 0
      };
    });

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
