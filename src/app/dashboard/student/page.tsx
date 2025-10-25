'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Course {
  id: string;
  title: string;
  description: string;
  videoLink: string;
  price: number;
  instructor: {
    name: string;
  };
  quizQuestions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'courses' | 'completed' | 'certificates'>('courses');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState<'video' | 'quiz'>('video');
  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: number}>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    if (session) {
      loadEnrolledCourses();
    }
  }, [session]);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      console.log('Loading enrolled courses...');
      const response = await fetch('/api/student/courses');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses data:', data);
        const allCourses = data.courses;
        console.log('All courses:', allCourses);
        
        // Separate active and completed courses based on quiz score
        const activeCourses = allCourses.filter((course: any) => {
          const enrollment = course.enrollments?.[0];
          if (!enrollment) return false;
          
          // Course is active if no quiz score or score < 100%
          const totalQuestions = course.quizQuestions?.length || 0;
          const quizScore = enrollment.quizScore || 0;
          return quizScore < totalQuestions;
        });
        
        const completedCourses = allCourses.filter((course: any) => {
          const enrollment = course.enrollments?.[0];
          if (!enrollment) return false;
          
          // Course is completed if quiz score = 100%
          const totalQuestions = course.quizQuestions?.length || 0;
          const quizScore = enrollment.quizScore || 0;
          return totalQuestions > 0 && quizScore === totalQuestions;
        });
        
        console.log('Active courses:', activeCourses);
        console.log('Completed courses:', completedCourses);
        
        setEnrolledCourses(activeCourses);
        setCompletedCourses(completedCourses);
      } else {
        const error = await response.json();
        console.error('API Error:', error);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswerChange = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = async () => {
    if (!selectedCourse) return;

    // Check if all questions are answered
    const unansweredQuestions = selectedCourse.quizQuestions.filter(
      question => quizAnswers[question.id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmittingQuiz(true);
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          answers: quizAnswers
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setQuizScore(result.score);
        setQuizSubmitted(true);
        
        // Course completion is now handled in quiz/submit API
        // No need to call enrollment/complete separately

        const percentage = Math.round((result.score / selectedCourse.quizQuestions.length) * 100);
        
        if (result.score === selectedCourse.quizQuestions.length) {
          alert(`Perfect! Quiz completed with 100% score: ${result.score}/${selectedCourse.quizQuestions.length} (${percentage}%)`);
        } else {
          alert(`Quiz submitted! Your score: ${result.score}/${selectedCourse.quizQuestions.length} (${percentage}%). You need 100% to complete this course.`);
        }
        
        // Reload courses to update the lists
        await loadEnrolledCourses();
      } else {
        const error = await response.json();
        alert(`Quiz submission failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    
    // Check if course is completed - don't reset quiz state for completed courses
    const isCompleted = (course as any).enrollments?.some((enrollment: any) => enrollment.status === 'COMPLETED');
    
    if (!isCompleted) {
      // Only reset quiz state for active courses
      setQuizAnswers({});
      setQuizScore(null);
      setQuizSubmitted(false);
      setSubmittingQuiz(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      // Check if course has quiz score before resetting
      const enrollment = (selectedCourse as any).enrollments?.[0];
      const totalQuestions = selectedCourse?.quizQuestions?.length || 0;
      const quizScore = enrollment?.quizScore || 0;
      
      if (totalQuestions === 0) {
        alert('This course has no quiz questions.');
        return;
      }
      
      if (quizScore === 0) {
        alert('You haven\'t taken this quiz yet.');
        return;
      }
      
      // Call API to reset quiz data in database
      const response = await fetch('/api/quiz/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse?.id }),
      });

      if (response.ok) {
        // Reset UI state
        setQuizAnswers({});
        setQuizScore(null);
        setQuizSubmitted(false);
        setSubmittingQuiz(false);
        
        // Reload courses to update the lists
        await loadEnrolledCourses();
        
        alert('Quiz reset successfully! You can now retake the quiz.');
      } else {
        const error = await response.json();
        alert(`Failed to reset quiz: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting quiz:', error);
      alert('Failed to reset quiz. Please try again.');
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url; // Return original URL if not a valid YouTube URL
  };

  // Simple auth - no complex checks
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
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session.user.name || 'Student'}!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'courses'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed ({completedCourses.length})
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-gray-800 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Certificates
              </button>
            </nav>
          </div>
        </div>

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedCourse.title}
                </h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Course Tab Navigation */}
              <div className="mb-4">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveCourseTab('video')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeCourseTab === 'video'
                          ? 'border-gray-800 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Video
                    </button>
                    <button
                      onClick={() => setActiveCourseTab('quiz')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeCourseTab === 'quiz'
                          ? 'border-gray-800 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Quiz ({selectedCourse.quizQuestions.length})
                    </button>
                  </nav>
                </div>
              </div>

              {/* Course Content */}
              {activeCourseTab === 'video' ? (
                <div>
                  {selectedCourse.videoLink ? (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedCourse.videoLink)}
                        title={selectedCourse.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">No video available</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>
                </div>
              ) : (
                <div>
                  {selectedCourse.quizQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Check if course is completed based on quiz score */}
                      {(() => {
                        const enrollment = (selectedCourse as any).enrollments?.[0];
                        const totalQuestions = selectedCourse.quizQuestions?.length || 0;
                        const quizScore = enrollment?.quizScore || 0;
                        const isCompleted = totalQuestions > 0 && quizScore === totalQuestions;
                        const shouldShowQuiz = !isCompleted && !quizSubmitted;
                        
                        if (isCompleted || quizSubmitted) {
                          // Get quiz data from enrollment
                          const enrollment = (selectedCourse as any).enrollments?.[0];
                          const dbQuizScore = enrollment?.quizScore || 0;
                          const dbQuizAnswers = enrollment?.quizAnswers;
                          
                          console.log('Enrollment data:', enrollment);
                          console.log('DB Quiz Score:', dbQuizScore);
                          console.log('DB Quiz Answers:', dbQuizAnswers);
                          
                          return (
                            <div className="py-8">
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Results</h3>
                                <p className="text-gray-700 mb-4">
                                  Your score: {dbQuizScore || quizScore}/{selectedCourse.quizQuestions.length} 
                                  ({Math.round(((dbQuizScore || quizScore || 0) / selectedCourse.quizQuestions.length) * 100)}%)
                                </p>
                                {(() => {
                                  const currentScore = dbQuizScore || quizScore || 0;
                                  const totalQuestions = selectedCourse.quizQuestions.length;
                                  const isPerfect = currentScore === totalQuestions;
                                  const hasScore = currentScore > 0;
                                  
                                  if (isPerfect) {
                                    return (
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-green-600 font-medium">
                                          Perfect! You have completed this course with 100% score!
                                        </p>
                                        {/* No retake button for perfect score */}
                                      </div>
                                    );
                                  } else if (hasScore) {
                                    return (
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-orange-600 font-medium">
                                          You need 100% score to complete this course. Try again!
                                        </p>
                                        <button
                                          onClick={handleRetakeQuiz}
                                          className="bg-gray-800 text-white px-3 py-1 text-xs rounded hover:bg-gray-900"
                                        >
                                          Retake Quiz
                                        </button>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <p className="text-sm text-gray-600">
                                        Take the quiz to see your score.
                                      </p>
                                    );
                                  }
                                })()}
                              </div>
                              
                              {/* Quiz Results - show if we have quiz data */}
                              {(quizSubmitted && quizScore !== null) || (isCompleted && dbQuizAnswers) ? (
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">Quiz Results:</h4>
                                  {selectedCourse.quizQuestions.map((question, index) => {
                                    // Use current session answers or database answers
                                    const currentAnswers = quizSubmitted ? quizAnswers : dbQuizAnswers;
                                    
                                    return (
                                      <div key={question.id} className="border border-gray-200 rounded p-4">
                                        <h5 className="font-medium text-gray-900 mb-2">
                                          Question {index + 1}: {question.question}
                                        </h5>
                                        <div className="space-y-2">
                                          {question.options.map((option, optionIndex) => {
                                            const isSelected = currentAnswers?.[question.id] === optionIndex;
                                            const isCorrect = optionIndex === question.correctAnswer;
                                            const isWrong = isSelected && !isCorrect;
                                            
                                            return (
                                              <div 
                                                key={optionIndex} 
                                                className={`p-2 rounded ${
                                                  isCorrect ? 'bg-green-50 border border-green-200' :
                                                  isWrong ? 'bg-red-50 border border-red-200' :
                                                  'bg-gray-50'
                                                }`}
                                              >
                                                <span className={`font-medium ${
                                                  isCorrect ? 'text-green-800' :
                                                  isWrong ? 'text-red-800' :
                                                  'text-gray-700'
                                                }`}>
                                                  {option}
                                                </span>
                                                {isCorrect && <span className="ml-2 text-green-600 text-sm">Correct</span>}
                                                {isWrong && <span className="ml-2 text-red-600 text-sm">Your answer</span>}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        }
                        
                        // Show quiz form if not completed and not submitted
                        if (shouldShowQuiz) {
                          return (
                            <>
                              {selectedCourse.quizQuestions.map((question, index) => (
                                <div key={question.id} className="border border-gray-200 rounded p-4">
                                  <h4 className="font-medium text-gray-900 mb-3">
                                    Question {index + 1}: {question.question}
                                  </h4>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <label key={optionIndex} className="flex items-center">
                                        <input
                                          type="radio"
                                          name={`question-${question.id}`}
                                          value={optionIndex}
                                          checked={quizAnswers[question.id] === optionIndex}
                                          onChange={() => handleQuizAnswerChange(question.id, optionIndex)}
                                          className="mr-2"
                                        />
                                        <span className="text-gray-700">{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div className="mt-6">
                                <button 
                                  onClick={submitQuiz}
                                  disabled={submittingQuiz}
                                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                              </div>
                            </>
                          );
                        }
                        
                        return null;
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No quiz questions available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'courses' ? (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading courses...</div>
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="bg-white border border-gray-300 rounded p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <div>Instructor: {course.instructor.name}</div>
                          <div>Price: ${(course.price * 200).toFixed(2)} USD</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="bg-gray-800 text-white px-3 py-1 text-xs rounded hover:bg-gray-900"
                          >
                            View Course
                          </button>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                            Enrolled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded p-6 text-center">
                <p className="text-gray-600">No courses enrolled yet</p>
              </div>
            )}
          </div>
        ) : activeTab === 'completed' ? (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading completed courses...</div>
              </div>
            ) : completedCourses.length > 0 ? (
              <div className="bg-white border border-gray-300 rounded p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Completed Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <div>Instructor: {course.instructor.name}</div>
                          <div>Price: ${(course.price * 200).toFixed(2)} USD</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCourse(course)}
                            className="bg-gray-800 text-white px-3 py-1 text-xs rounded hover:bg-gray-900"
                          >
                            View Course
                          </button>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded p-6 text-center">
                <p className="text-gray-600">No completed courses yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Complete quizzes to move courses to this section
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 rounded p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certificates</h3>
              <div className="text-center py-8">
                <p className="text-gray-600">No certificates earned yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Complete courses to earn certificates and tokens
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
