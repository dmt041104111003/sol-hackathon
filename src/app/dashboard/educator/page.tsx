'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EducatorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/role-selection');
      return;
    }

    if (session.user.role !== 'EDUCATOR') {
      router.push('/dashboard/student');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Educator Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name || 'Educator'}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              My Courses
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                You have 0 published courses
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Create Course
              </button>
            </div>
          </div>

          {/* Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Total Students
            </h3>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">
                Students enrolled
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Total Earnings
            </h3>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">
                Tokens earned
              </div>
            </div>
          </div>
        </div>

        {/* Course Management */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Management
            </h3>
            <div className="text-sm text-gray-600">
              No courses created yet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
