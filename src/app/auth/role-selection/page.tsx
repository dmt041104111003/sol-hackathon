'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RoleSelection() {
  const { publicKey, connected } = useWallet();
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'EDUCATOR' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user?.role) {
      if (session.user.role === 'STUDENT') {
        router.push('/dashboard/student');
      } else if (session.user.role === 'EDUCATOR') {
        router.push('/dashboard/educator');
      }
    }
  }, [session, status, router]);

  const handleRoleSelection = async (role: 'STUDENT' | 'EDUCATOR') => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        walletAddress: publicKey.toString(),
        role: role,
        redirect: false
      });

      if (result?.ok) {
        if (role === 'STUDENT') {
          router.push('/dashboard/student');
        } else {
          router.push('/dashboard/educator');
        }
      } else {
        alert('Authentication failed');
      }
    } catch (error) {
      alert('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-lg">Loading...</div>
        </div>
      </div>
    );
  }
  if (session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-lg">Redirecting to your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Connect Your Wallet
            </h2>
            <p className="mt-2 text-gray-600">
              Please connect your wallet to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-gray-600">
            Select how you want to use the platform
          </p>
        </div>

        <div className="space-y-4">
          {}
          <button
            onClick={() => handleRoleSelection('STUDENT')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <div className="text-left">
              <div className="text-lg font-semibold">Student</div>
              <div className="text-sm text-gray-500">
                Learn courses and earn tokens
              </div>
            </div>
          </button>

          {}
          <button
            onClick={() => handleRoleSelection('EDUCATOR')}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <div className="text-left">
              <div className="text-lg font-semibold">Educator</div>
              <div className="text-sm text-gray-500">
                Create courses and teach students
              </div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="text-gray-600">Setting up your account...</div>
          </div>
        )}
      </div>
    </div>
  );
}
