'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header() {
  const { connected } = useWallet();
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
  ];

  const handleDashboardClick = () => {
    if (status === 'loading') {
      return;
    }
    
    if (!session) {
      alert('Please connect your wallet and login first');
      return;
    }
    
    if (session.user?.role === 'STUDENT') {
      router.push('/dashboard/student');
    } else if (session.user?.role === 'EDUCATOR') {
      router.push('/dashboard/educator');
    } else {
      router.push('/auth/role-selection');
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b-2 border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-black">PECL-MS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 font-semibold'
                    : 'text-black hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleDashboardClick}
              className={`transition-colors ${
                pathname.startsWith('/dashboard')
                  ? 'text-blue-600 font-semibold'
                  : 'text-black hover:text-blue-600'
              }`}
            >
              Dashboard
            </button>
          </nav>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-4">
                {mounted && session && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {session.user?.name || session.user?.email || 'Connected'}
                    </span>
                  </div>
                )}
                {mounted && <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg" />}
              </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black hover:text-blue-600 px-2 py-1"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t-2 border-blue-600">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 font-semibold bg-blue-50'
                      : 'text-black hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleDashboardClick();
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${
                  pathname.startsWith('/dashboard')
                    ? 'text-blue-600 font-semibold bg-blue-50'
                    : 'text-black hover:text-blue-600'
                }`}
              >
                Dashboard
              </button>
                  {/* Mobile Auth Status */}
                  {mounted && session && (
                    <div className="px-3 py-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        {session.user?.name || session.user?.email || 'Connected'}
                      </span>
                    </div>
                  )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
