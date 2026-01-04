import express from 'express';
import { Sequelize, Op } from 'sequelize';
import { Course, Enrollment, Lesson, CourseProblem, LessonProgress, Problem, User } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.js';
import { enrollmentMiddleware } from '../middleware/enrollment.js';
import { AppError } from '../utils/errors.js';

const router = express.Router();

// Get all courses (public, filtered by status PUBLISHED)
router.get('/', async (req, res, next) => {
  try {
    const { level, price, search } = req.query;
    
    const whereClause = {
      status: 'PUBLISHED'  // Only show published courses to everyone
    };
    
    if (level) {
      whereClause.level = level.toUpperCase();
    }
    
    if (price === 'free') {
      whereClause.price = 0;
    } else if (price === 'paid') {
      whereClause.price = { [Op.gt]: 0 };
    }

    let courses = await Course.findAll({
      where: whereClause,
      attributes: [
        'id', 'title', 'short_description', 'description', 'level', 
        'price', 'status', 'duration', 'image_url', 'topics', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });

    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(c => 
        c && c.title &&
        (c.title.toLowerCase().includes(searchLower) ||
        (c.short_description && c.short_description.toLowerCase().includes(searchLower)) ||
        (c.description && c.description.toLowerCase().includes(searchLower)))
      );
    }

    // Add lesson and problem counts
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      try {
        const lessonCount = await Lesson.count({ where: { course_id: course.id } }).catch(() => 0);
        const problemCount = await CourseProblem.count({ where: { course_id: course.id } }).catch(() => 0);
        const enrollmentCount = await Enrollment.count({ where: { course_id: course.id } }).catch(() => 0);
        
        return {
          ...course.toJSON(),
          lesson_count: lessonCount || 0,
          problem_count: problemCount || 0,
          enrollment_count: enrollmentCount || 0
        };
      } catch (err) {
        // If counting fails, return course with zero counts
        return {
          ...course.toJSON(),
          lesson_count: 0,
          problem_count: 0,
          enrollment_count: 0
        };
      }
    }));

    res.json({
      status: 'success',
      data: coursesWithStats || []
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return empty array instead of crashing
    res.json({
      status: 'success',
      data: []
    });
  }
});

// Get course by ID with enrollment status for logged-in users (public route, optional auth)
router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return next(new AppError('Invalid course ID', 400));
    }

    const userId = req.user?.id;

    const course = await Course.findByPk(courseId);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    // Check if user is enrolled
    let enrollment = null;
    if (userId) {
      enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId }
      });
    }

    // Get stats
    const lessonCount = await Lesson.count({ where: { course_id: courseId } });
    const problemCount = await CourseProblem.count({ where: { course_id: courseId } });
    const enrollmentCount = await Enrollment.count({ where: { course_id: courseId } });

    const courseData = {
      ...course.toJSON(),
      lesson_count: lessonCount,
      problem_count: problemCount,
      enrollment_count: enrollmentCount,
      is_enrolled: !!enrollment,
      enrollment: enrollment ? {
        progress: enrollment.progress,
        current_lesson_id: enrollment.current_lesson_id,
        last_lesson_id: enrollment.last_lesson_id
      } : null
    };

    // If not enrolled, don't return lessons/problems
    if (!enrollment) {
      res.json({
        status: 'success',
        data: courseData
      });
      return;
    }

    // If enrolled, include lessons and problems
    try {
      const lessons = await Lesson.findAll({
        where: { course_id: courseId },
        order: [['position', 'ASC']],
        attributes: ['id', 'title', 'position', 'created_at']
      }).catch(() => []);

      const problems = await CourseProblem.findAll({
        where: { course_id: courseId },
        include: [{
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'topics'],
          required: false // Left join - don't fail if problem is deleted
        }],
        order: [['position', 'ASC']]
      }).catch(() => []);

      // Filter out problems where the problem itself was deleted
      const validProblems = problems.filter(cp => cp.problem !== null);

      courseData.lessons = lessons || [];
      courseData.problems = validProblems.map(cp => ({
        ...cp.problem.toJSON(),
        lesson_id: cp.lesson_id,
        position: cp.position
      }));
    } catch (err) {
      console.error('Error fetching course lessons/problems:', err);
      courseData.lessons = [];
      courseData.problems = [];
    }

    res.json({
      status: 'success',
      data: courseData
    });
  } catch (error) {
    // Ensure error is properly handled
    if (error instanceof AppError) {
      return next(error);
    }
    console.error('Error fetching course:', error);
    next(new AppError('Failed to fetch course', 500));
  }
});

