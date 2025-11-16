// context/InterviewContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

const InterviewContext = createContext<any>(null);

export const InterviewProvider = ({ children }: { children: React.ReactNode }) => {
  const [interviewData, setInterviewData] = useState({
    jobTitle: "",
    questions: [],
  });

  return (
    <InterviewContext.Provider value={{ interviewData, setInterviewData }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => useContext(InterviewContext);
