import sequelize from '../config/database.js';
import { Course, Enrollment, Lesson, CourseProblem, LessonProgress } from '../models/index.js';
import { Op } from 'sequelize';

async function reorderCourseIds() {
  try {
    console.log('Starting course ID reordering...');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const remainingCourses = await Course.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'title']
    });
    
    console.log(`Found ${remainingCourses.length} courses`);
    
    if (remainingCourses.length === 0) {
      console.log('No courses to reorder');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      return;
    }
    
    const idMap = new Map();
    remainingCourses.forEach((course, index) => {
      const newId = index + 1;
      if (course.id !== newId) {
        idMap.set(course.id, newId);
        console.log(`Will reorder course ID ${course.id} -> ${newId} (${course.title})`);
      }
    });
    
    if (idMap.size > 0) {
      // Update in reverse order to avoid conflicts
      const sortedIds = Array.from(idMap.entries()).sort((a, b) => b[0] - a[0]);
      for (const [oldId, newId] of sortedIds) {
        console.log(`Reordering course ${oldId} to ${newId}...`);
        
        // Get enrollments first to update lesson_progress
        const enrollments = await Enrollment.findAll({
          where: { course_id: oldId },
          attributes: ['id']
        });
        const enrollmentIds = enrollments.map(e => e.id);
        
        // Update foreign keys first
        if (enrollmentIds.length > 0) {
          // Update lesson_progress - need to map old enrollment IDs to new ones
          // This is complex, so we'll update by course_id through enrollments
          await sequelize.query(
            `UPDATE lesson_progress lp 
             INNER JOIN enrollments e ON lp.enrollment_id = e.id 
             SET lp.enrollment_id = (SELECT id FROM enrollments WHERE course_id = ${newId} AND user_id = e.user_id LIMIT 1)
             WHERE e.course_id = ${oldId}`
          ).catch(err => console.warn(`Warning updating lesson_progress:`, err.message));
        }
        
        await sequelize.query(
          `UPDATE enrollments SET course_id = ${newId} WHERE course_id = ${oldId}`
        );
        
        await sequelize.query(
          `UPDATE lessons SET course_id = ${newId} WHERE course_id = ${oldId}`
        );
        
        await sequelize.query(
          `UPDATE course_problems SET course_id = ${newId} WHERE course_id = ${oldId}`
        );
        
        // Update primary key last
        await sequelize.query(
          `UPDATE courses SET id = ${newId} WHERE id = ${oldId}`
        );
        
        console.log(`✓ Successfully reordered course ${oldId} to ${newId}`);
      }
    } else {
      console.log('No ID reordering needed - IDs are already sequential');
    }
    
    // Reset AUTO_INCREMENT
    const maxId = remainingCourses.length;
    await sequelize.query(
      `ALTER TABLE courses AUTO_INCREMENT = ${maxId + 1}`
    );
    console.log(`Reset AUTO_INCREMENT to ${maxId + 1}`);
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Course IDs reordered successfully!');
    
    // Verify
    const verifyCourses = await Course.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'title']
    });
    console.log('\nCurrent courses:');
    verifyCourses.forEach(c => {
      console.log(`  ID ${c.id}: ${c.title}`);
    });
    
  } catch (error) {
    console.error('Error reordering course IDs:', error);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

reorderCourseIds();

