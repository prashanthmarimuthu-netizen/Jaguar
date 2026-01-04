'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Lesson } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [courseId, lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
      setLesson(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch lesson:', error);
      if (error.response?.status === 403) {
        alert('You must be enrolled in this course to view lessons');
        router.push(`/courses/${courseId}`);
      } else if (error.response?.status === 404) {
        router.push(`/courses/${courseId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await api.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
      await fetchLesson(); // Refresh lesson data
      // Optionally redirect to next lesson or course page
    } catch (error: any) {
      console.error('Failed to mark lesson as complete:', error);
      alert('Failed to mark lesson as complete: ' + (error.response?.data?.message || error.message));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500">Lesson not found</p>
          <Link href={`/courses/${courseId}`} className="mt-4 text-indigo-600 hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link
                href={`/courses/${courseId}`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center"
              >
                ← Back to Course
              </Link>
              {lesson.is_completed && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✓ Completed
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{lesson.title}</h1>
          </div>

              {/* Content */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div
                  className="prose max-w-none text-gray-900"
                  style={{ color: '#111827' }}
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </div>

          {/* Problems */}
          {lesson.problems && lesson.problems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Practice Problems</h2>
              <div className="space-y-4">
                {lesson.problems.map((problem) => {
                  const difficultyColors = {
                    EASY: 'bg-green-100 text-green-800 border-green-300',
                    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    HARD: 'bg-red-100 text-red-800 border-red-300',
                  };
                  const topics = typeof problem.topics === 'string' 
                    ? JSON.parse(problem.topics || '[]') 
                    : (problem.topics || []);

                  return (
                    <div
                      key={problem.id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${difficultyColors[problem.difficulty]}`}>
                              {problem.difficulty}
                            </span>
                            {topics.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {topics.slice(0, 3).map((topic: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{problem.title}</h3>
                        </div>
                        <Link
                          href={`/problems/${problem.id}?course=${courseId}&lesson=${lessonId}`}
                          className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Solve
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Button */}
          {!lesson.is_completed && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <button
                onClick={handleComplete}
                disabled={completing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? 'Marking as Complete...' : 'Mark Lesson as Complete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

