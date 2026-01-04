import sequelize from '../config/database.js';
import { Problem, TestCase, Submission, CourseProblem } from '../models/index.js';

async function reorderProblemIds() {
  try {
    console.log('Starting problem ID reordering...');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const remainingProblems = await Problem.findAll({
      order: [['id', 'ASC']],
      attributes: ['id']
    });
    
    console.log(`Found ${remainingProblems.length} problems`);
    
    if (remainingProblems.length === 0) {
      console.log('No problems to reorder');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      return;
    }
    
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
        );
        
        await sequelize.query(
          `UPDATE submissions SET problem_id = ${newId} WHERE problem_id = ${oldId}`
        );
        
        await sequelize.query(
          `UPDATE course_problems SET problem_id = ${newId} WHERE problem_id = ${oldId}`
        );
        
        // Update primary key last
        await sequelize.query(
          `UPDATE problems SET id = ${newId} WHERE id = ${oldId}`
        );
        
        console.log(`✓ Successfully reordered problem ${oldId} to ${newId}`);
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
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Problem IDs reordered successfully!');
    
    // Verify
    const verifyProblems = await Problem.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'title']
    });
    console.log('\nCurrent problems:');
    verifyProblems.forEach(p => {
      console.log(`  ID ${p.id}: ${p.title}`);
    });
    
  } catch (error) {
    console.error('Error reordering problem IDs:', error);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

reorderProblemIds();

