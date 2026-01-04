import axios from 'axios';

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Map our language names to Piston API language names
const LANGUAGE_MAP = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  c: 'c'
};

const PISTON_VERSION_MAP = {
  python: '3.10.0',
  javascript: '18.15.0',
  java: '15.0.2',
  cpp: '10.2.0',
  c: '10.2.0'
};

export const executeCode = async (code, language, stdin = '') => {
  try {
    const pistonLanguage = LANGUAGE_MAP[language.toLowerCase()];
    if (!pistonLanguage) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const version = PISTON_VERSION_MAP[pistonLanguage];

    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: pistonLanguage,
      version: version,
      files: [
        {
          content: code
        }
      ],
      stdin: stdin
    }, {
      timeout: 10000 // 10 second timeout
    });

    return {
      success: true,
      output: response.data.run.stdout || '',
      stderr: response.data.run.stderr || '',
      executionTime: response.data.run.time || 0
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        output: '',
        stderr: error.response.data?.message || 'Execution error',
        executionTime: 0
      };
    }
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        output: '',
        stderr: 'Execution timeout',
        executionTime: 0
      };
    }
    return {
      success: false,
      output: '',
      stderr: error.message || 'Unknown error occurred',
      executionTime: 0
    };
  }
};

