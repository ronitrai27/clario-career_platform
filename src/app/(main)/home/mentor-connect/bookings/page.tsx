"use client";
import SingleCard from "@/app/(main)/_components/Mentor-card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import React, { use, useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuGhost, LuVideo } from "react-icons/lu";
import { MentorSession } from "@/lib/types/allTypes";
import { Filter, FilterIcon, Loader } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserData } from "@/context/UserDataProvider";

const TABLE = "mentor_sessions";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];
const Bookings = () => {
  const supabase = createClient();
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const router = useRouter();
  const { user } = useUserData();

  // ================================================
  const fetchInitial = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("student_id", user?.id)
      .order("requested_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Failed to fetch mentor sessions:", error);
      setSessions([]);
    } else {
      setSessions((data as MentorSession[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitial();

    // Real-time subscription: listen for INSERT / UPDATE / DELETE
    const channel = supabase
      .channel("public:mentor_sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          setSessions((prev) => [payload.new as MentorSession, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: TABLE },
        (payload) => {
          setSessions((prev) => {
            return prev.map((s) =>
              s.id === payload.new.id ? (payload.new as MentorSession) : s
            );
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: TABLE },
        (payload) => {
          setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ===============================================
  const filtered = useMemo(() => {
    if (selectedFilter === "all") return sessions;
    return sessions.filter((s) => s.status === selectedFilter);
  }, [sessions, selectedFilter]);

  // =====================================================
  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString();
  }

  // =====================================================
  // const handleJoinVC = () => {
  //   if (!s.vc_link) return;
  //   router.push(`/room/${s.vc_link}`);
  // };

  // ==========================================
  return (
    <div className="w-full h-full bg-gray-50 px-3 py-2 overflow-hidden">
      <SingleCard />

      <div className="mt-4 flex items-center  w-full">
        <p className="text-sm font-inter ml-5 cursor-pointer ">
          <LuChevronLeft className="inline mr-2" /> Back
        </p>

        <h2 className="font-inter text-2xl font-semibold text-center mx-auto">
          My Bookings
        </h2>
      </div>
      <div className="flex h-full gap-4 mt-4">
        {/* LEFT SIDE FILTERS lik Pending , Comfirmed , Completed , Rejected */}
        <div className="w-48 p-2">
          <h3 className="text-lg font-semibold mb-3 font-sora">
            Filters <FilterIcon className="inline ml-3 " size={20} />
          </h3>
          <div className="flex flex-col gap-5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`text-left px-3 py-2 font-inter text-base capitalize bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300 transition-colors ${
                  selectedFilter === f.key
                    ? "bg-blue-400 text-white font-inter font-medium"
                    : ""
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Separator orientation="vertical" />

        {/* RIGHT SIDE CARDS */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-inter whitespace-nowrap">
              Total Sessions Found : {filtered.length}
            </h2>
          </div>

          {loading && (
            <div className="w-full h-full mt-20 -ml-20 flex justify-center">
              <Loader className="animate-spin mr-5" size={24} />
              <p className="font-inter text-lg">Loading....</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Image
                    src={s.mentorAvatar || `/default-avatar.png`}
                    alt={s.mentorName}
                    width={100}
                    height={100}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium font-inter capitalize">
                      {s.mentorName}
                    </div>
                    <div className="text-sm text-muted-foreground font-inter">
                      {s.session_type}
                    </div>
                  </div>
                  <div className="ml-auto text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-inter font-medium capitalize ${
                        s.status === "pending"
                          ? "bg-yellow-600/20"
                          : s.status === "accepted"
                          ? "bg-green-600/20"
                          : s.status === "completed"
                          ? "bg-blue-600/20"
                          : "bg-red-600/20"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-sm font-inter text-muted-foreground">
                  <div>
                    <strong>Date:</strong>{" "}
                    {formatDate(s.scheduled_at || s.requested_at)}
                  </div>
                  {s.vc_link && (
                    <div
                      className="mt-2 font-inter text-sm text-blue-600 cursor-pointer"
                      onClick={() => router.push(`/room/${s.vc_link}`)}
                    >
                      <LuVideo className="inline mr-2" />
                      Join Video Call
                    </div>
                  )}
                </div>

                {s.notes && (
                  <div className="mt-3 text-sm font-inter">
                    Notes: {s.notes}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center text-muted-foreground font-inter text-lg">
                No sessions Found <LuGhost className="inline ml-2" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
