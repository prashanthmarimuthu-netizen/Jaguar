import { Problem, CourseProblem, Enrollment } from '../models/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Middleware to check problem access
 * Rules:
 * - Only logged-in users can view problems
 * - Free problems are accessible to all logged-in users
 * - Paid course problems require enrollment
 */
export const problemAccessMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const problemId = parseInt(req.params.id || req.params.problemId);

    if (!problemId || isNaN(problemId)) {
      return next(new AppError('Invalid problem ID', 400));
    }

    // Find problem
    const problem = await Problem.findByPk(problemId);

    if (!problem) {
      return next(new AppError('Problem not found', 404));
    }

    // Check if problem is published/enabled - handle missing status field
    const problemStatus = problem.status || 'PUBLISHED';
    if (problemStatus === 'DISABLED' && req.user?.role !== 'ADMIN') {
      return next(new AppError('Problem is disabled', 403));
    }

    // If problem is free, allow access to all logged-in users
    // Handle missing is_free field (default to true for backward compatibility)
    const isFree = problem.is_free !== undefined ? problem.is_free : true;
    if (isFree) {
      req.problem = problem;
      return next();
    }

    // For paid problems, check if user is enrolled in any course that has this problem
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'You must be logged in to access this problem',
        code: 'NOT_LOGGED_IN'
      });
    }

    // Check if problem is linked to any course
    const courseProblem = await CourseProblem.findOne({
      where: { problem_id: problemId }
    });

    if (!courseProblem) {
      // Standalone paid problem - require enrollment (or make it free)
      // For now, we'll allow access if user is logged in
      req.problem = problem;
      return next();
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseProblem.course_id
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be enrolled in the course to access this problem',
        code: 'NOT_ENROLLED',
        course_id: courseProblem.course_id
      });
    }

    req.problem = problem;
    req.enrollment = enrollment;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for optional problem access (for listing pages)
 * Returns problem data but marks access status
 */
export const optionalProblemAccessMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    req.userId = userId; // Store for later use
    next();
  } catch (error) {
    next(error);
  }
};

