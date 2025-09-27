/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getJson } from "serpapi";


 interface Course {
  title: string;
  link?: string;
  source?: string;
  thumbnail?: string;
  description?: string;
  price?: string;
  rating?: number;
  [key: string]: any; 
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "software developer";

  try {
    const response: any = await getJson({
    //   api_key: process.env.SERPAPI_KEY,
      q: query,
      hl: "en",
      gl: "us",
      device: "desktop",
    //   engine: "google",
    });

    console.log("SerpAPI Courses Response:", response);

    const courses: Course[] = Array.isArray(response.courses)
      ? response.courses.map((course: any) => ({
          title: course.title || "Untitled",
          link: course.link,
          source: course.source,
          thumbnail: course.thumbnail,
          description: course.description,
          price: course.price,
          rating: course.rating,
          ...course, 
        }))
      : [];

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Courses API Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
