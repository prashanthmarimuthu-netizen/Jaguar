'use client';

export default function AdminContests() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contests & Timed Challenges</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Feature Coming Soon</h3>
            <p className="text-sm text-yellow-700">
              Contest management is planned for future implementation. This will include creating timed challenges,
              assigning problems to contests, tracking submissions during contests, and generating contest-specific leaderboards.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Planned Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Create / edit / delete contests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Assign problems to contests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Set time windows for contests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Track submissions during contests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Generate contest-specific leaderboards</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

