import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ScreenshotDetector,
  ClipboardMonitor,
  MouseTracker,
  SEBDetector,
  MultiTabDetector,
  BrowserLockdown,
} from '@/lib/functions/MockTest/Security';
import { useQuizStore } from '@/lib/functions/MockTest/QuizStore';

export function useProctoring() {
  const router = useRouter();
  const {
    sessionId,
    userEmail,
    proctorConfig,
    sebDetected,
    setSEBDetected,
    incrementViolation,
    violationCount,
  } = useQuizStore();

  const screenshotDetectorRef = useRef<ScreenshotDetector | null>(null);
  const clipboardMonitorRef = useRef<ClipboardMonitor | null>(null);
  const mouseTrackerRef = useRef<MouseTracker | null>(null);
  const multiTabDetectorRef = useRef<MultiTabDetector | null>(null);
  const browserLockdownRef = useRef<BrowserLockdown | null>(null);

  useEffect(() => {
    // Check for Safe Exam Browser if required
    if (proctorConfig.requireSEB) {
      const isSEB = SEBDetector.detect();
      setSEBDetected(isSEB);
      
      if (!isSEB) {
        // Block exam if SEB is required but not detected
        return;
      }
    }

    // Initialize Screenshot Detection
    if (proctorConfig.enableScreenshotDetection) {
      screenshotDetectorRef.current = new ScreenshotDetector(
        sessionId,
        userEmail,
        () => {
          incrementViolation();
        }
      );
      screenshotDetectorRef.current.start();
    }

    // Initialize Clipboard Monitoring
    if (proctorConfig.enableClipboardMonitoring) {
      clipboardMonitorRef.current = new ClipboardMonitor(sessionId, userEmail);
      clipboardMonitorRef.current.start();
    }

    // Initialize Mouse Tracking
    if (proctorConfig.enableMouseTracking) {
      mouseTrackerRef.current = new MouseTracker(sessionId, userEmail);
      mouseTrackerRef.current.start();
    }

    // Initialize Multiple Tab Detection
    if (proctorConfig.enableMultiTabPrevention) {
      multiTabDetectorRef.current = new MultiTabDetector(
        sessionId,
        userEmail,
        () => {
          // Auto-submit when multiple tabs detected
          router.push('/results');
        }
      );
      multiTabDetectorRef.current.start();
    }

    // Initialize Browser Lockdown
    browserLockdownRef.current = new BrowserLockdown(
      sessionId,
      userEmail,
      (type) => {
        incrementViolation();
      }
    );
    browserLockdownRef.current.start();

    // Cleanup on unmount
    return () => {
      screenshotDetectorRef.current?.stop();
      clipboardMonitorRef.current?.stop();
      mouseTrackerRef.current?.stop();
      multiTabDetectorRef.current?.stop();
      browserLockdownRef.current?.stop();
    };
  }, [
    sessionId,
    userEmail,
    proctorConfig,
    setSEBDetected,
    incrementViolation,
    router,
  ]);

  // Monitor violation count and auto-submit if threshold exceeded
  useEffect(() => {
    const MAX_VIOLATIONS = 5;
    
    if (violationCount >= MAX_VIOLATIONS) {
      // Auto-submit quiz after too many violations
      router.push('/results');
    }
  }, [violationCount, router]);

  return {
    sebDetected,
    violationCount,
  };
}