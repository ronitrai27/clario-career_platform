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

const steps = [
  "Getting tools ready...",
  "Creating Your Learning Path...",
  "Generating 3D models...",
  "Linking External Resources",
];

const RoadmapMaker = () => {
  const { user, loading } = useUserData();
  const focus = user?.mainFocus?.toLowerCase();
  const [careerSkillOptions, setCareerSkillOptions] = useState<string[]>([]);
  const [quizDataLoading, setQuizDataLoading] = useState(false);
  const supabase = createClient();

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [field, setField] = useState("");
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const userCareerFocuses =
    focus === "career/ path guidance" || focus === "choose career paths";

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

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setQuizDataLoading(true);
      const data = await getUserQuizData(user.id);
      // setQuizData(data);

      //careerOptions--------------
      if (data.length > 0 && userCareerFocuses) {
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

  const fetchRoadmap = async () => {
    if (!field.trim()) return;
    setLoadingRoadmap(true);
    setError(null);
    setRoadmap(null);

    try {
      const res = await axios.post("/api/ai/roadmap-gen", { field });
      const roadmapJson = res.data;
      setRoadmap(roadmapJson);

      const { error: insertError } = await supabase
        .from("roadmapUsers")
        .insert([
          {
            user_id: user?.id,
            roadmap_data: roadmapJson,
          },
        ]);

      if (insertError) throw insertError;
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoadingRoadmap(false);
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
          <h2 className="text-2xl font-semibold font-sora text-center">
            AI Roadmap Maker{" "}
            <LuWorkflow className="inline ml-2 text-blue-500" />
          </h2>
          <p className="mt-3 font-inter text-base text-center">
            Level up your career with AI-powered roadmaps. Personalised guidance
            for your path.
          </p>
          <Tabs
            defaultValue="suggestions"
            className="w-full flex flex-col items-center mt-6"
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
              {!quizDataLoading ? (
                <div className="mt-4 bg-white border border-gray-200 rounded-md p-4 shadow-sm text-center">
                  <p className="text-gray-700 font-inter text-sm">
                    📜 Your past quiz attempts and generated roadmaps will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-3 w-full">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 w-full rounded-xl bg-gray-200 animate-pulse"
                    />
                  ))}
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

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] mx-auto">
            <div className="bg-slate-800 rounded-md pb-2 pt-3 px-2">
              <div className="flex items-center justify-between px-6 mb-2">
                <p className="font-inter text-sm text-white tracking-tight">
                  Roadmap Maker
                </p>
                <p className="text-gray-200 font-sora text-sm">15 coins-</p>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Devops Engineer"
                  rows={60}
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="resize-none h-[105px] bg-gray-50 placeholder:text-gray-400 text-black font-sora text-sm"
                />

                <div className="absolute bottom-2 left-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-500 text-blue-500">
                    <LuCombine size={18} />
                    <p className="text-sm tracking-tight">Tool</p>
                  </div>
                </div>
                <div className="absolute bottom-2 right-4">
                  <Button
                    className="flex items-center gap-2 bg-blue-100 p-2 rounded  text-gray-600 hover:text-white cursor-pointer"
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
