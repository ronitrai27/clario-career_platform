"use client";
import { useSessionStore } from "@/lib/store/useSessionStore";
import Image from "next/image";
import React, { useState } from "react";
import VideoCard from "../../_components/Video-card";
import { LuMessageSquare, LuVideo, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const notes = [
  "Maintain professionalism while interacting with students during the session.",
  "Ensure your network connection is stable before joining.",
  "Choose a quiet and distraction-free environment.",
  "Be punctual — join at least 5 minutes before the scheduled time.",
  "Keep any necessary resources or notes ready beforehand.",
];

const VideoCallHome = () => {
  const { activeSession } = useSessionStore();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleChat = () => {
    if (!activeSession) return;
    router.push(`/dashboard/messages/mentor/${activeSession.id}`);
  };

  const handleStartSession = () => {
    setConfirmOpen(true);
  };

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

          {/* <p>{activeSession.session_id}</p> */}
        </div>
      </div>

      <div className="flex items-center gap-10 mt-10 justify-center">
        <Button
          className="font-inter tracking-tight text-sm cursor-pointer"
          variant="outline"
          onClick={handleChat}
        >
          Chat with {activeSession?.userName}{" "}
          <LuMessageSquare className="ml-2" />
        </Button>
        <Button
          className="font-inter tracking-tight text-sm cursor-pointer"
          variant="outline"
          onClick={handleStartSession}
        >
          Start Session
          <LuVideo className="ml-2" />
        </Button>
      </div>

      <div className="mt-10">
        <Card className="max-w-2xl mx-auto bg-blue-50/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl p-4">
          <CardHeader className="flex items-center space-x-2">
            <AlertCircle className="text-blue-500 w-5 h-5" />
            <CardTitle className="text-lg font-semibold font-sora">
              Important Notes Before Starting the Session
            </CardTitle>
          </CardHeader>
          <Separator className="mb-2 -mt-3 bg-gray-300" />
          <CardContent className="-mt-5">
            <ul className="list-disc list-inside space-y-2 text-sm font-inter text-gray-800">
              {notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Popup */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-sora text-center tracking-tight">Confirm Session Start</DialogTitle>
            <DialogDescription className="text-sm text-gray-800 font-inter text-center mt-4">
              Are you sure you want to start the video call session with{" "}
              <span className="font-semibold text-blue-600">
                {activeSession.userName}
              </span>{" "}
              for a{" "}
              <span className="font-semibold text-blue-600">
                {activeSession.session_type}
              </span>{" "}
              session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center items-center mx-auto gap-6 mt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel <LuX className="ml-2" />
            </Button>
            <Button
               onClick={() => router.push(`/dashboard/room/${activeSession.session_id}`)}
            >
              Start session <LuVideo className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCallHome;
