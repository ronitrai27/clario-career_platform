import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { Question, DifficultyLevel } from './QuizStore';
import { searchForCareerContent, getDifficultyFocus, generateUniqueSeed } from './SearchPipeline';

const MAX_RETRIES = 2;
const RETRY_DELAY = 500;
const REQUEST_TIMEOUT = 15000; 

class QuestionGenerationPipeline {
  private llm: ChatGroq;
  private promptTemplate: PromptTemplate;

  constructor() {
    // Initialize Groq LLM with error handling
    try {
      const apiKey = process.env.GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set');
      }
      
      this.llm = new ChatGroq({
        apiKey: apiKey,
        model: 'llama-3.1-8b-instant', // Ultra-fast model for quiz generation
        temperature: 0.7,
        maxTokens: 2000, // Optimized for speed
      });
    } catch (error) {
      console.error('Failed to initialize Groq LLM:', error);
      throw new Error('LLM initialization failed');
    }

    // Create prompt template for question generation
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert quiz creator. Generate {count} UNIQUE and DIFFERENT multiple choice questions specifically for "{careerPath}" at {difficulty} level.

IMPORTANT UNIQUENESS REQUIREMENTS:
- Every question MUST be completely different from any previous questions
- Use the unique seed value to ensure variety: {seed}
- Session ID for this quiz: {sessionId}
- NEVER repeat topics, scenarios, or question patterns
- Each question must cover a DIFFERENT aspect of "{careerPath}"
- Avoid similar phrasings or concepts across questions
- Use diverse question types: definitions, scenarios, comparisons, applications

{difficultyFocus}

{webContext}

Question Requirements:
- {difficulty} level appropriate
- Each question: 4 options (A, B, C, D)
- Highly relevant to "{careerPath}" career
- Clear and unambiguous
- Based on current industry standards and practices
- Cover diverse topics within "{careerPath}"
- Include practical scenarios specific to "{careerPath}"
- Mix theoretical knowledge with practical applications

Return ONLY valid JSON array (DO NOT include id field, it will be auto-generated):
[
  {{
    "question": "Question text?",
    "options": {{
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    }},
    "correctAnswer": "A"
  }}
]

No markdown, no explanations. JSON only.
Unique Seed: {seed}
Session: {sessionId}
Career: {careerPath}
    `);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseQuestions(text: string): Question[] {
    try {
      // Remove markdown code blocks if present
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON array in the text
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate each question
      return parsed.map((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer) {
          throw new Error(`Invalid question structure at index ${index}`);
        }

        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
          throw new Error(`Invalid correct answer at index ${index}`);
        }

        // Generate unique ID with timestamp and index to avoid duplicates
        const uniqueId = q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`;
        return {
          id: uniqueId,
          question: q.question,
          options: {
            A: q.options.A || '',
            B: q.options.B || '',
            C: q.options.C || '',
            D: q.options.D || '',
          },
          correctAnswer: q.correctAnswer,
        };
      });
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateQuestions(
    careerPath: string,
    difficulty: DifficultyLevel,
    count: number = 10,
    sessionId?: string
  ): Promise<Question[]> {
    let lastError: Error | null = null;

    // Start question generation immediately with a simple prompt if web search takes too long
    console.log(`Starting question generation for ${difficulty} level ${careerPath}...`);
    
    // Try to get web context but don't wait too long
    let webContext = '';
    try {
      console.log(`Fetching web content (3s timeout)...`);
      webContext = await searchForCareerContent(careerPath, difficulty);
    } catch (error) {
      console.log('Web search skipped, proceeding with AI generation');
      webContext = '';
    }
    
    // Get difficulty-specific focus
    const difficultyFocus = getDifficultyFocus(difficulty);
    
    // Generate unique seed for variety
    const seed = generateUniqueSeed();
    const uniqueSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Generating questions (attempt ${attempt}/${MAX_RETRIES})...`);

        // Format the prompt with web context and difficulty focus
        const prompt = await this.promptTemplate.format({
          careerPath,
          difficulty,
          count: count.toString(),
          difficultyFocus,
          webContext: webContext ? `\nWeb Search Results (use as reference for current, real-world content):\n${webContext}\n` : '',
          seed,
          sessionId: uniqueSessionId,
        });

        // Call LLM with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
          const response = await this.llm.invoke(prompt, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const content = typeof response.content === 'string' 
            ? response.content 
            : JSON.stringify(response.content);

          // Parse and validate questions
          const questions = this.parseQuestions(content);

          if (questions.length < Math.min(count, 10)) {
            console.warn(`Expected ${count} questions, got ${questions.length}. Accepting partial result.`);
          }

          console.log(`Successfully generated ${questions.length} questions with web-informed content`);
          return questions;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Attempt ${attempt} failed:`, lastError.message);

        if (attempt < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms...`);
          await this.delay(RETRY_DELAY * attempt);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to generate questions after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  // Fallback questions in case of complete failure
  getFallbackQuestions(difficulty: DifficultyLevel, careerPath?: string): Question[] {
    const baseQuestions: Question[] = [
      {
        id: 'q1',
        question: 'What is the primary purpose of version control systems like Git?',
        options: {
          A: 'To compile code',
          B: 'To track changes and collaborate on code',
          C: 'To deploy applications',
          D: 'To write documentation',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q2',
        question: 'Which of the following is a common software development methodology?',
        options: {
          A: 'Agile',
          B: 'Rainbow',
          C: 'Tornado',
          D: 'Lightning',
        },
        correctAnswer: 'A',
      },
      {
        id: 'q3',
        question: 'What does API stand for?',
        options: {
          A: 'Advanced Programming Interface',
          B: 'Application Programming Interface',
          C: 'Automated Program Interaction',
          D: 'Applied Protocol Integration',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q4',
        question: 'What is the purpose of a database index?',
        options: {
          A: 'To backup data',
          B: 'To improve query performance',
          C: 'To encrypt data',
          D: 'To compress data',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q5',
        question: 'Which HTTP method is typically used to retrieve data?',
        options: {
          A: 'POST',
          B: 'PUT',
          C: 'GET',
          D: 'DELETE',
        },
        correctAnswer: 'C',
      },
      {
        id: 'q6',
        question: 'What does CSS stand for?',
        options: {
          A: 'Computer Style Sheets',
          B: 'Cascading Style Sheets',
          C: 'Creative Style System',
          D: 'Colorful Style Sheets',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q7',
        question: 'What is the main purpose of unit testing?',
        options: {
          A: 'To test individual components in isolation',
          B: 'To test the entire application',
          C: 'To test user interface',
          D: 'To test network connections',
        },
        correctAnswer: 'A',
      },
      {
        id: 'q8',
        question: 'What does SQL stand for?',
        options: {
          A: 'Standard Query Language',
          B: 'Structured Question Language',
          C: 'Structured Query Language',
          D: 'System Query Language',
        },
        correctAnswer: 'C',
      },
      {
        id: 'q9',
        question: 'Which principle is NOT part of Object-Oriented Programming?',
        options: {
          A: 'Encapsulation',
          B: 'Inheritance',
          C: 'Compilation',
          D: 'Polymorphism',
        },
        correctAnswer: 'C',
      },
      {
        id: 'q10',
        question: 'What is the purpose of a CDN (Content Delivery Network)?',
        options: {
          A: 'To store database backups',
          B: 'To deliver content faster to users globally',
          C: 'To compile code',
          D: 'To manage user authentication',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q11',
        question: 'What is a RESTful API?',
        options: {
          A: 'An API that uses REST architectural principles',
          B: 'An API for resting services',
          C: 'An API that restarts servers',
          D: 'An API for restaurant services',
        },
        correctAnswer: 'A',
      },
      {
        id: 'q12',
        question: 'What is the purpose of Docker?',
        options: {
          A: 'To create virtual machines',
          B: 'To containerize applications',
          C: 'To write documentation',
          D: 'To test databases',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q13',
        question: 'What does CI/CD stand for?',
        options: {
          A: 'Code Integration / Code Deployment',
          B: 'Continuous Integration / Continuous Deployment',
          C: 'Computer Integration / Computer Development',
          D: 'Custom Integration / Custom Delivery',
        },
        correctAnswer: 'B',
      },
      {
        id: 'q14',
        question: 'What is the primary purpose of a load balancer?',
        options: {
          A: 'To distribute traffic across multiple servers',
          B: 'To balance hard drives',
          C: 'To optimize code',
          D: 'To manage databases',
        },
        correctAnswer: 'A',
      },
      {
        id: 'q15',
        question: 'What is the purpose of caching?',
        options: {
          A: 'To delete old data',
          B: 'To store frequently accessed data for faster retrieval',
          C: 'To backup data',
          D: 'To encrypt data',
        },
        correctAnswer: 'B',
      },
    ];

    return baseQuestions.map((question, index) => ({
      ...question,
      id: `${difficulty}-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
  }
}

// Singleton instance
let pipelineInstance: QuestionGenerationPipeline | null = null;

export const getQuestionPipeline = (): QuestionGenerationPipeline => {
  if (!pipelineInstance) {
    pipelineInstance = new QuestionGenerationPipeline();
  }
  return pipelineInstance;
};

export type { Question, DifficultyLevel };