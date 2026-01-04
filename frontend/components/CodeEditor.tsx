'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RunCodeResponse } from '@/lib/types';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  language: string;
  code: string;
  onChange: (value: string | undefined) => void;
  onLanguageChange?: (language: string) => void;
  onRun?: () => void;
  onSubmit?: () => void;
  output?: string;
  stderr?: string;
  isRunning?: boolean;
  isSubmitting?: boolean;
}

export default function CodeEditor({
  language,
  code,
  onChange,
  onLanguageChange,
  onRun,
  onSubmit,
  output,
  stderr,
  isRunning,
  isSubmitting,
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);

  // Update local code when prop changes (language change)
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleEditorChange = (value: string | undefined) => {
    setLocalCode(value || '');
    onChange(value);
  };

  const languageMap: { [key: string]: string } = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };

  const languageIcons: { [key: string]: string } = {
    python: '🐍',
    javascript: '🟨',
    java: '☕',
    cpp: '⚙️',
    c: '🔧',
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2 border border-gray-600 shadow-md">
            <span className="text-lg">{languageIcons[language] || '💻'}</span>
            <select
              value={language}
              onChange={(e) => {
                if (onLanguageChange) {
                  onLanguageChange(e.target.value);
                }
              }}
              className="bg-gray-700 text-white font-semibold border-none outline-none cursor-pointer text-sm appearance-none pr-8 focus:ring-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                paddingRight: '2rem'
              }}
            >
              <option value="python" className="bg-gray-800 text-white">Python</option>
              <option value="javascript" className="bg-gray-800 text-white">JavaScript</option>
              <option value="java" className="bg-gray-800 text-white">Java</option>
              <option value="cpp" className="bg-gray-800 text-white">C++</option>
              <option value="c" className="bg-gray-800 text-white">C</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </>
            )}
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit
              </>
            )}
          </button>
        </div>
      </div>
      {/* Editor */}
      <div className="flex-1 min-h-0 relative">
        <MonacoEditor
          height="100%"
          language={languageMap[language] || 'python'}
          value={localCode}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}

