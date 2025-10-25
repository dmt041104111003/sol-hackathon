'use client';

import { motion } from 'framer-motion';
import { LMSAccount } from '@/types';

interface StatsSectionProps {
  lmsData: LMSAccount | null;
}

export function StatsSection({ lmsData }: StatsSectionProps) {
  const stats = [
    {
      label: 'Total Courses',
      value: lmsData?.totalCourses || 0,
      color: 'text-black',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Active Students',
      value: lmsData?.totalStudents || 0,
      color: 'text-black',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Certificates Issued',
      value: 1250,
      color: 'text-black',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Countries',
      value: 15,
      color: 'text-black',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <section className="py-16 bg-white border-2 border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Transforming Education Globally
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Join thousands of students and instructors building the future of education 
            on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
