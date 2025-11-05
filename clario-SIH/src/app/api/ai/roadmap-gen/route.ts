/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatGroq } from "@langchain/groq";
import { NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";

// schema non-strict
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
            link: z.string().optional(), // any string allowed
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

const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.3,
  maxTokens: 1000,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const field = body.field || "Software Developer";
    const timeline = body.timeline || "3 months";
    const mode = body.mode || "Beginner";
    const formatInstructions = parser.getFormatInstructions();

    const firstPrompt = `
You are an expert roadmap generator.

Task: Create a concise learning roadmap for a "${field}".

Requirements:
1. Roadmap must include:
   - roadmapTitle (short title of the roadmap)
   - description (1-2 lines summary)
   -  duration: "${timeline}"

2. initialNodes (5-8 topics):
    - Divide topics aligned to "${mode}" difficulty
    - Split into: Basics (2-3), Intermediate (2-3), Advanced (1-2)
    - Each node must have:
     • id: unique string (e.g. "node-1")
     • type: "default"
     • position: { x, y } → numeric values
     • data:
       - title: short name of the topic
       - description: 1-2 line explanation
       - link: a relevant reference link (e.g. free resource)

3. initialEdges:
   - Each edge must connect nodes logically from Basics → Intermediate → Advanced.
   - Each edge must have:
     • id: unique string (e.g. "edge-1")
     • source: source node id
     • target: target node id

Additional Rules:
- No extra commentary — only return valid JSON.
- JSON must strictly follow the schema.

${formatInstructions}
`;

    const firstResponse = await model.invoke(firstPrompt);
    // Try to repair raw JSON from first LLM
    let repairedJSON: string;
    try {
      repairedJSON = jsonrepair(firstResponse.content as string);
    } catch {
      repairedJSON = firstResponse.content as string;
    }

    // console.log("First LLM raw (possibly incomplete):", repairedJSON);

    // Second LLM to check and complete if necessary
    const secondPrompt = `
Here is the generated roadmap JSON for "${field}" for "${timeline}" in "${mode}" mode:
${repairedJSON}

Validate and repair the roadmap if needed. The JSON must satisfy ALL these conditions:

1. Has a meaningful roadmapTitle, description, and duration.
2. initialNodes:
   - topics aligned to "${mode}" difficulty
   - Contains 5-8 topics (2-3 basics, 2-3 intermediate, 1-2 advanced).
   - Each node must have:
     • id (unique string)
     • type ("default")
     • position with numeric x, y
     • data containing:
       - title (short topic name)
       - description (1-2 lines explanation)
       - link (learning resource)
3. initialEdges:
   - All nodes are connected in a clear logical sequence (basics → intermediate → advanced).
   - Each edge has id, source, and target matching valid node ids.
4. Content is concise, useful, and relevant to the "${field}" roadmap.

Rules:
- If the JSON already satisfies all requirements, return it unchanged.
- If anything is missing, incomplete, or poorly structured, correct it while keeping the original intent.
- Do NOT add extra commentary or text outside of JSON.
- Output must be valid JSON only, strictly following the schema.

${formatInstructions}
`;

    const secondResponse = await model.invoke(secondPrompt);

    // Repair second JSON before parsing
    let secondRepairedJSON: string;
    try {
      secondRepairedJSON = jsonrepair(secondResponse.content as string);
    } catch (repairErr) {
      console.warn(
        "Second JSON repair failed, using raw LLM output",
        repairErr
      );
      secondRepairedJSON = secondResponse.content as string; // fallback
    }

    // Parse second response
    const finalParsed = await parser.parse(secondRepairedJSON);

    // console.log("Final Parsed Roadmap from second LLM:", finalParsed);

    return NextResponse.json(finalParsed);
  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
