'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Hero } from '@/components/Hero';
import { CourseGrid } from '@/components/CourseGrid';
import { StatsSection } from '@/components/StatsSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { Dashboard } from '@/components/Dashboard';
import { solanaService } from '@/lib/solana';
import { Course, LMSAccount } from '@/types';
import toast from 'react-hot-toast';

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [lmsData, setLmsData] = useState<LMSAccount | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadLMSData();
      setShowDashboard(true);
    } else {
      setShowDashboard(false);
      setLoading(false); // Stop loading when not connected
    }
  }, [connected, publicKey]);

  const loadLMSData = async () => {
    try {
      setLoading(true);
      const result = await solanaService.getLMSAccount();
      if (result.success && result.data) {
        setLmsData(result.data as unknown as LMSAccount);
      }
    } catch (error) {
      toast.error('Failed to load LMS data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Hero />
      <StatsSection lmsData={lmsData} />
      <FeaturesSection />
      <CourseGrid courses={courses} />
    </>
  );
}
