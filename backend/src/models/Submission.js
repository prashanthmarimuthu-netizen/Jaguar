import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Submission = sequelize.define('Submission', {
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
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'problems',
      key: 'id'
    }
  },
  code: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACCEPTED', 'WRONG_ANSWER', 'ERROR', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'),
    allowNull: false
  },
  execution_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Execution time in milliseconds'
  },
  memory_usage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Memory usage in MB'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Error message if submission failed'
  },
  test_cases_passed: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of test cases passed'
  },
  total_test_cases: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total number of test cases'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'submissions',
  timestamps: false
});

export default Submission;

