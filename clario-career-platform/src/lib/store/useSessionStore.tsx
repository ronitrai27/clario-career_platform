import { create } from "zustand";

interface ActiveSession {
  id:any,
  userName: string;
  userEmail: string;
  avatar: string | null;
  session_type: string;
  session_id: string;
}

interface SessionState {
  activeSession: ActiveSession | null;
  setActiveSession: (session: ActiveSession) => void;
  clearActiveSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
  clearActiveSession: () => set({ activeSession: null }),
}));
