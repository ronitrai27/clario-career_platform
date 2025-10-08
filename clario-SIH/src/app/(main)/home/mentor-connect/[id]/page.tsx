"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DBMentor, MentorProfile } from "@/lib/types/allTypes";
import {
  getAllMentorProfiles,
  getMatchingMentors,
} from "@/lib/functions/dbActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  LuBookmark,
  LuBriefcaseBusiness,
  LuLoader,
  LuMail,
  LuMessageCircle,
  LuScreenShare,
  LuTimer,
  LuUser,
  LuUserCheck,
  LuX,
} from "react-icons/lu";
import { toast } from "sonner";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function MentorConnectPage() {
  const params = useParams();
  const mentorId = params?.id as string;

  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [recomentors, recoSetMentors] = useState<DBMentor[]>([]);
  const [mentorLoading, setMentorLoading] = useState<boolean>(false);

  // booking dialog state
  const [sessionType, setSessionType] = useState<"30" | "45" | null>(null);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);

  const supabase = createClient();
  const { user } = useUserData();
  const router = useRouter();

  // fetching mentor details-------------------------------
  useEffect(() => {
    async function fetchMentor() {
      setLoading(true);
      try {
        const mentors = await getAllMentorProfiles();
        const found = mentors.find((m) => m.id === mentorId) || null;
        setMentor(found);
      } catch (err) {
        console.error("Error fetching mentor:", err);
        setMentor(null);
      } finally {
        setLoading(false);
      }
    }
    if (mentorId) fetchMentor();
  }, [mentorId]);
  // ---------------------------------------------
  // SHOWING MENTORS---------------------------------------
  useEffect(() => {
    if (!user || !user.mainFocus) return;
    if (recomentors.length > 0) return;
    setMentorLoading(true);
    getMatchingMentors(user?.mainFocus)
      .then((data) => recoSetMentors(data))
      .finally(() => setMentorLoading(false));
  }, [user]);

  //   SUBMIT FUNCTION TO UPDATE CREDITS FOR USER AND SAVE SESSION IN TABLE.
  async function handleSubmit() {
    if (!sessionType || !date || !user) {
      toast.error("Please select a session type and date.");
      return;
    }

    if (!notes || notes.trim().length === 0) {
      toast.error("Please add a note before booking.");
      return;
    }

    const cost = sessionType === "30" ? 20 : 35;

    // check credits
    if (user.remainingCredits < cost) {
      toast.info(" Not enough credits to book this session.");
      return;
    }

    const { error: sessionError } = await supabase
      .from("mentor_sessions")
      .insert([
        {
          mentor_id: mentorId,
          student_id: user.id,
          session_type:
            sessionType === "30" ? "30 min session" : "45 min session",
          status: "pending",
          requested_at: new Date().toISOString(),
          scheduled_at: date.toISOString(),
          notes,
          vc_link: null,
          completed_at: null,
        },
      ]);

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      toast.error("Failed to create session. Please try again.");
      return;
    }

    const newCredits = user.remainingCredits - cost;
    const { error: updateError } = await supabase
      .from("users")
      .update({ remainingCredits: newCredits })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating credits:", updateError);
    }

    setOpen(false);
    setSessionType(null);
    setNotes("");
    setDate(new Date());
    toast.success("Session booked successfully!");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50">
        <p className="font-inter text-xl font-medium">
          <LuLoader className="inline mr-4 animate-spin" />
          Loading Mentor...
        </p>
      </div>
    );
  if (!mentor) return <p className="p-4">⚠️ Mentor not found.</p>;

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-yellow-500 to-amber-100 h-48 relative">
        {/* Decorative shapes inside their own overflow-hidden wrapper */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/design2.png"
            alt="design"
            width={300}
            height={300}
            className="absolute top-0 left-0"
          />
          <Image
            src="/design1.png"
            alt="design"
            width={250}
            height={250}
            className="absolute -bottom-10 right-0"
          />
        </div>

        {/* Main avatar NOT clipped */}
        <div className="absolute -bottom-14 left-44  flex items-center gap-10">
          <Image
            src={mentor?.avatar || "/user.png"}
            alt="avatar"
            width={180}
            height={180}
            className="rounded-full border-4 border-gray-100"
          />
          <div className="-mt-7">
            <h2 className="text-black text-2xl capitalize font-sora font-semibold">
              <LuUser className="inline mr-2 -mt-1" />
              {mentor?.full_name}
            </h2>
            <p className="text-black text-lg font-inter font-medium mt-1">
              <LuMail className="inline mr-2 -mt-1" /> {mentor?.email}
            </p>
            <p className="text-black text-lg font-inter font-medium capitalize mt-1">
              <LuBriefcaseBusiness className="inline mr-2 -mt-1" />{" "}
              {mentor?.current_position}
            </p>
          </div>
        </div>
        <div className="absolute -bottom-5 right-36 flex items-center gap-10">
          <Button
            size="lg"
            className="bg-gray-100 text-black font-inter text-base hover:bg-white"
          >
            Bookmark <LuBookmark className="text-amber-500" />
          </Button>
          <button
            onClick={() => router.push(`/home/messages/mentor/${mentor?.id}`)}
            className="bg-amber-300 text-black font-inter text-base py-2 px-8 rounded-lg flex gap-3 items-center hover:bg-amber-400"
          >
            Chat <LuMessageCircle className="text-black" />
          </button>
        </div>
      </div>

      {/* ----------------------------- */}
      <div className="mt-10 flex h-full px-8 gap-5">
        {/* LEFT SIDE */}
        <div className="w-[68%] h-full">
          <h2 className="font-inter underline underline-offset-4 text-lg font-semibold">
            About Me
          </h2>
          <p className="mt-4 text-base font-inter tracking-wide">
            {mentor?.bio}
          </p>
          <h2 className="font-inter underline underline-offset-4 text-lg font-semibold mt-10">
            Expertise
          </h2>
          <p className="mt-4 text-lg font-semibold font-inter capitalize">
            {" "}
            {mentor?.expertise?.join(", ") || "No expertise added"}
          </p>

         <div className="bg-gradient-to-br from-yellow-400 to-amber-100 h-48 rounded-lg p-4 mt-14">
           <h2 className="text-center mt-2 mb-2 text-xl font-semibold font-sora">
            Book Session
          </h2>
          <p className="text-center text-base font-inter tracking-tight">Book a session with {mentor?.full_name} and get guidance on your career choices. Make 1:1 Video call and discuss your concerns</p>
          <div className="flex gap-8 mt-6 justify-center">
            <Button
              onClick={() => {
                setSessionType("30");
                setOpen(true);
              }}
              className="cursor-pointer"
              variant="outline"
            >
              <LuTimer className="mr-2" /> 30 Min Session
            </Button>
            <Button
              onClick={() => {
                setSessionType("45");
                setOpen(true);
              }}
              className="cursor-pointer"
              variant="outline"
            >
              <LuTimer className="mr-2" /> 45 Min Session
            </Button>
          </div>
         </div>
        </div>
        <Separator orientation="vertical" className="" />
        {/* RIGHT SIDE */}
        <div className="w-[32%] h-full mt-5 ">
          <div className="flex flex-col  bg-yellow-50 p-3 rounded-md shadow justify-center mx-auto w-[200px]">
            <h2 className="font-inter text-xl font-semibold">Rating</h2>
            <div className="flex items-center gap-4">
              <Star className="text-amber-500" />
              <h2 className="text-2xl font-sora">{mentor?.rating}</h2>
            </div>
          </div>
          <h2 className="text-xl font-medium text-center my-10 font-sora">
            Other Mentors
          </h2>
          <div className="flex  mt-5">
            <div className="flex flex-col gap-4 w-[340px] px-5 mb-20">
              {recomentors.slice(0, 3).map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex flex-col items-center gap-4 p-3 rounded-xl border shadow-sm bg-white "
                >
                  <div className="flex items-center justify-center gap-6">
                    <Image
                      src={mentor.avatar || "/user.png"}
                      alt={mentor.full_name}
                      width={100}
                      height={100}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex flex-col">
                      <h3 className="font-semibold font-inter text-lg">
                        {mentor.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 font-inter">
                        {mentor.current_position}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        mentor.availability
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {mentor.availability ? "Available" : "Unavailable"}
                    </span>
                    <span className="text-yellow-600 text-sm">
                      ⭐ {mentor.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle className="text-xl font-sora tracking-tight">
              Book Mentor Session{" "}
              <LuScreenShare className="inline-block ml-2" />
            </DialogTitle>
          </DialogHeader>

          <div className="">
            <p className="text-muted-foreground -mt-2 tracking-tight text-center font-inter text-sm mb-3">
              You selected:{" "}
              <span className="font-semibold">
                {sessionType === "30" ? "30 min" : "45 min"}
              </span>{" "}
              session with your mentor. Fill the below form to book this
              session.
            </p>

            {/* Notes */}
            <label className="px-1 text-sm font-medium font-inter">Notes</label>
            <Textarea
              placeholder="Why do you want this session?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />

            {/* Date (Today only) + Time Picker */}
            <div className="flex gap-4 mt-3 w-full">
              {/* Date */}
              <div className="flex flex-col gap-3 flex-1">
                <label className="px-1 text-sm font-medium font-inter">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {new Date().toLocaleDateString()}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      disabled={() => true}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="flex flex-col gap-3 flex-1">
                <label
                  htmlFor="time-picker"
                  className="px-1 text-sm font-medium font-inter"
                >
                  Time
                </label>
                <Input
                  type="time"
                  id="time-picker"
                  step="900" // 15-min intervals
                  value={date?.toTimeString().slice(0, 5) || "10:00"}
                  onChange={(e) => {
                    if (!date) return;
                    const [hours, minutes] = e.target.value.split(":");
                    const updated = new Date(date);
                    updated.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    setDate(updated);
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-24 cursor-pointer"
              >
                Cancel <LuX className="ml-2" />
              </Button>
              <Button onClick={handleSubmit} className="w-36 cursor-pointer">
                Book Session <LuScreenShare className="ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
