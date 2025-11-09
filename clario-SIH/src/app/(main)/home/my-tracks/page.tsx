"use client";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  LuChevronRight,
  LuGhost,
  LuSignpost,
  LuTelescope,
} from "react-icons/lu";

const MyTracks = () => {
  const { user } = useUserData();
  const supabase = createClient();
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const [startedTracks, setStartedTracks] = useState<any[]>([]);

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
  // =========================FETCH  1 ACTIVE TRACK========================
  useEffect(() => {
    const fetchActiveTrack = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("roadmapUsers")
        .select("*")
        .eq("user_id", user.id)
        .eq("isStarted", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setActiveTrack(data);
      }

      //   setLoading(false);
    };

    fetchActiveTrack();
  }, [user?.id]);
  return (
    <div className="bg-gray-50 h-full w-full p-4">
      {/* ======STARTER SINGLE CARD====== */}
      <div className="w-[90%] h-[220px] bg-gradient-to-br from-indigo-300 to-rose-400 rounded-lg mx-auto relative overflow-hidden p-4">
        <Image
          src="/tr1.png"
          alt="tr"
          width={200}
          height={200}
          className=" absolute -right-10 -bottom-20"
        />

        <div className="flex gap-10 pr-5">
          <div className="w-[500px] mt-5">
            <h2 className="font-extrabold font-inter text-4xl text-white ml-2">
              Your Active Track To Success
            </h2>
            <p className="text-gray-200 font-inter text-lg mt-3">
              Complete the all Tracks to earn skills, Badges and unlock your
              dream job
            </p>
          </div>
          {/* RIGHT SIDE ACTIVE TRACK */}
          <div>
            <div className="bg-white/50 rounded-lg w-[370px] h-[180px] p-2 ml-20 relative z-20">
              {activeTrack ? (
                <>
                  <div>
                    <span className="bg-green-500 text-white text-[10px] px-3 py-[4px] rounded-full font-inter">
                      Active Track
                    </span>

                    <h3 className="font-semibold text-black font-inter capitalize mt-4">
                      {activeTrack.roadmap_data?.roadmapTitle ||
                        "Untitled Roadmap"}
                    </h3>

                    <p className="text-sm text-gray-600 font-inter mt-2">
                      Duration: {activeTrack.roadmap_data?.duration}
                    </p>

                    <p className="text-sm tracking-tight text-gray-600 font-inter mt-1">
                      Started on:{" "}
                      {new Date(activeTrack.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    onClick={() => (window.location.href = "/home/my-tracks")}
                    size="sm"
                    className="w-full font-inter text-sm mt-3 bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                  >
                    Continue Learning <LuChevronRight size={16} />
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-full flex flex-col items-center justify-center">
                    <h1 className="font-inter font-semibold text-2xl text-black tracking-tight">
                      No track Created Yet <LuGhost className="inline ml-2" />
                    </h1>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========ALL TRACKS WITHT HE PROGRESS========= */}
      <div className="mt-8 p-6">
        <h1 className="font-semibold text-2xl font-inter">
          My Tracks <LuTelescope className="inline ml-2" />
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {startedTracks.map((track) => {
            const randomImage = `/${Math.floor(Math.random() * 5) + 1}.png`;

            return (
              <div
                key={track.id}
                className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition cursor-pointer"
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
                <h2 className="font-semibold text-lg font-inter text-black">
                  {track.roadmap_data?.roadmapTitle || "Untitled Roadmap"}
                </h2>

                {/* Stage */}
                <p className="text-sm text-gray-500 font-inter mt-1">
                  <span className="font-semibold text-black">
                    <LuSignpost className="inline mr-1 -mt-1 text-[16px]" />{" "}
                    Checkpoint-1
                  </span>{" "}
                  : Python Basics
                </p>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: "33%" }}
                  ></div>
                </div>

                <p className="text-xs font-inter text-muted-foreground mt-1">
                  33% completed
                </p>

                <Button
                  onClick={() =>
                    (window.location.href = `/home/my-tracks/${track.id}/start`)
                  }
                  className="font-inter text-sm w-full cursor-pointer mt-4 bg-gradient-to-br from-indigo-400 to-sky-500 text-white"
                  size="sm"
                >
                  Start Learning <LuChevronRight size={16} />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyTracks;
