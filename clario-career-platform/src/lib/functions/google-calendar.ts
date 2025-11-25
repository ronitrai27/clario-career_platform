import { google } from "googleapis";

export function getClient(refreshToken: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
  client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: client });
}

export async function createGoogleEvent(event: any, refreshToken:any) {
  const calendar = getClient(refreshToken);

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    },
  });

  return res.data.id;
}

export async function updateGoogleEvent(event:any, refreshToken:any) {
  const calendar = getClient(refreshToken);

  await calendar.events.update({
    calendarId: "primary",
    eventId: event.google_event_id,
    requestBody: {
      summary: event.title,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    },
  });
}

export async function deleteGoogleEvent(eventId:any, refreshToken:any) {
  const calendar = getClient(refreshToken);
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}
