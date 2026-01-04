import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    comment: 'Progress percentage (0-100)'
  },
  last_lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    },
    comment: 'Last completed lesson ID'
  },
  current_lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    },
    comment: 'Current lesson ID (next to complete)'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'enrollments',
  timestamps: false
});

export default Enrollment;

