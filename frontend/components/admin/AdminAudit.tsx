'use client';

import { useState } from 'react';

export default function AdminAudit() {
  const [auditLogs] = useState([
    { id: 1, action: 'User Login', user: 'admin@example.com', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
    { id: 2, action: 'Problem Created', user: 'admin@example.com', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Security & Audit</h1>

      {/* Activity Logs */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Activity Logs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.user}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{log.ip}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Security Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span>JWT-based authentication</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span>Password hashing with bcrypt</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span>Role-based access control</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span>Rate limiting on API endpoints</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-500">✓</span>
              <span>CORS protection</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Planned Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Comprehensive audit logging</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Suspicious behavior monitoring</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Plagiarism detection</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Backup and restore functionality</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Password policy management</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

