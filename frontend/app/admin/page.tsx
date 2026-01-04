'use client';

import { useEffect, useState, Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminProblems from '@/components/admin/AdminProblems';
import AdminCourses from '@/components/admin/AdminCourses';
import AdminSubmissions from '@/components/admin/AdminSubmissions';
import AdminLeaderboard from '@/components/admin/AdminLeaderboard';
import AdminRoles from '@/components/admin/AdminRoles';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminContests from '@/components/admin/AdminContests';
import AdminAudit from '@/components/admin/AdminAudit';

function AdminContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    const section = searchParams.get('section') || 'dashboard';
    setActiveSection(section);
  }, [user, searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'problems':
        return <AdminProblems />;
      case 'courses':
        return <AdminCourses />;
      case 'submissions':
        return <AdminSubmissions />;
      case 'leaderboard':
        return <AdminLeaderboard />;
      case 'roles':
        return <AdminRoles />;
      case 'settings':
        return <AdminSettings />;
      case 'contests':
        return <AdminContests />;
      case 'audit':
        return <AdminAudit />;
      default:
        return <AdminDashboard />;
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <AdminLayout activeSection={activeSection}>
      {renderSection()}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <AdminContent />
      </Suspense>
    </ProtectedRoute>
  );
}
