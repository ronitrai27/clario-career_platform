/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
// import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import { Type } from "@google/genai";
import { getSelectedCareer, updateSelectedCareer } from "./dbActions";
import { retrivalServer } from "./pineconeQuery";
import { toast } from "sonner";
import { tavilySearching } from "./tavily";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

type AgentContext = {
  question: string;
  userId: any;
  userName: string;
  user_current_status: string;
  careerOptions?: string;
  summary?: string;
  stream?: string;
};

type HistoryPart =
  | { text: string }
  | { functionCall: any }
  | { functionResponse: any };

const history: Array<{
  role: string;
  parts: HistoryPart[];
}> = [];

// ----------------------TOOLS---------------------------
//webSearch tool----------------------------------------
// async function tavilySearch(query: string): Promise<string> {
//   const resp = await fetch("https://api.tavily.com/search", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.NEXT_PUBLIC_TAVILY_API_KEY!}`,
//     },
//     body: JSON.stringify({
//       query,
//       max_results: 3,
//     }),
//   });

//   const data = await resp.json();
//   console.log("===data from TAVILY====", data);
//   return data.results.map((r: any) => r.content).join("\n\n---\n\n");
// }

export async function tavilySearch(query: string): Promise<string> {
  try { 

    const result = await tavilySearching(query);

    if (!result || result.includes("Error")) {
      throw new Error("No results from Tavily");
    }

    return result;
  } catch (error) {
    console.error("Error fetching Tavily results:", error);
    return "Tavily search failed. Please try again later.";
  }
}

// ==========================================================
// Pinecone query tool----------------------------------------
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
// GET selectedCareer Tool--------------------------------
// async function getCareerTool(userId: any) {
//   try {
//     const career = await getSelectedCareer(userId);
//     toast.success("User Career retrieved successfully!");
//     return career;
//   } catch (error) {
//     console.error("Error in getCareerTool:", error);
//     return null;
//   }
// }
//  UPDATE selectedCareer tool----------------------------------------
async function updateCareerTool(userId: any, selectedCareer: string) {
  try {
    const career = await updateSelectedCareer(userId, selectedCareer);
    toast.success("User Career updated successfully!");
    return career;
  } catch (error) {
    console.error("Error in updateCareerTool:", error);
    return null;
  }
}

// ------------------------------TOOL DECLARATION----------------------------
const tavilySearchDeclaration = {
  name: "tavilySearch",
  description:
    "Search the web in real-time for up-to-date information using Tavily API. Use this when the query requires fresh accurate data/facts or external knowledge not present in Pinecone.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query to look up on the web",
      },
    },
    required: ["query"],
  },
};
const retrivalDeclaration = {
  name: "retrival",
  description:
    "Retrieve relevant information from Pinecone vector database based on user query. Useful when additional context or knowledge is required before answering.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      userQuery: {
        type: Type.STRING,
        description: "The user's natural language query to search in Pinecone",
      },
    },
    required: ["userQuery"],
  },
};

const updateCareerDeclaration = {
  name: "updateCareerTool",
  description:
    "Update the selected career of a specific user in the userQuizData table. Use this when modifying an existing record.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      selectedCareer: {
        type: Type.STRING,
        description:
          "The new career choice that will replace the user's previous selection.",
      },
    },
    required: ["selectedCareer"],
  },
};

// ---------------------------------TOOL MAPPING---------------------------

type ToolMap = {
  retrival: (args: { userQuery: string }) => Promise<string>;
  tavilySearch: (args: { query: string }) => Promise<string>;
  // getCareerTool: (args: { userId: any }) => Promise<string | null>;
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

    // getCareerTool: () => getCareerTool(userId),
    updateCareerTool: ({ selectedCareer }) =>
      updateCareerTool(userId, selectedCareer),
  };
  history.push({
    role: "user",
    parts: [
      {
        text: question,
      },
    ],
  });

  // 2.5-flash
  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
      config: {
        systemInstruction: `
You are a highly professional and empathetic AI Career Coach whose sole focus is to help ${userName} in choosing right career path and update it using the tool. 
${userName} is currently a ${user_current_status} in ${stream}. Based on their quiz results — suggested career options: ${careerOptions}, and summary: ${summary} — your goal is to update their desired career using the tools below for real time updates and information and help them make informed choices and chhose the career that they want to have.

You Main goal using tool is:
1. Update user's career choice in the database using tools provided.

For accurate and personalized guidance, you can use two knowledge tools freely:
(a) Retrieve relevant information from Pinecone.
(b) Search the web in real time using Tavily .

`,

        maxOutputTokens: 600,
        tools: [
          {
            functionDeclarations: [
              retrivalDeclaration,
              tavilySearchDeclaration,
              updateCareerDeclaration,
            ],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const { name, args } = response.functionCalls[0];

      const tool = availableTools[name as keyof ToolMap];
      const result = await tool(args as any);

      const functionResponsePart = {
        name: name,
        response: {
          result: result,
        },
      };

      // model response
      history.push({
        role: "model",
        parts: [
          {
            functionCall: response.functionCalls[0],
          },
        ],
      });
      history.push({
        role: "user",
        parts: [
          {
            functionResponse: functionResponsePart,
          },
        ],
      });

      console.log(`Result from ${name}:`, result);
    } else {
      history.push({
        role: "model",
        parts: [
          {
            text: response.text ?? "",
          },
        ],
      });
      return response.text ?? "";
    }
  }
}
