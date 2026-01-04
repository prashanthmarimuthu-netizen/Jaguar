'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Submission, Enrollment } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    wrongAnswer: 0,
    error: 0,
  });

  useEffect(() => {
    if (user) {
      fetchSubmissions();
      fetchEnrollments();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const response = await api.get(`/submissions/user/${user.id}`);
      const data: Submission[] = response.data.data;
      setSubmissions(data);

      // Calculate stats
      const accepted = data.filter((s) => s.status === 'ACCEPTED').length;
      const wrongAnswer = data.filter((s) => s.status === 'WRONG_ANSWER').length;
      const error = data.filter((s) => s.status === 'ERROR' || s.status === 'RUNTIME_ERROR').length;
      
      setStats({
        total: data.length,
        accepted,
        wrongAnswer,
        error,
      });
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('/courses/user/enrollments');
      const data: Enrollment[] = response.data.data;
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique solved problems
  const solvedProblems = new Set(
    submissions.filter((s) => s.status === 'ACCEPTED').map((s) => s.problem_id)
  );

  // Get completed courses (progress = 100%)
  const completedCourses = enrollments.filter((e) => e.progress >= 100 || e.completed);
  const inProgressCourses = enrollments.filter((e) => e.progress < 100 && !e.completed);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="text-center py-12">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-gray-600">Total Submissions</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-gray-600">Accepted</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-yellow-600">{stats.wrongAnswer}</div>
                <div className="text-gray-600">Wrong Answer</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-blue-600">{solvedProblems.size}</div>
                <div className="text-gray-600">Problems Solved</div>
              </div>
            </div>

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Completed Courses</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedCourses.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/courses/${enrollment.course_id}`}
                      className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{enrollment.course?.title || 'Course'}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                          ✓ Completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">100% Complete</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Courses */}
            {inProgressCourses.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Courses In Progress</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgressCourses.map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      href={`/courses/${enrollment.course_id}`}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{enrollment.course?.title || 'Course'}</h3>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                          In Progress
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{enrollment.progress}% Complete</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
              {submissions.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No submissions yet. <Link href="/problems" className="text-blue-600 hover:underline">Start solving!</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <Link
                          href={`/problems/${submission.problem_id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {submission.problem?.title || `Problem ${submission.problem_id}`}
                        </Link>
                        <span className="text-sm text-gray-500 ml-2">{submission.language}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          submission.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {submission.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                  {submissions.length > 5 && (
                    <Link
                      href="/submissions"
                      className="block text-center text-blue-600 hover:underline mt-4"
                    >
                      View all submissions →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

