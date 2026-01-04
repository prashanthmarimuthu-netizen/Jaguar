'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Problem } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ProblemsPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // solved, unsolved, attempted
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFreeFilter, setIsFreeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [difficultyFilter, statusFilter, categoryFilter, isFreeFilter, sortBy, user]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProblems();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (difficultyFilter !== 'all') {
        params.difficulty = difficultyFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (isFreeFilter !== 'all') {
        params.is_free = isFreeFilter === 'true';
      }
      if (sortBy !== 'recent') {
        params.sort = sortBy;
      }
      if (search) {
        params.search = search;
      }

      const response = await api.get('/problems', { params });
      setProblems(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch problems:', error);
      setProblems([]);
      if (error.response?.status === 401) {
        // User not logged in - this is okay for public problems
        console.log('Not logged in, fetching without auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  const difficultyColors = {
    EASY: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HARD: 'bg-red-100 text-red-800 border-red-300',
  };

  const difficultyIcons = {
    EASY: '✅',
    MEDIUM: '⚠️',
    HARD: '🔥',
  };

  const solveStatusColors = {
    solved: 'bg-green-100 text-green-800',
    attempted: 'bg-yellow-100 text-yellow-800',
    not_started: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            💻 Code. Solve. Excel.
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Coding Challenges
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Practice embedded programming with real-world coding challenges. 
            Sharpen your skills with problems from easy to hard.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-green-600">{problems.filter(p => p.difficulty === 'EASY').length}</div>
            <div className="text-sm text-gray-600 mt-1">Easy</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-yellow-600">{problems.filter(p => p.difficulty === 'MEDIUM').length}</div>
            <div className="text-sm text-gray-600 mt-1">Medium</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-red-600">{problems.filter(p => p.difficulty === 'HARD').length}</div>
            <div className="text-sm text-gray-600 mt-1">Hard</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-indigo-600">{problems.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Search and Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Problems</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 pr-12 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900 bg-white shadow-sm transition-all"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="border-b border-gray-200 mb-6"></div>

              {/* Filters */}
              <div className="space-y-6">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                  <div className="space-y-2">
                    {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setDifficultyFilter(difficulty)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          difficultyFilter === difficulty
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                  <div className="space-y-2">
                    {['all', 'solved', 'attempted', 'unsolved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          statusFilter === status
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <div className="space-y-2">
                    {['all', 'DSA', 'EMBEDDED_C', 'COMMUNICATION_PROTOCOLS', 'FREERTOS', 'OTHER'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          categoryFilter === category
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category === 'all' ? 'All Categories' : category.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free/Paid Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price</label>
                  <div className="space-y-2">
                    {['all', 'true', 'false'].map((price) => (
                      <button
                        key={price}
                        onClick={() => setIsFreeFilter(price)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          isFreeFilter === price
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {price === 'all' ? 'All Prices' : price === 'true' ? 'Free' : 'Paid'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                  <div className="space-y-2">
                    {['recent', 'difficulty', 'alphabetical'].map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          sortBy === sort
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {sort.charAt(0).toUpperCase() + sort.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Problems Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : problems.length === 0 ? (
              <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-700 mb-2">No problems found</p>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((problem, index) => {
                  const tags = problem.topics && (typeof problem.topics === 'string' 
                    ? (() => { try { return JSON.parse(problem.topics); } catch { return []; } })()
                    : (problem.topics || []));
                  
                  return (
                    <Link
                      key={problem.id}
                      href={`/problems/${problem.id}`}
                      className="block bg-white rounded-3xl shadow-2xl p-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100 relative overflow-hidden"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Gradient Accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-3">
                          <h2 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                            {problem.title}
                          </h2>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 shadow-sm flex-shrink-0 ${difficultyColors[problem.difficulty]}`}>
                          <span className="mr-1">{difficultyIcons[problem.difficulty]}</span>
                          {problem.difficulty}
                        </span>
                      </div>
                      
                      {/* Description */}
                      {problem.short_description && (
                        <p className="text-gray-600 line-clamp-2 leading-relaxed mb-4 text-sm">
                          {problem.short_description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200">
                              {tag}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Status & Course Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {problem.solve_status && (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${solveStatusColors[problem.solve_status] || solveStatusColors.not_started}`}>
                            {problem.solve_status === 'solved' ? '✓ Solved' : 
                             problem.solve_status === 'attempted' ? '↻ Attempted' : 
                             '○ Not Started'}
                          </span>
                        )}
                        {problem.course && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                            📚 {problem.course.title}
                          </span>
                        )}
                        {problem.is_free === false && (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
                            💎 Paid
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-indigo-600 font-bold group-hover:text-purple-600 transition-colors">
                          <span>Start Solving</span>
                          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
