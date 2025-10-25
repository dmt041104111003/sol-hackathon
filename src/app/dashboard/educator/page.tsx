'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  videoLink: string;
  price: number;
  createdAt: string;
  enrollments: any[];
  quizQuestions: QuizQuestion[];
}

export default function EducatorDashboard() {
  const { data: session, status } = useSession();
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [courseData, setCourseData] = useState({
    title: '',
    videoLink: '',
    description: '',
    priceUSD: 0
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [educatorWalletAddress, setEducatorWalletAddress] = useState<string>('');

  // Load courses from database
  useEffect(() => {
    if (session) {
      loadCourses();
      loadEducatorProfile();
    }
  }, [session]);

  // Update wallet address when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      setEducatorWalletAddress(publicKey.toString());
    }
  }, [connected, publicKey]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEducatorProfile = async () => {
    try {
      const response = await fetch('/api/educator/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.walletAddress) {
          setEducatorWalletAddress(data.walletAddress);
        }
      }
    } catch (error) {
      console.error('Error loading educator profile:', error);
    }
  };

  const updateEducatorWallet = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const response = await fetch('/api/educator/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
        }),
      });

      if (response.ok) {
        alert('Wallet address updated successfully!');
        setEducatorWalletAddress(publicKey.toString());
      } else {
        const error = await response.json();
        alert(`Failed to update wallet: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet address');
    }
  };

  const handleCreateCourse = () => {
    setShowCreateCourse(true);
    setActiveTab('overview'); // Switch to overview tab when creating course
  };

  const handleSaveCourse = async () => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseData.title,
          description: courseData.description,
          videoLink: courseData.videoLink,
          priceUSD: courseData.priceUSD,
          quizQuestions: quizQuestions
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Course saved successfully:', result);
        alert('Course saved successfully!');
        setShowCreateCourse(false);
        setCourseData({ title: '', videoLink: '', description: '', priceUSD: 0 });
        setQuizQuestions([]);
        setShowCreateCourse(false); // Close create course form
        setActiveTab('courses'); // Switch to courses tab
        loadCourses(); // Reload courses
      } else {
        const error = await response.json();
        console.error('Failed to save course:', error);
        alert(`Failed to save course: ${error.error || error.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    }
  };

  const addQuizQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every(opt => opt.trim())) {
      const newQuestion: QuizQuestion = {
        id: Date.now().toString(),
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer
      };
      setQuizQuestions([...quizQuestions, newQuestion]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Course deleted successfully!');
        loadCourses(); // Reload courses
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const handleViewStudents = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleMintNFT = (studentId: string, courseTitle: string) => {
    // TODO: Implement NFT minting logic
    alert(`Mint NFT for Student ID: ${studentId}\nCourse: ${courseTitle}\n\nThis feature will be implemented later.`);
  };

  const getCompletedStudents = (course: Course) => {
    return course.enrollments.filter(enrollment => {
      const totalQuestions = course.quizQuestions?.length || 0;
      const quizScore = (enrollment as any).quizScore || 0;
      return totalQuestions > 0 && quizScore === totalQuestions;
    });
  };

  const getActiveStudents = (course: Course) => {
    return course.enrollments.filter(enrollment => {
      const totalQuestions = course.quizQuestions?.length || 0;
      const quizScore = (enrollment as any).quizScore || 0;
      return quizScore < totalQuestions;
    });
  };

  const handleJsonImport = () => {
    try {
      const jsonData = JSON.parse(jsonInput);
      
      // Validate required fields
      if (!jsonData.courseTitle || !jsonData.youtubeLink || !jsonData.description) {
        alert('Missing required fields: courseTitle, youtubeLink, description');
        return;
      }

      // Set course data from JSON
      setCourseData({
        title: jsonData.courseTitle,
        videoLink: jsonData.youtubeLink,
        description: jsonData.description,
        priceUSD: jsonData.priceUSD || 0
      });

      // Set quiz questions from JSON
      if (jsonData.quizQuestions && Array.isArray(jsonData.quizQuestions)) {
        const questions = jsonData.quizQuestions.map((q: any, index: number) => ({
          id: `imported-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.options.indexOf(q.correctAnswer)
        }));
        setQuizQuestions(questions);
      }

      setShowJsonImport(false);
      setJsonInput('');
      setShowCreateCourse(true); // Open create course form
      setActiveTab('overview'); // Switch to overview tab
      alert('Course data imported successfully! Review and save the course.');
    } catch (error) {
      alert('Invalid JSON format. Please check your input.');
    }
  };

  // Simple check - if no session, show message
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600 mx-auto"></div>
          <div className="mt-4 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Connect your wallet to access dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Educator Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name || 'Educator'}!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setShowCreateCourse(false); // Hide create course form when switching to overview tab
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('courses');
                  setShowCreateCourse(false); // Hide create course form when switching to courses tab
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Courses
              </button>
            </nav>
          </div>
        </div>

        {/* Students Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Students in "{selectedCourse.title}"
                </h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {selectedCourse.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {/* Completed Students */}
                  {getCompletedStudents(selectedCourse).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Completed Students ({getCompletedStudents(selectedCourse).length})
                      </h4>
                      <div className="space-y-2">
                        {getCompletedStudents(selectedCourse).map((enrollment, index) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                            <div>
                              <p className="font-medium text-gray-900">Student #{index + 1} (Completed)</p>
                              <p className="text-sm text-gray-600">
                                Completed: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">ID: {enrollment.userId}</span>
                              <button
                                onClick={() => handleMintNFT(enrollment.userId, selectedCourse.title)}
                                className="bg-gray-800 text-white px-3 py-1 text-xs rounded hover:bg-gray-900"
                              >
                                Mint NFT
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Students */}
                  {getActiveStudents(selectedCourse).length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Active Students ({getActiveStudents(selectedCourse).length})
                      </h4>
                      <div className="space-y-2">
                        {getActiveStudents(selectedCourse).map((enrollment, index) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                            <div>
                              <p className="font-medium text-gray-900">Student #{index + 1}</p>
                              <p className="text-sm text-gray-600">
                                Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">ID: {enrollment.userId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      Total: {selectedCourse.enrollments.length} students | 
                      Completed: {getCompletedStudents(selectedCourse).length} | 
                      Active: {getActiveStudents(selectedCourse).length}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No students enrolled yet</p>
              )}
            </div>
          </div>
        )}

        {/* JSON Import Modal */}
        {showJsonImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Import Course from JSON
                </h3>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                  placeholder="Paste your JSON data here..."
                />
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                <h4 className="font-medium text-gray-900 mb-2">Expected JSON Format:</h4>
                <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "courseTitle": "Introduction to Web3 Development",
  "youtubeLink": "https://www.youtube.com/watch?v=VIDEO_ID",
  "description": "Course description here...",
  "priceUSD": 25,
  "quizQuestions": [
    {
      "question": "What is a blockchain?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1"
    }
  ]
}`}
                </pre>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleJsonImport}
                  className="bg-gray-800 text-white px-4 py-2 text-sm rounded"
                >
                  Import Course
                </button>
                <button
                  onClick={() => setShowJsonImport(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 text-sm rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!showCreateCourse ? (
          <>
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="text-sm font-medium text-gray-900">My Courses</h3>
                    <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                  </div>
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="text-sm font-medium text-gray-900">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.reduce((total, course) => total + course.enrollments.length, 0)}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="text-sm font-medium text-gray-900">Completed Students</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.reduce((total, course) => total + getCompletedStudents(course).length, 0)}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <h3 className="text-sm font-medium text-gray-900">Quiz Questions</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {courses.reduce((total, course) => total + course.quizQuestions.length, 0)}
                    </p>
                  </div>
                </div>

                {/* Wallet Information */}
                <div className="bg-white border border-gray-300 rounded p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Wallet</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Wallet Address
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={educatorWalletAddress}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                          placeholder="No wallet connected"
                        />
                        <button
                          onClick={updateEducatorWallet}
                          disabled={!connected}
                          className="bg-gray-800 text-white px-4 py-2 text-sm rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {connected ? 'Update Wallet' : 'Connect Wallet'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {connected 
                          ? 'Wallet connected. Click "Update Wallet" to save your address for payments.'
                          : 'Connect your wallet to receive payments from students.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Create Course Button */}
                <div className="bg-white border border-gray-300 rounded p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Course Management</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateCourse}
                      className="bg-gray-800 text-white px-4 py-2 text-sm"
                    >
                      Create New Course
                    </button>
                    <button
                      onClick={() => setShowJsonImport(true)}
                      className="bg-gray-800 text-white px-4 py-2 text-sm"
                    >
                      Import from JSON
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Courses List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Loading courses...</div>
                  </div>
                ) : courses.length > 0 ? (
                  <div className="bg-white border border-gray-300 rounded p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">My Courses</h3>
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-md font-medium text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                              <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                <span>Students: {course.enrollments.length}</span>
                                <span>Questions: {course.quizQuestions.length}</span>
                                <span>Price: ${course.price} USD</span>
                                <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              {course.videoLink && (
                                <a
                                  href={course.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  YouTube Link
                                </a>
                              )}
                              <button
                                onClick={() => handleViewStudents(course)}
                                className="bg-gray-800 text-white px-3 py-1 text-xs rounded hover:bg-gray-900"
                              >
                                View Students
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="bg-gray-600 text-white px-3 py-1 text-xs rounded hover:bg-gray-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-300 rounded p-6 text-center">
                    <p className="text-gray-600">No courses created yet</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-gray-300 rounded p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Create New Course</h2>
            
            {/* Course Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter course title"
                />
              </div>
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video Link
                    </label>
                    <input
                      type="url"
                      value={courseData.videoLink}
                      onChange={(e) => setCourseData({...courseData, videoLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Paste the full YouTube URL here
                    </p>
                  </div>
              
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={courseData.description}
                      onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      rows={3}
                      placeholder="Enter course description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={courseData.priceUSD}
                      onChange={(e) => setCourseData({...courseData, priceUSD: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter course price in USD"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ {(courseData.priceUSD / 200).toFixed(4)} SOL (Rate: $200/SOL)
                    </p>
                  </div>
            </div>

            {/* Quiz Questions */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Quiz Questions</h3>
              
              {/* Add New Question */}
              <div className="border border-gray-300 rounded p-4 mb-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Enter question"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {currentQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[index] = e.target.value;
                        setCurrentQuestion({...currentQuestion, options: newOptions});
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    value={currentQuestion.correctAnswer}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: parseInt(e.target.value)})}
                    className="px-3 py-2 border border-gray-300 rounded text-sm"
                    aria-label="Select correct answer"
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>
                
                <button
                  onClick={addQuizQuestion}
                  className="bg-gray-800 text-white px-3 py-1 text-sm"
                >
                  Add Question
                </button>
              </div>

              {/* Existing Questions */}
              {quizQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Added Questions:</h4>
                  {quizQuestions.map((q, index) => (
                    <div key={q.id} className="bg-gray-50 border border-gray-200 rounded p-3">
                      <p className="text-sm font-medium text-gray-900">{index + 1}. {q.question}</p>
                      <p className="text-xs text-gray-600">Correct: Option {q.correctAnswer + 1}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Course */}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveCourse}
                className="bg-gray-800 text-white px-4 py-2 text-sm"
              >
                Save Course
              </button>
              <button
                onClick={() => setShowCreateCourse(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
