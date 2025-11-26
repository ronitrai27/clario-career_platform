/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UserCalendarEvent } from "@/lib/types/allTypes";
import { useUserData } from "@/context/UserDataProvider";
import { LuChevronLeft, LuLoader } from "react-icons/lu";
import { Calendar1 } from "lucide-react";

import Link from "next/link";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);
// const DnDCalendar = withDragAndDrop(Calendar);
const DndCalendar = withDragAndDrop<UserCalendarEvent, object>(Calendar);

type MyEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const eventStyleGetter = (
  event: any,
  start: Date,
  end: Date,
  isSelected: boolean
) => {
  const style = {
    backgroundColor: "#3B82F6",
    color: "white",
    borderRadius: "6px",
    border: "none",
    padding: "2px 6px",
    display: "block",
  };
  return { style };
};

export default function MyCalendar() {
  const { user } = useUserData();
  const [events, setEvents] = useState<UserCalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpenEvent, setIsOpenEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UserCalendarEvent | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("userCalendar")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      } else if (data) {
        const mapped = data.map((ev) => ({
          ...ev,
          start: new Date(ev.start_time),
          end: new Date(ev.end_time),
        }));
        setEvents(mapped);
        setLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user?.id]);

  // =====================================
  // ========GOOGLE CALENDAR=============
  const getRefreshToken = async () => {
    const { data } = await supabase
      .from("users")
      .select("google_refresh_token")
      .eq("id", user?.id)
      .single();

    return data?.google_refresh_token;
  };

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedDate(slotInfo.start);
    setSelectedEvent(null);
    setTitle("");
    setStartDate(slotInfo.start);
    setEndDate(moment(slotInfo.start).add(1, "hours").toDate());
    setIsOpenEvent(true);
  };

  const handleSelectEvent = (event: object, _e: React.SyntheticEvent) => {
    const ev = event as UserCalendarEvent;
    setSelectedEvent(ev);
    setSelectedDate(null);
    setTitle(ev.title);
    setStartDate(ev.start);
    setEndDate(ev.end);
    setIsOpenEvent(true);
  };

  // =============================================

  // ===============================================
  const handleSave = async () => {
    if (selectedEvent) {
      // -------------------------
      // EDIT MODE
      // -------------------------
      const { data, error } = await supabase
        .from("userCalendar")
        .update({
          title,
          start_time: startDate,
          end_time: endDate,
        })
        .eq("id", selectedEvent.id)
        .select();

      if (!error && data) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === selectedEvent.id
              ? { ...ev, title, start: startDate!, end: endDate! }
              : ev
          )
        );
      }

      // 🔵 SYNC TO GOOGLE CALENDAR (server route)
      await fetch("/api/google/sync", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          type: "update",
          event: {
            google_event_id: selectedEvent.google_event_id,
            title,
            start: startDate?.toISOString(),
            end: endDate?.toISOString(),
          },
        }),
      });
    } else if (title && startDate && endDate) {
      // -------------------------
      // CREATE MODE
      // -------------------------

      const { data, error } = await supabase
        .from("userCalendar")
        .insert([
          {
            user_id: user?.id,
            title,
            start_time: startDate,
            end_time: endDate,
          },
        ])
        .select();

      if (!error && data && data[0]) {
        const created = data[0];

        // 🔵 FIRST insert event locally (UI)
        const newEvent: UserCalendarEvent = {
          ...created,
          start: new Date(created.start_time),
          end: new Date(created.end_time),
          google_event_id: null,
        };
        setEvents((prev) => [...prev, newEvent]);

        // 🔵 THEN sync with Google Calendar
        const res = await fetch("/api/google/sync", {
          method: "POST",
          body: JSON.stringify({
            userId: user?.id,
            type: "create",
            event: {
              title,
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            },
          }),
        });

        const { google_event_id } = await res.json();

        if(!google_event_id) {
          toast.error("Failed to sync with Google Calendar. Please try again.");
        }

        console.log("GOOGLE EVENT ID", google_event_id);

        // 🔵 Save google_event_id to Supabase
        if (google_event_id) {
          await supabase
            .from("userCalendar")
            .update({ google_event_id })
            .eq("id", created.id);
        }
      }
    }

    setIsOpenEvent(false);
  };

  //  handle resize

  //  ========================================================
  const handleEventDrop = async ({ event, start, end }: any) => {
    await supabase
      .from("userCalendar")
      .update({
        start_time: start,
        end_time: end,
      })
      .eq("id", event.id);

    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
    );

    // sync google
    await fetch("/api/google/sync", {
      method: "POST",
      body: JSON.stringify({
        userId: user?.id,
        type: "update",
        event: {
          google_event_id: event.google_event_id,
          title: event.title,
          start: start.toISOString(),
          end: end.toISOString(),
        },
      }),
    });
  };
  // =====================================================

  // ========================================================
  const handleEventResize = async ({ event, start, end }: any) => {
    await supabase
      .from("userCalendar")
      .update({
        start_time: start,
        end_time: end,
      })
      .eq("id", event.id);

    setEvents((prev) =>
      prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
    );

    // sync google
    await fetch("/api/google/sync", {
      method: "POST",
      body: JSON.stringify({
        userId: user?.id,
        type: "update",
        event: {
          google_event_id: event.google_event_id,
          title: event.title,
          start: start.toISOString(),
          end: end.toISOString(),
        },
      }),
    });
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-44px)] bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-sora">
          <LuLoader className="animate-spin inline mr-4 text-2xl" /> Loading
          content...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ height: "100%", padding: "26px 5px" }}
      className="bg-white border-t  font-inter font-medium text-black rounded"
    >
      <div className="mb-5 flex items-center gap-20">
        <p className="text-sm font-inter ml-5 cursor-pointer ">
          <LuChevronLeft className="inline mr-2" /> Back
        </p>

        <Link href={`/api/google/connect?user_id=${user?.id}`}>
          <Button
            className="font-inter cursor-pointer"
            size="sm"
            variant="outline"
          >
            Connect Google Calendar <Calendar1 className="inline ml-2" />
          </Button>
        </Link>
      </div>
      <DndCalendar
        selectable
        resizable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        style={{ height: "100%" }}
        className="bg-white"
      />

      {/* Dialog for Create/Edit Event */}
      <Dialog open={isOpenEvent} onOpenChange={setIsOpenEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center font-semibold font-sora">
              {selectedEvent ? "Edit Event" : "Add Event"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />

            {!selectedEvent && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start</label>
                  <Input
                    type="datetime-local"
                    value={
                      startDate
                        ? moment(startDate).format("YYYY-MM-DDTHH:mm")
                        : ""
                    }
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End</label>
                  <Input
                    type="datetime-local"
                    value={
                      endDate ? moment(endDate).format("YYYY-MM-DDTHH:mm") : ""
                    }
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpenEvent(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
