import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { createClient } from "@/lib/supabase/client";
import { embedText } from "@/lib/functions/embedding";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY!),
});

const BUCKET = process.env.GCS_BUCKET!;

export async function GET() {
  const supabase = createClient();

  const { data: mentors, error } = await supabase
    .from("mentors")
    .select("*");

  if (error) return NextResponse.json({ error }, { status: 500 });

  let ndjson = "";

  for (const m of mentors) {
    const text = `
      Mentor Name: ${m.full_name}
      Current Position: ${m.current_position}
      Bio: ${m.bio ?? ""}
    `;

    const vector = await embedText(text);

    ndjson += JSON.stringify({
      id: String(m.id),
      embedding: vector,
      payload: {
        full_name: m.full_name,
        current_position: m.current_position,
        bio: m.bio ?? "",
      }
    }) + "\n";
  }

  const filename = `mentors-${Date.now()}.json`; // JSON extension but content is JSONL
  const bucket = storage.bucket(BUCKET);
  const file = bucket.file(`vector/${filename}`);

  await file.save(ndjson, {
    resumable: false,
    contentType: "application/json",
  });

  return NextResponse.json({
    message: "Uploaded!",
    gcsUri: `gs://${BUCKET}/vector/${filename}`,
  });
}
