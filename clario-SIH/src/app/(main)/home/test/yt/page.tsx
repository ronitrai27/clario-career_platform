"use client";
import { useEffect, useState } from "react";
import { useQuizData } from "@/context/userQuizProvider";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

const YtVideo = () => {
  const { quizData } = useQuizData();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizData?.selectedCareer) return;

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const searchQuery = encodeURIComponent(quizData.selectedCareer);

        // STEP 1: Get up to 30 video IDs
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=30&q=${searchQuery}&type=video&order=viewCount&key=${API_KEY}`
        );
        const searchData = await searchRes.json();

        const videoIds = searchData.items
          .map((v: any) => v.id?.videoId)
          .filter(Boolean)
          .join(",");

        if (!videoIds) {
          setVideos([]);
          setLoading(false);
          return;
        }

        // STEP 2: Get detailed video data
        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
        );
        const detailsData = await detailsRes.json();

        // STEP 3: Filter valid videos
        const filtered = (detailsData.items || [])
          .filter((video: any) => {
            // Handle missing fields gracefully
            if (!video.contentDetails || !video.statistics) return false;

            const durationStr = video.contentDetails.duration;
            const viewsStr = video.statistics.viewCount;
            if (!durationStr || !viewsStr) return false;

            const duration = parseISO8601Duration(durationStr);
            const views = parseInt(viewsStr, 10);

            return duration > 5 && views > 100000; // >5 min, >100k views
          })
          .sort(
            (a: any, b: any) =>
              parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount)
          )
          .slice(0, 10); // top 10 only

        setVideos(filtered);
      } catch (err) {
        console.error("Error fetching YouTube videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [quizData?.selectedCareer]);

  // Helper: convert ISO 8601 duration to total minutes
  const parseISO8601Duration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match?.[1] || "0", 10);
    const minutes = parseInt(match?.[2] || "0", 10);
    const seconds = parseInt(match?.[3] || "0", 10);
    return hours * 60 + minutes + seconds / 60; // total minutes
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    const seconds = match?.[3] ? parseInt(match[3]) : 0;
    const total = hours * 3600 + minutes * 60 + seconds;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">
        Top YouTube Videos about {quizData?.selectedCareer}
      </h2>

      {loading && <p>Loading top videos...</p>}
      {!loading && videos.length === 0 && (
        <p className="text-gray-500">No videos match the criteria.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id} className="border rounded-lg p-2">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.snippet.title}
              allowFullScreen
            ></iframe>

            <div className="mt-2">
              <p className="font-semibold text-sm line-clamp-2">
                {video.snippet.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                🕒 {new Date(video.snippet.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                ⏱ {video.contentDetails?.duration
                  ? formatDuration(video.contentDetails.duration)
                  : "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                👁️ {video.statistics?.viewCount
                  ? parseInt(video.statistics.viewCount).toLocaleString()
                  : "N/A"}{" "}
                views
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YtVideo;
