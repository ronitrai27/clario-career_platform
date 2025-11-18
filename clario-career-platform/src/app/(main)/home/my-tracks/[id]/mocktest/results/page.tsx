'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useQuizStore } from '@/lib/functions/MockTest/QuizStore';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { questions, answers, startTime, careerPath, reset } = useQuizStore();
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Quiz type description
  const quizType = questions.length > 0 ? 'Mixed Assessment' : '';

  useEffect(() => {
    if (questions.length === 0) {
      router.push(`/home/my-tracks/${params.id}/start`);
      return;
    }

    // Prevent back navigation to quiz page (register once per mount)
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      alert('You cannot go back to the quiz. Please start a new test.');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      reset();
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);

    const startedAt = startTime;
    if (startedAt !== null) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedTime(elapsed);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleRetake = () => {
    reset();
    router.push(`/home/my-tracks/${params.id}/start`);
  };

  const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl h-full flex flex-col"
      >
        {/* Header - Compact */}
        <div className="text-center mb-3 sm:mb-4 flex-shrink-0">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.4 }}
            className="relative w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 mx-auto mb-2 sm:mb-3"
          >
            {/* Ground Shadow - more realistic */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 h-3 bg-gradient-radial from-black/40 via-black/20 to-transparent rounded-full blur-lg"></div>
            
            {/* Trophy Pedestal/Base */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 sm:w-14 md:w-16">
              {/* Base platform */}
              <div className="relative h-4 sm:h-5 bg-gradient-to-b from-yellow-600 via-yellow-700 to-yellow-900 rounded-sm shadow-xl border-t border-yellow-500/50">
                {/* Top edge shine */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-300 to-transparent opacity-60"></div>
                {/* Side shadows */}
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/30 to-transparent"></div>
                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/30 to-transparent"></div>
              </div>
            </div>
            
            {/* Trophy Cup */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2">
              {/* Handles Container */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                {/* Left Handle */}
                <div className="absolute -left-1 top-1/4 w-2 h-8 sm:h-10 md:h-12">
                  <div className="w-full h-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 rounded-l-full shadow-lg"></div>
                  <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-yellow-300 to-transparent opacity-50"></div>
                </div>
                
                {/* Right Handle */}
                <div className="absolute -right-1 top-1/4 w-2 h-8 sm:h-10 md:h-12">
                  <div className="w-full h-full bg-gradient-to-l from-yellow-500 via-yellow-600 to-yellow-700 rounded-r-full shadow-lg"></div>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-yellow-300 to-transparent opacity-50"></div>
                </div>
                
                {/* Main Cup Body */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Outer glow */}
                  <div className="absolute inset-0 bg-yellow-400/40 blur-xl rounded-full"></div>
                  
                  {/* Cup shell */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 rounded-full shadow-2xl">
                    {/* Rim highlight */}
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-300/60"></div>
                    
                    {/* Main shine - left side bright spot */}
                    <div className="absolute top-2 left-2 w-5 h-5 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-gradient-to-br from-white via-yellow-100 to-transparent rounded-full opacity-80 blur-[2px]"></div>
                    
                    {/* Secondary shine - top right */}
                    <div className="absolute top-1 right-3 w-2 h-6 sm:w-3 sm:h-8 md:w-4 sm:h-10 bg-gradient-to-l from-white/60 to-transparent rounded-full blur-[1px]"></div>
                    
                    {/* Bottom shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/50 via-transparent to-transparent rounded-full"></div>
                    
                    {/* Inner circle for depth */}
                    <div className="absolute inset-2 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-800 rounded-full"></div>
                    
                    {/* Trophy Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy 
                        className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 text-yellow-900 relative z-10" 
                        strokeWidth={3} 
                        style={{ 
                          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' 
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sparkles with better animation */}
            <motion.div
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1 right-2 w-2 h-2 bg-white rounded-full"
              style={{ boxShadow: '0 0 8px #fff, 0 0 12px #fbbf24' }}
            />
            <motion.div
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0.3, 1, 0.3],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-3 left-0 w-1.5 h-1.5 bg-yellow-200 rounded-full"
              style={{ boxShadow: '0 0 6px #fef08a' }}
            />
            <motion.div
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0.4, 1.2, 0.4],
              }}
              transition={{ 
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-12 right-1 w-1 h-1 bg-amber-300 rounded-full"
              style={{ boxShadow: '0 0 4px #fcd34d' }}
            />
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Mock Test Complete!</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            {careerPath} - {quizType}
          </p>
        </div>

        {/* Score Card - Optimized for one page */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 flex-1 flex flex-col overflow-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 flex-shrink-0">
            {/* Score */}
            <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-1">Score</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                {score}/{questions.length}
              </p>
              <p className="text-sm sm:text-lg md:text-xl font-semibold text-gray-700 mt-0.5 sm:mt-1">{percentage.toFixed(1)}%</p>
            </div>

            {/* Time */}
            <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg sm:rounded-xl">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-1">Time</p>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{formatTime(elapsedTime)}</p>
              </div>
            </div>

            {/* Performance */}
            <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg sm:rounded-xl">
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm mb-1">Rating</p>
              <p className="text-base sm:text-xl md:text-2xl font-bold text-orange-600">
                {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 40 ? 'Fair' : 'Poor'}
              </p>
            </div>
          </div>

          {/* Question Review - Scrollable */}
          <div className="border-t pt-2 sm:pt-3 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 flex-shrink-0">Question Review</h2>
            <div className="space-y-2 sm:space-y-3 overflow-y-auto pr-1 sm:pr-2 flex-1 custom-scrollbar">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-2 sm:p-3 rounded-lg border-2 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 sm:mb-1.5">
                          Q{index + 1}: {q.question}
                        </p>
                        <div className="text-[10px] sm:text-xs md:text-sm space-y-0.5 sm:space-y-1">
                          {userAnswer && (
                            <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              Your answer: <span className="font-semibold">{userAnswer}. {q.options[userAnswer]}</span>
                            </p>
                          )}
                          {!isCorrect && (
                            <p className="text-green-700">
                              Correct answer: <span className="font-semibold">{q.correctAnswer}. {q.options[q.correctAnswer]}</span>
                            </p>
                          )}
                          {!userAnswer && (
                            <p className="text-gray-600">Not answered</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center mt-3 sm:mt-4 flex-shrink-0">
          <button
            onClick={handleRetake}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs sm:text-sm md:text-base font-semibold hover:shadow-xl transition-all hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Take Mocktest Again
          </button>
        </div>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}