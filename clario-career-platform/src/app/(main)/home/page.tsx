/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
import SlidingCards from "../_components/SlidingCard";
import ActionsButtons from "../_components/ActionButtonsHome";
import {
  getMatchingMentors,
  getRandomUsersByCareer,
  getRandomUsersByInstitution,
} from "@/lib/functions/dbActions";
import { useEffect, useState } from "react";
import { DBMentor, UserQuizData } from "@/lib/types/allTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
// import Rating from "@mui/material/Rating";
import {
  LuActivity,
  LuBookOpenCheck,
  LuChevronDown,
  LuChevronRight,
  LuCircleFadingPlus,
  LuFilter,
  LuInbox,
  LuListPlus,
  LuMailbox,
  LuPen,
  LuScreenShare,
  LuSearch,
  LuStar,
  LuUser,
  LuUsersRound,
  LuWorkflow,
} from "react-icons/lu";
import { HomeCalendar } from "../_components/HomeCalendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DBUser } from "@/lib/types/allTypes";
import ActionBox from "../_components/ActionBox";
import {
  Building2,
  CheckCircle,
  Ghost,
  LucideInfo,
  Map,
  PlusCircle,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BsSuitcase, BsSuitcase2 } from "react-icons/bs";
import SuggestedCollegeScroll from "../_components/SuggestedCollegeScroll";
import MessageNamesList from "./test/showchats/page";
import confetti from "canvas-confetti";
import AiSuggestedBoxHome from "../_components/AiSuggestedBoxHome";
import { useNotificationStore } from "@/lib/store/NotificationStore";
import { useQuizData } from "@/context/userQuizProvider";

const fallbackAvatars = [
  "/a1.png",
  "/a2.png",
  "/a3.png",
  "/a4.png",
  "/a5.png",
  "/a6.png",
];

