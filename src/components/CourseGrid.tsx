'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Course } from '@/types';

interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const displayCourses = courses;

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'blockchain', name: 'Blockchain' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFTs' },
    { id: 'smart-contracts', name: 'Smart Contracts' },
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'newest', name: 'Newest' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
  ];

  return (
    <section className="py-20 bg-white border-2 border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            Explore Our Courses
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Discover cutting-edge blockchain and Web3 courses taught by industry experts
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Sort courses by"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayCourses.map((course, index) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-secondary-500">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    ${course.price} USD
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <button className="bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all">
                    <span className="text-gray-900 font-bold text-sm">Play</span>
                  </button>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Blockchain</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">Rating: 4.8</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <span>Students: {course.currentStudents}/{course.maxStudents}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Duration: 8 weeks</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-bold text-xs">I</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
                      <p className="text-xs text-gray-500">Instructor</p>
                    </div>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2">
                    Enroll Now
                  </button>
                </div>
              </div>

              {/* Progress Bar (if enrolled) */}
              {course.currentStudents > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-secondary px-8 py-3">
            Load More Courses
          </button>
        </div>
      </div>
    </section>
  );
}
