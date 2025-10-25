'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

interface VerificationSectionProps {
  lmsData?: any;
}

export function StatsSection({ lmsData }: VerificationSectionProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'verify'>('generate');
  const [txHash, setTxHash] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const generateQRCode = async () => {
    if (!txHash.trim()) {
      alert('Please enter a transaction hash');
      return;
    }

    setIsGenerating(true);

    try {
      const qrData = {
        type: 'blockchain_verification',
        txHash: txHash,
        timestamp: new Date().toISOString(),
        platform: 'APEC LMS'
      };
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      setQrCodeUrl(qrCodeDataURL);
    } catch (error) {
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyTransaction = async () => {
    if (!verifyHash.trim()) {
      alert('Please enter a transaction hash to verify');
      return;
    }

    setIsVerifying(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = {
        valid: true,
        txHash: verifyHash,
        timestamp: new Date().toISOString(),
        issuer: 'APEC LMS',
        certificate: 'Blockchain Fundamentals Certificate',
        student: 'John Doe',
        status: 'Verified'
      };

      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        valid: false,
        error: 'Transaction not found or invalid'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="py-16 bg-white border-2 border-blue-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Blockchain Verification
          </h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Generate QR codes or verify transaction hashes for blockchain credentials
          </p>
        </div>

        {}
        <div className="flex justify-center mb-8">
          <div className="border border-gray-300 rounded">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 text-sm ${
                activeTab === 'generate'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Generate QR
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-6 py-2 text-sm border-l border-gray-300 ${
                activeTab === 'verify'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verify Hash
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          {}
          {activeTab === 'generate' && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter your transaction hash..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="text-center mb-6">
                <button
                  onClick={generateQRCode}
                  disabled={isGenerating || !txHash.trim()}
                  className="bg-gray-800 text-white px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>

              {qrCodeUrl && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Verification QR Code</h3>
                  <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                    <img src={qrCodeUrl} alt="Verification QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Scan this QR code to verify your blockchain transaction
                  </p>
                </div>
              )}
            </>
          )}

          {}
          {activeTab === 'verify' && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Hash to Verify
                </label>
                <input
                  type="text"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="Enter transaction hash to verify..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="text-center mb-6">
                <button
                  onClick={verifyTransaction}
                  disabled={isVerifying || !verifyHash.trim()}
                  className="bg-gray-800 text-white px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Transaction'}
                </button>
              </div>

              {verificationResult && (
                <div className="text-center">
                  {verificationResult.valid ? (
                    <div className="bg-white border border-gray-300 rounded p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Successful</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Certificate:</strong> {verificationResult.certificate}</p>
                        <p><strong>Student:</strong> {verificationResult.student}</p>
                        <p><strong>Issuer:</strong> {verificationResult.issuer}</p>
                        <p><strong>Status:</strong> {verificationResult.status}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-300 rounded p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h3>
                      <p className="text-sm text-gray-600">{verificationResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