export default function HomePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading, ensureUserInDB } = useUserData();
  const {quizData} = useQuizData();
  const { open: sidebarOpen, isMobile } = useSidebar();
  const [mentors, setMentors] = useState<DBMentor[]>([]);
  const [mentorLoading, setMentorLoading] = useState<boolean>(false);
  const [discoverUsers, setDiscoverUsers] = useState<UserQuizData[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(1);

  useEffect(() => {
    ensureUserInDB();
  }, []);

  // ======================================================
  // ------------FETCHING NOTIFICATIONS---------------------
  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications
  );

  useEffect(() => {
    if (user?.id) fetchNotifications(user?.id);
  }, [user?.id, fetchNotifications]);

  const getAvatar = (mentor: any) => {
    if (mentor.avatar) return mentor.avatar;
    const randomIndex = Math.floor(Math.random() * fallbackAvatars.length);
    return fallbackAvatars[randomIndex];
  };
  // SHOWING MENTORS---------------------------------------
  useEffect(() => {
    if (!user || !user.mainFocus) return;
    if (mentors.length > 0) return;
    setMentorLoading(true);
    getMatchingMentors(user?.mainFocus)
      .then((data) => setMentors(data))
      .finally(() => setMentorLoading(false));
  }, [user]);

  // =========================================================
  // DISCOVER USERS FROM SAME CAREER---------------------------
  useEffect(() => {
    if (!user || !quizData?.selectedCareer) return;
    // if (discoverUsers.length > 0) return;

    setDiscoverLoading(true);
    getRandomUsersByCareer(quizData.selectedCareer, user.id)
      .then((data) => setDiscoverUsers(data))
      .finally(() => setDiscoverLoading(false));
  }, [user, quizData?.selectedCareer]);

  // -----------CONFETTI---------------------
  const handleClick = () => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };
  // HANDLE SHOW DIALOG ON QUIZ COMPLETE-----------------------

  useEffect(() => {
    const quizDone = localStorage.getItem("quizDone");
    if (quizDone === "true") {
      setOpen(true);
      handleClick();
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.removeItem("quizDone");
    router.push("/home/ai-tools/career-coach");
  };

  const avatarBgColors = [
    "bg-yellow-200",
    "bg-blue-200",
    "bg-purple-200",
    "bg-pink-200",
    "bg-sky-200",
    "bg-green-200",
  ];

  const getRandomBgColor = () => {
    const index = Math.floor(Math.random() * avatarBgColors.length);
    return avatarBgColors[index];
  };

  return (
    <section className={`h-full transition-all duration-200 ease-in-out ${sidebarOpen ? "w-[calc(100vw-14.5rem)]": "w-screen"}  bg-gradient-to-b from-gray-50 to-gray-100 py-6 px-5 overflow-hidden`}>
      <div className="flex flex-col">
        <div className="flex h-full justify-between overflow-hidden ">
          {/*---------- Left side--------------- */}
          <div className="w-[75%] px-2">
            <SlidingCards />
            {loading ? (
              <div
                className={`mt-3 ${
                  sidebarOpen ? "max-w-[810px]" : "max-w-[1100px]"
                } max-w-[800px] mx-auto flex justify-between items-center`}
              >
                <Skeleton className="h-[40px] w-[300px] rounded-full" />
                <Skeleton className="h-[40px] w-[300px] rounded-full" />
              </div>
            ) : (
              <div
                className={`mt-5 ${
                  sidebarOpen ? "max-w-[810px]" : "w-[1100px]"
                } max-w-[800px] mx-auto flex justify-between items-center`}
              >
                <h1 className="text-4xl font-semibold font-sora tracking-tight max-w-[380px] truncate">
                  Welcome, {user?.userName}
                </h1>
                <ActionsButtons />
              </div>
            )}

            {/* ACTION BOX */}

            <ActionBox />

            {/* MENTORS !! */}
            <div
              className={` w-full ${
                sidebarOpen ? "max-w-[1020px]" : "max-w-[1200px]"
              } mx-auto mt-6 bg-white  border border-gray-200 p-2 rounded-xl  overflow-hidden`}
            >
              <div className="flex items-center justify-between pr-8">
                <h2 className="text-[26px] pt-4 tracking-tight font-medium font-inter mb-3 pl-2">
                  Recommended Mentors{" "}
                  <LuUsersRound className="inline ml-2 text-blue-500" />
                </h2>

                <div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/home/mentor-connect")}
                    className="cursor-pointer text-sm tracking-tight font-inter"
                  >
                    View More{" "}
                    <LuListPlus className="inline ml-2 text-blue-500" />
                  </Button>
                </div>
              </div>
              {mentorLoading || loading ? (
                <div className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-[300px] w-[260px] rounded-2xl flex-shrink-0"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <div className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide">
                    {mentors.map((m) => (
                      <Card
                        key={m.id}
                        className="relative group w-[300px] max-h-[285px] flex-shrink-0 rounded-2xl shadow-md bg-white p-0 overflow-hidden hover:-translate-y-0.5 duration-200"
                      >
                        <CardHeader className="flex flex-col  gap-2 p-0">
                          <div className="relative w-full py-2">
                            <div
                              className={`absolute top-0 left-0 w-full h-[66%] rounded-t-2xl ${getRandomBgColor()}`}
                              style={{ zIndex: 0 }}
                            ></div>

                            <div className="absolute top-0 right-0 w-16 h-16">
                              <div className="w-full h-full bg-white/25 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
                            </div>

                            <div className="absolute bottom-20 left-0 w-16 h-16">
                              <div className="w-full h-full bg-white/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                            </div>

                            {/* 🔹 Avatar */}
                            <div className="relative z-10">
                              <Image
                                src={getAvatar(m)}
                                alt={m.full_name}
                                width={95}
                                height={95}
                                className="rounded-full object-cover border mx-auto"
                              />

                              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 bg-white border border-yellow-600 px-4 rounded-full">
                                <span className="font-inter text-sm font-medium text-amber-500 flex items-center gap-1">
                                  {m.rating}{" "}
                                  <LuStar className="inline fill-yellow-500 ml-1" />
                                </span>
                              </div>
                            </div>
                          </div>

                          <CardTitle className="text-lg font-semibold text-center w-full font-raleway -mt-2">
                            {m.full_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="-mt-5 w-full mx-auto pb-3 flex flex-col h-full">
                          <p className="font-inter bg-gradient-to-r from-blue-500 to-indigo-400 text-transparent bg-clip-text tracking-tight text-center capitalize text-base">
                            {m.current_position}
                          </p>
                          <p className="font-raleway text-sm tracking-tight text-center mt-2 line-clamp-2">
                            <span className="font-medium">Expertise:</span>{" "}
                            {m.expertise?.join(", ")}
                          </p>

                          <div className="flex justify-center mt-auto">
                            <Button
                              className="rounded-md text-xs font-inter bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                              onClick={() =>
                                router.push(`/home/mentor-connect/${m.id}`)
                              }
                            >
                              Book Session <LuScreenShare />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI SUGGESSTIONS  */}
            <AiSuggestedBoxHome />
          </div>
          {/* --------------Right side--------------- */}
          <div className="w-[24%]  flex flex-col gap-12  items-center h-full ">
            <HomeCalendar />
            {/* Messages Container */}
            <div className="w-full h-[466px] bg-white rounded-xl shadow px-2 py-4">
              <div className="flex items-center justify-between px-4">
                <p className="text-base font-inter font-semibold">Activity</p>
                <LuActivity className="text-gray-600 text-xl " />
              </div>
              <div className="relative flex items-center  px-2 bg-gray-50 border border-gray-200 rounded-md mt-3">
                <LuSearch className=" text-gray-600 -mr-1" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="border-none rounded-none shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-inter"
                />
                <LuFilter className=" text-gray-600" />
              </div>
              <Tabs
                defaultValue="messages"
                className="h-full flex flex-col mt-4 "
              >
                <TabsList className="flex w-full justify-start gap-4 bg-gray-50">
                  <TabsTrigger value="messages" className="font-inter">
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="discover" className="font-inter">
                    Discover
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 mt-4 overflow-y-auto">
                  <TabsContent value="messages" className="h-full">
                    <MessageNamesList />
                  </TabsContent>
                  <TabsContent value="discover" className="h-full">
                    {discoverUsers.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {discoverUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between  p-2 "
                          >
                            {/* Left: avatar + details */}
                            <div className="flex items-center gap-3">
                              <Image
                                src={u.userAvatar || "/user.png"}
                                alt={u.userName}
                                width={35}
                                height={35}
                                className=" rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm tracking-tight font-inter">
                                  {u.userName || "Loading"}
                                </p>
                                <p className="text-sm text-muted-foreground font-inter max-w-[120px] truncate">
                                  {u.selectedCareer}
                                </p>
                              </div>
                            </div>

                            {/* Right: message button */}
                            <button 
                             onClick={() => router.push(`/home/messages/peer/${u.userId}`)}
                             className="px-3 py-1 text-xs tracking-tight font-inter bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition">
                              Message
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* INBOX */}
            <div className="w-full h-[370px] bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-base font-inter font-semibold">Inbox</h2>
                <LuMailbox className="text-gray-600 text-2xl" />
              </div>

              {/* Content */}
              <div className="mt-6 flex-1 overflow-y-auto h-full">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <LuMailbox className="text-gray-600 text-4xl" />
                    <p className="text-lg font-sora">No messages yet..</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div key={notif.id ?? Math.random()} className="flex gap-2 p-1 bg-blue-50 border border-blue-200 rounded-md w-full">
                        <Image
                        src={user?.avatar || "/user.png"}
                        alt="user"
                        height={100}
                        width={100}
                        className="w-9 h-9 rounded-full object-cover"
                        />

                        <div className="w-full">
                          <p className="text-xs tracking-wide font-light font-inter line-clamp-2">{notif.message}</p>
                          <p className="text-xs mt-2 ml-10 text-muted-foreground font-inter">{notif.created_at ? new Date(notif.created_at).toLocaleString() : ""}</p>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* COLLEGES */}
        {user?.isQuizDone && (
          <div className={`w-full px-5 py-4 mt-14 bg-gradient-to-br from-white to-white border border-gray-200  mx-auto rounded-xl shadow`}>
            <div className="flex items-center justify-between pr-8 w-full">
              <div className="flex flex-col">
                <h2 className="text-[26px]  tracking-tight font-medium font-inter mb-1 ">
                  Discover Colleges
                  <Building2 className="inline ml-2 text-blue-500" />
                </h2>
                <p className="font-inter text-lg italic text-gray-600">
                  Discover top colleges nearby you
                </p>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={()=>router.push("/home/career-board")}
                  className="cursor-pointer text-sm tracking-tight font-inter"
                >
                  See All <Building2 className="inline ml-2 text-blue-500" />
                </Button>
              </div>
            </div>
            <div>
              <SuggestedCollegeScroll />
            </div>
          </div>
        )}
      </div>

      {/* Dialog to show after quiz ends*/}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[780px] h-[520px] p-0 border-0 shadow-2xl rounded-lg overflow-hidden">
          <div className="flex h-full w-full">
            {/* LEFT SIDE */}
            <div className="bg-gradient-to-br from-red-100 via-red-200 to-rose-400 h-full w-[460px] relative">
              <Image
                src="/element1.png"
                alt="element1"
                width={900}
                height={900}
                className=" h-full w-full object-cover absolute z-20"
              />
              <Image
                src="/static5.png"
                alt="element1"
                width={900}
                height={900}
                className=" h-full w-full shrink-0 absolute -top-20 z-0"
              />
            </div>
            {/* RIGHT SIDE */}
            <div>
              {step == 1 ? (
                <div className="space-y-2 p-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-1">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-sora text-center my-2 text-2xl font-semibold">
                    Quiz Complete!
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed text-center font-inter">
                    Congratulations on completing your personalized assessment.
                    Now We will help you decide your future Career.
                  </p>

                  <div className="space-y-3 py-2">
                    <h3 className="font-semibold text-gray-800 font-inter text-base mb-3">
                      What&apos;s next for you:
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Personalized Career Suggestions
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            Discover roles tailored to your skills and interests
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
                        <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Map className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            AI-Powered Roadmap
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            Get a step-by-step plan to reach your goals
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            AI Interview Preparation
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            Get expert advice on how to prepare for interviews
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="">
                    <Button
                      // onClick={handleClose}
                      onClick={() => setStep(2)}
                      className="w-full h-9 font-inter text-sm bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      Continue
                      <LuChevronRight className="ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-1">
                    <LucideInfo className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-sora text-center my-2 text-2xl font-semibold">
                    Next Step !
                  </p>
                  <p className="text-gray-600 text-base leading-relaxed text-center font-inter">
                    Now its time to decide your Career Path. AI powered career
                    adviser will guide you through the process.
                  </p>

                  <div className="space-y-3 py-2">
                    <h3 className="font-semibold text-gray-800 font-inter text-base mb-3">
                      What You Need To Do:
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <p className="text-white font-extrabold">1</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Say Hello
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            Greet your AI Career Adviser.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
                        <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <p className="text-white font-extrabold">2</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Ask Bout Your Career
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            Ask your confusion and career options according to
                            your interests.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <p className="text-white font-extrabold">3</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Select your career
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5 font-inter">
                            After getting career options, tell your AI Career
                            Adviser about desired career that suits you the
                            best.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-evenly mt-4">
                    <Button
                      onClick={handleClose}
                      className=" h-9 font-inter text-xs bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      Talk to AI Adviser
                      <LuChevronRight className="ml-2" />
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className=" h-9 font-inter text-xs bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      Set up Later
                      <LuChevronRight className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
