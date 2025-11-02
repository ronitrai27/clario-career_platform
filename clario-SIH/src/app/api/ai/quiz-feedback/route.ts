/* eslint-disable @typescript-eslint/no-explicit-any */
// api/ai/quiz-feedback/route.ts
import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

interface QuizRequest {
  quizData: { section: string; question: string; answer: string }[];
  userStatus: string;
  mainFocus: string;
}

function getSchemaAndPrompt(userStatus: string, mainFocus: string) {
  if (userStatus === "12th student") {
    const schema = z.object({
      insights: z.object({
        stream: z.string().optional(),
        Interest: z.string().optional(),
        collegePreference: z.string().optional(),
        degree: z.array(z.string()).optional(),
        summary: z.string().optional(),
        careerOptions: z.array(z.string()).optional(),
      }),
    });

    const prompt = PromptTemplate.fromTemplate(`
    Student Quiz Data:
    {quizData}

    Based on the above, extract structured career insights.

    Your task:
    - stream (detected stream from answers)
    - Interest (student's all interests he mentioned)
    - collegePreference (detect from quiz , what was student college preference:  government/private/any)
    - degree (list of 2-3 relevant degrees for this student according to their stream and careerOptions both. for example: BCA/MBA, B.TECH/M.TECH etc.)
    - summary (5-6-line summary about student profile and his choices he made in the quiz.)
    - careerOptions (list of 5 future career paths suitable for this student only basis of his interest , skills and confidence level)

    Return ONLY JSON in this format:
    {format_instructions}
    `);

    return { schema, prompt };
  }

  //  && mainFocus === "career/ path guidance"
  if (userStatus !== "12th student") {
    const schema = z.object({
      insights: z.object({
        stream: z.string().optional(),
        confidence: z.string().optional(),
        Interest: z.string().optional(),
        // reason: z.string().optional(),
        degree: z.array(z.string()).optional(),
        summary: z.string().optional(),
        careerOptions: z.array(z.string()).optional(),
      }),
    });

    const prompt = PromptTemplate.fromTemplate(`
    Student Quiz Data:
    {quizData}

    Based on the above, extract structured guidance for a User.

    Your task:
    - stream (Current stream of the student)
    - confidence (User's confidence level in that stream)
    - Interest (User's all interests he mentioned)
    - degree (list of 2-3 relevant degrees for this student according to their stream and careerOptions both. for example: BCA/MBA, B.TECH/M.TECH etc.)
    - summary (4-line profile summary of the student)
    - careerOptions (5 long-term career paths suitable for them according to their chosen stream)

    Return ONLY JSON in this format:
    {format_instructions}
    `);

    return { schema, prompt };
  }

  throw new Error("Unsupported userStatus + mainFocus combination");
}

const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.4,
  maxTokens: 600,
});

export async function POST(request: Request) {
  try {
    const body: QuizRequest = await request.json();
    const { quizData, userStatus, mainFocus } = body;

    if (!quizData || quizData.length === 0) {
      return NextResponse.json(
        { isError: true, error: "Missing quiz data" },
        { status: 400 }
      );
    }

    //  Pick schema + prompt dynamically ---
    const { schema, prompt } = getSchemaAndPrompt(userStatus, mainFocus);
    const parser = StructuredOutputParser.fromZodSchema(schema as any);
    const chain = prompt.pipe(llm).pipe(parser);

    //  Convert quiz data into plain string ---
    const quizString = quizData
      .map((q) => `${q.question}: ${q.answer}`)
      .join("\n");

    const input = {
      quizData: quizString,
      format_instructions: parser.getFormatInstructions(),
    };

    const result = (await chain.invoke(input)) as z.infer<typeof schema>;

    // Normalize (safe defaults to avoid UI crash) ---
    const finalResult = {
      insights: Object.fromEntries(
        Object.entries(result?.insights ?? {}).map(([key, val]) => [
          key,
          Array.isArray(val) ? val.filter(Boolean) : val ?? "",
        ])
      ),
    };

    return NextResponse.json({ data: finalResult });
  } catch (error: any) {
    console.error("❌ CAREER INSIGHT ERROR:", error);
    return NextResponse.json(
      { isError: true, error: error.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}
