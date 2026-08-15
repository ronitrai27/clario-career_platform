'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, Maximize, Minimize, AlertCircle } from 'lucide-react';
import { useQuizStore } from '@/lib/functions/MockTest/QuizStore';
import { useProctoring } from '@/hooks/useSecurity';
import Watermark from '@/components/mocktest/watermark';
import SEBBlockScreen from '@/components/mocktest/BlockScreen';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const {
    careerPath,
    questions,
    currentQuestionIndex,
    answers,
    startTime,
    isFullscreen,
    isLoading,
    error,
    sessionId,
    userEmail,
    proctorConfig,
    setQuestions,
    setAnswer,
    nextQuestion,
    previousQuestion,
    startQuiz,
    toggleFullscreen,
    setLoading,
    setError,
    setQuizActive,
  } = useQuizStore();

  // Initialize proctoring features
  const { sebDetected, violationCount } = useProctoring();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [fullscreenExitAttempts, setFullscreenExitAttempts] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [cheatingAttempts, setCheatingAttempts] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  
  const devToolsCheckRef = useRef<NodeJS.Timeout | null>(null);
  const tabSwitchRef = useRef<boolean>(false);

  // Get timer duration based on question index (10 questions total)
  const getQuestionTimeLimit = () => {
    // Questions 0-3 (beginner)
    if (currentQuestionIndex < 4) {
      return 30;
    }
    // Questions 4-6 (intermediate)
    if (currentQuestionIndex < 7) {
      return 45;
    }
    // Questions 7-9 (advanced)
    return 60;
  };

  // Generate questions in batches (4 beginner, 3 intermediate, 3 advanced) with randomization
  const generateQuestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add timestamp and random parameter to prevent caching
      const timestamp = Date.now();
      const random = Math.random();
      const sessionNonce = `${sessionId}-${timestamp}-${random}`;

      // Helper to fetch a batch by difficulty
      const fetchBatch = async (
        difficulty: 'beginner' | 'intermediate' | 'advanced',
        count: number,
        offset: number
      ) => {
        const response = await fetch('/api/ai/mocktest/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
          body: JSON.stringify({
            careerPath,
            difficulty,
            count,
            timestamp: timestamp + offset,
            random: random + offset * 0.01,
            sessionId: `${sessionNonce}-${difficulty}`,
            forceNew: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate ${difficulty} questions`);
        }

        return response.json();
      };

      // Generate beginner/intermediate/advanced questions (4/3/3)
      const beginnerResponse = await fetch('/api/ai/mocktest/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          careerPath: careerPath,
          difficulty: 'beginner',
          count: 4,
          timestamp,
          random,
          sessionId: `${sessionNonce}-beginner`,
          forceNew: true,
        }),
      });

      if (!beginnerResponse.ok) {
        throw new Error('Failed to generate beginner questions');
      }

      const beginnerData = await beginnerResponse.json();
      const intermediateData = await fetchBatch('intermediate', 3, 1);
      const advancedData = await fetchBatch('advanced', 3, 2);

      // Combine and ensure uniqueness by question text
      const combined = [
        ...shuffleArray(beginnerData.questions ?? []),
        ...shuffleArray(intermediateData.questions ?? []),
        ...shuffleArray(advancedData.questions ?? []),
      ];

      const uniqueQuestions: typeof combined = [];
      const seen = new Set<string>();
      combined.forEach((question) => {
        const signature = `${question.question}`.toLowerCase();
        if (!seen.has(signature)) {
          seen.add(signature);
          uniqueQuestions.push(question);
        }
      });

      setQuestions(uniqueQuestions.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle algorithm for question randomization
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Timer effect - start when questions are loaded and enter fullscreen
  useEffect(() => {
    if (questions.length > 0 && !startTime) {
      // Show fullscreen prompt instead of auto-entering
      setShowFullscreenPrompt(true);
    }
  }, [questions.length, startTime]);

  // Prevent browser back/forward navigation during active quiz
  useEffect(() => {
    if (!startTime) return;

    // Block browser navigation buttons
    const blockNavigation = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
      alert('Navigation is disabled during the quiz. Please complete or finish the test.');
    };

    // Push initial state to prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', blockNavigation);

    return () => {
      window.removeEventListener('popstate', blockNavigation);
    };
  }, [startTime]);

  // Function to start quiz in fullscreen (triggered by user click)
  const handleStartQuizFullscreen = async () => {
    setShowFullscreenPrompt(false);
    
    try {
      // Enter fullscreen - MUST be called directly from user interaction
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (!isFullscreen) {
          toggleFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen not supported or denied:', err);
      // Continue without fullscreen if it fails
    }
    
    // Request wake lock to keep screen on
    requestWakeLock();
    // Start quiz timer
    startQuiz();
  };

  // Wake Lock functions to prevent screen from sleeping
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        console.log('Wake Lock activated');
        
        // Re-acquire wake lock if it's released (e.g., tab becomes inactive)
        lock.addEventListener('release', () => {
          console.log('Wake Lock released');
        });
      }
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        console.log('Wake Lock manually released');
      } catch (err) {
        console.warn('Error releasing wake lock:', err);
      }
    }
  };

  // Clean up wake lock when component unmounts or quiz ends
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  // Timer effect - update elapsed time
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Question timer effect
  useEffect(() => {
    if (questions.length === 0 || isAutoAdvancing) return;

    // Reset timer when question changes
    setQuestionTimer(0);

    const timer = setInterval(() => {
      setQuestionTimer((prev) => {
        const newTime = prev + 1;
        const timeLimit = getQuestionTimeLimit();

        // Auto-advance when time is up
        if (newTime >= timeLimit) {
          handleAutoAdvance();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, questions.length, isAutoAdvancing]);

  const handleAutoAdvance = () => {
    if (isAutoAdvancing) return;

    setIsAutoAdvancing(true);
    const currentQuestion = questions[currentQuestionIndex];
    const hasAnswer = answers[currentQuestion?.id];

    // If no answer selected, skip the question (don't save)
    // If answer selected, it's already saved in the store

    // Move to next question or finish
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        nextQuestion();
      } else {
        // Last question - go to results
        setQuizActive(false);
        router.push(`/home/my-tracks/${params.id}/mocktest/results`);
      }
      setIsAutoAdvancing(false);
    }, 500);
  };

  // Fullscreen handling with exit prevention and alert system
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If user exits fullscreen during active quiz
      if (!document.fullscreenElement && isFullscreen && startTime) {
        toggleFullscreen();
        
        // Check if this is the first exit attempt
        if (fullscreenExitAttempts === 0) {
          // First attempt - show warning and start timer
          setFullscreenExitAttempts(1);
          setShowExitWarning(true);
          setIsAlertActive(true);
          
          // Set 3-second timer for auto-fullscreen
          alertTimerRef.current = setTimeout(async () => {
            // Auto re-enter fullscreen after 3 seconds
            try {
              if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
                setShowExitWarning(false);
                setIsAlertActive(false);
                if (!isFullscreen) {
                  toggleFullscreen();
                }
              }
            } catch (err) {
              console.warn('Could not auto re-enter fullscreen:', err);
              setShowExitWarning(false);
              setIsAlertActive(false);
            }
          }, 3000);
        } else {
          // Second or subsequent attempt - immediately end test
          releaseWakeLock();
          setQuizActive(false);
          router.push(`/home/my-tracks/${params.id}/mocktest/results`);
        }
      } else if (document.fullscreenElement && !isFullscreen) {
        // Sync state when entering fullscreen
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, [isFullscreen, startTime, fullscreenExitAttempts]);

  // Tab switch detection - immediately end test
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && startTime) {
        tabSwitchRef.current = true;
      } else {
        // Tab is now visible again - immediately end test
        if (tabSwitchRef.current && startTime) {
          tabSwitchRef.current = false;
          
          // Immediately auto-submit test on tab switch
          releaseWakeLock();
          setQuizActive(false);
          router.push(`/home/my-tracks/${params.id}/mocktest/results`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTime]);

  // Copy/paste prevention
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleCheatingAttempt('Copy attempt detected');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleCheatingAttempt('Cut attempt detected');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleCheatingAttempt('Paste attempt detected');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // DevTools detection
  useEffect(() => {
    const detectDevTools = () => {
      // Simple DevTools detection using console check
      const start = new Date().getTime();
      // This will take longer if DevTools is open
      debugger;
      const end = new Date().getTime();
      
      // If the difference is significant, DevTools might be open
      if (end - start > 100) {
        if (!devToolsOpen) {
          setDevToolsOpen(true);
          handleCheatingAttempt('Developer tools detected');
        }
      } else {
        setDevToolsOpen(false);
      }
    };

    // Check periodically
    devToolsCheckRef.current = setInterval(detectDevTools, 1000);

    return () => {
      if (devToolsCheckRef.current) {
        clearInterval(devToolsCheckRef.current);
      }
    };
  }, [devToolsOpen]);

  // Right-click prevention
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleCheatingAttempt('Right-click attempt detected');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Keyboard shortcuts prevention with alert detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If alert is active and user presses any key, end the test
      if (isAlertActive) {
        e.preventDefault();
        if (alertTimerRef.current) {
          clearTimeout(alertTimerRef.current);
        }
        setIsAlertActive(false);
        setShowExitWarning(false);
        releaseWakeLock();
        setQuizActive(false);
        router.push(`/home/my-tracks/${params.id}/mocktest/results`);
        return;
      }
      
      // Prevent common shortcuts
      if (
        e.ctrlKey || 
        e.shiftKey || 
        e.altKey || 
        e.metaKey || 
        e.key === 'F12' ||
        e.key === 'F5' ||
        e.key === 'Escape'
      ) {
        // Allow F5 only if not in fullscreen (to prevent refresh)
        if (e.key === 'F5' && !isFullscreen) return;
        
        // Allow Escape only if in fullscreen (to exit fullscreen)
        if (e.key === 'Escape' && isFullscreen) return;
        
        e.preventDefault();
        handleCheatingAttempt('Keyboard shortcut attempt detected');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, isAlertActive]);

  // Click detection during alert - end test if user clicks anywhere except the button
  useEffect(() => {
    if (!isAlertActive) return;

    const handleClick = (e: MouseEvent) => {
      // Check if click is on the "Enable Fullscreen" button
      const target = e.target as HTMLElement;
      if (target.closest('.fullscreen-enable-btn')) {
        return; // Allow this click
      }
      
      // Any other click ends the test
      e.preventDefault();
      e.stopPropagation();
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
      setIsAlertActive(false);
      setShowExitWarning(false);
      releaseWakeLock();
      setQuizActive(false);
      router.push(`/home/my-tracks/${params.id}/mocktest/results`);
    };

    // Use capture phase to catch clicks before they reach other handlers
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isAlertActive]);

  // Cursor confinement - prevent cursor from leaving test area
  useEffect(() => {
    if (!startTime) return; // Only confine during active test

    const handleMouseMove = (e: MouseEvent) => {
      const testContainer = document.querySelector('.quiz-container') as HTMLElement;
      if (!testContainer) return;

      const rect = testContainer.getBoundingClientRect();
      const padding = 10; // Small padding to prevent edge issues

      // Confine cursor within test container bounds
      if (e.clientX < rect.left + padding) {
        (e.target as HTMLElement)?.style.setProperty('cursor', 'not-allowed');
      } else if (e.clientX > rect.right - padding) {
        (e.target as HTMLElement)?.style.setProperty('cursor', 'not-allowed');
      } else if (e.clientY < rect.top + padding) {
        (e.target as HTMLElement)?.style.setProperty('cursor', 'not-allowed');
      } else if (e.clientY > rect.bottom - padding) {
        (e.target as HTMLElement)?.style.setProperty('cursor', 'not-allowed');
      } else {
        (e.target as HTMLElement)?.style.setProperty('cursor', 'default');
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Prevent cursor from leaving test area
      const testContainer = document.querySelector('.quiz-container') as HTMLElement;
      if (!testContainer) return;

      const rect = testContainer.getBoundingClientRect();
      
      // If cursor tries to leave, show warning
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        handleCheatingAttempt('Cursor left test area');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startTime]);

  // Handle cheating attempts
  const handleCheatingAttempt = (message: string) => {
    console.log('Cheating attempt detected:', message);
    
    setCheatingAttempts(prev => {
      const newAttempts = prev + 1;
      
      if (newAttempts >= 2) {
        // End quiz after 2 cheating attempts
        releaseWakeLock();
        setQuizActive(false);
        router.push(`/home/my-tracks/${params.id}/mocktest/results`);
      } else {
        // Show warning
        setShowCheatingWarning(true);
        setTimeout(() => {
          setShowCheatingWarning(false);
        }, 3000);
      }
      
      return newAttempts;
    });
  };

  const handleToggleFullscreen = async () => {
    // Prevent manual fullscreen toggle during quiz
    return;
  };

  // Handle Enable Fullscreen button click
  const handleEnableFullscreen = async () => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
    
    setIsAlertActive(false);
    
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setShowExitWarning(false);
        if (!isFullscreen) {
          toggleFullscreen();
        }
      }
    } catch (err) {
      console.warn('Could not re-enter fullscreen:', err);
      setShowExitWarning(false);
    }
  };

  const handleFinish = () => {
    releaseWakeLock();
    setQuizActive(false);
    router.push(`/home/my-tracks/${params.id}/mocktest/results`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Min`;
  };

  // Check for Safe Exam Browser requirement
  if (proctorConfig.requireSEB && !sebDetected) {
    return <SEBBlockScreen />;
  }

  // Show loading screen while generating questions
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
        
        <div className="text-center relative z-10">
          {/* Animated loader */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Outer spinning ring */}
            <motion.div
              className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle spinning ring */}
            <motion.div
              className="absolute inset-2 border-4 border-transparent border-t-purple-500 border-l-purple-400 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner pulsing circle */}
            <motion.div
              className="absolute inset-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          {/* Animated text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Mock Test
              </motion.span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg mb-4">Creating personalized questions...</p>
            
            {/* Loading dots */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Progress indicator */}
          <motion.div
            className="mt-8 max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    // Always generate fresh questions when component mounts
    generateQuestions();
    return null;
  }

  // Show fullscreen prompt before starting quiz
  if (showFullscreenPrompt) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center relative overflow-hidden p-2 sm:p-4">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 sm:p-5 md:p-6 max-w-3xl w-full mx-auto relative z-10 h-[95vh] flex flex-col overflow-hidden"
        >
          {/* Logo/Icon */}
          <div className="flex justify-center mb-3 sm:mb-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm border border-slate-200">
              <Maximize className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" strokeWidth={2} />
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center flex-shrink-0">Test Instructions</h2>
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 sm:space-y-4 pr-2">
            {/* Rules and Regulations */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span>Rules & Regulations</span>
              </h3>
              
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">1</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold">Fullscreen Mode Required:</span> The test will start in fullscreen mode and must remain in fullscreen until completion.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">2</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold">No Exit Allowed:</span> Attempting to exit fullscreen will trigger a warning. A second attempt will automatically end your test.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">3</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold">Mixed Questions:</span> The test contains 10 carefully selected questions covering various topics and complexity levels.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">4</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold">Timed Questions:</span> Each question has a time limit based on its complexity (30-60 seconds).
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">5</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold text-red-600">No Tab Switching:</span> Switching tabs or minimizing the browser will immediately end your test. No warnings given.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">6</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold">Screen Lock:</span> Your screen will remain active throughout the test to prevent interruptions.
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold">!</div>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                    <span className="font-semibold text-red-600">Security Measures:</span> Tab switching will immediately end your test. Copy/paste and DevTools are blocked.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Important Notice */}
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1 text-sm sm:text-base">Important Notice</h4>
                  <p className="text-red-800 text-xs sm:text-sm leading-relaxed">
                    Ensure you have a stable internet connection and are in a quiet environment before starting. Once you begin, the test cannot be paused.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer buttons - fixed at bottom */}
          <div className="flex-shrink-0 mt-3 sm:mt-4 space-y-2">
            <motion.button
              onClick={handleStartQuizFullscreen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Mock Test
            </motion.button>
            
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              By clicking the button above, you agree to follow all test rules and regulations.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedAnswer = answers[currentQuestion.id];
  const timeLimit = getQuestionTimeLimit();
  const remainingTime = timeLimit - questionTimer;
  const timerProgress = (questionTimer / timeLimit) * 100;
  const isTimerCritical = remainingTime <= 10;


  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 relative flex flex-col">
      {/* Watermark overlay */}
      {proctorConfig.enableWatermark && (
        <Watermark careerPath={careerPath} sessionId={sessionId} />
      )}
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Cheating Warning */}
      <AnimatePresence>
        {showCheatingWarning && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg font-semibold text-sm"
          >
            Warning: Tab switching detected! Returning to fullscreen... (no attempt remaining)
          </motion.div>
        )}
      </AnimatePresence>

      <div className="quiz-container relative flex-1 p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-2 sm:mb-3 md:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 w-full flex-shrink-0">
          <div className="flex-shrink-0">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Mock Test</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 truncate max-w-[200px] sm:max-w-none">{careerPath}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Progress */}
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-20 sm:w-32 md:w-48 lg:w-64 bg-gray-200 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                />
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700 min-w-[2rem] sm:min-w-[2.5rem]">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-gray-700">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <span className="font-mono text-xs sm:text-sm md:text-base lg:text-lg">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        {/* Question Container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
          {/* Fullscreen Exit Warning with Enable Button */}
          <AnimatePresence>
            {showExitWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-2xl p-6 md:p-8 max-w-md mx-4 shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
                    >
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-3">⚠️ ALERT!</h3>
                    <p className="text-gray-900 text-base md:text-lg mb-2 font-bold">
                      Fullscreen Exited!
                    </p>
                    <p className="text-gray-700 text-sm md:text-base mb-4">
                      Click the button below to continue the test.
                    </p>
                    <p className="text-red-600 text-xs md:text-sm font-semibold mb-6">
                      ⚠️ Clicking anywhere else or pressing any key will END your test!
                    </p>
                    
                    <motion.button
                      onClick={handleEnableFullscreen}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="fullscreen-enable-btn px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Enable Fullscreen
                    </motion.button>
                    
                    <p className="text-gray-500 text-xs mt-4">
                      Click to Enable Fullscreen.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto-advance notification */}
          {isAutoAdvancing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-full shadow-lg font-semibold text-sm md:text-base"
            >
              {selectedAnswer ? 'Answer saved! Moving to next...' : 'Time up! Skipping question...'}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl h-full flex flex-col px-2 sm:px-4"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col overflow-hidden">
              {/* Question Number */}
              <div className="flex justify-between items-center mb-1 sm:mb-2 md:mb-3 flex-shrink-0">
                <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm">Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>

              {/* Question Timer */}
              <div className="mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600">Time</span>
                    {isTimerCritical && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold tabular-nums ${
                    isTimerCritical ? 'text-red-600 animate-pulse' : 'text-blue-600'
                  }`}>
                    {remainingTime}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${timerProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full rounded-full ${
                      isTimerCritical
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4 leading-tight sm:leading-snug flex-shrink-0 line-clamp-3 sm:line-clamp-none">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-1.5 sm:space-y-2 md:space-y-2.5 flex-1 min-h-0 flex flex-col overflow-y-auto">
                {Object.entries(currentQuestion.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setAnswer(currentQuestion.id, key as 'A' | 'B' | 'C' | 'D')}
                      className={`w-full p-2 sm:p-2.5 md:p-3 rounded-md sm:rounded-lg md:rounded-xl border sm:border-2 transition-all duration-200 text-left flex items-center justify-between flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        {/* Option Letter */}
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 flex-shrink-0 rounded sm:rounded-md flex items-center justify-center font-semibold text-xs sm:text-sm md:text-base ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-600 border sm:border-2 border-gray-300'
                          }`}
                        >
                          {key}
                        </div>
                        
                        {/* Option Text */}
                        <span className="text-gray-700 text-xs sm:text-sm md:text-base break-words line-clamp-2 sm:line-clamp-none">{value}</span>
                      </div>

                      {/* Radio indicator */}
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 rounded-full border sm:border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500"
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 md:mt-4 flex items-center justify-center flex-shrink-0 w-full"
        >
          {/* Next/Finish Button */}
          {currentQuestionIndex < questions.length - 1 ? (
            <motion.button
              onClick={nextQuestion}
              disabled={isAutoAdvancing}
              whileHover={{ scale: isAutoAdvancing ? 1 : 1.05 }}
              whileTap={{ scale: isAutoAdvancing ? 1 : 0.95 }}
              className={`flex items-center gap-1.5 md:gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base shadow-md ${
                isAutoAdvancing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              <span>Next Question</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </motion.div>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinish}
              disabled={isAutoAdvancing}
              whileHover={{ scale: isAutoAdvancing ? 1 : 1.05 }}
              whileTap={{ scale: isAutoAdvancing ? 1 : 0.95 }}
              className={`relative overflow-hidden px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base shadow-lg ${
                isAutoAdvancing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl hover:from-emerald-600 hover:to-teal-700'
              }`}
            >
              <motion.span
                animate={isAutoAdvancing ? {} : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                Finish Quiz
              </motion.span>
              {!isAutoAdvancing && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ opacity: 0.2 }}
                />
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}