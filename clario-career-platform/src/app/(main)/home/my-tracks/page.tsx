"use client";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { IoSettingsOutline } from "react-icons/io5";
import {
  LuArrowUpRight,
  LuAward,
  LuChevronRight,
  LuGhost,
  LuOctagonMinus,
  LuPlus,
  LuSignpost,
  LuTelescope,
  LuTrash2,
} from "react-icons/lu";
import { getOrCreateRoadmapTrack } from "@/lib/functions/Track";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ghost } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import axios from "axios";
import { LearningPathDialog } from "../../_components/LearningPathDialog";
import { SubTopic } from "@/lib/types/allTypes";

interface myRoadmap {
  id: number;
  user_id: any;
  roadmap_data: any;
  created_at: string;
  isStarted: boolean;
  timeline: string;
  mode: string;
  status: string;
  progress: number;
  // STATUS - going_on / completed / paused / not_started
}

const MyTracks = () => {
  const { user } = useUserData();
  const supabase = createClient();
  const router = useRouter();
  const [startedTracks, setStartedTracks] = useState<myRoadmap[]>([]);
  const [startingId, setStartingId] = useState<number | null>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [activeTracks, setActiveTracks] = useState<any[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  //   =================================================
  // ====================GETCH ALL STARTED TRACKS=================
  useEffect(() => {
    const fetchStartedTracks = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("roadmapUsers")
        .select("*")
        .eq("user_id", user.id)
        .eq("isStarted", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setStartedTracks(data);
      }
    };

    fetchStartedTracks();
  }, [user?.id]);

  // ===========================================
  useEffect(() => {
    const fetchActiveTracks = async () => {
      if (!user?.id) return;
      try {
        setActiveLoading(true);
        const { data, error } = await supabase
          .from("roadmapUsers")
          .select("*")
          .eq("user_id", user.id)
          .eq("isStarted", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setActiveTracks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch active tracks", err);
        setActiveTracks([]);
      } finally {
        setActiveLoading(false);
      }
    };

    fetchActiveTracks();
  }, [user?.id]);
  // ===========================================
  // ==============FETCH ROADMAP_DATA TITLES==================

  const handleStartLearning = async (track: myRoadmap) => {
    try {
      setShowDialog(true);
      setLoadingStep(0);
      setStartingId(track.id);
      toast.info("Preparing your track...");

      // MESSAGES TIMELINE----
      const loadingMessages = [
        "Generating your personalized learning path...",
        "Analyzing roadmap data...",
        "Looking for external resources...",
        "Fetching YouTube tutorials...",
        "Connecting to the database...",
        "Finalizing your setup...",
      ];

      loadingMessages.forEach((_, index) => {
        setTimeout(() => setLoadingStep(index), index * 1200);
      });

      // CREATING AND SAVING CHECKPOINTS---
      if (track.status === "not_started") {
        const { firstCheckpoint } = await getOrCreateRoadmapTrack({
          id: track.id,
          user_id: track.user_id,
          roadmap_data: track.roadmap_data,
        });

        const checkpointTitle = firstCheckpoint?.title ?? "";
        const checkpointDescription = firstCheckpoint?.description ?? "";

        console.log("FIRST checkpointTitle", checkpointTitle);
        console.log("FIRST checkpointDescription", checkpointDescription);

        // -------------------------------
        //AI ROUTE HERE
        // -------------------------------
        try {
          const aiRes = await axios.post("/api/ai/generate-checkpoint", {
            title: checkpointTitle,
            description: checkpointDescription,
          });

          const aiData = aiRes.data?.data;
          if (!aiData) throw new Error("Invalid AI data");

          // Getting exisiting Track
          const { data: trackRow, error: trackErr } = await supabase
            .from("tracks")
            .select("checkpoints")
            .eq("roadmap_id", track.id)
            .single();

          if (trackErr || !trackRow) throw trackErr;

          // Clone current checkpoints
          const updatedCheckpoints = [...trackRow.checkpoints];

          // Update only FIRST checkpoint
          updatedCheckpoints[0] = {
            ...updatedCheckpoints[0],
            skills: aiData.skills,
            topics_covered: aiData.topics_covered,
            subtopics: aiData.subtopics.map((st: SubTopic) => ({
              ...st,
              youtube_videos: [],
            })),
          };

          // Save back to DB----
          const { error: updateErr } = await supabase
            .from("tracks")
            .update({ checkpoints: updatedCheckpoints })
            .eq("roadmap_id", track.id);

          if (updateErr) throw updateErr;

          console.log("🔥 Checkpoint updated successfully!");
          toast.success("AI learning path generated successfully!");
        } catch (err) {
          console.error("AI generation error:", err);
          toast.error("AI failed to generate details");
        }

        // UPDATE STATUS----
        await supabase
          .from("roadmapUsers")
          .update({ status: "going_on" })
          .eq("id", track.id);

        setTimeout(() => {
          setShowDialog(false);
          router.push(`/home/my-tracks/${track.id}/start`);
        }, 7500);

        return;
      }

      router.push(`/home/my-tracks/${track.id}/start`);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to prepare your track. Please try again.");
      setShowDialog(false);
    }
  };

  // ==========================
  // ==========UPDATE STATUS TO pause=============

  const updatePause = async (track: myRoadmap) => {
    await supabase
      .from("roadmapUsers")
      .update({ status: "paused" })
      .eq("id", track.id);
    setStartedTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, status: "paused" } : t))
    );
    toast.success("Track paused successfully!");
  };

  // ========================================
  // ==============continue the PAUSED TRACK==================

  const updateContinue = async (track: myRoadmap) => {
    await supabase
      .from("roadmapUsers")
      .update({ status: "going_on" })
      .eq("id", track.id);
    setStartedTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, status: "going_on" } : t))
    );
    toast.success("Track successfully continued!");
  };

  // ================================================
  // =====================DELETE THE TRACK===================
  const deleteTrack = async (track: myRoadmap) => {
    try {
      const { error: tracksError } = await supabase
        .from("tracks")
        .delete()
        .eq("roadmap_id", track.id);

      if (tracksError) throw tracksError;

      const { error: roadmapError } = await supabase
        .from("roadmapUsers")
        .delete()
        .eq("id", track.id);

      if (roadmapError) throw roadmapError;

      setStartedTracks((prev) => prev.filter((t) => t.id !== track.id));
      setActiveTracks((prev) => prev.filter((t) => t.id !== track.id));

      toast.success("Track deleted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete track.");
    }
  };

  return (
    <div className="bg-gray-50 h-full w-full p-4">
      {/* ======STARTER SINGLE CARD====== */}
      <div className="w-[90%] h-[220px] bg-gradient-to-br from-indigo-300 to-rose-400 rounded-lg mx-auto relative overflow-hidden p-4">
        <Image
          src="/tr1.png"
          alt="tr"
          width={200}
          height={200}
          className="absolute -right-10 -bottom-20"
        />

        <div className="flex gap-10 pr-5 justify-between w-full h-full">
          <div className="w-[500px] mt-5">
            <h2 className="font-extrabold font-inter text-4xl text-white ml-2">
              Your Active Track To Success
            </h2>
            <p className="text-gray-200 font-inter text-lg mt-3">
              Complete the all Tracks to earn skills, Badges and unlock your
              dream job
            </p>
          </div>

          {/* RIGHT SIDE ACTIVE TRACKS (horizontal scroll) */}
          <div className="flex-1 flex items-center justify-end">
            <div
              className="w-[370px] h-[200px] p-2 relative z-20 overflow-x-auto"
              aria-label="Active tracks carousel"
            >
              {/* container for horizontal cards */}
              <div className="flex gap-4 px-1 py-2 items-stretch snap-x snap-mandatory">
                {activeLoading ? (
                  <div className="min-w-[340px] bg-white/50 rounded-lg p-4 flex items-center justify-center">
                    <p className="text-sm text-gray-700 font-inter">
                      Loading...
                    </p>
                  </div>
                ) : activeTracks.length > 0 ? (
                  activeTracks.map((t) => (
                    <div
                      key={t.id}
                      className="min-w-[340px] bg-white/50 rounded-lg p-3 flex flex-col justify-between snap-center"
                    >
                      <div>
                        <span className="bg-green-500 text-white text-[10px] px-3 py-[4px] rounded-full font-inter">
                          Active Track
                        </span>

                        <h3 className="font-semibold text-black font-inter capitalize mt-3 truncate">
                          {t.roadmap_data?.roadmapTitle ?? "Untitled Roadmap"}
                        </h3>

                        <p className="text-sm text-gray-600 font-inter mt-2 truncate">
                          Duration: {t.roadmap_data?.duration ?? "—"}
                        </p>

                        <p className="text-sm tracking-tight text-gray-600 font-inter mt-1">
                          Started on:{" "}
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>

                      <div className="mt-2 flex gap-2">
                        <Button
                          onClick={() => router.push(`/home/my-tracks`)}
                          size="sm"
                          className="w-full font-inter text-sm bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                        >
                          Continue Learning <LuChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="min-w-[340px] bg-white/50 rounded-lg p-4 flex items-center justify-center">
                    <h1 className="font-inter font-semibold text-2xl text-black tracking-tight">
                      No track Created Yet <LuGhost className="inline ml-2" />
                    </h1>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========ALL TRACKS WITHT HE PROGRESS========= */}
      <div className="mt-6 p-6">
        <div className="flex items-center gap-10 mb-8">
          <h1 className="font-semibold text-2xl font-inter">
            My Tracks <LuTelescope className="inline ml-2" />
          </h1>

          <Button
            className="font-inter text-sm tracking-tight bg-gradient-to-br from-indigo-400 to-blue-400 text-white cursor-pointer"
            size="sm"
            onClick={() => router.push("/home/ai-tools/roadmap-maker")}
          >
            Generate New Track <LuArrowUpRight size={16} />{" "}
          </Button>
        </div>

        {startedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 mt-6 w-full sm:w-[400px] mx-auto">
            <Ghost className="w-14 h-14 mb-2 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-800 font-inter mb-2">
              No Tracks Found
            </h2>
            <p className="text-gray-500 font-inter text-sm mb-6">
              You haven’t started any learning track yet.
            </p>
            <Button
              onClick={() => router.push("/home/ai-tools/roadmap-maker")}
              className="font-inter bg-gradient-to-br from-indigo-500 to-sky-500 text-white px-5 py-2 text-sm"
            >
              Create New Roadmap <LuPlus className="ml-2" size={16} />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {startedTracks.map((track) => {
              const randomImage = `/${Math.floor(Math.random() * 5) + 1}.png`;

              return (
                <div
                  key={track.id}
                  className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition cursor-pointer w-[320px] h-[330px]"
                >
                  {/* Thumbnail Image */}
                  <div className="h-36 w-full rounded-lg overflow-hidden mb-3">
                    <Image
                      src={randomImage}
                      alt="Roadmap"
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title */}
                  <h2 className="font-semibold text-lg font-inter text-black whitespace-nowrap max-w-[300px] truncate">
                    {track.roadmap_data?.roadmapTitle || "Untitled Roadmap"}
                  </h2>

                  {/* Stage */}
                  <p className="text-sm text-gray-500 font-inter mt-2">
                    <span className="font-semibold text-black">
                      <LuSignpost className="inline mr-1 -mt-1 text-[16px]" />{" "}
                      Checkpoint-1
                    </span>{" "}
                    : Python Basics
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${track?.progress || 0}%` }}
                    />
                  </div>

                  <p className="text-xs font-inter text-muted-foreground mt-1">
                    {track.progress || 0}% completed
                  </p>

                  <div className="flex w-full items-center mt-4 justify-between">
                    <div>
                      {track.status === "not_started" ? (
                        <Button
                          onClick={() => handleStartLearning(track)}
                          className="font-inter text-sm w-full cursor-pointer bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                          size="sm"
                        >
                          Start Learning <LuChevronRight size={16} />
                        </Button>
                      ) : track.status === "going_on" ? (
                        <Button
                          className="font-inter text-sm w-full cursor-pointer bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                          size="sm"
                          onClick={() =>
                            router.push(`/home/my-tracks/${track.id}/start`)
                          }
                        >
                          Continue Learning <LuChevronRight size={16} />
                        </Button>
                      ) : track.status === "completed" ? (
                        <Button
                          className="font-inter text-sm w-full cursor-pointer bg-gradient-to-br from-green-400 to-green-600 text-white"
                          size="sm"
                        >
                          Completed <LuAward size={16} />
                        </Button>
                      ) : (
                        <Button
                          className="font-inter text-sm w-full cursor-pointer bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                          size="sm"
                          onClick={() => updateContinue(track)}
                        >
                          Resume Learning <LuChevronRight size={16} />
                        </Button>
                      )}
                    </div>

                    {/* === TO EDIT THE TRACK (pause or delete) === */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="w-9 h-9 bg-gray-100 text-black border rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition">
                          <IoSettingsOutline size={18} />
                        </div>
                      </PopoverTrigger>

                      <PopoverContent className="w-40 p-2 font-inter text-sm">
                        <button
                          onClick={() => updatePause(track)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition"
                        >
                          ⏸ Pause Track
                        </button>

                        <button
                          onClick={() => deleteTrack(track)}
                          className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 rounded-md transition"
                        >
                          <LuTrash2 size={16} className="inline mr-2 -mt-1" />{" "}
                          Delete Track
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LearningPathDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        loadingStep={loadingStep}
      />
    </div>
  );
};

export default MyTracks;
