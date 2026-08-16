"use client";

import { useEffect, useState } from "react";
import { paginatedColleges } from "@/lib/functions/dbActions";
import type { College } from "@/lib/types/allTypes";
import Image from "next/image";
import { LuActivity, LuChevronRight, LuLoader, LuPi, LuPin } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Building2, ExternalLink, LucideActivity, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizData } from "@/context/userQuizProvider";
import { QuizCollegeQues } from "@/lib/types/allTypes";
import { Skeleton } from "@/components/ui/skeleton";

const quizDataCollege: QuizCollegeQues[] = [
  {
    id: "q1",
    question: "What the main moto of yours joining a college?",
    key: "moto",
    options: ["Academics", "Placement", "Good Environment"],
    type: "single",
  },
  {
    id: "q2",
    question: "What type of college would you prefer?",
    key: "type",
    options: ["Private", "Government", "Any"],
    type: "single",
  },
  {
    id: "q3",
    question: "Which location preference suits you best?",
    key: "location",
    options: ["Nearby cities", "Far away cities", "Flexible with any location"],
    type: "single",
  },
  {
    id: "q4",
    question: "Do you have any budget constraints? Your typical budget.",
    key: "fees",
    options: [
      "Below ₹50,000",
      "₹50,000 - ₹1,00,000",
      "₹1,00,000 - ₹2,00,000",
      "Above ₹2,00,000",
    ],
    type: "single",
  },
  {
    id: "q5",
    question: "How important is campus placement to you?",
    key: "placement",
    options: [
      "Very important (Top recruiters & high packages)",
      "Moderately important (Good average package)",
      "Not a priority (Focus on academics/research)",
    ],
    type: "single",
  },
  {
    id: "q6",
    question:
      "Would you like your college recommendations to prioritize any of these?",
    key: "priority",
    options: [
      "Low Fees",
      "High Placement Rate",
      "Top Ranking",
      "Best Fit for My Course",
    ],
    type: "multiple",
  },
];

