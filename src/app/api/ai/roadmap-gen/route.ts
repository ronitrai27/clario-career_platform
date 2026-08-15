/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import OpenAI from "openai";
// import { ChatGroq } from "@langchain/groq";
import { NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";
import { tavily } from "@tavily/core";

// Schema non-strict
const RoadmapSchema = z.object({
  roadmapTitle: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  initialNodes: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.string().optional(),
        position: z
          .object({
            x: z.number().optional(),
            y: z.number().optional(),
          })
          .optional(),
        data: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            link: z.string().optional(),
          })
          .optional(),
      })
    )
    .optional(),
  initialEdges: z
    .array(
      z.object({
        id: z.string().optional(),
        source: z.string().optional(),
        target: z.string().optional(),
      })
    )
    .optional(),
});

const parser = StructuredOutputParser.fromZodSchema(RoadmapSchema as any);

export async function POST(req: Request) {
  try {
    // --- Previous Groq Implementation (Commented out) ---
    // const groqApiKey = process.env.GROQ_API_KEY;
    // const groqModel = new ChatGroq({
    //   apiKey: groqApiKey,
    //   model: "llama-3.3-70b-versatile",
    //   temperature: 0.3,
    //   maxTokens: 1500,
    // });

    const apiKey =
      process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return NextResponse.json(
        { error: "OpenAI is not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const body = await req.json();
    const field = body.field || "Software Developer";
    const timeline = body.timeline || "3 months";
    const mode = body.mode || "Beginner";
    const formatInstructions = parser.getFormatInstructions();

    // 🔹 Tavily Real-Time Web Search for Industry Context Across Any Field
    const tavilyKey =
      process.env.NEXT_PUBLIC_TAVILY_API_KEY || process.env.TAVILY_API_KEY;
    let tavilyContext = "";

    if (tavilyKey) {
      try {
        const tvly = tavily({ apiKey: tavilyKey });
        const searchRes = await tvly.search(
          `latest industry standards tools platforms practices for ${field} ${new Date().getFullYear()}`,
          {
            search_depth: "basic",
            max_results: 5,
          }
        );

        if (searchRes?.results?.length) {
          tavilyContext = searchRes.results
            .map(
              (r: any, idx: number) =>
                `Source ${idx + 1}: ${r.title}\n${r.content?.slice(0, 350)}`
            )
            .join("\n\n");
        }
      } catch (err) {
        console.warn("Tavily real-time search failed:", err);
      }
    }

    const firstPrompt = `
You are an Industry Leader, Domain Expert & Senior Principal Mentor.

Task: Generate an up-to-date, industry-level learning roadmap for "${field}" (${timeline}, ${mode} level).

${
  tavilyContext
    ? `REAL-TIME UP-TO-DATE INDUSTRY CONTEXT (from Tavily Web Search):\n${tavilyContext}\n`
    : ""
}

DIRECTIVES FOR ANY FIELD (Tech, Design, Finance, Marketing, Healthcare, Business, Engineering, AI, etc.):
1. Adapt dynamically to "${field}". Include specific current tools, software, platforms, frameworks, methodologies, or regulations used by top industry professionals in ${new Date().getFullYear()}.
   • If Tech/AI: LangGraph StateGraph, Hybrid RAG, Vector Search, LangSmith Observability, Next.js 15, Kubernetes, etc.
   • If Design: Figma Design Systems & Tokens, Auto-Layout, Maze User Testing, Prototyping.
   • If Marketing/Business: GA4 Analytics, HubSpot Automation, Meta Ads Manager, AEO/SEO Strategy, Financial Modeling, etc.
   • If Healthcare/Finance/Other: Relevant industry software, standards, tools, and real-world compliance/methodologies.
2. ABSOLUTELY NO generic textbook terms (NO "Introduction to X", NO vague concepts). Name concrete tools, software, and practical industry techniques.
3. Each node description MUST be exactly 1 action-oriented sentence (max 18 words) explaining the practical industry application of that tool/step.
4. Generate exactly 7 nodes (node-1 through node-7).

GRID POSITIONS (3-column layout index coordinates):
• node-1: { x: 0, y: 0 }
• node-2: { x: 1, y: 0 }
• node-3: { x: 2, y: 0 }
• node-4: { x: 0, y: 1 }
• node-5: { x: 1, y: 1 }
• node-6: { x: 2, y: 1 }
• node-7: { x: 0, y: 2 }

NODE STRUCTURE:
- id: "node-1", "node-2", etc.
- type: "default"
- position: grid coordinate above
- data.title: Specific tool / platform / industry topic
- data.description: Exactly 1 sentence (max 18 words) naming the tool/concept and its core industry usage.
- data.link: search query string for learning resources (e.g. "${field} official documentation tutorial guide")

EDGES: Connect all nodes sequentially: node-1 → node-2 → ... → node-7.

Return ONLY valid JSON matching format instructions.

${formatInstructions}
`;

    const firstResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: firstPrompt }],
      temperature: 0.3,
      max_tokens: 1800,
    });

    const firstContent = firstResponse.choices[0]?.message?.content || "";

    let repairedJSON: string;
    try {
      repairedJSON = jsonrepair(firstContent);
    } catch {
      repairedJSON = firstContent;
    }

    const secondPrompt = `
Validate and refine this roadmap JSON for "${field}" (${timeline}, ${mode}):
${repairedJSON}

Verification Checklist:
1. Validate roadmapTitle, description (1-2 lines), and duration "${timeline}".
2. Ensure exactly 7 nodes featuring specific, modern industry tools, software, or methodologies for "${field}". Descriptions MUST be 1 sentence (max 18 words).
3. Ensure exact grid positions: node-1:{x:0,y:0}, node-2:{x:1,y:0}, node-3:{x:2,y:0}, node-4:{x:0,y:1}, node-5:{x:1,y:1}, node-6:{x:2,y:1}, node-7:{x:0,y:2}.
4. Ensure sequential edges connect node-1 → node-2 → ... → node-7.

Return valid JSON only.

${formatInstructions}
`;

    const secondResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: secondPrompt }],
      temperature: 0.2,
      max_tokens: 1800,
    });

    const secondContent = secondResponse.choices[0]?.message?.content || "";

    let secondRepairedJSON: string;
    try {
      secondRepairedJSON = jsonrepair(secondContent);
    } catch (repairErr) {
      console.warn(
        "Second JSON repair failed, using raw LLM output",
        repairErr
      );
      secondRepairedJSON = secondContent;
    }

    const finalParsed: any = await parser.parse(secondRepairedJSON);

    // 🔹 Tavily Real-Time Web Search for Exact Official Documentation Links
    if (
      tavilyKey &&
      finalParsed?.initialNodes &&
      Array.isArray(finalParsed.initialNodes)
    ) {
      try {
        const tvly = tavily({ apiKey: tavilyKey });
        await Promise.all(
          finalParsed.initialNodes.map(async (node: any) => {
            const topic = node.data?.title || field;
            if (!node.data) node.data = {};
            try {
              const searchRes = await tvly.search(
                `${topic} ${field} official guide documentation tutorial`,
                {
                  search_depth: "basic",
                  max_results: 2,
                }
              );

              if (searchRes?.results?.[0]?.url) {
                node.data.link = searchRes.results[0].url;
              } else {
                node.data.link = `https://www.google.com/search?q=${encodeURIComponent(
                  topic + " " + field + " tutorial guide"
                )}`;
              }
            } catch (err) {
              console.warn("Tavily search failed for topic:", topic, err);
              node.data.link = `https://www.google.com/search?q=${encodeURIComponent(
                topic + " " + field + " tutorial guide"
              )}`;
            }
          })
        );
      } catch (err) {
        console.error("Tavily initialization failed:", err);
      }
    } else if (
      finalParsed?.initialNodes &&
      Array.isArray(finalParsed.initialNodes)
    ) {
      finalParsed.initialNodes.forEach((node: any) => {
        const topic = node.data?.title || field;
        if (!node.data) node.data = {};
        if (!node.data.link) {
          node.data.link = `https://www.google.com/search?q=${encodeURIComponent(
            topic + " " + field + " tutorial guide"
          )}`;
        }
      });
    }

    return NextResponse.json(finalParsed);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




