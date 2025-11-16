/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";

interface Job {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  apply_options: { title: string; link: string }[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "software developer";

  try {
    const response = await getJson({
      api_key: process.env.SERPAPI_KEY,
      engine: "google_jobs",
      google_domain: "google.co.in",
      q: query,
      hl: "en",
      gl: "in",
      location: "India",
    });

    //  console.log("SerpAPI Jobs Response:", response);

    const jobs: Job[] = Array.isArray(response.jobs_results)
      ? response.jobs_results.map((job: any) => ({
          title: job.title,
          company_name: job.company_name,
          location: job.location,
          via: job.via,
          description: job.description,
          apply_options: job.apply_options,
        }))
      : [];

     

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}
