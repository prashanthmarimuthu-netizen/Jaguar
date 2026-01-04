import express from 'express';
import { Problem, TestCase, Submission, CourseProblem, Course, sequelize } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.js';
import { problemAccessMiddleware, optionalProblemAccessMiddleware } from '../middleware/problemAccess.js';
import { AppError } from '../utils/errors.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all problems with filters, search, and sorting (optional auth - shows PUBLISHED only)
router.get('/', optionalAuthMiddleware, optionalProblemAccessMiddleware, async (req, res, next) => {
  try {
    const userId = req.user?.id; // Get userId from optional auth middleware
    const { 
      difficulty, 
      search, 
      tags, 
      course_id, 
      status, // solved, unsolved, attempted
      is_free,
      sort, // difficulty, recent, alphabetical
      category
    } = req.query;
    
    // Build where clause - handle missing status column gracefully
    const whereClause = {};
    
    // Filter by status - only show PUBLISHED problems to non-admin users
    // Admin users can see all problems via /admin/problems endpoint
    // For public route, always show PUBLISHED only
    whereClause.status = 'PUBLISHED';
    
    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = difficulty.toUpperCase();
    }
    
    // Only filter by category if it exists
    if (category && category !== 'all') {
      try {
        whereClause.category = category.toUpperCase();
      } catch (err) {
        // Category column might not exist
      }
    }
    
    if (is_free !== undefined) {
      try {
        whereClause.is_free = is_free === 'true';
      } catch (err) {
        // is_free column might not exist
      }
    }

    // Get all problems matching filters - handle missing columns gracefully
    let problems = [];
    try {
      // First try with all new fields
      problems = await Problem.findAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'short_description', 'description', 'difficulty', 
          'category', 'topics', 'is_free', 'status', 'created_at'
        ],
        order: [['created_at', 'DESC']]
      });
    } catch (err) {
      // If new columns don't exist, use basic fields
      if (err.message && err.message.includes('Unknown column')) {
        console.warn('Some problem columns missing, using basic fields. Run migration script.');
        try {
          // Remove status from where clause if it doesn't exist
          const basicWhereClause = { ...whereClause };
          delete basicWhereClause.status;
          delete basicWhereClause.category;
          delete basicWhereClause.is_free;
          
          problems = await Problem.findAll({
            where: basicWhereClause,
            attributes: [
              'id', 'title', 'description', 'difficulty', 
              'topics', 'created_at'
            ],
            order: [['created_at', 'DESC']]
          });
        } catch (err2) {
          console.error('Error fetching problems with basic fields:', err2.message);
          problems = [];
        }
      } else {
        console.error('Error fetching problems:', err.message);
        problems = [];
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

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      problems = problems.filter(p => {
        if (!p.topics) return false;
        const problemTags = typeof p.topics === 'string' ? JSON.parse(p.topics) : p.topics;
        return tagArray.some(tag => problemTags.includes(tag));
      });
    }

    // Filter by course
    if (course_id) {
      const courseProblems = await CourseProblem.findAll({
        where: { course_id: parseInt(course_id) },
        attributes: ['problem_id']
      });
      const problemIds = courseProblems.map(cp => cp.problem_id);
      problems = problems.filter(p => problemIds.includes(p.id));
    }

    // Get user submissions to determine solve status (only if user is logged in)
    const problemStatusMap = new Map();
    if (userId) {
      try {
        const submissions = await Submission.findAll({
          where: { user_id: userId },
          attributes: ['problem_id', 'status'],
          order: [['created_at', 'DESC']]
        });

        submissions.forEach(sub => {
          if (!problemStatusMap.has(sub.problem_id)) {
            problemStatusMap.set(sub.problem_id, sub.status === 'ACCEPTED' ? 'solved' : 'attempted');
          } else if (problemStatusMap.get(sub.problem_id) !== 'solved' && sub.status === 'ACCEPTED') {
            problemStatusMap.set(sub.problem_id, 'solved');
          }
        });
      } catch (err) {
        console.warn('Error fetching submissions for solve status:', err.message);
      }
    }

    // Add solve status and filter by status
    // Add default values for missing fields
    let problemsWithStatus = problems.map(p => {
      const status = problemStatusMap.get(p.id) || 'not_started';
      const problemData = p.toJSON();
      return {
        ...problemData,
        short_description: problemData.short_description || null,
        category: problemData.category || 'OTHER',
        is_free: problemData.is_free !== undefined ? problemData.is_free : true,
        status: problemData.status || 'PUBLISHED',
        solve_status: status
      };
    });

    if (status && status !== 'all') {
      problemsWithStatus = problemsWithStatus.filter(p => {
        if (status === 'solved') return p.solve_status === 'solved';
        if (status === 'attempted') return p.solve_status === 'attempted';
        if (status === 'unsolved') return p.solve_status !== 'solved';
        return true;
      });
    }

    // Get course info for each problem
    const problemIds = problemsWithStatus.map(p => p.id);
    const courseProblems = await CourseProblem.findAll({
      where: { problem_id: { [Op.in]: problemIds } },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }]
    });

    const courseMap = new Map();
    courseProblems.forEach(cp => {
      if (cp.course) {
        courseMap.set(cp.problem_id, cp.course);
      }
    });

    // Add course info
    problemsWithStatus = problemsWithStatus.map(p => ({
      ...p,
      course: courseMap.get(p.id) || null
    }));

    // Sorting
    if (sort === 'difficulty') {
      const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
      problemsWithStatus.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    } else if (sort === 'recent') {
      problemsWithStatus.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'alphabetical') {
      problemsWithStatus.sort((a, b) => a.title.localeCompare(b.title));
    }

    res.json({
      status: 'success',
      data: problemsWithStatus
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    next(new AppError('Failed to fetch problems', 500));
  }
});