export default function CollegesList() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const { quizData } = useQuizData();

  const [searchQuery, setSearchQuery] = useState("");

  // colleges filters---------------------------->
  const [nearbyActive, setNearbyActive] = useState(false);
  const [collegeType, setCollegeType] = useState<string | null>(null);

  // ===================================
  // COLLEGE QUIZ
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = quizDataCollege[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion) return;

    setAnswers((prev) => {
      if (currentQuestion.type === "multiple") {
        const prevSelected = (prev[currentQuestion.key] as string[]) || [];
        const updated = prevSelected.includes(option)
          ? prevSelected.filter((o) => o !== option)
          : [...prevSelected, option];
        return { ...prev, [currentQuestion.key]: updated };
      } else {
        return { ...prev, [currentQuestion.key]: option };
      }
    });
  };

  const handleNext = () => {
    if (currentIndex < quizDataCollege.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log("✅ User Quiz Result:", answers);
      setOpen(false);
      setCurrentIndex(0);
      setStarted(false);
      // Re-trigger real-time search with quiz preferences if set
      const preferredType = answers.type as string;
      if (preferredType && preferredType !== "Any") {
        setCollegeType(preferredType.toLowerCase());
        fetchRealTimeColleges(searchQuery, preferredType.toLowerCase());
      }
    }
  };

  // ==================================
  // REAL-TIME COLLEGE FETCHING
  const fetchRealTimeColleges = async (
    locationSearch?: string,
    typeFilter?: string | null
  ) => {
    setLoading(true);
    try {
      const career = quizData?.selectedCareer || "";
      const degrees: string[] = quizData?.quizInfo?.degree || [];
      const primaryDegree = degrees.length > 0 ? degrees[0] : "";

      const params = new URLSearchParams();
      if (career) params.set("q", career);
      if (primaryDegree) params.set("degree", primaryDegree);
      if (locationSearch) params.set("location", locationSearch);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setColleges(data);
      } else {
        // Fallback to static DB query if real-time API yields empty
        const dbData = await paginatedColleges(
          1,
          6,
          locationSearch || null,
          typeFilter || null
        );
        setColleges(dbData);
      }
    } catch (err) {
      console.error("❌ Error fetching real-time colleges:", err);
      // Fallback to DB
      const dbData = await paginatedColleges(
        1,
        6,
        locationSearch || null,
        typeFilter || null
      );
      setColleges(dbData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeColleges(searchQuery, collegeType);
  }, [quizData?.selectedCareer, quizData?.quizInfo?.degree]);

  const handleSearch = () => {
    fetchRealTimeColleges(searchQuery, collegeType);
  };

  const handleCollegeTypeChange = (type: string) => {
    const newType = collegeType === type ? null : type;
    setCollegeType(newType);
    fetchRealTimeColleges(searchQuery, newType);
  };

  const handleRecommendedToggle = () => {
    const nextState = !nearbyActive;
    setNearbyActive(nextState);
    if (nextState) {
      // Prioritize top degrees
      fetchRealTimeColleges(searchQuery, collegeType);
    }
  };

  return (
    <div>
      <div className="mb-10 flex items-center gap-10 w-full">
        <div className="bg-gradient-to-br from-slate-500 to-slate-800 w-[240px] h-[180px] shrink-0 rounded-lg p-4 flex flex-col ">
          <h2 className="text-white font-inter text-xl leading-tight">
            Get College Recommendation Based on your Interests
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            className="text-sm font-inter w-fit mt-auto ml-auto cursor-pointer"
          >
            Check out <LuChevronRight />
          </Button>
        </div>

        <div className="flex flex-col space-y-6 w-full">
          <div className="flex items-center gap-6 w-full">
            <div className="relative w-full max-w-[400px] flex justify-between items-center border border-blue-300 rounded-md px-4 bg-blue-50">
              <Input
                type="text"
                placeholder="Search Colleges by Location..."
                className="font-inter text-sm bg-transparent border-none shadow-none focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />

              <Search
                className="text-blue-600 cursor-pointer hover:scale-105"
                onClick={handleSearch}
              />
            </div>
            <Button
              onClick={handleRecommendedToggle}
              className={`font-inter text-sm cursor-pointer flex items-center hover:bg-blue-100 hover:border-blue-500 hover:text-blue-600
    ${nearbyActive ? "bg-blue-100 border-blue-500 text-blue-600" : ""}`}
              variant={nearbyActive ? "default" : "outline"}
            >
              Recommended <Building2 className="ml-2" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="font-inter text-sm capitalize cursor-pointer flex items-center"
                  variant="outline"
                >
                  {collegeType ? collegeType : "Type"}{" "}
                  <LucideActivity className="ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2 font-inter">
                  <Button
                    variant={collegeType === "private" ? "default" : "outline"}
                    className="cursor-pointer border-none shadow-none"
                    onClick={() => handleCollegeTypeChange("private")}
                  >
                    Private College
                  </Button>
                  <Button
                    className="cursor-pointer border-none shadow-none"
                    variant={collegeType === "government" ? "default" : "outline"}
                    onClick={() => handleCollegeTypeChange("government")}
                  >
                    Government College
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-5 w-full justify-end pr-20">
            <p className="font-inter">Ai suggested Degrees</p>
            {quizData?.quizInfo?.degree?.length > 0 ? (
              quizData?.quizInfo.degree.map((deg: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 font-inter space-x-3 text-sm px-3 py-1 rounded-full shadow-sm cursor-pointer hover:bg-blue-200"
                  onClick={() => fetchRealTimeColleges(searchQuery, collegeType)}
                >
                  {deg}
                </span>
              ))
            ) : (
              <span className="text-gray-400 font-inter text-sm">
                No degree selected
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex items-center justify-center my-6">
            <div className="flex items-center gap-3">
              <LuLoader className="animate-spin text-3xl text-blue-600" />
              <p className="font-inter text-base tracking-tight">
                Fetching Real-time College Suggestions...
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[310px] w-full rounded-lg" />
            ))}
          </div>
        </>
      ) : colleges.length === 0 ? (
        <div className="my-8">
          <p className="text-center text-gray-800 font-inter text-xl">
            No colleges found for &quot;{searchQuery || quizData?.selectedCareer || "your criteria"}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((college, idx) => {
            const rankPos = (college as any).rank_position || `#${idx + 1} Best Ranked`;
            const rankLabel = (college as any).rank_display || "Top Ranked";
            const suitList = (
              Array.isArray(college.best_suit_for)
                ? college.best_suit_for
                : [college.best_suit_for]
            ).slice(0, 2);

            return (
              <div
                key={college.id}
                className="border rounded-lg p-4 border-b-4 border-b-blue-500 shadow-sm hover:shadow-md bg-white relative overflow-hidden flex flex-col justify-between h-[340px]"
              >
                <div>
                  {/* Ranking Position & Tag Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-inter bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap shrink-0">
                      🏆 {rankPos}
                    </span>
                    <span className="text-[11px] font-medium font-inter text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[170px] text-right">
                      {rankLabel}
                    </span>
                  </div>

                  {/* College Title - Fixed Height Container */}
                  <h2 className="font-semibold text-base font-inter tracking-tight line-clamp-2 h-[48px] leading-tight capitalize overflow-hidden">
                    {college.college_name}
                  </h2>

                  {/* Location & Type */}
                  <p className="text-xs font-inter my-1 capitalize text-gray-600 truncate">
                    <LuPin className="inline-block mr-1 text-blue-500 shrink-0" />
                    {college.location}
                  </p>
                  <p className="text-xs font-sora font-medium capitalize text-gray-500">
                    Type: {college.type || "Institution"}
                  </p>

                  {/* Fees & Placement */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-inter text-gray-700 truncate">
                      1st Year Fees: <span className="font-medium text-black">{college.fees || "N/A"}</span>
                    </p>
                    <p className="text-xs font-inter text-gray-700 truncate">
                      Highest Placement: <span className="font-medium text-black">{college.placement || "N/A"}</span>
                    </p>
                  </div>

                  <Image
                    src="/hat.png"
                    width={200}
                    height={200}
                    alt="college"
                    className="absolute opacity-10 -right-5 top-16 w-32 h-32 pointer-events-none"
                  />

                  {/* Best Suited For Tags - Single Uniform Row */}
                  <div className="flex items-center gap-1.5 mt-3 overflow-hidden">
                    <span className="font-inter font-semibold text-blue-500 text-xs shrink-0">
                      Best Suited For:
                    </span>
                    <div className="flex gap-1.5 overflow-hidden">
                      {suitList.map((course, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[11px] font-inter uppercase whitespace-nowrap"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="pt-2 mt-auto">
                  <a
                    href={(college as any).link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-inter text-xs font-medium transition cursor-pointer"
                  >
                    Visit Website / Apply <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Fetch / Refresh Colleges */}
      <div className="flex justify-center mt-6">
        <Button
          disabled={loading}
          variant="outline"
          onClick={() => fetchRealTimeColleges(searchQuery, collegeType)}
          className="px-4 py-2 disabled:opacity-50 font-inter text-sm"
        >
          {loading ? "Loading..." : "Refresh College Suggestions"}
        </Button>
      </div>

      {/* ========================== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[880px] h-[600px] p-0 overflow-hidden">
          {!started ? (
            <div className="flex">
              {/* LEFT SIDE */}
              <div className="h-full bg-gradient-to-br from-blue-200 to-rose-300 w-[35%] relative">
                <Image
                  src="/static1.png"
                  width={200}
                  height={200}
                  alt="jobs"
                  className="absolute -bottom-5 h-[90%] w-full object-cover "
                />
              </div>
              {/* RIGHT SIDE */}
              <div className="flex-1 flex flex-col h-full p-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-semibold font-sora text-center mt-5">
                    🎓 Welcome to College Preference Quiz
                  </DialogTitle>
                </DialogHeader>
                <p className="text-gray-800 font-inter text-center mt-20 text-base">
                  Answer a few quick questions to help us match you with the
                  best colleges for your preferences.
                </p>
                <Button
                  className="font-inter text-base mt-20 mx-auto flex items-center justify-center"
                  onClick={() => setStarted(true)}
                >
                  Start Quiz <LuActivity className="ml-2" />
                </Button>

                <div className="bg-blue-50 border border-blue-400 px-3 py-6 rounded-md mt-auto">
                  <p className="text-gray-800 font-inter text-center text-base">
                   Make sure you answer the right questions so to get the most accurate results.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  Question {currentIndex + 1} of {quizDataCollege.length}
                </DialogTitle>
              </DialogHeader>

              <p className="text-lg font-medium">{currentQuestion.question}</p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion.key];
                  const isSelected =
                    currentQuestion.type === "multiple"
                      ? (selected as string[])?.includes(opt)
                      : selected === opt;

                  return (
                    <Button
                      key={opt}
                      variant={isSelected ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleOptionSelect(opt)}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext}>
                  {currentIndex === quizDataCollege.length - 1
                    ? "Finish"
                    : "Next"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
