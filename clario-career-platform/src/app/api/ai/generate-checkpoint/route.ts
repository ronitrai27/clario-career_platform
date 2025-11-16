/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// -----------------------------
// ZOD SCHEMA (NO YOUTUBE)
// -----------------------------
const subtopicSchema = z.object({
  subtopic_order: z.number(),
  title: z.string(),
  overview: z.string(),
  resources: z.array(z.string()), 
//   yt video excluded from here.
});

const outputSchema = z.object({
  skills: z.array(z.string()),
  topics_covered: z.array(z.string()), 
  subtopics: z.array(subtopicSchema), 
});

const parser = StructuredOutputParser.fromZodSchema(outputSchema as any);

// -----------------------------
// PROMPT TEMPLATE
// -----------------------------
const promptTemplate = PromptTemplate.fromTemplate(`
You are an experienced AI expert with strong mastery in generating structured learning content for roadmap checkpoints.

Generate the following for:

Checkpoint Title: {title}
Checkpoint Description: {description}

Rules:
- Provide exactly 3-4 skills overall learned in this checkpoint (Main Important skills only).
- Provide exactly 4 bullet points under topics_covered for this checkpoint.
- Provide exactly 2 subtopics.
- For each subtopic:
  - Add a concise title.
  - Add a 2-3 line overview.
  - Add 2 external learning resource links (blogs, docs, tutorials).
- No YouTube links.
- No markdown.
- No extra commentary.
- Return only clean JSON.

{format_instructions}

`);

// -----------------------------
// LLM CONFIG
// -----------------------------
const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.6,
  maxTokens: 1200,
  maxRetries: 3,
});

const chain = promptTemplate.pipe(llm).pipe(parser);

// -----------------------------
// API ROUTE
// -----------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { isError: true, error: "Missing title or description" },
        { status: 400 }
      );
    }

    const input = {
      title,
      description,
      format_instructions: parser.getFormatInstructions(),
    };

    const result = await chain.invoke(input);

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("❌ AI Generation Error:", error);
    return NextResponse.json(
      {
        isError: true,
        error: error.message || "Failed to generate checkpoint details",
      },
      { status: 500 }
    );
  }
}
