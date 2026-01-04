'use client';

import { Problem } from '@/lib/types';

interface ProblemDescriptionProps {
  problem: Problem;
}

export default function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const difficultyColors = {
    EASY: 'text-green-500',
    MEDIUM: 'text-yellow-500',
    HARD: 'text-red-500',
  };

  const difficultyBadges = {
    EASY: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HARD: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-white">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{problem.title}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-4 py-1.5 rounded-full font-bold text-sm border-2 ${difficultyBadges[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          {problem.category && problem.category !== 'OTHER' && (
            <span className="px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 border-2 border-purple-300 font-semibold text-sm">
              {problem.category.replace(/_/g, ' ')}
            </span>
          )}
          {problem.is_free ? (
            <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 border-2 border-green-300 font-semibold text-sm">
              Free
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 border-2 border-orange-300 font-semibold text-sm">
              Paid
            </span>
          )}
        </div>
        {problem.short_description && (
          <p className="mt-4 text-lg text-gray-600 italic">{problem.short_description}</p>
        )}
      </div>

      <div className="prose max-w-none mb-6">
        <div className="whitespace-pre-wrap text-gray-700">{problem.description}</div>
      </div>

      {problem.input_format && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Input Format
          </h2>
          <div className="bg-white p-4 rounded-lg border border-blue-200 whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {problem.input_format}
          </div>
        </div>
      )}

      {problem.output_format && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Output Format
          </h2>
          <div className="bg-white p-4 rounded-lg border border-green-200 whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {problem.output_format}
          </div>
        </div>
      )}

      {problem.constraints && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Constraints
          </h2>
          <div className="bg-white p-4 rounded-lg border border-yellow-200 whitespace-pre-wrap text-sm text-gray-700 font-mono">
            {problem.constraints}
          </div>
        </div>
      )}

      {problem.sample_input && problem.sample_output && (
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500">
          <h2 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Sample Input/Output
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Input:
              </h3>
              <pre className="bg-white p-4 rounded-lg border-2 border-blue-200 text-sm whitespace-pre-wrap font-mono text-gray-800 shadow-sm">
                {problem.sample_input}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Output:
              </h3>
              <pre className="bg-white p-4 rounded-lg border-2 border-green-200 text-sm whitespace-pre-wrap font-mono text-gray-800 shadow-sm">
                {problem.sample_output}
              </pre>
            </div>
            {problem.sample_explanation && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-semibold mb-2 text-indigo-800">Explanation:</h3>
                <p className="text-sm text-indigo-700">{problem.sample_explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {problem.testCases && problem.testCases.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
          <div className="space-y-4">
            {problem.testCases.map((testCase, idx) => (
              <div key={testCase.id} className="border border-gray-300 rounded p-4">
                <h3 className="font-semibold mb-2">Test Case {idx + 1}</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Input:</span>
                    <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <span className="font-semibold">Expected Output:</span>
                    <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
                      {testCase.expected_output}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

