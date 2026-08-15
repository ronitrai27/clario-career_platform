import { google } from "googleapis";
import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const userId = url.searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.json(
      { error: "Missing code or user ID" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Missing Google OAuth credentials" },
      { status: 500 }
    );
  }

  console.log("CODE FROM GOOGLE CALLBACK:", code);

  const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  let tokens;
  try {
    const result = await oauthClient.getToken(code);
    tokens = result.tokens;

    console.log("TOKENS FROM GOOGLE CALLBACK:", tokens);
  } catch (err) {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 500 }
    );
  }

  const supabase = createClient();
  await supabase
    .from("users")
    .update({ google_refresh_token: tokens.refresh_token })
    .eq("id", userId);

  console.log("USER ID FROM GOOGLE CALLBACK:", userId);

  return NextResponse.redirect(new URL("/home/calendar", req.url));
}
