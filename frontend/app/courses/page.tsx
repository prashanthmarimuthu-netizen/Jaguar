'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Course } from '@/lib/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, [filter, priceFilter]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCourses();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        params.level = filter;
      }
      if (priceFilter !== 'all') {
        params.price = priceFilter;
      }
      if (search) {
        params.search = search;
      }

      const response = await api.get('/courses', { params });
      setCourses(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      if (error.message && error.message.includes('Cannot connect')) {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const levelColors = {
    BEGINNER: 'bg-green-100 text-green-800 border-green-300',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ADVANCED: 'bg-red-100 text-red-800 border-red-300',
  };

  const levelIcons = {
    BEGINNER: '🌱',
    INTERMEDIATE: '🚀',
    ADVANCED: '⚡',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            🎓 Learn. Practice. Master.
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Embedded Systems Courses
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master embedded programming with our comprehensive course collection. 
            From beginner to advanced, build real-world skills.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-indigo-600">{courses.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Courses</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-purple-600">
              {courses.filter(c => c.price === 0).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Free Courses</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50">
            <div className="text-3xl font-bold text-pink-600">
              {courses.reduce((sum, c) => sum + (c.lesson_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Lessons</div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Search and Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Courses</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="space-y-2">
                    {['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFilter(level)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          filter === level
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level === 'all' ? 'All Levels' : level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price</label>
                  <div className="space-y-2">
                    {['all', 'free', 'paid'].map((price) => (
                      <button
                        key={price}
                        onClick={() => setPriceFilter(price)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          priceFilter === price
                            ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {price === 'all' ? 'All Prices' : price === 'free' ? 'Free' : 'Paid'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Course Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-700 mb-2">No courses found</p>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-3 group border border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Course Image with Overlay */}
                    <div className="relative h-56 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 overflow-hidden">
                      {course.image_url ? (
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                          <div className="text-center">
                            <svg className="w-24 h-24 text-white opacity-80 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <div className="text-white font-bold text-lg">{course.level}</div>
                          </div>
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-sm bg-white/90 ${levelColors[course.level]}`}>
                          {levelIcons[course.level]} {course.level}
                        </span>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-sm ${
                          course.price === 0 
                            ? 'bg-green-500/90 text-white border-green-400' 
                            : 'bg-orange-500/90 text-white border-orange-400'
                        }`}>
                          {course.price === 0 ? '🆓 Free' : `$${course.price}`}
                        </span>
                      </div>

                      {/* Hover Content */}
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                          <div className="flex items-center gap-4 text-sm text-gray-700">
                            {course.lesson_count !== undefined && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="font-semibold">{course.lesson_count} Lessons</span>
                              </div>
                            )}
                            {course.problem_count !== undefined && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-semibold">{course.problem_count} Problems</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 bg-white">
                      <h3 className="text-2xl font-extrabold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mb-5 line-clamp-3 leading-relaxed text-sm">
                        {course.short_description || course.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-5 text-xs text-gray-500">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{course.duration}</span>
                          </div>
                        )}
                        {course.lesson_count !== undefined && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{course.lesson_count} Lessons</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/courses/${course.id}`}
                        className="block w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-center py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group/btn"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span>Explore Course</span>
                          <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

