'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  role: string;
  solved_count: number;
}

interface ProblemStat {
  id: number;
  title: string;
  difficulty: string;
  totalSubmissions: number;
  acceptedSubmissions: number;
  successRate: string;
}

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
    fetchProblemStats();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/leaderboard', {
        params: { timeframe, limit: 100 }
      });
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemStats = async () => {
    try {
      const response = await api.get('/admin/analytics/problems');
      setProblemStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch problem stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Leaderboard & Analytics</h1>

      {/* Leaderboard Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
          >
            <option value="all">All Time</option>
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Problems Solved</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{entry.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {entry.solved_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Problem Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Problem Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Problem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Accepted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Success Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problemStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{stat.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      stat.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      stat.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stat.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.totalSubmissions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{stat.acceptedSubmissions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{stat.successRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

