"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

import type { RoadmapTrack, Checkpoint } from "@/lib/types/allTypes";
import {
  LuChevronDown,
  LuChevronLast,
  LuChevronLeft,
  LuChevronRight,
  LuFlagTriangleRight,
  LuLockKeyhole,
  LuLockKeyholeOpen,
  LuMapPinned,
} from "react-icons/lu";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const MyTrackStart = () => {
  const supabase = createClient();
  const params = useParams();

  const [track, setTrack] = useState<RoadmapTrack | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

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

      //  Calculate Progress Percentage
      const completedCheckpoints = data.checkpoints.filter(
        (cp: Checkpoint) => cp.isMockDone
      ).length;

      const totalCheckpoints = data.checkpoints.length;
      const calculatedProgress = Math.round(
        (completedCheckpoints / totalCheckpoints) * 100
      );

      setProgress(calculatedProgress);
      // Update in roadmapUsers table
      await supabase
        .from("roadmapUsers")
        .update({ progress: calculatedProgress })
        .eq("id", params.id);
      setLoading(false);
    };

    fetchTrack();
  }, [params.id]);

  // ==================================
  // ==========Progress View============

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
      </div>
      <div className="flex items-center justify-between relative mt-8">
        <h2 className="font-inter absolute left-10">
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

                    <div className="w-9 h-9 bg-white border rounded-full flex items-center justify-center">
                      <LuChevronDown className="text-black text-[22px] cursor-pointer" />
                    </div>
                  </div>
                </div>

                <p className="text-gray-800 font-inter -mt-1 mb-3 ml-6">
                  {checkpoint.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyTrackStart;
