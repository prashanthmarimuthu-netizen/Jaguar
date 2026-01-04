'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProblemDescription from '@/components/ProblemDescription';
import CodeEditor from '@/components/CodeEditor';
import Notification from '@/components/Notification';
import api from '@/lib/api';
import { Problem, RunCodeResponse, SubmitCodeResponse } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState<string | undefined>(undefined);
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

  const defaultCode: { [key: string]: string } = {
    python: `print("Hello, World!")`,
    javascript: `console.log("Hello, World!");`,
    java: `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  };

  // Load code from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem(`problem_${problemId}_code`);
    const savedLanguage = localStorage.getItem(`problem_${problemId}_language`);
    if (savedCode) {
      setCode(savedCode);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, [problemId]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (code && problemId) {
      localStorage.setItem(`problem_${problemId}_code`, code);
    }
  }, [code, problemId]);

  // Save language to localStorage
  useEffect(() => {
    if (language && problemId) {
      localStorage.setItem(`problem_${problemId}_language`, language);
    }
  }, [language, problemId]);

  useEffect(() => {
    // Reset state and fetch when problemId changes
    setProblem(null);
    setOutput(undefined);
    setStderr('');
    setSubmitResult(null);
    setLoading(true);
    fetchProblem();
  }, [problemId]);

  // Refresh when page becomes visible (handles back/forward navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && problemId) {
        fetchProblem();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [problemId]);

  useEffect(() => {
    // Set default code when language changes - but only if no saved code exists
    const savedCode = localStorage.getItem(`problem_${problemId}_code`);
    if (!savedCode) {
      if (problem && problem.code_templates && typeof problem.code_templates === 'object') {
        const template = problem.code_templates[language] || problem.code_templates['python'] || '';
        setCode(template || defaultCode[language] || '');
      } else {
        setCode(defaultCode[language] || '');
      }
    }
    setOutput(undefined);
    setStderr('');
    setSubmitResult(null);
  }, [language, problem, problemId]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/problems/${problemId}`);
      if (response.data && response.data.data) {
        setProblem(response.data.data);
        // Only set code if no saved code exists
        const savedCode = localStorage.getItem(`problem_${problemId}_code`);
        if (!savedCode) {
          const problemData = response.data.data;
          if (problemData.code_templates && typeof problemData.code_templates === 'object') {
            const template = problemData.code_templates[language] || problemData.code_templates['python'] || '';
            setCode(template || defaultCode[language] || '');
          } else {
            setCode(defaultCode[language] || '');
          }
        }
      } else {
        throw new Error('Problem not found');
      }
    } catch (error: any) {
      console.error('Failed to fetch problem:', error);
      let errorMessage = 'Failed to load problem. Please try again.';
      let errorType: 'error' | 'warning' = 'error';
      
      if (error.response) {
        // Backend returned an error response
        if (error.response.status === 401) {
          errorMessage = 'You must be logged in to view this problem.';
          errorType = 'warning';
          // Show notification immediately
          setNotification({ message: errorMessage, type: errorType });
          // Auto-redirect after showing notification
          setTimeout(() => {
            router.push('/login?redirect=' + encodeURIComponent(`/problems/${problemId}`));
          }, 2000);
          setLoading(false);
          return;
        } else if (error.response.status === 403) {
          errorMessage = error.response.data?.message || 'You do not have access to this problem.';
        } else if (error.response.status === 404) {
          errorMessage = 'Problem not found or has been deleted.';
          setNotification({ message: errorMessage, type: 'error' });
          setTimeout(() => {
            router.push('/problems');
          }, 2000);
          setLoading(false);
          return;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        // Network error or other error
        if (error.message.includes('Cannot connect')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setNotification({ message: errorMessage, type: errorType });
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        setTimeout(() => {
          router.push('/problems');
        }, 2000);
      }
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput(undefined);
    setStderr('');
    setSubmitResult(null);

    try {
      // Use sample input if available
      const stdin = problem.sample_input || '';
      const response = await api.post<{ status: string; data: RunCodeResponse }>(
        '/submissions/run',
        {
          problem_id: parseInt(problemId),
          code,
          language,
          stdin,
        }
      );

      setOutput(response.data.data.output);
      setStderr(response.data.data.stderr || '');
    } catch (error: any) {
      setStderr(error.response?.data?.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    setOutput(undefined);
    setStderr('');
    setSubmitResult(null);

    try {
      const response = await api.post<{ status: string; data: SubmitCodeResponse }>(
        '/submissions/submit',
        {
          problem_id: parseInt(problemId),
          code,
          language,
        }
      );

      const { status } = response.data.data.submission;
      setSubmitResult(status);
      
      // Test case checking is disabled - always show accepted
      setOutput('Submission successful! ✓');
    } catch (error: any) {
      setStderr(error.response?.data?.message || 'Failed to submit code');
      setSubmitResult('ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
      <ProtectedRoute>
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100">
        {loading ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <div className="text-xl text-gray-600">Loading problem...</div>
            </div>
          </div>
        ) : !problem ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center">
              <div className="text-2xl text-red-600 font-bold mb-2">Problem not found</div>
              <button
                onClick={() => router.push('/problems')}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Problems
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
            {/* Problem Description Panel */}
          <div className="w-full lg:w-1/2 border-r border-gray-200 bg-white overflow-hidden flex flex-col shadow-xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Problem Statement</h2>
                <button
                  onClick={() => router.push('/problems')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProblemDescription problem={problem} />
            </div>
          </div>

          {/* Code Editor Panel */}
          <div className="w-full lg:w-1/2 bg-gray-900 flex flex-col shadow-2xl">
            {/* Editor Section - 60% */}
            <div className="flex-[0.6] flex flex-col min-h-0 border-b border-gray-700">
              <CodeEditor
                language={language}
                code={code}
                onChange={setCode}
                onLanguageChange={setLanguage}
                onRun={handleRun}
                onSubmit={handleSubmit}
                isRunning={isRunning}
                isSubmitting={isSubmitting}
              />
            </div>
            
            {/* Output Section - 40% */}
            <div className="flex-[0.4] bg-gray-800 flex flex-col min-h-0">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Output
                  </h3>
                  {submitResult && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        submitResult === 'ACCEPTED'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                          : 'bg-red-500/20 text-red-400 border border-red-500/50'
                      }`}
                    >
                      {submitResult === 'ACCEPTED' ? '✓ Accepted' : '✗ Failed'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {stderr && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Error
                    </div>
                    <pre className="text-red-300 whitespace-pre-wrap text-sm font-mono">{stderr}</pre>
                  </div>
                )}
                {output !== undefined && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Output
                    </div>
                    <pre className="text-gray-200 whitespace-pre-wrap text-sm font-mono">{output || '(no output)'}</pre>
                  </div>
                )}
                {!output && !stderr && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">Run your code to see output here</p>
                    <p className="text-sm mt-2">Click the "Run" button to execute your code</p>
                  </div>
                )}
              </div>
              {submitResult && (
                <div
                  className={`p-4 border-t ${
                    submitResult === 'ACCEPTED'
                      ? 'bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 border-green-600'
                      : 'bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 border-red-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      submitResult === 'ACCEPTED' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {submitResult === 'ACCEPTED' ? (
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {submitResult === 'ACCEPTED' ? 'Accepted!' : 'Submission Failed'}
                      </div>
                      <div className="text-sm opacity-80">
                        {submitResult === 'ACCEPTED' 
                          ? 'All test cases passed successfully' 
                          : submitResult.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
        </div>
      </ProtectedRoute>
    </>
  );
}

