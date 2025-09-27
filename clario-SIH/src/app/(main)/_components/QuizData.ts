export const quizData = {
  "12": {
    "12th student": {
      "choose career paths": {
        focus_specific: [
          {
            question: "Which stream are you in?",
            options: ["Medical", "Science", "Commerce", "Arts"],
          },
          {
            question: "How confident are you in your chosen stream?",
            options: ["Very confident", "Neutral", "Unsure"],
          },
          {
            question: "Why did you choose this stream?",
            options: [
              "Passion",
              "High salary",
              "Social impact",
              "Family influence",
            ],
          },
          {
            question:
              "Along with your stream, what additional skill/interest would you like to build?",
            options: [
              "Technical",
              "Creative",
              "Sports",
              "Entrepreneurship",
              "Others",
            ],
          },
          {
            question: "Which type of College do you prefer or are you open to?",
            options: ["Government", "private", "any"],
          },
        ],
        deep_understanding: [
          {
            question:
              "Tell us about your interests and hobbies outside academics.",
          },
          {
            question:
              "What is your biggest confusion about choosing a career path?",
            options: [
              "Finding my strengths",
              "Future growth",
              "Too many choices",
              "Family pressure",
              "Lack of guidance",
            ],
          },
          {
            question: "What matters most to you in a career?",
            options: [
              "Job security",
              "High income",
              "Work-life balance",
              "Passion",
            ],
          },
          {
            question: "Which type of activities excite you the most?",
            options: [
              "Problem-solving tasks",
              "Creative projects",
              "Helping people",
              "Leadership roles",
              "Making a difference",
            ],
          },
          {
            question: "What motivates you the most to work hard?",
            options: [
              "Personal growth",
              "Earning money",
              "Recognition/Respect",
              "Making a difference in society",
            ],
          },
        ],
      },

      "skill building": {
        focus_specific: [
          {
            question: "Which stream are you in?",
            options: ["Medical", "Science", "Commerce", "Arts"],
          },
          {
            question: "Which skills are you most interested in building?",
            options: [
              "Technical",
              "Communication",
              "Creative",
              "Leadership",
              "Entrepreneurship",
            ],
          },
          {
            question: "Why do you want to build this skill?",
            options: [
              "Career growth",
              "Personal interest",
              "Academic requirement",
            ],
          },
          {
            question:
              "How much time per week can you dedicate to skill-building?",
          },
        ],
        learning_style: [
          {
            question: "Do you learn skills better through practice or theory?",
            options: ["Practice", "Theory", "Both"],
          },
          {
            question:
              "What type of projects/tasks excite you the most while learning?",
          },
        ],
        deep_understanding: [
          {
            question:
              "Which skills do you feel are most important for your future career?",
          },
          {
            question:
              "What’s stopping you right now from improving these skills?",
            options: ["Time", "Resources", "Motivation"],
          },
        ],
      },
    },
  },
  "10": {
    "10th student": {
      "career/ path guidance": {
        focus_specific: [
          {
            question: "In Which Stream are you most interested in?",
            options: ["Medical", "Commerce", "Arts", "Science"],
          },
          {
            question: "How confident are you in your chosen subjects?",
            options: ["Very confident", "Somewhat confident", "Not confident"],
          },
          {
            question: "Why did you choose this path?",
            options: [
              "Passion",
              "High salary job",
              "Social impact",
              "Family influence",
            ],
          },
          {
            question:
              "Along with your main subjects, what other skills would you like to build?",
            options: [
              "Technical",
              "Creative",
              "Sports",
              "Entrepreneurship",
              "Others",
            ],
          },
        ],
        deep_understanding: [
          {
            question: "What is your biggest confusion about choosing a career?",
          },
          {
            question: "What matters most to you in a future career?",
            options: [
              "Job security",
              "Passion",
              "Work-life balance",
              "High income",
            ],
          },
        ],
      },
      "skill building": {
        focus_specific: [
          {
            question: "Which skills are you most interested in building?",
            options: ["Coding", "Design", "Public speaking", "Arts", "Others"],
          },
          {
            question: "Why do you want to build this skill?",
            options: ["Career growth", "Hobby", "Extra income", "Confidence"],
          },
          {
            question:
              "How confident are you in learning new skills outside school subjects?",
            options: ["Very confident", "Somewhat confident", "Not confident"],
          },
          {
            question:
              "Do you want to link this skill to your future career path?",
            options: ["Yes", "No", "Not sure"],
          },
        ],
        learning_style: [
          {
            question:
              "Do you learn skills better with online tutorials, workshops, or self-practice?",
            options: ["Online tutorials", "Workshops", "Self-practice"],
          },
          {
            question:
              "Do you prefer individual projects or learning in groups?",
            options: ["Individual projects", "Group learning"],
          },
        ],

        deep_understanding: [
          {
            question: "What’s your biggest challenge in building new skills?",
            options: ["Time", "Resources", "Confidence", "Guidance"],
          },
          {
            question:
              "Which motivates you more: mastering skills for career or for passion?",
            options: ["Career", "Passion", "Both equally"],
          },
        ],
      },
    },
  },
};

export type QuizQuestion = {
  question: string;
  options?: string[];
};

export type QuizSection = {
  [section: string]: QuizQuestion[];
};

export type FocusBlock = {
  [focus: string]: QuizSection;
};

export type StudentBlock = {
  [student: string]: FocusBlock;
};

export type QuizData = {
  "10": StudentBlock;
  "12": StudentBlock;
};
