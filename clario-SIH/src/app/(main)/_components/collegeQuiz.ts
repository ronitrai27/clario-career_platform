import { QuizCollegeQues } from "@/lib/types/allTypes";

export const quizData: QuizCollegeQues[] = [
  {
    id: "q1",
    question: "What the main moto of yours joining a college?",
    key: "moto",
    options: ["Academics", "Placement", "Good Environment"],
    type: "single",
  },
  {
    id: "q2",
    question: "What type of college would you prefer?",
    key: "type",
    options: ["Private", "Government", "Any"], 
    type: "single",
  },
  {
    id: "q3",
    question: "Which location preference suits you best?",
    key: "location",
    options: ["Nearby cities", "Far away cities", "Flexible with any location"],
    type: "single",
  },
  {
    id: "q4",
    question: "Do you have any budget constraints? Your typical budget.",
    key: "fees",
    options: [
      "Below ₹50,000",
      "₹50,000 - ₹1,00,000",
      "₹1,00,000 - ₹2,00,000",
      "Above ₹2,00,000",
    ],
    type: "single",
  },
  {
    id: "q5",
    question: "How important is campus placement to you?",
    key: "placement",
    options: [
      "Very important (Top recruiters & high packages)",
      "Moderately important (Good average package)",
      "Not a priority (Focus on academics/research)",
    ],
    type: "single",
  },
  {
    id: "q6",
    question:
      "Would you like your college recommendations to prioritize any of these?",
    key: "priority",
    options: [
      "Low Fees",
      "High Placement Rate",
      "Top Ranking",
      "Best Fit for My Course",
    ],
    type: "multiple",
  },
];
