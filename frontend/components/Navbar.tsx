'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-white rounded-lg p-2 transform group-hover:rotate-12 transition">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">EmbeddedPro</span>
          </Link>

          {/* Navigation Links - Right Side */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                  : 'text-white hover:bg-white/20 hover:shadow-md'
              }`}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/courses')
                  ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                  : 'text-white hover:bg-white/20 hover:shadow-md'
              }`}
            >
              Courses
            </Link>
            <Link
              href="/problems"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive('/problems')
                  ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                  : 'text-white hover:bg-white/20 hover:shadow-md'
              }`}
            >
              Problems
            </Link>

            {isAuthenticated && (
              <>
                {user?.role !== 'ADMIN' && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive('/dashboard')
                          ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                          : 'text-white hover:bg-white/20 hover:shadow-md'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/submissions"
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive('/submissions')
                          ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                          : 'text-white hover:bg-white/20 hover:shadow-md'
                      }`}
                    >
                      Submissions
                    </Link>
                  </>
                )}
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-white text-indigo-600 shadow-lg transform scale-105'
                        : 'text-white hover:bg-white/20 hover:shadow-md'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white">
                    <div className="text-xs font-medium">{user?.name}</div>
                    <div className="text-xs opacity-75">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
