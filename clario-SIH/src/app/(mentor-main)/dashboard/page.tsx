"use client";
import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import Link from "next/link";
import VideoUpload from "../_components/VideoUpload";
import VideoPlayer from "../_components/VideoPLayer";
import { HomeCalendar } from "../_components/HomeCalender";
import { StatsBoxes } from "../_components/HomeBoxes";
import SingleCard from "../_components/WelcomeCard";
import { MeetingsChart } from "../_components/SessionCharts";
import MentorMessagesList from "../_components/MentorMessageList";
import MentorSessionsTabs from "../_components/MentorTabs";
const Dashbaord = () => {
  const supabase = createClient();
  const router = useRouter();
  const { mentor, loading, ensureUserInDB } = useUserData();

  useEffect(() => {
    ensureUserInDB();
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
      router.push("/auth-mentor");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <div className="flex flex-col px-4 pb-20">
      <div className="flex gap-4 py-6  bg-gray-50 ">
        {/* LEFT SIDE CONTENT */}
        <div className="w-[72%] mx-auto">
          {/* Welcome box */}
          <SingleCard />
          {/* 3 boxes  */}
          <StatsBoxes />
          {/* charts */}
          <MeetingsChart />
        </div>
        {/* Right side */}
        <div className="w-[28%] mx-auto">
          <div className="max-w-[300px] mx-auto">
            <HomeCalendar />
          </div>
          <div className="bg-white w-full p-4 mt-16 h-[400px] overflow-y-scroll  rounded-md border">
            <h2 className="text-center font-sora text-xl">Messages</h2>
            <MentorMessagesList />
          </div>
        </div>
      </div>
      <div className="w-full">
        <MentorSessionsTabs />
      </div>
    </div>
  );
};

export default Dashbaord;

//  <div>
//         <VideoUpload />
//       </div>
//       <div>
//         <h1>watch video</h1>
//         <VideoPlayer/>
//       </div>
