'use client';

import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      title: 'Blockchain Security',
      description: 'Immutable certificates and tamper-proof academic records stored on Solana blockchain.',
      benefits: ['Forgery Prevention', 'Instant Verification', 'Lifetime Ownership'],
    },
    {
      title: 'Token Rewards',
      description: 'Earn real tokens for learning achievements, course completions, and active participation.',
      benefits: ['Learn-to-Earn Model', 'Real Economic Value', 'Cross-Platform Use'],
    },
    {
      title: 'Global Access',
      description: 'Decentralized platform accessible worldwide without geographic or institutional barriers.',
      benefits: ['No Geographic Limits', '24/7 Availability', 'Global Community'],
    },
    {
      title: 'Peer-to-Peer Learning',
      description: 'Direct instructor-student connections without intermediary platform fees.',
      benefits: ['Lower Costs', 'Direct Communication', 'Fair Compensation'],
    },
    {
      title: 'IP Protection',
      description: 'Blockchain-based intellectual property protection with automated royalty distribution.',
      benefits: ['Proof of Creation', 'Automatic Royalties', 'Usage Tracking'],
    },
    {
      title: 'Skill Verification',
      description: 'Multi-party verification system for soft skills and practical abilities beyond grades.',
      benefits: ['Holistic Assessment', 'Peer Reviews', 'AI Assessment'],
    },
    {
      title: 'AI-Powered Learning',
      description: 'Personalized learning paths and recommendations powered by artificial intelligence.',
      benefits: ['Personalized Content', 'Smart Recommendations', 'Progress Prediction'],
    },
    {
      title: 'Interoperability',
      description: 'Seamless integration with existing educational systems and platforms.',
      benefits: ['Easy Migration', 'Standard Formats', 'API Integration'],
    },
  ];

  return (
    <section className="py-20 bg-white border-2 border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of education with cutting-edge blockchain technology 
            and AI-powered learning systems
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary-600 font-bold text-sm">Feature</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-primary-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Learning Experience?
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Join the APEC Education Ecosystem and be part of the blockchain education revolution. 
              Start earning tokens while you learn!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Get Started Now
              </button>
              <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
