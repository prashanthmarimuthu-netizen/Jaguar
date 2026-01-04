import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CourseProblem = sequelize.define('CourseProblem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'problems',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'course_problems',
  timestamps: false
});

export default CourseProblem;

