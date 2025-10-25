'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Course, UserProfile, Achievement } from '@/types';
import { solanaService } from '@/lib/solana';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { publicKey } = useWallet();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (publicKey) {
      loadDashboardData();
    }
  }, [publicKey]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load user profile from blockchain
      if (publicKey) {
        const profile: UserProfile = {
          walletAddress: publicKey.toString(),
          name: 'Blockchain Student',
          email: '',
          role: 'Student' as any,
          enrolledCourses: [],
          certificates: [],
          achievements: [],
          totalTokens: 0,
          createdAt: Date.now(),
        };
        setUserProfile(profile);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'courses', name: 'My Courses' },
    { id: 'achievements', name: 'Achievements' },
    { id: 'community', name: 'Community' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Welcome back, {userProfile?.name}!</h1>
          <p className="text-black mt-2">Continue your learning journey with APEC LMS</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
  
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Courses Enrolled</p>
                <p className="text-2xl font-bold text-black">{userProfile?.enrolledCourses.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
        
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Achievements</p>
                <p className="text-2xl font-bold text-black">{userProfile?.achievements.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
          
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Tokens Earned</p>
                <p className="text-2xl font-bold text-black">{userProfile?.totalTokens || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
        
              <div className="ml-4">
                <p className="text-sm font-medium text-black">Certificates</p>
                <p className="text-2xl font-bold text-black">{userProfile?.certificates.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b-2 border-blue-600 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && <OverviewTab userProfile={userProfile} />}
          {activeTab === 'courses' && <CoursesTab courses={courses} />}
          {activeTab === 'achievements' && <AchievementsTab achievements={achievements} />}
          {activeTab === 'community' && <CommunityTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ userProfile }: { userProfile: UserProfile | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-black mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <div>
              <p className="text-sm font-medium text-black">Completed "Blockchain Basics"</p>
              <p className="text-xs text-black">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">+</span>
            </div>
            <div>
              <p className="text-sm font-medium text-black">Enrolled in "Smart Contracts"</p>
              <p className="text-xs text-black">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-sm font-medium text-black">Earned 50 tokens</p>
              <p className="text-xs text-black">3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-black mb-4">Learning Progress</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black">Blockchain Fundamentals</span>
              <span className="text-sm text-black">85%</span>
            </div>
            <div className="w-full bg-blue-200 h-2">
              <div className="bg-blue-600 h-2" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black">Smart Contract Development</span>
              <span className="text-sm text-black">60%</span>
            </div>
            <div className="w-full bg-blue-200 h-2">
              <div className="bg-blue-600 h-2" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-black">DeFi Protocols</span>
              <span className="text-sm text-black">30%</span>
            </div>
            <div className="w-full bg-blue-200 h-2">
              <div className="bg-blue-600 h-2" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursesTab({ courses }: { courses: Course[] }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h3>
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 font-bold">C</span>
            </div>
            <p className="text-gray-500">No courses enrolled yet</p>
            <button className="btn-primary mt-4">Browse Courses</button>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.courseId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary-600">85% Complete</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AchievementsTab({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Achievements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 font-bold">A</span>
            </div>
            <p className="text-gray-500">No achievements earned yet</p>
            <p className="text-sm text-gray-400 mt-2">Complete courses to earn achievements!</p>
          </div>
        ) : (
          achievements.map((achievement, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">A</span>
              </div>
              <h4 className="font-medium text-gray-900">{achievement.achievementType}</h4>
              <p className="text-sm text-gray-600 mt-1">+{achievement.amount} tokens</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommunityTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Groups</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Blockchain Study Group</h4>
            <p className="text-sm text-gray-600 mt-1">12 members • Active</p>
            <button className="btn-primary text-sm mt-2">Join Group</button>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Smart Contract Developers</h4>
            <p className="text-sm text-gray-600 mt-1">8 members • Active</p>
            <button className="btn-primary text-sm mt-2">Join Group</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Discussions</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-primary-500 pl-4">
            <h4 className="font-medium text-gray-900">How to deploy smart contracts?</h4>
            <p className="text-sm text-gray-600">5 replies • 2 hours ago</p>
          </div>
          <div className="border-l-4 border-secondary-500 pl-4">
            <h4 className="font-medium text-gray-900">Best practices for DeFi protocols</h4>
            <p className="text-sm text-gray-600">12 replies • 4 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
