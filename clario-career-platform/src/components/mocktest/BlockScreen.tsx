'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Download } from 'lucide-react';

export default function SEBBlockScreen() {
  return (
    <div className="h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
          >
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Safe Exam Browser Required
          </h1>

          {/* Description */}
          <p className="text-gray-700 text-lg mb-6">
            This exam requires Safe Exam Browser (SEB) for enhanced security.
            Please download and install SEB, then access this exam through the SEB application.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6 text-left w-full">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">Instructions:</h3>
            <ol className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">1.</span>
                <span>Download Safe Exam Browser from the official website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">2.</span>
                <span>Install SEB on your computer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">3.</span>
                <span>Open this exam URL in Safe Exam Browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold min-w-[1.5rem]">4.</span>
                <span>The exam will start automatically once SEB is detected</span>
              </li>
            </ol>
          </div>

          {/* Download Button */}
          <a
            href="https://safeexambrowser.org/download_en.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Download className="w-5 h-5" />
            Download Safe Exam Browser
          </a>

          {/* Additional Info */}
          <p className="text-gray-500 text-sm mt-6">
            Safe Exam Browser is a secure browser environment for taking online exams safely.
            It prevents unauthorized access to other applications and websites during the exam.
          </p>
        </div>
      </motion.div>
    </div>
  );
}