// Get problem by ID with full details (requires access check)
router.get('/:id', optionalAuthMiddleware, optionalProblemAccessMiddleware, async (req, res, next) => {
  try {
    const problemId = parseInt(req.params.id);
    if (!problemId || isNaN(problemId)) {
      return next(new AppError('Invalid problem ID', 400));
    }
    
    const userId = req.user?.id; // Optional - user might not be logged in
    
    // Fetch the problem
    const problem = await Problem.findByPk(problemId);
    
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }
    
    // Check if problem is published (for non-admin users)
    const problemStatus = problem.status || 'PUBLISHED';
    if (problemStatus === 'DISABLED' && req.user?.role !== 'ADMIN') {
      return next(new AppError('Problem is disabled', 403));
    }
    
    // For non-logged-in users, only show published free problems
    if (!userId && (problemStatus !== 'PUBLISHED' || (problem.is_free !== undefined && !problem.is_free))) {
      return next(new AppError('You must be logged in to view this problem', 401));
    }

    // Get sample test cases (non-hidden) - handle missing order column gracefully
    let sampleTestCases = [];
    try {
      sampleTestCases = await TestCase.findAll({
        where: { 
          problem_id: problemId,
          is_hidden: false
        },
        order: [['id', 'ASC']], // Use id for ordering if order column doesn't exist
        attributes: ['id', 'input', 'expected_output', 'explanation']
      });
      
      // Try to include order if it exists
      try {
        const testCasesWithOrder = await TestCase.findAll({
          where: { 
            problem_id: problemId,
            is_hidden: false
          },
          order: [[sequelize.literal('`test_cases`.`order`'), 'ASC']],
          attributes: ['id', 'input', 'expected_output', 'explanation', 'order']
        });
        sampleTestCases = testCasesWithOrder;
      } catch (orderError) {
        // Order column doesn't exist, use the basic query result
        console.warn('Order column not found, using id for ordering');
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
      // Continue with empty array if test cases can't be fetched
      sampleTestCases = [];
    }

    // Get user's submission status (only if user is logged in)
    let solveStatus = 'not_started';
    if (userId) {
      const submissions = await Submission.findAll({
        where: { 
          user_id: userId,
          problem_id: problemId
        },
        order: [['created_at', 'DESC']],
        limit: 1,
        attributes: ['id', 'status', 'created_at']
      });

      if (submissions.length > 0) {
        const latestSubmission = submissions[0];
        if (latestSubmission.status === 'ACCEPTED') {
          solveStatus = 'solved';
        } else {
          solveStatus = 'attempted';
        }
      }
    }

    // Parse JSON fields - handle missing fields gracefully
    const topics = typeof problem.topics === 'string' 
      ? (() => {
          try { return JSON.parse(problem.topics || '[]'); } 
          catch { return []; }
        })()
      : (problem.topics || []);
    
    const supportedLanguages = problem.supported_languages
      ? (typeof problem.supported_languages === 'string' 
          ? (() => {
              try { return JSON.parse(problem.supported_languages); } 
              catch { return ['c', 'cpp', 'python']; }
            })()
          : (problem.supported_languages || ['c', 'cpp', 'python']))
      : ['c', 'cpp', 'python'];
    
    const codeTemplates = problem.code_templates
      ? (typeof problem.code_templates === 'string' 
          ? (() => {
              try { return JSON.parse(problem.code_templates); } 
              catch { return {}; }
            })()
          : (problem.code_templates || {}))
      : {};

    // Get course info if problem is linked to a course
    const courseProblem = await CourseProblem.findOne({
      where: { problem_id: problemId },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title']
      }]
    });

    // Build problem data with defaults for missing fields
    const problemJson = problem.toJSON();
    const problemData = {
      ...problemJson,
      short_description: problemJson.short_description || null,
      category: problemJson.category || 'OTHER',
      input_format: problemJson.input_format || null,
      output_format: problemJson.output_format || null,
      assumptions: problemJson.assumptions || null,
      sample_explanation: problemJson.sample_explanation || null,
      time_limit: problemJson.time_limit || 1000,
      memory_limit: problemJson.memory_limit || 256,
      is_free: problemJson.is_free !== undefined ? problemJson.is_free : true,
      status: problemJson.status || 'PUBLISHED',
      topics,
      supported_languages: supportedLanguages,
      code_templates: codeTemplates,
      sample_test_cases: sampleTestCases,
      solve_status: solveStatus,
      course: courseProblem?.course || null,
      // Don't include reference solution or editorial for non-admin users
      reference_solution: req.user?.role === 'ADMIN' ? (problemJson.reference_solution || null) : undefined,
      editorial: solveStatus === 'solved' ? (problemJson.editorial || null) : undefined
    };

    res.json({
      status: 'success',
      data: problemData
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    console.error('Error fetching problem:', error);
    next(new AppError('Failed to fetch problem', 500));
  }
});

export default router;

