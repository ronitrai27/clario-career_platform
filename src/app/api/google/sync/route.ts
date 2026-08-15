import { NextResponse } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const { type, event, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = createClient();

  // directly use userId from frontend
  const { data: u } = await supabase
    .from("users")
    .select("google_refresh_token")
    .eq("id", userId)
    .single();

  console.log("U GOOGLE SYNC", u);

  if (!u || !u.google_refresh_token) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  auth.setCredentials({ refresh_token: u.google_refresh_token });

  const calendar = google.calendar({ version: "v3", auth });

  // create
  if (type === "create") {
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });

    return NextResponse.json({ google_event_id: res.data.id });
  }

  // update
  if (type === "update") {
    await calendar.events.update({
      calendarId: "primary",
      eventId: event.google_event_id,
      requestBody: {
        summary: event.title,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });

    return NextResponse.json({ success: true });
  }

  // delete
  if (type === "delete") {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: event.google_event_id,
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

