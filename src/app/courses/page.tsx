'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  videoLink: string;
  price: number;
  instructor: {
    name: string;
  };
  enrollments: any[];
  quizQuestions: any[];
  createdAt: string;
}

export default function CoursesPage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const coursesPerPage = 6;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setAllCourses(data.courses);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(allCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = allCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnroll = async (course: Course) => {
    if (!connected || !publicKey || !session) {
      alert('Please connect your wallet and login first');
      return;
    }

    if (session.user?.role === 'EDUCATOR') {
      alert('Educators cannot enroll in courses. Only students can enroll.');
      return;
    }

    if (enrolling) {
      return; // Prevent multiple enrollments
    }

    try {
      setEnrolling(course.id);

      const confirmPayment = confirm(
        `Enroll in "${course.title}" for ${course.price} SOL?\n\nThis will process payment through your Solana wallet.`
      );

      if (!confirmPayment) {
        return;
      }

      const preEnrollResponse = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          walletAddress: publicKey.toString(),
          preCheck: true,
        }),
      });

      if (!preEnrollResponse.ok) {
        const error = await preEnrollResponse.json();
        throw new Error(error.error || 'Failed to get instructor wallet');
      }

      const preEnrollData = await preEnrollResponse.json();
      const instructorWalletAddress = preEnrollData.instructorWalletAddress;

      const { Connection, Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import('@solana/web3.js');
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

      const lamports = Math.floor(course.price * LAMPORTS_PER_SOL);

      const instructorWallet = new PublicKey(instructorWalletAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: instructorWallet, // Send to instructor's wallet
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      if (!signTransaction) {
        throw new Error('Wallet does not support signing transactions');
      }
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      await connection.confirmTransaction(signature, 'confirmed');

      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          walletAddress: publicKey.toString(),
          paymentSignature: signature,
        }),
      });

      if (response.ok) {
        alert('Successfully enrolled in the course!');

        router.push('/dashboard/student');
      } else {
        const error = await response.json();
        alert(`Enrollment failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <div className="mt-4 text-lg text-gray-600">Loading courses...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">
            Available blockchain education courses ({allCourses.length} total)
          </p>
        </div>

        {allCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                {}
                <div className="mb-4 min-h-[120px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {}
                <div className="flex-grow flex flex-col justify-center">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Instructor:</span>
                      <span className="text-gray-600">{course.instructor.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="text-gray-600">${(course.price * 200).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Students:</span>
                      <span className="text-gray-600">{course.enrollments.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Quiz Questions:</span>
                      <span className="text-gray-600">{course.quizQuestions.length}</span>
                    </div>
                  </div>
                </div>

                {}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={enrolling === course.id || session?.user?.role === 'EDUCATOR'}
                    className={`w-full py-3 px-4 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      session?.user?.role === 'EDUCATOR'
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {enrolling === course.id
                      ? 'Processing...'
                      : session?.user?.role === 'EDUCATOR'
                        ? 'Educators Cannot Enroll'
                        : connected
                          ? `Enroll - ${(course.price * 200).toFixed(2)} USD`
                          : 'Connect Wallet'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg">No courses available yet</div>
            <div className="text-gray-500 text-sm mt-2">Check back later for new courses</div>
          </div>
        )}

        {}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              {}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {}
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

              {}
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

        {}
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, allCourses.length)} of {allCourses.length} courses
        </div>
      </div>
    </div>
  );
}
