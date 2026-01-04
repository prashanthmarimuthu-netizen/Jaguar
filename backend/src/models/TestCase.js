import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TestCase = sequelize.define('TestCase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  problem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'problems',
      key: 'id'
    }
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expected_output: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explanation for this test case'
  },
  is_hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Hidden test cases are not visible to users'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    field: 'order', // Explicitly set field name
    comment: 'Order of test case (for sample cases)'
  }
}, {
  tableName: 'test_cases',
  timestamps: false
});

export default TestCase;

