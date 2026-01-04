'use client';

export default function AdminRoles() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Role Management & Permissions</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Available Roles</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">Student</h3>
                <p className="text-sm text-gray-600">Can solve problems, enroll in courses, view submissions</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Active</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">Institution</h3>
                <p className="text-sm text-gray-600">Same permissions as Student (can be extended for bulk user management)</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">Active</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">Admin</h3>
                <p className="text-sm text-gray-600">Full access to all platform features, user management, and analytics</p>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Role Permissions Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Feature</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Institution</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Admin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Solve Problems</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Enroll in Courses</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center">✅</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Manage Users</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Manage Problems</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">Manage Courses</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-700">View Analytics</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">❌</td>
                <td className="px-6 py-4 text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

