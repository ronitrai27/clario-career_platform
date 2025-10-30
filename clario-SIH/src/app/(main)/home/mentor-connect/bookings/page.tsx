"use client";
import SingleCard from "@/app/(main)/_components/Mentor-card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useMemo, useState } from "react";
import { LuChevronLeft } from "react-icons/lu";
import { MentorSession } from "@/lib/types/allTypes";

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

  // ================================================
  const fetchInitial = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
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

  // ==========================================
  return (
    <div className="w-full h-full bg-gray-50 p-3 overflow-hidden">
      <SingleCard />

      <div className="mt-4 flex items-center  w-full">
        <p className="text-sm font-inter ml-5 cursor-pointer ">
          <LuChevronLeft className="inline mr-2" /> Back
        </p>

        <h2 className="font-inter text-2xl font-semibold text-center mx-auto">
          My Bookings
        </h2>
      </div>
      <div className="flex h-full gap-4">
        {/* LEFT SIDE FILTERS lik Pending , Comfirmed , Completed , Rejected */}
        <div className="w-48 p-2">
          <h3 className="text-lg font-semibold mb-3 font-sora">Filters</h3>
          <div className="flex flex-col gap-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={`text-left px-3 py-2 font-inter text-base capitalize bg-blue-100 rounded-md cursor-pointer hover:bg-blue-300 transition-colors ${
                  selectedFilter === f.key ? "bg-white/10 font-medium" : ""
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
            <h2 className="text-xl font-semibold">
              Sessions ({filtered.length})
            </h2>
            {loading && <span className="text-sm">Loading…</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 bg-white/5 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={s.mentorAvatar || `/default-avatar.png`}
                    alt={s.mentorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{s.mentorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.session_type}
                    </div>
                  </div>
                  <div className="ml-auto text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
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

                <div className="mt-3 text-sm text-muted-foreground">
                  <div>
                    <strong>Date:</strong>{" "}
                    {formatDate(s.scheduled_at || s.requested_at)}
                  </div>
                  {s.vc_link && (
                    <div className="mt-2">
                      <a
                        href={s.vc_link}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sm"
                      >
                        Join VC
                      </a>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <div className="mt-3 text-sm">Notes: {s.notes}</div>
                )}
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center text-muted-foreground">
                No sessions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
