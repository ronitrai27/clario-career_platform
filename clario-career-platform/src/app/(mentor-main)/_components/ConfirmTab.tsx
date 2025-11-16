"use client";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { useSessionStore } from "@/lib/store/useSessionStore";
import { createClient } from "@/lib/supabase/client";
import { MentorSession } from "@/lib/types/allTypes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LuActivity } from "react-icons/lu";
import { toast } from "sonner";

const ConfirmTab = () => {
  const supabase = createClient();
  const { mentor } = useUserData();
  const router = useRouter();
  const { setActiveSession } = useSessionStore();
  const [acceptedSessions, setAcceptedSessions] = useState<
    (MentorSession & {
      userName: string;
      userEmail: string;
      avatar: string | null;
    })[]
  >([]);

  useEffect(() => {
    if (!mentor?.id) return;

    const fetchAccepted = async () => {
      const { data: sessions, error } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("mentor_id", mentor.id)
        .in("status", ["accepted"])
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching accepted/rejected sessions:", error);
        return;
      }

      if (!sessions || sessions.length === 0) {
        setAcceptedSessions([]);
        return;
      }

      // Get unique student IDs
      const studentIds = [...new Set(sessions.map((s) => s.student_id))];

      // Fetch user info
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, userName, userEmail, avatar")
        .in("id", studentIds);

      if (userError) {
        console.error("Error fetching users for accepted/rejected:", userError);
        return;
      }

      // Merge user info
      const merged = sessions.map((session) => {
        const user = users?.find((u) => u.id === session.student_id);
        return {
          ...session,
          userName: user?.userName || "Unknown User",
          userEmail: user?.userEmail || "No Email",
          avatar: user?.avatar || "/user.png",
        };
      });

      setAcceptedSessions(merged);
    };

    fetchAccepted();
  }, [mentor?.id]);
  //   -------------------------------------------REALTIME EVENTS--------------------
  useEffect(() => {
    if (!mentor?.id) return;

    const channel = supabase
      .channel("mentor_sessions_update_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mentor_sessions" },
        async (payload) => {
          const updated = payload.new as MentorSession;

          if (
            updated.mentor_id === mentor.id &&
            updated.status === "accepted"
          ) {
            // Fetch student details for the accepted session
            const { data: user } = await supabase
              .from("users")
              .select("id, userName, userEmail, avatar")
              .eq("id", updated.student_id)
              .single();

            setAcceptedSessions((prev) => [
              {
                ...updated,
                userName: user?.userName || "Unknown User",
                userEmail: user?.userEmail || "No Email",
                avatar: user?.avatar || "/user.png",
              },
              ...prev.filter((s) => s.id !== updated.id),
            ]);
            toast.success("Session accepted!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentor?.id]);
  return (
    <div className=" bg-white">
      {acceptedSessions.length === 0 ? (
        <p className="text-center text-gray-600">No accepted sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between w-full font-inter font-semibold text-sm text-gray-800 border-b pb-2 px-6 mb-2 ">
            <p>User Details</p>
            <p className="text-center">Requested On</p>
            <p className="text-center">Scheduled On</p>
            <p className="">Start Session</p>
          </div>
          {acceptedSessions.map((session) => (
            <div
              key={session.id}
              className="border border-gray-200 rounded-md p-2 flex items-center justify-between"
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
                  <p className="font-semibold capitalize">{session.userName}</p>
                  <p>{session.userEmail}</p>
                </div>
              </div>
              <p className="text-sm font-inter">
                {session.scheduled_at
                  ? new Date(session.requested_at).toLocaleDateString()
                  : "Date of requested"}
              </p>

              <p className="text-sm font-inter">
                {session.scheduled_at
                  ? new Date(session.scheduled_at).toLocaleString()
                  : ""}
              </p>
              {/* <p>{session.session_type}</p> */}
             

              <Button
                size="sm"
                variant="default"
                className="text-sm font-inter tracking-tight cursor-pointer"
                onClick={() => {
                  setActiveSession({
                    userName: session.userName,
                    id: session.student_id,
                    session_id: session.id,
                    userEmail: session.userEmail,
                    avatar: session.avatar,
                    session_type: session.session_type,
                  });
                  router.push("/dashboard/video-call-Home");
                }}
              >
                Start Session <LuActivity className="ml-2" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfirmTab;
