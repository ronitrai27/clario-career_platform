/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useUserData } from "@/context/UserDataProvider";
import React, { useEffect, useState } from "react";
import {
  LuChevronRight,
  LuCombine,
  LuGlobe,
  LuHistory,
  LuLoader,
  LuWorkflow,
} from "react-icons/lu";
import { getUserQuizData } from "@/lib/functions/dbActions";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Loader2,
  LucideGlobe,
  LucideSendHorizontal,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Roadmap from "@/app/(main)/_components/RoadmapCanvas";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import DefaultRoadmap from "@/app/(main)/_components/DeafultRoadmap";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useQuizData } from "@/context/userQuizProvider";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { time } from "console";
import { useRouter } from "next/navigation";
import { se } from "date-fns/locale";

const steps = [
  "Getting tools ready...",
  "Creating Your Learning Path...",
  "Generating 3D models...",
  "Linking External Resources",
];

const RoadmapMaker = () => {
  const { user, loading } = useUserData();
  const focus = user?.mainFocus?.toLowerCase();
  const router = useRouter();
  const [careerSkillOptions, setCareerSkillOptions] = useState<string[]>([]);
  const [quizDataLoading, setQuizDataLoading] = useState(false);
  const supabase = createClient();

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [field, setField] = useState("");
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =============================================
  const [roadmap, setRoadmap] = useState<any>(null);
  const [histRoadmap, setHistRoadmap] = useState<any[]>([]);
  const [roadmapId, setRoadmapId] = useState<any | null>(null);
  const [isstarted, setIsstarted] = useState<boolean>(false);

  // ===============TOOLS================
  const [openTools, setOpenTools] = useState(false);
  const [timeline, setTimeline] = useState("");
  const [mode, setMode] = useState("");

  // to show loading text-----------------------------
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loadingRoadmap) {
      // reset to first step whenever loading starts
      setStepIndex(0);

      interval = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % steps.length);
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingRoadmap, steps.length]);

  // ====================================

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setQuizDataLoading(true);
      const data = await getUserQuizData(user.id);
      // setQuizData(data);

      if (data.length > 0) {
        const firstQuiz = data[0];
        const options = firstQuiz.quizInfo?.careerOptions;

        if (Array.isArray(options)) {
          setCareerSkillOptions(options);
        }
      }
      setQuizDataLoading(false);
    };

    fetchData();
  }, [user?.id]);

  // =====================================

  // Maker roadmap From AI and Insert to supabase
  const fetchRoadmap = async () => {
    if (!field.trim()) return;
    setRoadmapId(null);
    setLoadingRoadmap(true);
    setError(null);
    setRoadmap(null);

    try {
      // const res = await axios.post("/api/ai/roadmap-gen", { field });
      // console.log("=========Fetching roadmap for========= :", field, timeline, mode);
      if (!timeline || !mode) {
        toast.error("Please select timeline and mode from filters");
        setLoadingRoadmap(false);
        return;
      }
      const res = await axios.post("/api/ai/roadmap-gen", {
        field,
        timeline,
        mode,
      });
      const roadmapJson = res.data;
      setRoadmap(roadmapJson);

      const { data: insertedRows, error: insertError } = await supabase
        .from("roadmapUsers")
        .insert([
          {
            user_id: user?.id,
            roadmap_data: roadmapJson,
            mode: mode,
            timeline: timeline,
          },
        ])
        .select();

      if (insertError) throw insertError;
      setRoadmapId(insertedRows?.[0]?.id);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoadingRoadmap(false);
    }
  };
  // ======================================
  // HISTORY ROADMAP
  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("roadmapUsers")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setHistRoadmap(data || []);
    };

    fetchRoadmaps();
  }, [user?.id]);
  // ======================================
  const SetHistoryRoadmap = async (item: any) => {
    toast.success("Roadmap loaded successfully!");
    setRoadmap(item.roadmap_data);
    setRoadmapId(item.id);
    setIsstarted(item.isStarted);
  };

  // ===================================
  // ===================START THE ROADMAP===============
  const handleStart = async () => {
    if (!roadmapId) {
      toast.error("No roadmap selected.");
      return;
    }

    const { error } = await supabase
      .from("roadmapUsers")
      .update({ isStarted: true })
      .eq("id", roadmapId);

    if (error) {
      toast.error("Failed to start roadmap");
    } else {
      setIsstarted(true);
      toast("Roadmap has been started", {
        description: " You can track your progress in the my tracks",
        style: { borderRadius: "8px", background: "#000", color: "#fff" },
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-44px)] bg-gray-50 py-6">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-xl font-sora">
            <LuLoader className="animate-spin inline mr-4 text-2xl" /> Loading
            content...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-[calc(100vh-65px)] bg-gray-50 py-6 pl-3">
      <div className="flex w-full h-full gap-5">
        {/* LEFT SIDE */}
        <div className="flex flex-col w-[32%] relative border border-slate-300 px-2 pt-3 pb-0 rounded-xl bg-white ">
          <h2 className="text-3xl font-semibold font-sora text-center">
            AI Roadmap Maker{" "}
            <LuWorkflow className="inline ml-2 text-blue-500" />
          </h2>
          <p className="mt-3 font-inter text-base tracking-tight text-center">
            Level up your career with AI-powered 3D Roadmaps.
          </p>
          <Tabs
            defaultValue="suggestions"
            className="w-full flex flex-col items-center mt-3"
          >
            {/* Tabs header */}
            <TabsList className="grid grid-cols-2 w-full  bg-gray-100 rounded-md">
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-sm font-inter py-2 rounded-md transition-all"
              >
                <LuHistory size={18} />
                History
              </TabsTrigger>

              <TabsTrigger
                value="suggestions"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-sm font-inter py-2 rounded-md transition-all"
              >
                <Activity size={18} />
                Suggestions
              </TabsTrigger>
            </TabsList>

            {/* History tab */}
            <TabsContent value="history" className="w-full max-w-[400px]">
              {histRoadmap.length > 0 ? (
                <div className="flex flex-col mt-4 space-y-3 px-4">
                  {histRoadmap.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => SetHistoryRoadmap(item)}
                      className={`border rounded-lg p-2 cursor-pointer flex justify-between items-center transition-all ${
                        item.isStarted || isstarted
                          ? "bg-blue-50 border-blue-400"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <h3 className="text-sm capitalize font-inter tracking-tight">
                          {item.roadmap_data?.roadmapTitle ||
                            "Untitled Roadmap"}
                        </h3>
                        <p className="text-xs text-gray-600 font-sora">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        <span className="font-inter text-blue-600 text-sm">
                          {item.isStarted && "Active"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 bg-white border border-gray-200 rounded-md p-4 shadow-sm text-center">
                  <p className="text-gray-700 font-inter text-sm">
                    📜 Your past quiz attempts and generated roadmaps will
                    appear here.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Suggestions tab */}
            <TabsContent value="suggestions" className="w-full max-w-[400px]">
              {quizDataLoading && (
                <div className="mt-8 grid grid-cols-1 gap-3 w-full">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-11 w-full rounded-xl bg-gray-200 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!quizDataLoading && user?.isQuizDone && (
                <div className="mt-4 grid grid-cols-1 gap-3 mx-auto px-6 w-full">
                  {careerSkillOptions.map((option, idx) => (
                    <div
                      key={idx}
                      onClick={() => setField(option)}
                      className="rounded-md w-full max-w-[260px] mx-auto shadow p-2 bg-white border border-gray-100 hover:scale-105 hover:bg-blue-100 duration-200 cursor-pointer text-center"
                    >
                      <p className="text-xs font-inter font-medium text-black tracking-tight">
                        {option}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* ====================TEXTAREA BOX======================== */}

          <div className="mt-auto pb-2 w-full max-w-[480px] mx-auto">
            <div
              className={`overflow-hidden transition-[height,opacity] duration-300 ease-in-out bg-white rounded-lg border border-t-4 border-t-slate-800
  ${openTools ? "h-[68px] opacity-100" : "h-0 opacity-0"}
`}
            >
              <div className="flex items-center justify-center gap-6 py-3">
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger className="w-[140px] bg-blue-50 font-inter text-xs">
                    <SelectValue placeholder="Timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="1 year">1 year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="w-[140px] bg-blue-50 font-inter text-xs">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* =================TEXTAREA================= */}

            <div className="bg-slate-800 rounded-md pb-2 pt-3 px-2">
              <div className="flex items-center justify-between px-6 mb-2">
                {roadmapId && !isstarted && (
                  <Button
                    onClick={handleStart}
                    size="sm"
                    variant="outline"
                    className="text-xs font-inter cursor-pointer"
                  >
                    Start Roadmap <LuChevronRight size={16} />
                  </Button>
                )}

                {roadmapId && isstarted && (
                  <Button
                    onClick={() => router.push("/home/my-tracks")}
                    size="sm"
                    variant="outline"
                    className="text-xs font-inter cursor-pointer"
                  >
                    Continue <LuChevronRight size={16} />
                  </Button>
                )}

                {!roadmapId && (
                  <p className="font-inter text-sm text-white">Roadmap Maker</p>
                )}

                <p className="text-gray-200 font-sora text-sm">10 coins</p>
              </div>

              <div className="relative">
                <Textarea
                  placeholder="Devops Engineer"
                  rows={60}
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className={`resize-none transition-[height] duration-300 ease-in-out ${
                    openTools ? "h-[85px]" : "h-[110px]"
                  } bg-gray-50 placeholder:text-gray-400 text-black font-sora text-sm`}
                />

                <div className="absolute bottom-2 left-4">
                  <div
                    className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-500 text-blue-500 cursor-pointer"
                    onClick={() => setOpenTools(!openTools)}
                  >
                    <LuCombine size={18} />
                    <p className="text-sm tracking-tight">Filters</p>
                  </div>
                </div>

                <div className="absolute bottom-2 right-4">
                  <Button
                    className="flex items-center gap-2 bg-blue-100 p-2 rounded text-gray-600 hover:text-white cursor-pointer"
                    onClick={fetchRoadmap}
                    disabled={loading}
                  >
                    <LucideSendHorizontal size={18} className="-rotate-45" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT SIDE */}
        <div className="w-[68%] h-full bg-white border border-slate-300 rounded-md">
          {loadingRoadmap ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-blue-50 border border-gray-300 rounded-xl shadow-md p-6 max-w-[580px] mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-medium text-black font-inter tracking-wide">
                    Hang tight,{" "}
                    <span className="font-semibold text-blue-600">Clario</span>{" "}
                    is designing your personalised roadmap
                  </h2>

                  <Image
                    src="/roadmap.png"
                    alt="loading"
                    width={40}
                    height={40}
                  />
                </div>

                <Separator className="mb-6 bg-gray-300" />

                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-gray-200" />

                  <div className="flex flex-col gap-4 pl-6">
                    {steps.map((text, i) => {
                      const isActive = i === stepIndex;
                      return (
                        <motion.div
                          key={i}
                          animate={{
                            scale: isActive ? 1.05 : 1,
                            opacity: isActive ? 1 : 0.6,
                          }}
                          transition={{ duration: 0.4 }}
                          className="relative flex items-center bg-white p-2 rounded-md w-full"
                        >
                          {/* Step indicator */}
                          <div className="absolute -left-[26px] flex items-center justify-center w-5 h-5">
                            {isActive ? (
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                            )}
                          </div>

                          {/* Step text */}
                          <span
                            className={`text-lg font-inter font-medium ${
                              isActive ? "text-blue-700" : "text-gray-600"
                            }`}
                          >
                            {text}
                          </span>

                          <div className="ml-auto">
                            <LuChevronRight
                              size={20}
                              className="text-gray-400"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : roadmap && roadmap.initialNodes?.length > 0 ? (
            <Roadmap roadmap={roadmap} />
          ) : (
            <DefaultRoadmap setField={setField} fetchRoadmap={fetchRoadmap} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapMaker;
