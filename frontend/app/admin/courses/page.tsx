'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Course } from '@/lib/types';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await api.delete(`/admin/courses/${courseId}`);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await api.post('/admin/courses', {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        duration: formData.get('duration'),
        image_url: formData.get('image_url'),
        status: formData.get('status') || 'DRAFT'
      });
      setShowCreateModal(false);
      fetchCourses();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowCreateModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await api.put(`/admin/courses/${editingCourse.id}`, {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        duration: formData.get('duration'),
        image_url: formData.get('image_url'),
        status: formData.get('status') || 'DRAFT'
      });
      setShowCreateModal(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update course');
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Manage Courses
            </h1>
            <div className="flex gap-4">
              <a href="/admin" className="text-indigo-600 hover:text-indigo-800">← Back</a>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setShowCreateModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Create Course
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading courses...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{c.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          c.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                          c.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {c.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.duration || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/courses/${c.id}`}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          Manage
                        </Link>
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-indigo-600 hover:text-indigo-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">
                  {editingCourse ? 'Edit Course' : 'Create Course'}
                </h2>
                <form onSubmit={editingCourse ? handleUpdate : handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingCourse?.title}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        defaultValue={editingCourse?.description}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        name="level"
                        defaultValue={editingCourse?.level}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        defaultValue={editingCourse?.duration || ''}
                        placeholder="e.g., 4 weeks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input
                        type="url"
                        name="image_url"
                        defaultValue={editingCourse?.image_url || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        defaultValue={editingCourse?.status || 'DRAFT'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      {editingCourse ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingCourse(null);
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
      </div>
    </ProtectedRoute>
  );
}

