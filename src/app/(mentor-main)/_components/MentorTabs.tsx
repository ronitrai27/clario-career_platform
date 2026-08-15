"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MentorSession } from "@/lib/types/allTypes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LuEye } from "react-icons/lu";
import { Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmTab from "./ConfirmTab";

export default function MentorSessionsTabs() {
  const supabase = createClient();
  const { mentor } = useUserData();
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingSessions, setPendingSessions] = useState<
    (MentorSession & {
      userName: string;
      userEmail: string;
      avatar: string | null;
    })[]
  >([]);

  useEffect(() => {
    if (!mentor?.id) return;

    const fetchPending = async () => {
      const { data: sessions, error } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("mentor_id", mentor.id)
        .eq("status", "pending")
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending sessions:", error);
        return;
      }

      if (!sessions || sessions.length === 0) {
        setPendingSessions([]);
        return;
      }

      // Get all unique student IDs
      const studentIds = [...new Set(sessions.map((s) => s.student_id))];

      // Fetch user details from `users` table
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, userName, userEmail, avatar")
        .in("id", studentIds);

      if (userError) {
        console.error("Error fetching user details:", userError);
        return;
      }

      // Merge sessions with their user info
      const merged = sessions.map((session) => {
        const user = users?.find((u) => u.id === session.student_id);
        return {
          ...session,
          userName: user?.userName || "Unknown User",
          userEmail: user?.userEmail || "No Email",
          avatar: user?.avatar || "/user.png",
        };
      });

      setPendingSessions(merged);
    };

    fetchPending();
  }, [mentor?.id]);

  // -----------------Subscribe to realtime updates-----------------------
  useEffect(() => {
    if (!mentor?.id) return;

    const channel = supabase
      .channel("mentor_sessions_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentor_sessions" },
        async (payload) => {
          const newSession = payload.new as MentorSession;

          if (
            newSession.mentor_id === mentor.id &&
            newSession.status === "pending"
          ) {
            // Fetch user details for this student
            const { data: user, error: userError } = await supabase
              .from("users")
              .select("id, userName, userEmail, avatar")
              .eq("id", newSession.student_id)
              .single();

            if (userError) {
              console.error(
                "Error fetching user details for new session:",
                userError
              );
            }

            setPendingSessions((prev) => [
              {
                ...newSession,
                userName: user?.userName || "Unknown User",
                userEmail: user?.userEmail || "No Email",
                avatar: user?.avatar || "/user.png",
              },
              ...prev,
            ]);

            toast.success("New session request received!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentor?.id]);

  // -------------------------------------------------------
  // --------------------------ACCEPT / REJECT SESSION REQUEST-----------------------
  // ---------------------------------------------------------
  const handleAccept = async (sessionId: string) => {
    const { error } = await supabase
      .from("mentor_sessions")
      .update({ status: "accepted" })
      .eq("id", sessionId);

    if (error) {
      console.error("Error accepting session:", error);
      toast.error("Failed to accept session");
    } else {
      toast.success("Session accepted!");
      setPendingSessions((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );
    }
  };

  const handleReject = async (sessionId: string) => {
    const { error } = await supabase
      .from("mentor_sessions")
      .update({ status: "rejected" })
      .eq("id", sessionId);

    if (error) {
      console.error("Error rejecting session:", error);
      toast.error("Failed to reject session");
    } else {
      toast.info("Session rejected!");
      setPendingSessions((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );
    }
  };

  return (
    <Tabs
      defaultValue="pending"
      className="w-full max-w-[1080px] mx-auto mt-10 bg-gray-100 p-4 rounded-lg"
    >
      <TabsList className="grid w-full grid-cols-3 font-inter text-lg font-semibold">
        <TabsTrigger value="pending">Pending Request</TabsTrigger>
        <TabsTrigger value="accepted-rejected">Confirmed Request</TabsTrigger>
        <TabsTrigger value="completed">Ongoing Session</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="p-4 bg-white">
        {pendingSessions.length === 0 ? (
          <p className="text-center text-gray-600">
            No pending session requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-5 font-inter font-semibold text-sm text-gray-800 border-b pb-2 mb-2 ml-10">
              <p>User Details</p>
              <p className="text-center">Requested On</p>
              <p className="text-center">Scheduled On</p>
              <p className="text-center">Note</p>
              <p className="text-center">Action</p>
            </div>
            {pendingSessions.map((session) => (
              <div
                key={session.id}
                className=" border border-gray-200 rounded-md flex justify-between items-center p-2"
              >
                <div className="flex gap-4">
                  <Image
                    src={session.avatar || "/user.png"}
                    alt="avatar"
                    height={100}
                    width={100}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex flex-col font-inter text-sm tracking-tight ">
                    <p className="font-semibold capitalize">
                      {session.userName}
                    </p>
                    <p>{session.userEmail}</p>
                  </div>
                </div>

                <p className="text-sm font-inter tracking-tight">
                  {session.scheduled_at
                    ? new Date(session.requested_at).toLocaleDateString()
                    : "Date of requested"}
                </p>

                <p className="text-sm font-inter tracking-tight">
                  {session.scheduled_at
                    ? new Date(session.scheduled_at).toLocaleString()
                    : ""}
                </p>

                <p>{session.session_type}</p>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-inter tracking-tight cursor-pointer text-sm text-muted-foreground flex items-center gap-1">
                        View Note <LuEye className="inline" />
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      {session.notes || "No note available"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* ACTIONS- ACCEPT/REJECT */}
                <div className="flex gap-5">
                  <div
                    className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => handleAccept(session?.id)}
                  >
                    <Check className="cursor-pointer text-white" />
                  </div>
                  <div
                    className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => handleReject(session?.id)}
                  >
                    <X className="cursor-pointer text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="accepted-rejected" className="p-4 bg-white">
        <ConfirmTab />
      </TabsContent>

      <TabsContent value="completed" className="p-6 bg-white">
        <p className="text-center text-gray-600">
          Here you’ll see all completed sessions.
        </p>
      </TabsContent>
    </Tabs>
  );
}
