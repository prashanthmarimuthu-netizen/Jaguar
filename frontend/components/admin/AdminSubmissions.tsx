'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Submission } from '@/lib/types';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_id: '',
    problem_id: '',
    status: 'all',
    language: 'all'
  });
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.problem_id) params.problem_id = filters.problem_id;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.language !== 'all') params.language = filters.language;

      const response = await api.get('/admin/submissions', { params });
      setSubmissions(response.data.data.submissions || response.data.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (submission: Submission) => {
    try {
      const response = await api.get(`/admin/submissions/${submission.id}`);
      setSelectedSubmission(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch submission details:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Submission Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="number"
              placeholder="Filter by user..."
              value={filters.user_id}
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem ID</label>
            <input
              type="number"
              placeholder="Filter by problem..."
              value={filters.problem_id}
              onChange={(e) => setFilters({ ...filters, problem_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="ERROR">Error</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="all">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading submissions...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(s as any).user?.name || `User ${s.user_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {s.problem?.title || `Problem ${s.problem_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{s.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      s.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {s.execution_time ? `${s.execution_time}ms` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewDetails(s)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Submission Details</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-gray-900">{(selectedSubmission as any).user?.name || `User ${selectedSubmission.user_id}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Problem</label>
                  <p className="mt-1 text-gray-900">{selectedSubmission.problem?.title || `Problem ${selectedSubmission.problem_id}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <p className="mt-1 text-gray-900 font-mono">{selectedSubmission.language}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedSubmission.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSubmission.status.replace(/_/g, ' ')}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                  {selectedSubmission.code}
                </pre>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedSubmission(null);
              }}
              className="mt-6 w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

