import { create } from 'zustand';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Question {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface ProctorConfig {
  requireSEB: boolean;
  enableWatermark: boolean;
  enableScreenshotDetection: boolean;
  enableClipboardMonitoring: boolean;
  enableMouseTracking: boolean;
  enableMultiTabPrevention: boolean;
}

export interface QuizState {
  careerPath: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  startTime: number | null;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  isQuizActive: boolean;

  // Proctoring state
  sessionId: string;
  userEmail: string;
  proctorConfig: ProctorConfig;
  sebDetected: boolean;
  violationCount: number;

  
  // Actions
  setCareerPath: (path: string) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswer: (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  startQuiz: () => void;
  toggleFullscreen: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSessionId: (sessionId: string) => void;
  setUserEmail: (email: string) => void;
  setProctorConfig: (config: Partial<ProctorConfig>) => void;
  setSEBDetected: (detected: boolean) => void;
  incrementViolation: () => void;
  setQuizActive: (active: boolean) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  careerPath: '',
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,
  isFullscreen: false,
  isLoading: false,
  error: null,
  isQuizActive: false,
  
  // Proctoring state defaults
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userEmail: '',
  proctorConfig: {
    requireSEB: false,
    enableWatermark: true,
    enableScreenshotDetection: true,
    enableClipboardMonitoring: true,
    enableMouseTracking: true,
    enableMultiTabPrevention: true,
  },
  sebDetected: false,
  violationCount: 0,

  setCareerPath: (careerPath) => set({ careerPath }),
  setQuestions: (questions) =>
    set(() => ({
      questions,
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      isQuizActive: false,
    })),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    })),
  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
  startQuiz: () => set({ startTime: Date.now(), isQuizActive: true }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSessionId: (sessionId) => set({ sessionId }),
  setUserEmail: (userEmail) => set({ userEmail }),
  setProctorConfig: (config) =>
    set((state) => ({
      proctorConfig: { ...state.proctorConfig, ...config },
    })),
  setSEBDetected: (sebDetected) => set({ sebDetected }),
  incrementViolation: () =>
    set((state) => ({
      violationCount: state.violationCount + 1,
    })),
  setQuizActive: (isQuizActive) => set({ isQuizActive }),
  reset: () =>
    set({
      careerPath: '',
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      isLoading: false,
      error: null,
      isQuizActive: false,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: '',
      proctorConfig: {
        requireSEB: false,
        enableWatermark: true,
        enableScreenshotDetection: true,
        enableClipboardMonitoring: true,
        enableMouseTracking: true,
        enableMultiTabPrevention: true,
      },
      sebDetected: false,
      violationCount: 0,
    }),
}));