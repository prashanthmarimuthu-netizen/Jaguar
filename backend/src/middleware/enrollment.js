import { Enrollment } from '../models/index.js';
import { AppError } from '../utils/errors.js';

/**
 * Middleware to check if user is enrolled in a course
 * Requires authMiddleware to be called first
 */
export const enrollmentMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Try different param names that might contain course ID
    const courseId = parseInt(req.params.courseId || req.params.id || req.params.course_id);

    if (!courseId || isNaN(courseId)) {
      return next(new AppError('Course ID is required', 400));
    }
    
    // Store courseId for later use
    req.courseId = courseId;

    const enrollment = await Enrollment.findOne({
      where: {
        user_id: userId,
        course_id: courseId
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be enrolled in this course to access this content',
        code: 'NOT_ENROLLED'
      });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    next(error);
  }
};

