
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { UserCalendarEvent } from "@/lib/types/allTypes";
import moment from "moment";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDatesInRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  let current = moment(start).startOf("day");
  const stop = moment(end).startOf("day");
  while (current.isSameOrBefore(stop)) {
    dates.push(current.toDate());
    current = current.add(1, "day");
  }
  return dates;
};

export function HomeCalendar() {
  const { user } = useUserData();
  const supabase = createClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState<Date[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("userCalendar")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error("Error fetching events:", error);
      } else if (data) {
        const mappedEvents = data.map((ev) => ({
          ...ev,
          start: new Date(ev.start_time),
          end: new Date(ev.end_time),
        }));

        // Compute all unique dates in event ranges for the current month
        const allDatesSet = new Set<string>();
        mappedEvents.forEach((event) => {
          getDatesInRange(event.start, event.end).forEach((d) => {
            const date = moment(d);
            // Only include dates in the current month and year
            if (date.year() === year && date.month() === month) {
              allDatesSet.add(date.format("YYYY-MM-DD"));
            }
          });
        });
        const uniqueDates = Array.from(allDatesSet).map((d) => new Date(d));
        setMarkedDates(uniqueDates);
      }
    };

    if (user) fetchEvents();
  }, [user?.id, year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const hasMeeting = markedDates.some((d) =>
        moment(d).isSame(moment(currentDay), "day")
      );
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <div
          key={day}
          className={`h-8 w-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors ${
            isToday
              ? "bg-blue-600 text-white"
              : hasMeeting
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "hover:bg-gray-100"
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <Card className="bg-white">
      <CardHeader className="">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium text-black font-inter tracking-tight">Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium max-w-[130px] text-center shrink-0 tracking-tight">
              {months[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 -mt-5">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-600 font-inter">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-black font-sora pt-2 border-t-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2 font-sora">
              <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
              <span>Events</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}