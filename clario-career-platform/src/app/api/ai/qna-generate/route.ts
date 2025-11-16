/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

interface InterviewRequest {
  jobTitle: string;
  jobDescription: string;
}

const questionSchema = z.array(
  z.object({
    interviewQuestions: z.array(
      z.object({
        question: z.string().describe("The interview question"),
      })
    ),
  })
);

const parser = StructuredOutputParser.fromZodSchema(questionSchema as any);

const promptTemplate = PromptTemplate.fromTemplate(`
Based on the following inputs, generate 6-7 high-quality interview questions:
Job Title: {jobTitle}
Job Description: {jobDescription}

Your task:
- Analyze the job description to identify the key skills, technologies, and experience needed.
- Generate:
  - 2 easy-level questions (to test basic understanding),
  - 2-3 moderate-level questions (to test applied skills),
  - 1-2 advanced-level questions (to test deep expertise or problem-solving ability).
  - Each question should be short to medium length, clear, and suitable for an oral conversation enough to understand the candidate's skills.
- Make sure the questions are realistic, relevant, and diverse in focus (e.g., theory, application, reasoning).
- Return a JSON array containing a single object with the key 'interviewQuestions' containing an array of objects with 'question' field.
- Do not include markdown, explanations, or extra text.

{format_instructions}
`);

const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.7,
  maxTokens: 600,
  maxRetries: 3,
});

const chain = promptTemplate.pipe(llm).pipe(parser);

export async function POST(request: Request) {
  try {
    const body: InterviewRequest = await request.json();
    const { jobTitle, jobDescription } = body;

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { isError: true, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const input = {
      jobTitle,
      jobDescription,
      format_instructions: parser.getFormatInstructions(),
    };

    // Run the chain
    const result = await chain.invoke(input);

    // Fallback to extract inner object for UI
    const finalResult =
      Array.isArray(result) && result[0]?.interviewQuestions
        ? { interviewQuestions: result[0].interviewQuestions }
        : result;

    return NextResponse.json({ data: finalResult });
  } catch (error: any) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(
      { isError: true, error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
