import sequelize from '../config/database.js';
import { User, Submission, Enrollment, LessonProgress } from '../models/index.js';
import { Op } from 'sequelize';

async function reorderUserIds() {
  try {
    console.log('Starting user ID reordering...');
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const remainingUsers = await User.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'email']
    });
    
    console.log(`Found ${remainingUsers.length} users`);
    
    if (remainingUsers.length === 0) {
      console.log('No users to reorder');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      return;
    }
    
    const idMap = new Map();
    remainingUsers.forEach((user, index) => {
      const newId = index + 1;
      if (user.id !== newId) {
        idMap.set(user.id, newId);
        console.log(`Will reorder user ID ${user.id} -> ${newId} (${user.name} - ${user.email})`);
      }
    });
    
    if (idMap.size > 0) {
      // Update in reverse order to avoid conflicts
      const sortedIds = Array.from(idMap.entries()).sort((a, b) => b[0] - a[0]);
      for (const [oldId, newId] of sortedIds) {
        console.log(`Reordering user ${oldId} to ${newId}...`);
        
        // Update foreign keys first
        await sequelize.query(
          `UPDATE submissions SET user_id = ${newId} WHERE user_id = ${oldId}`
        );
        
        await sequelize.query(
          `UPDATE enrollments SET user_id = ${newId} WHERE user_id = ${oldId}`
        );
        
        // Update primary key last
        await sequelize.query(
          `UPDATE users SET id = ${newId} WHERE id = ${oldId}`
        );
        
        console.log(`✓ Successfully reordered user ${oldId} to ${newId}`);
      }
    } else {
      console.log('No ID reordering needed - IDs are already sequential');
    }
    
    // Reset AUTO_INCREMENT
    const maxId = remainingUsers.length;
    await sequelize.query(
      `ALTER TABLE users AUTO_INCREMENT = ${maxId + 1}`
    );
    console.log(`Reset AUTO_INCREMENT to ${maxId + 1}`);
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ User IDs reordered successfully!');
    
    // Verify
    const verifyUsers = await User.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'email', 'role']
    });
    console.log('\nCurrent users:');
    verifyUsers.forEach(u => {
      console.log(`  ID ${u.id}: ${u.name} (${u.email}) - ${u.role}`);
    });
    
  } catch (error) {
    console.error('Error reordering user IDs:', error);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

reorderUserIds();

