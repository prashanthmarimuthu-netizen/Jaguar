'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Course, Lesson, Problem } from '@/lib/types';
import RichTextEditor from '@/components/RichTextEditor';

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonContent, setLessonContent] = useState<string>('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, allProblemsRes] = await Promise.all([
        api.get(`/admin/courses/${courseId}`),
        api.get(`/admin/courses/${courseId}/lessons`),
        api.get('/problems').catch(() => ({ data: { data: [] } }))
      ]);
      setCourse(courseRes.data.data);
      setLessons(lessonsRes.data.data);
      // Extract problems from lessons
      const allProblemsInLessons: any[] = [];
      lessonsRes.data.data.forEach((lesson: any) => {
        if (lesson.problems && lesson.problems.length > 0) {
          lesson.problems.forEach((cp: any) => {
            if (cp.problem) {
              allProblemsInLessons.push({
                ...cp.problem,
                lesson_id: lesson.id,
                lesson_title: lesson.title
              });
            }
          });
        }
      });
      setProblems(allProblemsInLessons);
      setAllProblems(allProblemsRes.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 404) {
        router.push('/admin?section=courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const contentInput = document.querySelector('input[name="content"]') as HTMLInputElement;
    const content = contentInput?.value || lessonContent;
    
    try {
      await api.post(`/admin/courses/${courseId}/lessons`, {
        title: formData.get('title'),
        content: content,
        position: formData.get('position') ? parseInt(formData.get('position') as string) : undefined
      });
      setShowLessonModal(false);
      setLessonContent('');
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const contentInput = document.querySelector('input[name="content"]') as HTMLInputElement;
    const content = contentInput?.value || lessonContent || editingLesson.content;
    
    try {
      await api.put(`/admin/lessons/${editingLesson.id}`, {
        title: formData.get('title'),
        content: content,
        position: formData.get('position') ? parseInt(formData.get('position') as string) : undefined
      });
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonContent('');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonContent(lesson.content);
    setShowLessonModal(true);
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) {
      alert('Please select a lesson');
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    const problemId = parseInt(formData.get('problem_id') as string);
    
    try {
      await api.post(`/admin/lessons/${selectedLessonId}/problems`, {
        problem_id: problemId
      });
      setShowProblemModal(false);
      setSelectedLessonId(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add problem');
    }
  };

  const handleRemoveProblem = async (lessonId: number, problemId: number) => {
    if (!confirm('Are you sure you want to remove this problem from the lesson?')) return;
    
    try {
      await api.delete(`/admin/lessons/${lessonId}/problems/${problemId}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove problem');
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-500">Course not found</p>
            <Link href="/admin?section=courses" className="mt-4 text-indigo-600 hover:underline">Back to Courses</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin?section=courses" className="text-indigo-600 hover:text-indigo-700 font-semibold mb-4 inline-block">
              ← Back to Courses
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.title}</h1>
            <p className="text-gray-600">Manage lessons and problems for this course</p>
          </div>

          {/* Lessons Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Lessons</h2>
              <button
                onClick={() => {
                  setEditingLesson(null);
                  setLessonContent('');
                  setShowLessonModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Add Lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson: any, index: number) => (
                <div key={lesson.id} className="border-2 border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-semibold text-gray-500">Lesson {index + 1}</span>
                        <span className="text-sm text-gray-600">Position: {lesson.position}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{lesson.title}</h3>
                      {lesson.problems && lesson.problems.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Problems in this lesson:</p>
                          <div className="space-y-2">
                            {lesson.problems.map((cp: any) => (
                              <div key={cp.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                <span className="text-gray-800">{cp.problem?.title || `Problem ${cp.problem_id}`}</span>
                                <button
                                  onClick={() => handleRemoveProblem(lesson.id, cp.problem_id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setShowProblemModal(true);
                            }}
                            className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                          >
                            + Add Problem
                          </button>
                        </div>
                      )}
                      {(!lesson.problems || lesson.problems.length === 0) && (
                        <button
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setShowProblemModal(true);
                          }}
                          className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                        >
                          + Add Problem to Lesson
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setShowLessonModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <p className="text-gray-500 text-center py-8">No lessons yet. Add your first lesson!</p>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Modal */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
              </h2>
              <form onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingLesson?.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <RichTextEditor
                      content={lessonContent}
                      onChange={(value) => {
                        setLessonContent(value);
                        // Also update hidden input for form submission
                        const hiddenInput = document.querySelector('input[name="content"]') as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = value;
                        }
                      }}
                      placeholder="Write your lesson content here..."
                    />
                    <input type="hidden" name="content" value={lessonContent} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position (optional)</label>
                    <input
                      type="number"
                      name="position"
                      defaultValue={editingLesson?.position}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    {editingLesson ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLessonModal(false);
                      setEditingLesson(null);
                      setLessonContent('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Problem Modal */}
        {showProblemModal && selectedLessonId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add Problem to Lesson</h2>
              <form onSubmit={handleAddProblem}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Problem</label>
                    <select
                      name="problem_id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      required
                    >
                      <option value="">-- Select a problem --</option>
                      {allProblems.map((problem) => (
                        <option key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Add Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProblemModal(false);
                      setSelectedLessonId(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

