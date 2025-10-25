'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

export function Hero() {
  const { connected } = useWallet();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      title: 'Blockchain Security',
      description: 'Immutable certificates and tamper-proof records',
    },
    {
      title: 'Token Rewards',
      description: 'Earn tokens for learning achievements and milestones',
    },
    {
      title: 'Global Access',
      description: 'Decentralized platform accessible worldwide',
    },
  ];

  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Education
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join the PECL Education Ecosystem - a decentralized learning platform where 
                students earn tokens, instructors get fair compensation, and certificates are 
                forever secure on the blockchain.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!connected ? (
                <button className="btn-primary text-lg px-8 py-4">
                  Connect Wallet to Start →
                </button>
              ) : (
                <button className="btn-primary text-lg px-8 py-4">
                  Explore Courses →
                </button>
              )}
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="btn-secondary text-lg px-8 py-4"
              >
                Watch Demo
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center space-y-2 border-2 border-blue-600 p-4"
                >
          
                  <h3 className="font-semibold text-black">{feature.title}</h3>
                  <p className="text-sm text-black">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white border-2 border-blue-800 p-8">
              <div className="space-y-6">
                {/* Mock Dashboard Preview */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-black">My Learning Dashboard</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600"></div>
                    <span className="text-sm text-black">Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border-2 border-blue-600 p-4">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-black">Courses Enrolled</div>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-600 p-4">
                    <div className="text-2xl font-bold text-blue-600">1,250</div>
                    <div className="text-sm text-black">Tokens Earned</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Blockchain Fundamentals</span>
                    <span className="text-sm font-medium text-blue-600">85%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2">
                    <div className="bg-blue-600 h-2" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black">Smart Contract Development</span>
                    <span className="text-sm font-medium text-blue-600">60%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2">
                    <div className="bg-blue-600 h-2" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-blue-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black">Recent Achievement</span>
                    <div className="w-6 h-6 bg-blue-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">A</span>
                    </div>
                  </div>
                  <p className="text-sm text-black mt-1">Completed "DeFi Fundamentals"</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-600 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">PECL-MS Demo</h3>
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl text-gray-400 mb-4">Play</span>
                <p className="text-gray-600">Demo video would be embedded here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
