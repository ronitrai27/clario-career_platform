import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

// --- Zod Schema
const followUpSchema = z.object({
  followUps: z.array(z.string()).optional(),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = StructuredOutputParser.fromZodSchema(followUpSchema as any);

// --- Prompt Template ---
const promptTemplate = PromptTemplate.fromTemplate(`
Conversation between Assistant and User:
{conversation}

Based on the above conversation, suggest 4 very short and natural follow-up questions
that a user might ask next. Focus on continuing the topic and being relevant. Dont make it too long.

Return ONLY JSON in this format, no other text or reponse is allowed:
{format_instructions}
`);

// --- LLM ---
const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.7,
  maxTokens: 300,
});

// --- Chain ---
const chain = promptTemplate.pipe(llm).pipe(parser);

// --- Usage ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conversationString: string = body.conversationString;

    if (!conversationString) {
      return NextResponse.json({ followUps: [] }, { status: 400 });
    }

    const input = {
      conversation: conversationString,
      format_instructions: parser.getFormatInstructions(),
    };

    // cleaning
    const result = (await chain.invoke(input)) as { followUps?: string[] };
    const followUps = Array.isArray(result.followUps)
      ? result.followUps.slice(0, 4)
      : [];

    return NextResponse.json({ followUps });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Follow-up API error:", err);
    return NextResponse.json({ followUps: [] }, { status: 500 });
  }
}
