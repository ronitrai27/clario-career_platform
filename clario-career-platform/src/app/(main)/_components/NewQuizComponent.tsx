/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { QuizData, quizData, QuizSection } from "./QuizData";
import { useUserData } from "@/context/UserDataProvider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, Sparkles } from "lucide-react";
import axios from "axios";
import {
  LuArrowBigRight,
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuLoader,
} from "react-icons/lu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import InsightsReveal from "./CardQuizInsights";
import { motion } from "framer-motion";
import { Users, Video, Briefcase } from "lucide-react";

export default function Quiz() {
  const { user } = useUserData();
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [finalLoading, setFinalLoading] = useState(false);

  const [insights, setInsights] = useState<any>(null);
  const [readyToSave, setReadyToSave] = useState(false); // to display insights

  const current_status = user?.current_status;
  const mainFocus = user?.mainFocus;
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<
    Record<string, Record<number, string>>
  >({});

  if (!current_status || !mainFocus) {
    return <p>Loading user data...</p>;
  }

  const statusToKeyMap: Record<string, keyof QuizData> = {
    "12th student": "12",
    "diploma student": "diploma",
    graduate: "graduate",
    "working professional": "working professional",
  };

  const gradeKey = statusToKeyMap[current_status];

  const adjustedFocus =
    current_status === "12th student"
      ? "choose career paths"
      : "career/ path guidance";

  // const gradeKey = current_status as keyof QuizData;

  // function getQuizSet(
  //   gradeKey: keyof QuizData,
  //   current_status: string,
  //   mainFocus: string
  // ): QuizSection | undefined {
  //   const block = (
  //     quizData[gradeKey] as Record<string, Record<string, QuizSection>>
  //   )[current_status];
  //   return block?.[mainFocus];
  // }

  // const quizSet = getQuizSet(gradeKey, current_status, mainFocus);

  function getQuizSet(
    gradeKey: keyof QuizData,
    current_status: string,
    mainFocus: string
  ): QuizSection | undefined {
    const block = (
      quizData[gradeKey] as Record<string, Record<string, QuizSection>>
    )[current_status];
    return block?.[mainFocus];
  }

  const quizSet = getQuizSet(gradeKey, current_status, adjustedFocus);

  if (!quizSet) {
    return <p>No quiz available for this selection.</p>;
  }

  // flatten
  const sections = Object.entries(quizSet);
  const allQuestions = sections.flatMap(([sectionName, questions]) =>
    questions.map((q, idx) => ({
      section: sectionName,
      question: q,
      index: idx,
    }))
  );

  const currentQ = allQuestions[step];

  const saveAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.section]: {
        ...prev[currentQ.section],
        [currentQ.index]: value,
      },
    }));
  };

  const progressPercent = Math.round(((step + 1) / allQuestions.length) * 100);

  const progress = ((step + 1) / allQuestions.length) * 100;

  const handleSubmit = async () => {
    // merge questions + answers
    const result = allQuestions.map((q: any) => ({
      section: q.section,
      question: q.question.question,
      answer: answers[q.section]?.[q.index] || "",
    }));

    // console.log("Final Quiz Data:", JSON.stringify(result, null, 2));

    setLoading(true);
    try {
      const res = await axios.post("/api/ai/quiz-feedback", {
        quizData: result,
        userStatus: user.current_status,
        mainFocus: user.mainFocus,
      });

      const { data } = res.data;
      setInsights(data.insights);
      setFinished(false);
      setReadyToSave(true);
      toast.success("Quiz submitted successfully!");
    } catch (err: any) {
      console.error("❌ handleSubmit error:", err.message || err);
      toast.error(err.message || "Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!insights) return;
    setFinalLoading(true);
    try {
      const { error } = await supabase.from("userQuizData").insert([
        {
          userId: user.id,
          user_current_status: user.current_status,
          user_mainFocus: user.mainFocus,
          quizInfo: insights, // JSONB
          userName: user.userName,
          userAvatar: user.avatar
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Failed to save quiz data. Please try again.");
        return;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ isQuizDone: true })
        .eq("id", user.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        toast.error("Failed to update user status.");
        return;
      }

      localStorage.setItem("quizDone", "true");
      toast.success("Quiz submitted successfully!");
      router.push("/home");
    } catch (err: any) {
      console.error("❌ handleConfirm error:", err.message || err);
      toast.error("Failed to save quiz results.");
    } finally {
      setFinalLoading(false);
    }
  };

  if (finished) {
    return (
      <div className="flex h-full">
        {/* Left side */}
        <div className="w-[32%] bg-slate-800  relative">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "#1d293d",
              backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px),
        radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)
      `,
              backgroundSize: "20px 20px, 20px 20px, 20px 20px",
              backgroundPosition: "0 0, 0 0, 0 0",
            }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-[320px] bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center border border-gray-200"
            >
              {/* Icon */}
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>

              {/* Fact/Feature */}
              <h3 className="font-semibold text-gray-800 text-lg mb-2 font-sora">
                Did you know? 🤔
              </h3>
              <p className="text-bl font-inter text-base leading-relaxed">
                Clario helps{" "}
                <span className="font-semibold text-indigo-600">
                  300+ students
                </span>{" "}
                transform their careers, while{" "}
                <span className="font-semibold text-green-600">
                  20+ students daily
                </span>{" "}
                clear doubts with expert mentors on 1:1 video calls.
              </p>
            </motion.div>
          </div>
        </div>
        {/* Right side */}
        <div className="w-[68%] flex flex-col justify-center items-center">
          <div className="flex items-center justify-center gap-6">
            <h2 className="text-3xl font-bold font-sora text-black">
              Quiz Completed!
            </h2>
            <div className="flex justify-center items-center bg-blue-100 w-12 h-12 rounded-full mx-auto">
              <Activity className="text-2xl text-blue-500" />
            </div>
          </div>
          <p className="text-gray-700 font-inter text-lg mt-5">
            Great job {user?.userName}! You’ve reached the end of the quiz.
          </p>

          <div className="flex justify-center gap-8 mt-14">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => {
                setAnswers({});
                setStep(0);
                setStarted(false);
                setFinished(false);
              }}
            >
              Retake Quiz
            </Button>
            <Button
              disabled={loading}
              className="bg-blue-500 text-white"
              onClick={handleSubmit}
            >
              Submit Quiz
            </Button>
          </div>

          {loading && (
            <p className="text-gray-800 text-lg mt-10 font-inter text-center flex items-center gap-2 justify-center">
              <LuLoader className="animate-spin mr-2 text-2xl" />
              Analyzing Response...
            </p>
          )}
        </div>
      </div>
    );
  }

  //  Welcome screen before quiz starts
  if (!started) {
    return (
      <div className="flex h-full">
        {/* Left side */}
        <div className="w-[32%] bg-slate-800  relative">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "#1d293d",
              backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px),
        radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)
      `,
              backgroundSize: "20px 20px, 20px 20px, 20px 20px",
              backgroundPosition: "0 0, 0 0, 0 0",
            }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-[360px] h-[380px] bg-white shadow-lg rounded-2xl p-5 flex flex-col gap-4 border border-gray-200"
            >
              {/* Tweet Header */}
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/50"
                  alt="Clario Logo"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold font-inter text-black">
                    Anonymous
                  </h2>
                  <p className="text-sm text-gray-600 font-raleway">
                    @ClarioCareer
                  </p>
                </div>
              </div>

              {/* Tweet Content */}
              <p className="text-black font-inter text-base leading-snug">
                🚀 Clario is a wonderful platform to enhance your career and
                clear all doubts with the right guidance.
              </p>

              {/* Stats Section */}
              <div className="grid grid-cols-1 gap-3 mt-2 font-sora tracking-tight">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer"
                >
                  <Users className="w-6 h-6 text-indigo-600" />
                  <span className="text-gray-700 text-sm font-medium">
                    300+ students changed their lives
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer"
                >
                  <Video className="w-6 h-6 text-green-600" />
                  <span className="text-gray-700 text-sm font-medium">
                    20+ students daily clear doubts on 1:1 video calls
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer"
                >
                  <Briefcase className="w-6 h-6 text-yellow-600" />
                  <span className="text-gray-700 text-sm font-medium">
                    Daily jobs & career info updates
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-[68%] flex flex-col justify-center items-center">
          <div className="flex gap-5 items-center">
            <h2 className="text-3xl font-bold font-sora">
              Welcome to Your Quiz
            </h2>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Activity className="text-2xl text-blue-500" />
            </div>
          </div>

          <p className="text-gray-700 font-inter text-xl text-center">
            Personalized assessment for your academic journey
          </p>
          <div className="my-12 bg-blue-50 w-1/2 mx-auto border border-blue-500 rounded-lg shadow p-3 flex flex-col items-center justify-center">
            <p className="text-black font-inter text-lg">{user?.userName}</p>
            <p className="text-gray-700 mt-3 capitalize font-raleway">
              <span className="font-medium font-inter text-lg ">
                Current Status:
              </span>{" "}
              {current_status}
            </p>
            <p className="text-gray-700 mt-3 capitalize font-raleway">
              <span className="font-medium font-inter text-lg ">
                Main Focus:
              </span>{" "}
              {mainFocus}
            </p>
          </div>
          <Button
            onClick={() => setStarted(true)}
            className="mt-4 w-1/2 bg-blue-500 text-white hover:bg-blue-600 px-6 py-3 rounded-lg font-medium"
          >
            Start Quiz <LuArrowBigRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (readyToSave) {
    return (
      <div className="flex h-full">
        {/* Left side */}
        <div className="w-[32%] bg-slate-800  relative">
          <div
            className="absolute inset-0 z-0 h-full"
            style={{
              background: "#1d293d",
              backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px),
        radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)
      `,
              backgroundSize: "20px 20px, 20px 20px, 20px 20px",
              backgroundPosition: "0 0, 0 0, 0 0",
            }}
          />
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
            <div className="w-[340px] h-[380px] bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-gray-200 overflow-hidden relative">
              {/* Scan Area */}
              <div className="w-full h-40 bg-gray-100 rounded-lg relative overflow-hidden">
                {/* Scanner Line */}
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: ["0%", "100%", "0%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 left-0 w-full h-1/2 rounded-md  bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-500 shadow-md"
                />
                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/40 to-transparent" />
              </div>

              {/* Text Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  🔍 Scanning your results...
                </h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  Our AI is analysing your answers and <br />
                  creating a{" "}
                  <span className="font-semibold text-indigo-600">
                    custom career plan
                  </span>{" "}
                  for you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="w-[68%] px-6 pt-6 pb-3 h-full">
          <div className="flex flex-col justify-center max-w-[800px] mx-auto h-full">
            <h2 className="text-center font-sora text-3xl">
              {" "}
              AI Career Insights
            </h2>
            <div className="mt-6">
              <InsightsReveal insights={insights} />
            </div>

            <div className="mt-auto flex items-center justify-center">
              <Button
                onClick={handleConfirm}
                disabled={finalLoading}
                className="w-1/2 mx-auto"
              >
                {finalLoading ? (
                  <>
                    <LuLoader className="animate-spin mr-2 inline" /> Loading...
                  </>
                ) : (
                  <>Confirm & Continue</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left side */}
      <div className="w-[32%] bg-slate-800  relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "#1d293d",
            backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px),
        radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)
      `,
            backgroundSize: "20px 20px, 20px 20px, 20px 20px",
            backgroundPosition: "0 0, 0 0, 0 0",
          }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="w-[300px] bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center border border-gray-200"
          >
            {/* Avatar stack */}
            <div className="flex -space-x-4 mb-4">
              <img
                src="https://i.pravatar.cc/50?img=1"
                alt="user1"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <img
                src="https://i.pravatar.cc/50?img=2"
                alt="user2"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <img
                src="https://i.pravatar.cc/50?img=3"
                alt="user3"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <img
                src="https://i.pravatar.cc/50?img=4"
                alt="user4"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
              <img
                src="https://i.pravatar.cc/50"
                alt="user4"
                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
              />
            </div>

            {/* Text */}
            <p className="text-black font-inter text-base leading-relaxed text-center">
              Start your personal assessment quiz <br />
              and unlock the power to build your future ✨
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side */}
      <div className="w-[68%] flex flex-col h-full px-10 py-6">
        {/* Progress bar */}
        <div className="max-w-[660px] mx-auto w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-inter font-semibold">
              Question {step + 1} of {allQuestions.length}
            </h2>
            <p className="text-sm text-muted-foreground font-inter">
              {progressPercent}% completed
            </p>
          </div>

          <Progress value={progress} className="h-2 bg-blue-100 mt-2" />
        </div>

        <div className="max-w-[720px] mx-auto mt-14 w-full">
          <p className="mt-4 font-sora text-3xl text-left ">
            {currentQ.question.question}
          </p>
          <p className="text-base font-inter tracking-tight text-muted-foreground mt-4">
            Note: Your selection will help to improve platform experience and
            will not be shared with anyone.
          </p>

          <p className="text-base font-inter  text-blue-500 italic mt-4 mb-16">
            Section: {currentQ.section.replace("_", " ")}
          </p>

          {currentQ.question.options ? (
            <div className="flex flex-col gap-3">
              {currentQ.question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => saveAnswer(opt)}
                  className={`px-4 py-2 rounded-md cursor-pointer ${
                    answers[currentQ.section]?.[currentQ.index] === opt
                      ? "bg-blue-500 border border-white text-white"
                      : "bg-gray-50 border border-gray-300 hover:bg-blue-100 hover:border-blue-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="border p-2 rounded-lg w-full h-40 bg-gray-50"
              placeholder="Type your answer..."
              value={answers[currentQ.section]?.[currentQ.index] || ""}
              onChange={(e) => saveAnswer(e.target.value)}
            />
          )}
        </div>

        <div className="mt-auto border-t-2">
          <div className="flex justify-between mt-6 max-w-[800px] mx-auto w-full">
            <Button
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
            >
              <LuArrowLeft className="inline mr-2" /> Back
            </Button>

            {step < allQuestions.length - 1 ? (
              <Button
                onClick={() =>
                  setStep((s) => Math.min(s + 1, allQuestions.length - 1))
                }
                disabled={!answers[currentQ.section]?.[currentQ.index]}
              >
                Next <LuArrowRight className="inline ml-2" />
              </Button>
            ) : (
              <Button
                className="bg-blue-500 cursor-pointer text-white"
                onClick={() => setFinished(true)}
              >
                Finish <LuArrowRight className="inline ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
