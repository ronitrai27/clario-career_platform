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
import { LuLoader } from "react-icons/lu";

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

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedDate(slotInfo.start);
    setSelectedEvent(null);
    setTitle("");
    setStartDate(slotInfo.start);
    setEndDate(moment(slotInfo.start).add(1, "hours").toDate()); // default +1h
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

  const handleSave = async () => {
    if (selectedEvent) {
      // edit mode
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
    } else if (title && startDate && endDate) {
      // create mode
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
        const newEvent: UserCalendarEvent = {
          ...data[0],
          start: new Date(data[0].start_time),
          end: new Date(data[0].end_time),
        };
        setEvents((prev) => [...prev, newEvent]);
      }
    }
    setIsOpenEvent(false);
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    const { error } = await supabase
      .from("userCalendar")
      .update({
        start_time: start,
        end_time: end,
      })
      .eq("id", event.id);

    if (!error) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
      );
    }
  };

  //  handle resize
  const handleEventResize = async ({ event, start, end }: any) => {
    const { error } = await supabase
      .from("userCalendar")
      .update({
        start_time: start,
        end_time: end,
      })
      .eq("id", event.id);

    if (!error) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev))
      );
    }
  };

  if(loading){
    return(
      <div className="w-full h-[calc(100vh-44px)] bg-gray-50 flex items-center justify-center">
        <p className="text-xl font-sora">
          <LuLoader className="animate-spin inline mr-4 text-2xl" /> Loading
          content...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{ height: "95%", padding: "26px 5px" }}
      className="bg-white border-t  font-inter font-medium text-black rounded"
    >
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

