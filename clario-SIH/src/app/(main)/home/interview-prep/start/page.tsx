"use client";
import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useUserData } from "@/context/UserDataProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import React from "react";
import {
  LuChevronLeft,
  LuDownload,
  LuFileVideo,
  LuGhost,
  LuMessagesSquare,
  LuMic,
  LuMicOff,
  LuVideo,
  LuVideoOff,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import Vapi from '@vapi-ai/web';
import AI_Voice from "@/components/kokonutui/ai-voice";
// const vapi = new Vapi('YOUR_PUBLIC_API_KEY');

const InterviewStart = () => {
  const { user } = useUserData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success("Camera turned on");
      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    toast.success("Camera turned off");
    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) stopCamera();
    else startCamera();
  };

  const toggleMic = async () => {
    if (isMicOn) {
      setIsMicOn(false);
      toast.success("Mic turned off");
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicOn(true);
        toast.success("Mic turned on");
      } catch (err) {
        console.error("Mic access error:", err);
      }
    }
  };

  const handleEnd = () => {
    stopCamera();
    setIsMicOn(false);
  };

  // optional: cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);
  return (
    <div className="w-full h-screen overflow-hidden  bg-white p-4">
      <div className="flex justify-between w-full">
        <div>
          <div className="flex gap-3">
            <SidebarTrigger />
            <p className=" font-inter flex items-center gap-3 px-4">
              <LuChevronLeft className="w-4 h-4" /> Back
            </p>
          </div>
          <h1 className="text-[27px] font-sora font-semibold mt-2 flex items-center gap-4">
            AI Interview Prep <LuVideo className="w-6 h-6" />
          </h1>
        </div>
        <Image
          src={user?.avatar || "/user.png"}
          alt="User Avatar"
          width={70}
          height={70}
          className="rounded-full w-[72px] h-[72px] shrink-0"
        />
      </div>
      <Separator className="my-2 max-w-[90%] bg-gray-300 mx-auto" />

      {/* PARENT BOX - LEFT VIDEO / RIGHT - MESSAGE */}
      <div className="flex gap-5 ">
        {/* LEFT */}
        <div className="flex-1 p-2">
          <div className="flex justify-between mb-2">
            <div className="flex gap-4">
              <div className="w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
              <p className="font-inter text-base tracking-wide">
                Connecting...
              </p>
            </div>

            <p className="font-semibold font-sora text-xl">00:00</p>
          </div>
          {/* VIDEO PART */}
          <div className="flex  justify-center w-full h-[520px] border rounded-lg shadow relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
            />
            {!isCameraOn && (
              <div>
                <Image
                  src={user?.avatar || "/user.png"}
                  alt="User Avatar"
                  width={70}
                  height={70}
                  className="rounded-full w-[200px] h-[200px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            )}

            <div className="w-[180px] h-[180px] bg-blue-50 absolute top-3 right-3 rounded-lg border-2 border-blue-400 flex flex-col items-center justify-center overflow-hidden">
              <div className="  bg-white border rounded-full w-16 h-16 flex items-center justify-center shrink-0 -mb-5">
                <h1 className="font-extrabold font-inter text-2xl">AI</h1>
              </div>
              <div className="mt-10 flex flex-col space-y-1">
                <AI_Voice />
                <p className="text-center font-inter text-sm">Listening</p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-center gap-10">
            {/*  Video Button */}
            <Button
              variant={isCameraOn ? "default" : "outline"}
              onClick={toggleCamera}
              className="font-inter text-sm shadow-md cursor-pointer"
            >
              {isCameraOn ? (
                <LuVideo className="w-4 h-4 mr-2 text-white" />
              ) : (
                <LuVideoOff className="w-4 h-4 mr-2 text-black" />
              )}
              Video
            </Button>

            {/*  Mic Button */}
            <Button
              variant={isMicOn ? "default" : "outline"}
              onClick={toggleMic}
              className="font-inter text-sm shadow-md cursor-pointer"
            >
              {isMicOn ? (
                <LuMic className="w-4 h-4 mr-2 text-white" />
              ) : (
                <LuMicOff className="w-4 h-4 mr-2 text-black" />
              )}
              Mic
            </Button>

            {/*  End Button */}
            <Button
              variant="destructive"
              onClick={handleEnd}
              className="font-inter text-sm shadow-md cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              End
            </Button>
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-[28%] bg-gray-50 rounded-lg border p-3 flex flex-col">
          <h2 className="flex items-center justify-center gap-3 font-inter text-xl">
            Transcribe <LuMessagesSquare className="w-6 h-6" />
          </h2>
          <div className="bg-blue-50 border border-blue-400 mt-4 px-3 py-6 rounded-md">
            <p className="font-inter tracking-tight text-sm text-center">
              All transcriptions appear here. Please give clear, relevant
              answers.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center h-full ">
            <h2 className="font-inter text-lg text-muted-foreground mb-2">No Transcriptions Available</h2>
            <LuGhost  className="w-6 h-6 text-muted-foreground" />
          </div>

          <div className="w-full mt-auto">
            <Separator className="my-2" />
            <Button className="font-inter text-sm w-full bg-white text-black cursor-pointer">Download Transcribe <LuDownload className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewStart;
