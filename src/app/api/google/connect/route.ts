import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing user_id in request" },
      { status: 400 }
    );
  }

  // google oauth URL params
  const googleParams = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    access_type: "offline",
    prompt: "consent select_account", 
    scope: "https://www.googleapis.com/auth/calendar",
    state: userId, 
  });

  return NextResponse.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + googleParams.toString()
  );
}


// import { NextResponse } from "next/server";

// export async function GET() {
//   const params = new URLSearchParams({
//     client_id: process.env.GOOGLE_CLIENT_ID!,
//     redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
//     response_type: "code",
//     access_type: "offline",
//     prompt: "consent select_account",
//     include_granted_scopes: "true",
//     scope: "https://www.googleapis.com/auth/calendar",
//   });

//   return NextResponse.redirect(
//     "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
//   );
// }
