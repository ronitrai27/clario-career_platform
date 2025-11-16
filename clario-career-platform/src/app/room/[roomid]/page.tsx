
"use client";

import { useUserData } from "@/context/UserDataProvider";
import React, { useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";


const Room = ({ params }: { params: Promise<{ roomid: string }> | { roomid: string } }) => {
  // useUser is a client hook — ok to use since this is a client component.
  // Next's App Router may provide params as a Promise in client components.
  // React.use(...) unwraps promises so we can access params.roomid synchronously.
  // If params is already a plain object, React.use returns it unchanged.
  // (If your Next version doesn't support React.use for this, replace with a server-side page
  // that passes roomID down to this client component.)
  // Type-ignore to avoid TS error if React.use isn't typed for this usage.
  // @ts-ignore
  const unwrappedParams = React.use ? React.use(params) : params;
  const roomID = (unwrappedParams && (unwrappedParams as any).roomid) || "";
  const { mentor } = useUserData();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    if (!roomID) {
      console.error("[Room] roomID is empty. params.roomid must be supplied.");
      return;
    }

    // run only in browser
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.error("[Room] Not running in browser — Zego UI must run client-side.");
      return;
    }

    const init = async () => {
      try {
        // Dynamic import so the module only loads client-side (prevents "document is not defined")
        const zegoModule = await import("@zegocloud/zego-uikit-prebuilt");

        // Make sure env vars exist. If you keep token generation here, you NEED these,
        // but they must not be exposed in production. See comment above.
        const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID
          ? parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
          : undefined;
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;

        if (!appID) {
          console.error(
            "[ZEGOCLOUD] NEXT_PUBLIC_ZEGO_APP_ID missing or invalid. Set env NEXT_PUBLIC_ZEGO_APP_ID."
          );
          return;
        }
        if (!serverSecret) {
          console.error(
            "[ZEGOCLOUD] NEXT_PUBLIC_ZEGO_SERVER_SECRET missing. **Do NOT** expose server secret client-side — move token generation server-side."
          );
          return;
        }

        // generateKitTokenForTest will run in browser here if you keep secrets public (not recommended)
        const kitToken = (zegoModule as any).ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          uuid(),
          mentor?.full_name || "user" + Date.now(),
          720
        );

        // create instance and join room
        const zp = (zegoModule as any).ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // defensive check
        if (!containerRef.current) {
          console.error("[Room] containerRef missing when trying to join room.");
          return;
        }

        // joinRoom may throw if token invalid or other issues
        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: "Shareable link",
              url:
                window.location.protocol +
                "//" +
                window.location.host +
                window.location.pathname +
                "?roomID=" +
                roomID,
            },
          ],
          scenario: {
            mode: (zegoModule as any).ZegoUIKitPrebuilt.VideoConference,
          },
        });
      } catch (err: any) {
        console.error("[Room] Zego init error:", err?.message || err);
      }
    };

    init();

    return () => {
      mounted = false;
      // attempt cleanup if SDK exposes a destroy/leave method
      try {
        if (zpRef.current?.destroy) {
          zpRef.current.destroy();
        } else if (zpRef.current?.leave) {
          zpRef.current.leave();
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
    // we want roomID and fullName to re-run init if they change
  }, [roomID, mentor?.full_name]);

  return (
    <div
      className="myCallContainer"
      ref={containerRef}
      style={{ width: "100vw", height: "100vh" }}
    />
  );
  maxUsers: 2;
};

export default Room;