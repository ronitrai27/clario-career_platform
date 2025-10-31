"use server";

import { tavily } from "@tavily/core";
// export const runtime = "nodejs"; 


const tvly = tavily({
  apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY!,
});

export async function tavilySearching(query: string): Promise<string> {
  try {
    const res = await tvly.search(query, {
      search_depth: "basic",
      //   include_answer: true,
      max_results: 3,
    });

    const results = (res.results || [])
      .slice(0, 3)
      .map(
        (r: any, i: number) =>
          `#${i + 1} ${r.title}\n${r.content?.slice(0, 300)}\nSource: ${r.url}`
      )
      .join("\n\n");

    console.log("========TAVILY DATA=======", results);
    return `Top Results:\n${results}`.slice(
      0,
      2000
    );
    // 0-2500
  } catch (err) {
    console.error("Tavily error:", err);
    return "Error fetching Tavily data.";
  }
}
