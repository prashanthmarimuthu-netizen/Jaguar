'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Problem } from '@/lib/types';

export default function AdminProblemsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  
  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    constraints: '',
    sample_input: '',
    sample_output: ''
  });

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchProblems();
  }, [user]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      // Admin should fetch from admin endpoint to see all problems including DRAFT
      const response = await api.get('/admin/problems');
      setProblems(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch problems:', error);
      // Fallback to public endpoint if admin endpoint fails
      try {
        const fallbackResponse = await api.get('/problems');
        setProblems(fallbackResponse.data.data || []);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        setProblems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (problemId: number) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await api.delete(`/admin/problems/${problemId}`);
      fetchProblems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete problem');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/admin/problems', formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        difficulty: 'EASY',
        constraints: '',
        sample_input: '',
        sample_output: ''
      });
      fetchProblems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create problem');
    }
  };

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title || '',
      description: problem.description || '',
      difficulty: problem.difficulty || 'EASY',
      constraints: problem.constraints || '',
      sample_input: problem.sample_input || '',
      sample_output: problem.sample_output || ''
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    
    try {
      await api.put(`/admin/problems/${editingProblem.id}`, formData);
      setShowCreateModal(false);
      setEditingProblem(null);
      setFormData({
        title: '',
        description: '',
        difficulty: 'EASY',
        constraints: '',
        sample_input: '',
        sample_output: ''
      });
      fetchProblems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update problem');
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
              Manage Problems
            </h1>
            <div className="flex gap-4">
              <a href="/admin" className="text-indigo-600 hover:text-indigo-800">← Back</a>
              <button
                onClick={() => {
                  setEditingProblem(null);
                  setFormData({
                    title: '',
                    description: '',
                    difficulty: 'EASY',
                    constraints: '',
                    sample_input: '',
                    sample_output: ''
                  });
                  setShowCreateModal(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Create Problem
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading problems...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Difficulty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{p.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          p.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                          p.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-indigo-600 hover:text-indigo-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
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
                  {editingProblem ? 'Edit Problem' : 'Create Problem'}
                </h2>
                <form onSubmit={editingProblem ? handleUpdate : handleCreate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
                      <textarea
                        name="constraints"
                        value={formData.constraints}
                        onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sample Input</label>
                      <textarea
                        name="sample_input"
                        value={formData.sample_input}
                        onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sample Output</label>
                      <textarea
                        name="sample_output"
                        value={formData.sample_output}
                        onChange={(e) => setFormData({ ...formData, sample_output: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      {editingProblem ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProblem(null);
                        setFormData({
                          title: '',
                          description: '',
                          difficulty: 'EASY',
                          constraints: '',
                          sample_input: '',
                          sample_output: ''
                        });
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

