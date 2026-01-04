'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import SubmissionHistory from '@/components/SubmissionHistory';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Submission } from '@/lib/types';

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get(`/submissions/user/${user.id}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Submissions</h1>
        {loading ? (
          <div className="text-center py-12">Loading submissions...</div>
        ) : (
          <SubmissionHistory submissions={submissions} />
        )}
      </div>
    </ProtectedRoute>
  );
}