// Get course by ID (public version - no enrollment check, no lessons/problems)
router.get('/:id/public', async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    const lessonCount = await Lesson.count({ where: { course_id: course.id } });
    const problemCount = await CourseProblem.count({ where: { course_id: course.id } });

    res.json({
      status: 'success',
      data: {
        ...course.toJSON(),
        lesson_count: lessonCount,
        problem_count: problemCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// Enroll in course (protected)
router.post('/:id/enroll', authMiddleware, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return next(new AppError('Course not found', 404));
    }

    if (course.status !== 'PUBLISHED') {
      return next(new AppError('Course is not available for enrollment', 400));
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId }
    });

    if (enrollment) {
      return res.json({
        status: 'success',
        message: 'Already enrolled',
        data: enrollment
      });
    }

    // Get first lesson as current lesson
    const firstLesson = await Lesson.findOne({
      where: { course_id: courseId },
      order: [['position', 'ASC']]
    });

    enrollment = await Enrollment.create({
      user_id: userId,
      course_id: courseId,
      progress: 0,
      completed: false,
      current_lesson_id: firstLesson?.id || null,
      last_lesson_id: null
    });

    res.status(201).json({
      status: 'success',
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
});

// Get user enrollments (protected)
router.get('/user/enrollments', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'short_description', 'description', 'level', 'price', 'duration', 'image_url']
      }],
      order: [['enrolled_at', 'DESC']]
    });

    res.json({
      status: 'success',
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
});

// Get course lessons (requires enrollment)
router.get('/:id/lessons', authMiddleware, enrollmentMiddleware, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    const enrollment = req.enrollment;

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [['position', 'ASC']],
      include: [{
        model: CourseProblem,
        as: 'problems',
        include: [{
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'topics']
        }],
        order: [['position', 'ASC']]
      }]
    });

    // Get lesson progress
    const lessonProgress = await LessonProgress.findAll({
      where: { enrollment_id: enrollment.id },
      attributes: ['lesson_id', 'completed', 'completed_at']
    });

    const progressMap = {};
    lessonProgress.forEach(lp => {
      progressMap[lp.lesson_id] = lp.completed;
    });

    const lessonsWithProgress = lessons.map(lesson => ({
      ...lesson.toJSON(),
      problems: lesson.problems?.map(cp => ({
        ...cp.problem.toJSON(),
        position: cp.position
      })) || [],
      is_completed: progressMap[lesson.id] || false
    }));

    res.json({
      status: 'success',
      data: lessonsWithProgress
    });
  } catch (error) {
    next(error);
  }
});

// Get specific lesson (requires enrollment)
router.get('/:courseId/lessons/:lessonId', authMiddleware, enrollmentMiddleware, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const lessonId = parseInt(req.params.lessonId);

    const lesson = await Lesson.findOne({
      where: { 
        id: lessonId, 
        course_id: courseId 
      },
      include: [{
        model: CourseProblem,
        as: 'problems',
        include: [{
          model: Problem,
          as: 'problem',
          attributes: ['id', 'title', 'difficulty', 'topics']
        }],
        order: [['position', 'ASC']]
      }]
    });

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    // Get lesson progress
    const enrollment = req.enrollment;
    const lessonProgress = await LessonProgress.findOne({
      where: {
        enrollment_id: enrollment.id,
        lesson_id: lessonId
      }
    });

    res.json({
      status: 'success',
      data: {
        ...lesson.toJSON(),
        problems: lesson.problems?.map(cp => ({
          ...cp.problem.toJSON(),
          position: cp.position
        })) || [],
        is_completed: lessonProgress?.completed || false
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark lesson as complete (requires enrollment)
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, enrollmentMiddleware, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const lessonId = parseInt(req.params.lessonId);
    const enrollment = req.enrollment;

    // Verify lesson belongs to course
    const lesson = await Lesson.findOne({
      where: { id: lessonId, course_id: courseId }
    });

    if (!lesson) {
      return next(new AppError('Lesson not found', 404));
    }

    // Mark lesson as complete
    let lessonProgress = await LessonProgress.findOne({
      where: {
        enrollment_id: enrollment.id,
        lesson_id: lessonId
      }
    });

    if (!lessonProgress) {
      lessonProgress = await LessonProgress.create({
        enrollment_id: enrollment.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date()
      });
    } else if (!lessonProgress.completed) {
      lessonProgress.completed = true;
      lessonProgress.completed_at = new Date();
      await lessonProgress.save();
    }

    // Calculate progress percentage
    const totalLessons = await Lesson.count({ where: { course_id: courseId } });
    
    // Get all lesson IDs for this course
    const courseLessons = await Lesson.findAll({
      where: { course_id: courseId },
      attributes: ['id']
    });
    const courseLessonIds = courseLessons.map(l => l.id);
    
    // Count completed lessons that belong to this course
    const completedLessons = await LessonProgress.count({
      where: {
        enrollment_id: enrollment.id,
        lesson_id: { [Op.in]: courseLessonIds },
        completed: true
      }
    });

    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment progress
    enrollment.progress = progress;
    enrollment.last_lesson_id = lessonId;

    // Find next lesson
    const nextLesson = await Lesson.findOne({
      where: {
        course_id: courseId,
        position: { [Op.gt]: lesson.position }
      },
      order: [['position', 'ASC']]
    });

    if (nextLesson) {
      enrollment.current_lesson_id = nextLesson.id;
    } else {
      enrollment.current_lesson_id = null;
      enrollment.completed = true;
    }

    await enrollment.save();

    res.json({
      status: 'success',
      data: {
        lesson_progress: lessonProgress,
        enrollment: enrollment,
        progress: progress
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
