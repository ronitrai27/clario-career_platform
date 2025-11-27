import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { promises as fs } from "fs";
import path from "path";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY!),
});

const BUCKET = process.env.GCP_BUCKET_ASSETS!;

export async function GET() {
  try {
    const bucket = storage.bucket(BUCKET);

    const images = [
      "hero1.png",
      "hero2.png",
      "hero3.png",
      "jobasset1.png",
      "jobs.png",
      "linkedin.png",
      "microsoft.png",
      "prep2.png",
      "prep3.png",
      "re1.png",
      "roadmap.png",
      "search.png",
      "sec2.png",
      "sec4.jpg",
      "sec6.png",
      "sec7.png",
      "slack.png",
      "staic6.png",
      "static1.png",
      "static3.png",
      "static5.png",
      "static7.png",
      "tr1.png",
      "user.png",
    ];

    const results: any[] = [];

    for (const img of images) {
      // read image from /public
      const filePath = path.join(process.cwd(), "public", img);
      const buffer = await fs.readFile(filePath);

      const destination = `assests/${img}`;
      const file = bucket.file(destination);

      await file.save(buffer, {
        resumable: false,
        contentType: "image/png",
      });

      //   await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${BUCKET}/${destination}`;

      results.push({
        file: img,
        url: publicUrl,
      });
    }

    return NextResponse.json({
      message: "Uploaded 3 images successfully",
      files: results,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
