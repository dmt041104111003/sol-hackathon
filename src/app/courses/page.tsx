'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function CoursesPage() {
  const { connected } = useWallet();
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  const allCourses = [
    {
      id: '1',
      title: 'Blockchain Fundamentals',
      description: 'Learn the basics of blockchain technology',
      instructor: 'Dr. Smith',
      duration: '4 weeks',
      level: 'Beginner'
    },
    {
      id: '2',
      title: 'Smart Contracts Development',
      description: 'Build and deploy smart contracts',
      instructor: 'Prof. Johnson',
      duration: '6 weeks',
      level: 'Intermediate'
    },
    {
      id: '3',
      title: 'DeFi Protocols',
      description: 'Understanding Decentralized Finance',
      instructor: 'Dr. Lee',
      duration: '5 weeks',
      level: 'Advanced'
    },
    {
      id: '4',
      title: 'NFT Marketplace Development',
      description: 'Create and deploy NFT marketplaces',
      instructor: 'Dr. Chen',
      duration: '8 weeks',
      level: 'Advanced'
    },
    {
      id: '5',
      title: 'Cryptocurrency Trading',
      description: 'Learn trading strategies and market analysis',
      instructor: 'Prof. Wilson',
      duration: '6 weeks',
      level: 'Intermediate'
    },
    {
      id: '6',
      title: 'Web3 Security',
      description: 'Security best practices for Web3 applications',
      instructor: 'Dr. Martinez',
      duration: '5 weeks',
      level: 'Advanced'
    },
    {
      id: '7',
      title: 'Ethereum Development',
      description: 'Build applications on Ethereum blockchain',
      instructor: 'Prof. Davis',
      duration: '10 weeks',
      level: 'Intermediate'
    },
    {
      id: '8',
      title: 'Solana Development',
      description: 'Develop applications on Solana blockchain',
      instructor: 'Dr. Anderson',
      duration: '8 weeks',
      level: 'Intermediate'
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(allCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = allCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">
            Available blockchain education courses ({allCourses.length} total)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCourses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
              {/* Header - cố định chiều cao */}
              <div className="mb-4 min-h-[120px]">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Content - flex-grow để đẩy button xuống dưới */}
              <div className="flex-grow flex flex-col justify-center">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Instructor:</span>
                    <span className="text-gray-600">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Level:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Button - luôn ở dưới cùng với margin cố định */}
              <div className="mt-8 pt-4">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                  {connected ? 'Enroll' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Page info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, allCourses.length)} of {allCourses.length} courses
        </div>
      </div>
    </div>
  );
}
