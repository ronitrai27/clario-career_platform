"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

import type { RoadmapTrack, Checkpoint } from "@/lib/types/allTypes";
import {
  LuAward,
  LuCheck,
  LuCheckCheck,
  LuChevronDown,
  LuChevronLast,
  LuChevronLeft,
  LuChevronRight,
  LuClipboardCheck,
  LuFlagTriangleRight,
  LuGalleryVerticalEnd,
  LuGraduationCap,
  LuLockKeyhole,
  LuLockKeyholeOpen,
  LuMapPinned,
} from "react-icons/lu";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/lib/functions/MockTest/QuizStore";

const MyTrackStart = () => {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();

  const [track, setTrack] = useState<RoadmapTrack | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedSubtopics, setExpandedSubtopics] = useState<{
    [key: string]: boolean;
  }>({});

  const [youtubeData, setYoutubeData] = useState<Record<string, string[]>>({});

  const { setCareerPath, reset } = useQuizStore();

  useEffect(() => {
    const fetchTrack = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("roadmap_id", params.id)
        .single();

      if (error) {
        console.error("❌ Failed to fetch track:", error);
        setLoading(false);
        return;
      }

      setTrack(data);

      // Detect the current checkpoint (first one where isMockDone == false)
      const checkpoint = data.checkpoints.find(
        (cp: Checkpoint) => !cp.isMockDone
      );

      setCurrentCheckpoint(checkpoint || null);

      const completedCheckpoints = data.checkpoints.filter(
        (cp: Checkpoint) => cp.isMockDone
      ).length;

      const totalCheckpoints = data.checkpoints.length;
      const calculatedProgress = Math.round(
        (completedCheckpoints / totalCheckpoints) * 100
      );

      setProgress(calculatedProgress);

      await supabase
        .from("roadmapUsers")
        .update({ progress: calculatedProgress })
        .eq("id", params.id);
      setLoading(false);
    };

    fetchTrack();
  }, [params.id]);

  // ==================================
  const toggleSubtopic = async (checkpointIndex: number, subIndex: number) => {
    const key = `${checkpointIndex}-${subIndex}`;
    setExpandedSubtopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    if (youtubeData[key]) return;

    const query = track?.checkpoints[checkpointIndex].subtopics[subIndex].title;

    // Fetching videos
    const videos = await fetchYouTubeVideos(query!);

    // Saving only 2 in state...
    setYoutubeData((prev) => ({
      ...prev,
      [key]: videos,
    }));
  };
  // ================================
  // FETCH YT VIDEO=======================
  const fetchYouTubeVideos = async (query: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

      const res = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: query,
            maxResults: 2,
            key: apiKey,
            type: "video",
            videoDuration: "medium",
          },
        }
      );

      return res.data.items?.map(
        (item: any) => `https://www.youtube.com/watch?v=${item.id.videoId}`
      );
    } catch (err) {
      console.error("YT FETCH ERROR:", err);
      return [];
    }
  };

  // ===========================================
  const handleMockTest = (checkpoint: Checkpoint) => {
    reset();
    const topics = checkpoint.topics_covered?.length
      ? checkpoint.topics_covered.join(", ")
      : checkpoint.title;

    setCareerPath(
      `Checkpoint ${checkpoint.checkpoint_order}: ${checkpoint.title} - Topics: ${topics}`
    );

    router.push(`/home/my-tracks/${params.id}/mocktest/quiz`);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50 flex justify-center items-center text-lg font-inter ">
        Loading...
      </div>
    );
  }

  if (!track || !currentCheckpoint) {
    return (
      <div className="w-full h-full flex justify-center items-center text-lg font-inter text-gray-500">
        No active checkpoint found 🚫
      </div>
    );
  }

  return (
    <div className="bg-gray-50 w-full min-h-screen p-4">
      {/* DISPLAY CARD */}
      <div className="w-[90%] mx-auto h-[180px] border my-3 rounded-lg bg-gradient-to-br from-indigo-400 to-rose-500 relative overflow-hidden shadow p-4">
        <h2 className="text-4xl font-bold font-inter text-white ml-4">
          Complete your track
        </h2>
        <p className="text-gray-200 font-inter text-lg mt-3 max-w-[340px] ml-4">
          Complete all checkpoints to unlock your acheivement and earn skills
        </p>
        <Image
          src="/8.png"
          alt="7"
          width={280}
          height={280}
          className=" object-cover absolute -top-6 right-0"
        />
        <div className="absolute top-0 right-[40%] w-16 h-16">
          <div className="w-full h-full bg-white/25 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
        </div>

        <div className="absolute bottom-20 left-[40%] w-16 h-16">
          <div className="w-full h-full bg-white/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
        </div>

        <div className="absolute bottom-0 right-[60%] w-16 h-16">
          <div className="w-full h-full bg-white/25 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
        </div>

        <div className="absolute -bottom-5 left-20 w-16 h-16">
          <div className="w-full h-full bg-white/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
        </div>
      </div>

      <div className="flex items-center justify-between relative mt-8">
        <h2
          onClick={() => router.push("/home/my-tracks")}
          className="font-inter absolute left-10 cursor-pointer"
        >
          <LuChevronLeft className="inline mr-2" />
          Back
        </h2>

        <h1 className="font-bold text-2xl font-inter capitalize text-center w-full">
          Start your journey with clarity
        </h1>
      </div>

      {/* === TOTAL PROGRESS BAR === */}
      <div className="w-full flex flex-col items-center mt-8 mb-8">
        <div className="w-[80%] bg-gray-200 h-4 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mt-2 font-inter text-base text-muted-foreground">
          {progress}% Completed
        </p>
      </div>

      <div className="flex gap-14 w-full mt-10 px-4">
        {/* =================LEFT SIDE OVERVEIW=============== */}
        <div className="flex flex-col items-center w-36 sticky top-20 ">
          <h2 className="font-inter font-semibold text-lg capitalize mb-4 whitespace-nowrap pl-4">
            Progress Overview <LuMapPinned className="inline ml-2" />{" "}
          </h2>
          {/* Progress Line */}
          <div className="relative flex flex-col items-center">
            {track.checkpoints.map((checkpoint: Checkpoint, index: number) => {
              const isUnlocked =
                index === 0 || track.checkpoints[index - 1].isMockDone === true;

              return (
                <div
                  key={checkpoint.checkpoint_order}
                  className="flex flex-col items-center"
                >
                  {/* Circle */}
                  <div
                    className={`
                w-10 h-10 flex items-center justify-center rounded-full border-4
                transition-all duration-300 font-bold text-sm font-inter
                ${
                  checkpoint.isMockDone
                    ? "bg-green-400 border-green-500 text-white"
                    : isUnlocked
                    ? "bg-blue-400 border-blue-500 text-white animate-pulse"
                    : "bg-gray-100 border-gray-200 text-gray-600"
                }
              `}
                  >
                    {checkpoint.checkpoint_order}
                  </div>

                  {/* Text below circle */}
                  <span className="text-xs text-center font-inter mt-2 w-24">
                    {checkpoint.title}
                  </span>

                  {/* Vertical line except last checkpoint */}
                  {index !== track.checkpoints.length - 1 && (
                    <div
                      className={`
                  w-[3px] h-12 rounded-full my-1
                  ${checkpoint.isMockDone ? "bg-green-500" : "bg-gray-300"}
                `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =============RIGHT SIDE ALL CHECKPOINTS=============== */}
        <div className="space-y-14 flex-1 max-w-[840px] mx-auto">
          {/* ======= All Checkpoints (Locked / Unlocked) ======= */}
          {track.checkpoints.map((checkpoint: Checkpoint, index: number) => {
            const isUnlocked =
              index === 0 || track.checkpoints[index - 1].isMockDone === true;

            return (
              <div
                key={checkpoint.checkpoint_order}
                className={`rounded-xl p-4  transition ${
                  checkpoint.isMockDone
                    ? "bg-green-50 border border-green-300"
                    : isUnlocked
                    ? "bg-white border shadow-sm"
                    : "bg-gray-200 opacity-60 pointer-events-none shadow"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-blue-600 font-inter flex items-center gap-2">
                    <LuFlagTriangleRight className="text-[22px]" /> Checkpoint{" "}
                    {checkpoint.checkpoint_order}: {checkpoint.title}
                  </h2>

                  <div className="flex items-center gap-8">
                    {checkpoint.isMockDone ? (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Completed
                      </span>
                    ) : !isUnlocked ? (
                      <span className="text-sm font-inter flex items-center gap-2 bg-gray-400 text-white px-2 py-1 rounded-full">
                        Locked <LuLockKeyhole className="ml-1" />
                      </span>
                    ) : (
                      <span className="text-sm font-inter flex items-center gap-2 bg-blue-500 text-white px-2 py-1 rounded-full">
                        Available <LuLockKeyholeOpen className="ml-1" />
                      </span>
                    )}

                    <div
                      className="w-9 h-9 bg-white border rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                    >
                      <LuChevronDown
                        className={`text-[22px] transition-transform ${
                          expandedIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg font-inter -mt-2 mb-3 ml-6">
                  {checkpoint.description}
                </p>

                {/* ====== COLLAPSIBLE CONTENT ====== */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    expandedIndex === index
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {/* SUBTOPICS */}
                  <div className="mt-4 ml-6 space-y-4 font-inter">
                    <h3 className="text-lg font-semibold text-black font-inter">
                      Subtopics <LuGalleryVerticalEnd className="inline ml-2" />
                    </h3>

                    {checkpoint.subtopics.map((sub, subIndex) => {
                      const subKey = `${index}-${subIndex}`;
                      const isSubOpen = expandedSubtopics[subKey];

                      return (
                        <div
                          key={sub.subtopic_order}
                          className="bg-gray-50 p-3 rounded-lg border shadow"
                        >
                          {/* SUBTOPIC HEADER */}
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSubtopic(index, subIndex)}
                          >
                            <h4 className="font-semibold text-lg font-inter capitalize text-blue-600">
                              {sub.title}
                            </h4>

                            <LuChevronDown
                              className={`text-lg  transition-transform ${
                                isSubOpen ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          </div>

                          {/* SUBTOPIC CONTENT (collapsible) */}
                          <div
                            className={`transition-all duration-300 overflow-hidden ${
                              isSubOpen
                                ? "max-h-[1000px] opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <p className="text-base font-inter ml-4 mt-3  text-black">
                              {sub.overview}
                            </p>

                            <div className="mt-5">
                              <p className="text-base font-medium text-black font-inter">
                                Resources:
                              </p>
                              <div className="list-disc ml-5 mt-3 text-sm text-black font-sora space-y-4">
                                {sub.resources.map((link, idx) => (
                                  <div
                                    key={idx}
                                    className=" bg-gradient-to-br from-pink-100 via-white to-white px-3 py-4 rounded-lg shadow border"
                                  >
                                    <a
                                      href={link}
                                      target="_blank"
                                      className="text-right ml-auto flex items-center justify-end"
                                    >
                                      {link}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* YOUTUBE VIDEOS */}
                            <div className="mt-6">
                              <p className="text-base font-medium text-black font-inter">
                                YouTube Videos:
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                {!youtubeData[`${index}-${subIndex}`] && (
                                  <p className="text-gray-500">
                                    Loading videos...
                                  </p>
                                )}

                                {youtubeData[`${index}-${subIndex}`]?.map(
                                  (yt, i) => (
                                    <iframe
                                      key={i}
                                      className="w-full h-48 rounded-lg shadow"
                                      src={yt.replace("watch?v=", "embed/")}
                                      allowFullScreen
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* SKILLS */}
                  <div className="mt-10 ml-6">
                    <h3 className="text-lg font-semibold text-left text-black font-inter capitalize">
                      Skills You will Gain{" "}
                      <LuAward className="inline ml-2 text-[20px]" />
                    </h3>

                    <div className="grid grid-cols-2 gap-5 mt-3">
                      {checkpoint.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <LuCheck className="text-white text-[18px] inline" />
                          </div>
                          <p className="capitalize font-inter">{skill} </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOPICS COVERED */}
                  <div className="mt-10 ml-6 mb-6">
                    <h3 className="text-lg font-semibold text-left text-black font-inter capitalize">
                      Topics Covered{" "}
                      <LuClipboardCheck className="inline ml-2 text-[20px] -mt-1" />
                    </h3>

                    <div className="grid grid-cols-2 gap-5 mt-3">
                      {checkpoint.topics_covered.map((topic, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <LuCheckCheck className="text-white text-[18px] inline" />
                          </div>
                          <p className="capitalize font-inter tracking-tight">
                            {topic}{" "}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MOCK TEST */}
                  <h2 className="ml-6 text-lg font-semibold text-left text-black font-inter capitalize">
                    Take Your Mock Test Now{" "}
                    <LuAward className="inline ml-2 text-[20px]" />
                  </h2>
                  <Button
                    onClick={() => handleMockTest(checkpoint)}
                    className="font-inter text-sm tracking-tight mt-4 ml-6 bg-gradient-to-br from-indigo-400 to-blue-400"
                    size="sm"
                  >
                    Take Test{" "}
                    <LuGraduationCap className="inline ml-2 text-[20px]" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyTrackStart;
