'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Course, Lesson } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    // Reset state and fetch when courseId changes
    setCourse(null);
    setLoading(true);
    fetchCourse();
  }, [courseId, user]);

  // Refresh when page becomes visible (handles back/forward navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && courseId) {
        fetchCourse();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${courseId}`);
      if (response.data && response.data.data) {
        setCourse(response.data.data);
      } else {
        throw new Error('Course not found');
      }
    } catch (error: any) {
      console.error('Failed to fetch course:', error);
      if (error.response?.status === 404 || error.message === 'Course not found') {
        alert('Course not found or has been deleted.');
        router.push('/courses');
      } else {
        alert('Failed to load course. Please try again.');
        router.push('/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/courses/${courseId}`));
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/courses/${courseId}/enroll`);
      await fetchCourse(); // Refresh course data
    } catch (error: any) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll: ' + (error.response?.data?.message || error.message));
    } finally {
      setEnrolling(false);
    }
  };

  const levelColors = {
    BEGINNER: 'bg-green-100 text-green-800 border-green-300',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ADVANCED: 'bg-red-100 text-red-800 border-red-300',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-500">Course not found</p>
          <Link href="/courses" className="mt-4 text-indigo-600 hover:underline">Back to Courses</Link>
        </div>
      </div>
    );
  }

  const isEnrolled = course.is_enrolled || false;
  const topics = typeof course.topics === 'string' ? JSON.parse(course.topics || '[]') : (course.topics || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
            {course.image_url ? (
              <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 bg-white/90 ${levelColors[course.level]}`}>
                {course.level}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">{course.title}</h1>
                <div className="flex items-center gap-6 text-gray-600 mb-4">
                  {course.duration && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="font-semibold text-indigo-600 text-xl">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </div>
                  {course.lesson_count !== undefined && (
                    <div>{course.lesson_count} Lessons</div>
                  )}
                  {course.problem_count !== undefined && (
                    <div>{course.problem_count} Problems</div>
                  )}
                </div>
              </div>
            </div>

            {isEnrolled && course.enrollment && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-semibold text-indigo-600">{course.enrollment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${course.enrollment.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!isEnrolled ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Enrollment Required</h3>
                <p className="text-yellow-700 mb-4">
                  You must enroll in this course to access lessons and problems.
                </p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                {course.enrollment?.current_lesson_id ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${course.enrollment.current_lesson_id}`}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Resume Learning
                  </Link>
                ) : (
                  course.lessons && course.lessons.length > 0 && (
                    <Link
                      href={`/courses/${courseId}/lessons/${course.lessons[0].id}`}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Start Course
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">About This Course</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {course.description}
          </div>
        </div>

        {/* Topics */}
        {topics.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Topics Covered</h2>
            <div className="flex flex-wrap gap-3">
              {topics.map((topic: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lessons - Only show if enrolled */}
        {isEnrolled && course.lessons && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Lessons</h2>
            <div className="space-y-4">
              {course.lessons.map((lesson: Lesson, index: number) => (
                <div
                  key={lesson.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-500">Lesson {index + 1}</span>
                        {lesson.is_completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{lesson.title}</h3>
                      {lesson.problems && lesson.problems.length > 0 && (
                        <p className="text-gray-600 text-sm">
                          {lesson.problems.length} problem{lesson.problems.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/courses/${courseId}/lessons/${lesson.id}`}
                      className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      View Lesson
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problems - Only show if enrolled */}
        {isEnrolled && course.problems && course.problems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Practice Problems</h2>
            <div className="space-y-4">
              {course.problems.map((cp: any) => {
                const problem = cp.problem || cp;
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
                        href={`/problems/${problem.id}?course=${courseId}`}
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
      </div>
    </div>
  );
}
