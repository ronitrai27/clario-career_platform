// "use client";

// import { useEffect, useState } from "react";
// import { Video as Video } from "@imagekit/next";
// import { createClient } from "@/lib/supabase/client";
// import { useUserData } from "@/context/UserDataProvider";

// interface SavedVideo {
//   id: number;
//   url: string;
// }

// export default function VideoPlayer() {
//   const supabase = createClient();
//   const {mentor} = useUserData();
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);

//   console.log(mentor?.video_url);

//   useEffect(() => {
//     // Read from localStorage
//     const videos: SavedVideo[] = JSON.parse(
//       localStorage.getItem("videos") || "[]"
//     );
//     // Get the most recent video (last in array)
//     const latestVideo = videos[videos.length - 1];
//     setVideoUrl(latestVideo?.url || null);
//   }, []);

//   if (!videoUrl) {
//     return <div>No videos found in storage.</div>;
//   }

//   // Extract path from URL (e.g., "videos/mentor1_9pghnxnTm.mp4")
//   const videoPath = videoUrl.split("/").slice(4).join("/");

//   return (
//     <div
//       style={{
//         width: "360px",
//         height: "420px",
//         margin: "0 auto",
//         overflow: "hidden",
//         borderRadius: "8px",
//         position: "relative",
//       }}
//     >
//       <Video
//         urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
//         src={videoPath}
//         autoPlay
//         controls
//         loop
//         loading="lazy"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           objectFit: "cover", // or "contain"
//         }}
//       />
//     </div>
//   );
// }
// ---------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { Video as Video } from "@imagekit/next";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";

export default function VideoPlayer() {
  const supabase = createClient();
  const { mentor } = useUserData();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  console.log("Mentor video_url:", mentor?.video_url);

  useEffect(() => {
    if (mentor?.video_url) {
      setVideoUrl(mentor.video_url);
    }
  }, [mentor]);

  if (!videoUrl) {
    return <div>No video uploaded.</div>;
  }

  // Extract path from URL (e.g., "videos/mentor1_9pghnxnTm.mp4")
  const videoPath = videoUrl.split("/").slice(4).join("/");

  return (
    <div
      style={{
        width: "360px",
        height: "420px",
        margin: "0 auto",
        overflow: "hidden",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      <Video
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
        src={videoPath}
        autoPlay
        controls
        loop
        loading="lazy"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
    </div>
  );
}
