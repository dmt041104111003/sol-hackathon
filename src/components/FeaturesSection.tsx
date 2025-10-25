'use client';

import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      title: 'Immutable Certificates',
      description: 'Blockchain-secured credentials that cannot be forged, lost, or tampered with.',
      benefits: ['Cryptographic Security', 'Permanent Storage', 'Tamper-Proof Records'],
    },
    {
      title: 'Instant Verification',
      description: 'Scan QR codes to authenticate credentials in seconds instead of weeks.',
      benefits: ['Real-time Verification', 'No Contact Required', 'Global Access'],
    },
    {
      title: 'Full Ownership',
      description: 'Learners have complete control and ownership of their academic records.',
      benefits: ['Digital Wallet Storage', 'Portable Credentials', 'Self-Sovereign Identity'],
    },
    {
      title: 'Cost-Effective',
      description: 'Low blockchain issuance costs and free verification for all parties.',
      benefits: ['Reduced Admin Costs', 'Free Verification', 'No Middleman Fees'],
    },
    {
      title: 'Forgery Prevention',
      description: 'Cryptographically secured records that cannot be duplicated or falsified.',
      benefits: ['Mathematical Security', 'Unique Digital Signatures', 'Blockchain Immutability'],
    },
    {
      title: 'Cross-Platform Portability',
      description: 'Credentials work across different systems and institutions worldwide.',
      benefits: ['Universal Standards', 'Easy Migration', 'Global Recognition'],
    },
    {
      title: 'Lifetime Management',
      description: 'Securely manage all certificates and degrees in one digital wallet.',
      benefits: ['Centralized Storage', 'Easy Access', 'Complete History'],
    },
    {
      title: 'Enhanced Credibility',
      description: 'Blockchain verification increases trust and credibility for institutions.',
      benefits: ['Trusted Verification', 'Reduced Fraud', 'Enhanced Reputation'],
    },
  ];

  return (
    <section className="py-20 bg-white border-2 border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Learning Passport Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform certificate management with blockchain technology. 
            Create immutable, verifiable credentials that solve real-world problems.
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

        {/* Problem vs Solution */}
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
