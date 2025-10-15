/* eslint-disable @typescript-eslint/no-explicit-any */
export type DBMentor = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  bio: string | null;
  expertise: string[];
  current_position: string;
  availability: boolean;
  rating: number;
  avatar: string | null;
  created_at: string;
  is_verified: boolean;
  video_url: string | null;
};

export type DBUser =  {
  id: number;
  userName: string;
  userEmail: string;
  avatar: string;
  created_at: string;
  totalCredits: number;
  remainingCredits: number;
  invite_link: string;
  current_status: string;
  userPhone: string;
  institutionName: string;
  mainFocus: string;
  calendarConnected: boolean;
  is_verified: boolean;
  isQuizDone: boolean;
  latitude: number;
  longitude: number;
}

export type UserQuizData =  {
  id: number; 
  created_at: string; 
  quizInfo: Record<string, any>; //depends on user current_status and mainFocus
  userId: string; 
  user_current_status: string; 
  user_mainFocus: string; 
  selectedCareer: string;
}

export type UserCalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  start: Date; // mapped from start_time
  end: Date;   // mapped from end_time
  created_at?: string;
  updated_at?: string;
};

export type MentorProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  bio: string | null;
  expertise: string[];
  current_position: string;
  availability: boolean;
  rating: number;
  avatar: string | null;
};

export type College = {
  id: string; 
  college_name: string;
  location: string;
  best_suit_for: string[];
  fees: string;
  placement: string;
  // inserted_at: string; 
  type: string;
};

export type MentorSession = {
  id: string;
  mentor_id: string;
  student_id: string;
  session_type: "30 min session" | "45 min session";
  status: "pending" | "accepted" | "rejected" | "completed";
  requested_at: string;   
  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  vc_link?: string | null;
};

export type JobTracker = {
  id: number;
  created_at: string; 
  userId: any; 
  stage: string;
  job_title: string;
  company: string;
  applied_date: string; 
  type: string;
  description: string;
  note: string;
};
// stage: "saved" | "applied" | "interviewing" | "negotiating" | "hired" | "rejected";
// type: "full-time" | "internship" | "contract" | "freelance" | "part-time";
