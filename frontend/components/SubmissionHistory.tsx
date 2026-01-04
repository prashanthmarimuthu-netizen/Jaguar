'use client';

import { Submission } from '@/lib/types';
import Link from 'next/link';

interface SubmissionHistoryProps {
  submissions: Submission[];
}

export default function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  const statusColors: { [key: string]: string } = {
    ACCEPTED: 'bg-green-100 text-green-800',
    WRONG_ANSWER: 'bg-red-100 text-red-800',
    ERROR: 'bg-red-100 text-red-800',
    TIME_LIMIT_EXCEEDED: 'bg-yellow-100 text-yellow-800',
    RUNTIME_ERROR: 'bg-red-100 text-red-800',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No submissions yet. Start solving problems!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Problem</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Language</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Execution Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Submitted At</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {submission.problem ? (
                  <Link
                    href={`/problems/${submission.problem.id}`}
                    className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                  >
                    {submission.problem.title}
                  </Link>
                ) : (
                  <span className="text-gray-500">Problem {submission.problem_id}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{submission.language}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[submission.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {submission.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {submission.execution_time !== undefined
                  ? `${submission.execution_time}ms`
                  : <span className="text-gray-400">N/A</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(submission.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

