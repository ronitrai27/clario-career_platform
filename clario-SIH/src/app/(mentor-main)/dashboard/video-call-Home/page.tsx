"use client";
import { useSessionStore } from "@/lib/store/useSessionStore";
import Image from "next/image";
import React from "react";
import VideoCard from "../../_components/Video-card";
import { LuMessageSquare, LuVideo } from "react-icons/lu";
import { Button } from "@/components/ui/button";

const VideoCallHome = () => {
  const { activeSession } = useSessionStore();

  if (!activeSession) {
    return <p>No session selected.</p>;
  }

  return (
    <div className="p-4">
      <VideoCard />
      <h2 className="mt-6 font-inter text-3xl text-center font-semibold tracking-wide capitalize">
        Start your Video of{" "}
        <span className="font-sora text-blue-600 tracking-tight">
          {activeSession.session_type}
        </span>{" "}
        <LuVideo className="inline ml-4" />{" "}
      </h2>

      <div className="flex items-center gap-4 mt-6 justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl w-fit mx-auto">
        <Image
          src={activeSession.avatar || "/user.png"}
          alt="avatar"
          height={100}
          width={100}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold font-inter text-lg">
            {activeSession.userName}
          </p>
          <p className="text-gray-600 text-sm font-inter">
            {activeSession.userEmail}
          </p>
        </div>
      </div>

     <div className="flex items-center gap-10 mt-10 justify-center">
       <Button className="font-inter tracking-tight text-sm"  variant="outline">Chat with {activeSession?.userName} <LuMessageSquare className="ml-2" /></Button>
      <Button className="font-inter tracking-tight text-sm"  variant="outline">Start Session<LuVideo className="ml-2" /></Button>
     </div>
    </div>
  );
};

export default VideoCallHome;
