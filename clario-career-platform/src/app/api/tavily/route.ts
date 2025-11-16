import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.NEXT_PUBLIC_TAVILY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid or missing query." }, { status: 400 });
    }

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

    const formatted = `Top Results:\n${results}`.slice(0, 2000);

    return NextResponse.json({ result: formatted });
  } catch (err) {
    console.error("Tavily API error:", err);
    return NextResponse.json({ error: "Error fetching Tavily data." }, { status: 500 });
  }
}
