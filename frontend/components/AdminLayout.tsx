'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'User Management', icon: '👥' },
  { id: 'problems', label: 'Problem Management', icon: '📝' },
  { id: 'courses', label: 'Course Management', icon: '📚' },
  { id: 'submissions', label: 'Submission Management', icon: '📤' },
  { id: 'leaderboard', label: 'Leaderboard & Analytics', icon: '🏆' },
  { id: 'roles', label: 'Role Management', icon: '🔐' },
  { id: 'settings', label: 'System Settings', icon: '⚙️' },
  { id: 'contests', label: 'Contests & Challenges', icon: '🏅' },
  { id: 'audit', label: 'Security & Audit', icon: '🔒' },
];

export default function AdminLayout({ children, activeSection = 'dashboard' }: AdminLayoutProps) {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState(activeSection);

  useEffect(() => {
    setSelectedSection(activeSection);
  }, [activeSection]);

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    router.push(`/admin?section=${sectionId}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-full lg:w-64 bg-white shadow-lg h-auto lg:h-screen overflow-y-auto z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 rounded p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    handleSectionChange(item.id);
                    setSidebarOpen(false); // Close mobile sidebar on selection
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedSection === item.id
                      ? 'bg-indigo-100 text-indigo-700 font-semibold border-l-4 border-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 w-full lg:w-auto">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-20 left-4 z-30 bg-indigo-600 text-white p-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="max-w-7xl mx-auto mt-12 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
