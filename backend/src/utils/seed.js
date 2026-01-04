// Seed script to add sample problems
// Run with: node src/utils/seed.js

import sequelize from '../config/database.js';
import { Problem, TestCase } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProblems = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'EASY',
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
    sample_input: 'nums = [2,7,11,15], target = 9',
    sample_output: '[0,1]',
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        expected_output: '[0,1]',
        is_hidden: false
      },
      {
        input: '[3,2,4]\n6',
        expected_output: '[1,2]',
        is_hidden: true
      },
      {
        input: '[3,3]\n6',
        expected_output: '[0,1]',
        is_hidden: true
      }
    ]
  },
  {
    title: 'Reverse String',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'EASY',
    constraints: `1 <= s.length <= 10^5
s[i] is a printable ascii character.`,
    sample_input: 's = ["h","e","l","l","o"]',
    sample_output: '["o","l","l","e","h"]',
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expected_output: '["o","l","l","e","h"]',
        is_hidden: false
      },
      {
        input: '["H","a","n","n","a","h"]',
        expected_output: '["h","a","n","n","a","H"]',
        is_hidden: true
      }
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string s, find the length of the longest substring without repeating characters.`,
    difficulty: 'MEDIUM',
    constraints: `0 <= s.length <= 5 * 10^4
s consists of English letters, digits, symbols and spaces.`,
    sample_input: 's = "abcabcbb"',
    sample_output: '3',
    testCases: [
      {
        input: '"abcabcbb"',
        expected_output: '3',
        is_hidden: false
      },
      {
        input: '"bbbbb"',
        expected_output: '1',
        is_hidden: true
      },
      {
        input: '"pwwkew"',
        expected_output: '3',
        is_hidden: true
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

    // Clear existing problems (optional - comment out to keep existing)
    // await Problem.destroy({ where: {} });
    // await TestCase.destroy({ where: {} });

    // Add sample problems
    for (const problemData of sampleProblems) {
      const { testCases, ...problemFields } = problemData;
      const problem = await Problem.create(problemFields);
      console.log(`Created problem: ${problem.title}`);

      // Add test cases
      for (const testCaseData of testCases) {
        await TestCase.create({
          ...testCaseData,
          problem_id: problem.id
        });
      }
      console.log(`  Added ${testCases.length} test cases`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

