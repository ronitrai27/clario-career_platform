/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import OpenAI from "openai";
import { tavily } from "@tavily/core";
import { updateSelectedCareer } from "./dbActions";
import { retrivalServer } from "./pineconeQuery";

const getOpenAI = () =>
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY ||
      process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
      "",
  });

type AgentContext = {
  question: string;
  userId: any;
  userName: string;
  user_current_status: string;
  careerOptions?: string;
  summary?: string;
  stream?: string;
};

// ----------------------TOOLS---------------------------
// webSearch tool
export async function tavilySearch(query: string): Promise<string> {
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_TAVILY_API_KEY || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.error("Tavily API key missing");
      return "Tavily search is currently unavailable.";
    }

    const tvly = tavily({ apiKey });
    const res = await tvly.search(query, {
      search_depth: "basic",
      max_results: 3,
    });

    const results = (res.results || [])
      .slice(0, 3)
      .map(
        (r: any, i: number) =>
          `#${i + 1} ${r.title}\n${r.content?.slice(0, 300)}\nSource: ${r.url}`
      )
      .join("\n\n");

    return `Top Results:\n${results}`.slice(0, 2000);
  } catch (error) {
    console.error("Error fetching Tavily results:", error);
    return "Tavily search failed. Please try again later.";
  }
}

// Pinecone query tool
async function retrival(userQuery: string): Promise<string> {
  try {
    console.log("====Pinecone query called===");
    const result = await retrivalServer(userQuery);
    return result;
  } catch (err) {
    console.error("Error in retrival tool:", err);
    return "";
  }
}

// UPDATE selectedCareer tool
async function updateCareerTool(userId: any, selectedCareer: string) {
  try {
    const career = await updateSelectedCareer(userId, selectedCareer);
    return career;
  } catch (error) {
    console.error("Error in updateCareerTool:", error);
    return null;
  }
}

// ------------------------------TOOL DECLARATION----------------------------
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "tavilySearch",
      description:
        "Search the web in real-time for up-to-date information using Tavily API. Use this when the query requires fresh accurate data/facts or external knowledge not present in Pinecone.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to look up on the web",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "retrival",
      description:
        "Retrieve relevant information from Pinecone vector database based on user query. Useful when additional context or knowledge is required before answering.",
      parameters: {
        type: "object",
        properties: {
          userQuery: {
            type: "string",
            description: "The user's natural language query to search in Pinecone",
          },
        },
        required: ["userQuery"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateCareerTool",
      description:
        "Update the selected career of a specific user in the userQuizData table. Use this when modifying an existing record.",
      parameters: {
        type: "object",
        properties: {
          selectedCareer: {
            type: "string",
            description:
              "The new career choice that will replace the user's previous selection.",
          },
        },
        required: ["selectedCareer"],
      },
    },
  },
];

// ---------------------------------TOOL MAPPING---------------------------
type ToolMap = {
  retrival: (args: { userQuery: string }) => Promise<string>;
  tavilySearch: (args: { query: string }) => Promise<string>;
  updateCareerTool: (args: {
    userId: any;
    selectedCareer: string;
  }) => Promise<string | null>;
};

export async function runAgent(ctx: AgentContext) {
  const {
    question,
    userId,
    userName,
    user_current_status,
    careerOptions,
    summary,
    stream,
  } = ctx;

  const availableTools: ToolMap = {
    retrival: ({ userQuery }) => retrival(userQuery),
    tavilySearch: ({ query }) => tavilySearch(query),
    updateCareerTool: ({ selectedCareer }) =>
      updateCareerTool(userId, selectedCareer),
  };

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a highly professional and empathetic AI Career Coach whose sole focus is to help ${userName} in choosing right career path and update it using the tool. 
${userName} is currently a ${user_current_status} in ${stream}. Based on their quiz results — suggested career options: ${careerOptions}, and summary: ${summary} — your goal is to update their desired career using the tools below for real time updates and information and help them make informed choices and choose the career that they want to have.

Your Main goal using tool is:
1. Update user's career choice in the database using tools provided.

For accurate and personalized guidance, you can use two knowledge tools freely:
(a) Retrieve relevant information from Pinecone.
(b) Search the web in real time using Tavily.`,
    },
    {
      role: "user",
      content: question,
    },
  ];

  const openai = getOpenAI();

  try {
    while (true) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        tools: tools,
        max_tokens: 600,
      });

      const responseMessage = response.choices[0].message;
      messages.push(responseMessage);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.type === "function") {
            const name = toolCall.function.name;
            let args = {};
            try {
              args = JSON.parse(toolCall.function.arguments || "{}");
            } catch (e) {
              console.error("Failed to parse tool call arguments:", e);
            }

            const tool = availableTools[name as keyof ToolMap];
            let resultStr = "";
            if (tool) {
              const result = await tool(args as any);
              console.log(`Result from ${name}:`, result);
              resultStr =
                typeof result === "string"
                  ? result
                  : JSON.stringify(result ?? {});
            }

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: resultStr || "Tool executed successfully",
            });
          }
        }
      } else {
        return responseMessage.content ?? "";
      }
    }
  } catch (error: any) {
    console.error("Error in OpenAI runAgent:", error);
    if (
      error?.status === 429 ||
      String(error?.message).includes("429") ||
      String(error?.message).includes("quota")
    ) {
      return "⚠️ OpenAI API rate limit or quota exceeded. Please check your plan/billing details or try again later.";
    }
    return `⚠️ An error occurred: ${error?.message || "Please try again."}`;
  }
}


