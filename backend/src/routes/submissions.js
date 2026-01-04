import express from 'express';
import { Submission, Problem, TestCase, User } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateSubmission, handleValidationErrors } from '../utils/validators.js';
import { executeCode } from '../services/piston.js';
import { AppError } from '../utils/errors.js';

const router = express.Router();

// Run code without evaluation (for testing)
router.post('/run', authMiddleware, validateSubmission, handleValidationErrors, async (req, res, next) => {
  try {
    const { problem_id, code, language, stdin = '' } = req.body;

    // Verify problem exists
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Execute code
    const result = await executeCode(code, language, stdin);

    res.json({
      status: 'success',
      data: {
        output: result.output,
        stderr: result.stderr,
        executionTime: result.executionTime
      }
    });
  } catch (error) {
    next(error);
  }
});

// Submit code for evaluation (test case checking disabled for now)
router.post('/submit', authMiddleware, validateSubmission, handleValidationErrors, async (req, res, next) => {
  try {
    const { problem_id, code, language } = req.body;
    const user_id = req.user.id;

    // Verify problem exists
    const problem = await Problem.findByPk(problem_id);
    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Test case checking is disabled - always accept submission
    // TODO: Re-enable test case checking in next phase
    const status = 'ACCEPTED';
    const executionTime = 0;

    // Save submission
    const submission = await Submission.create({
      user_id,
      problem_id,
      code,
      language,
      status,
      execution_time: executionTime,
      test_cases_passed: 0,
      total_test_cases: 0
    });

    res.json({
      status: 'success',
      data: {
        submission: {
          id: submission.id,
          status: submission.status,
          executionTime: submission.execution_time
        }
      }
    });
  } catch (error) {
    // Save error submission if possible
    if (req.body.problem_id && req.user) {
      try {
        await Submission.create({
          user_id: req.user.id,
          problem_id: req.body.problem_id,
          code: req.body.code,
          language: req.body.language,
          status: 'ERROR',
          execution_time: 0
        });
      } catch (e) {
        // Ignore save errors
      }
    }
    next(error);
  }
});

// Get user submissions
router.get('/user/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only view their own submissions unless they're admin
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return next(new AppError('Access denied', 403));
    }

    const submissions = await Submission.findAll({
      where: { user_id: userId },
      include: [{
        model: Problem,
        as: 'problem',
        attributes: ['id', 'title', 'difficulty']
      }],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    next(error);
  }
});

export default router;

