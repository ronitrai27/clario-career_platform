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

export type DBUser = {
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
  google_refresh_token: string;
  isPro: boolean;
};

export type UserQuizData = {
  id: number;
  created_at: string;
  quizInfo: Record<string, any>; //depends on user current_status and mainFocus
  userId: string;
  user_current_status: string;
  user_mainFocus: string;
  userName: string;
  userAvatar: string;
  selectedCareer: string;
};

export type UserCalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  start: Date; // mapped from start_time
  end: Date; // mapped from end_time
  created_at?: string;
  updated_at?: string;
  google_event_id?: string;
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

export type QuizCollegeQues = {
  id: string;
  question: string;
  key: string;
  options: string[];
  type: "single" | "multiple";
};


export type MentorSession = {
  id: string;
  mentor_id: string;
  student_id: string;
  session_type: "10 min session" | "30 min session" | "45 min session";
  status: "pending" | "accepted" | "rejected" | "completed";
  requested_at: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  vc_link?: string | null;
  reviews?: string ;
  mentorName: string;
  mentorAvatar: string | null;
};

export type JobTrackerCard = {
  id: number;
  created_at: string;
  userId: any;
  stage: string;
  job_title: string;
  company: string;
  applied_date: string;
  type: string;
  description: string;
  note?: string;
};
// stage: "saved" | "applied" | "interviewing" | "negotiating" | "hired" | "rejected";
// type: "full-time" | "internship" | "contract" | "freelance" | "part-time";

// OTHERS TABLE
export interface InterviewFeedback {
  id: number;
  created_at: string;
  userId: any;
  jobTitle: string;
  interviewInsights: {
    feedback: {
      rating: {
        technicalSkills?: number;
        communication?: number;
        problemSolving?: number;
        experience?: number;
      };
      summary?: string;
    };
  };
}

export type Notification = {
  id: number; 
  userId: string; 
  message: string; 
  created_at: string; 
};
// ====================
// ROAMAP==============
interface myRoadmap {
  id: number;
  user_id: any;
  roadmap_data: any;
  created_at: string;
  isStarted: boolean;
  timeline: string;
  mode: string;
  status: string;   // STATUS - going_on / completed / paused / not_started
  progress: number; 
}

// ====================
// TRACKS==============
export interface SubTopic {
  subtopic_order: number;
  title: string;
  overview: string;
  resources: string[];  // learning resouce links by AI
  youtube_videos: string[]; // this will be by YT 
}

export interface Checkpoint {
  checkpoint_order: number;
  title: string;
  description?: string;
  skills: string[];          // 3-4 skills for checkpoint
  topics_covered: string[];  // 4 bullet points
  isMockDone: boolean;       // unlock next checkpoint
  subtopics: SubTopic[];     // ← subtopics  here
}

// table Tracks--
export interface RoadmapTrack {
  id?: number;
  roadmap_id: number; //FK to roadmap table
  user_id: any; // FK to user table
  checkpoints: Checkpoint[];   // ALL checkpoints here
}

