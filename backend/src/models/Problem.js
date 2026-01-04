import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  short_description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Short description (1-2 lines)'
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'Full problem statement (rich text)'
  },
  difficulty: {
    type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('DSA', 'EMBEDDED_C', 'COMMUNICATION_PROTOCOLS', 'FREERTOS', 'OTHER'),
    allowNull: true,
    defaultValue: 'OTHER'
  },
  topics: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of topic tags (e.g., ["Pointers", "CAN", "FreeRTOS"])'
  },
  input_format: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Input format description'
  },
  output_format: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Output format description'
  },
  constraints: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Constraints (range, limits, memory/time)'
  },
  assumptions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Assumptions if any'
  },
  sample_input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sample_output: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sample_explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Explanation for sample cases'
  },
  supported_languages: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '["c", "cpp", "python"]',
    comment: 'JSON array of supported languages'
  },
  time_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1000,
    comment: 'Time limit in milliseconds'
  },
  memory_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 256,
    comment: 'Memory limit in MB'
  },
  reference_solution: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'Reference solution (admin-only)'
  },
  editorial: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'Editorial explanation (unlock after solve)'
  },
  code_templates: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'JSON object with language-wise code templates'
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'DISABLED'),
    defaultValue: 'DRAFT',
    allowNull: false
  },
  is_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'True for free problems, false for paid course problems'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'problems',
  timestamps: false
});

export default Problem;

