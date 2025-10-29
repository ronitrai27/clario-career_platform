/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LuAArrowUp,
  LuArrowUpRight,
  LuChevronDown,
  LuChevronUp,
  LuGlobe,
  LuLoader,
  LuMessageCircleHeart,
  LuMic,
} from "react-icons/lu";
import {
  Divide,
  Loader2,
  LucideActivity,
  LucideGlobe,
  LucideHistory,
  LucideSendHorizontal,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { UserQuizData } from "@/lib/types/allTypes";
import { getUserQuizData } from "@/lib/functions/dbActions";
import { Skeleton } from "@/components/ui/skeleton";
import { runAgent } from "@/lib/functions/Agents";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { BsStars } from "react-icons/bs";
import AILoadingState from "@/components/kokonutui/ai-loading";
import axios from "axios";

type Message = {
  role: "user" | "ai";
  text: string;
};

const CareerCoach = () => {
  const router = useRouter();
  const { user, loading } = useUserData();
  const supabase = createClient();
  const focus = user?.mainFocus?.toLowerCase();
  const [careerSkillOptions, setCareerSkillOptions] = useState<string[]>([]);
  const [quizData, setQuizData] = useState<UserQuizData[] | null>(null); // data will always be in this format(as table structure , only the quizInfo differs so we have any for that)
  const [quizDataLoading, setQuizDataLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const [quizSummary, setQuizSummary] = useState<string>("");
  const [quizStream, setQuizStream] = useState<string>("");
  const [showQuizDialog, setShowQuizDialog] = useState(false);

  // AI PART
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // follow-up state
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setQuizDataLoading(true);
      const data = await getUserQuizData(user.id);
      setQuizData(data);

      const firstQuiz = data[0];
      const options = firstQuiz.quizInfo?.careerOptions;

      if (Array.isArray(options)) {
        setCareerSkillOptions(options);
        // console.log("Career Options:", options);
      }
      const summary = firstQuiz.quizInfo?.summary;
      if (typeof summary === "string") {
        setQuizSummary(summary);
        // console.log("summary--------",summary);
      }

      const stream = firstQuiz.quizInfo?.stream;
      if (typeof stream === "string") {
        setQuizStream(stream);
      }

      setQuizDataLoading(false);
    };

    fetchData();
  }, [user?.id]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content) {
      toast.error("Please enter a message to send.");
      return;
    }
    if (user?.isQuizDone == false) {
      setShowQuizDialog(true);
      return;
    }

    if (aiLoading) return;

    setAiLoading(true);

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    try {
      // Construct context object
      const ctx: any = {
        question: userInput,
        userId: user?.id,
        userName: user?.userName,
        user_current_status: user?.current_status,
        careerOptions: careerSkillOptions.join(", "),
        summary: quizSummary,
      };

      ctx.stream = quizStream;

      // console.log("Context passing to AI:", ctx);

      const aiReply = await runAgent(ctx);
      console.log("AI Reply:---------->", aiReply);

      const aiMessage: Message = {
        role: "ai",
        text: typeof aiReply === "string" ? aiReply : String(aiReply),
      };

      setMessages((prev) => [...prev, aiMessage]);
      // FOLLOW UP QUESTIONS=====================================
      (async () => {
        try {
          const { data } = await axios.post("/api/ai/follow-up", {
            conversationString: `User: ${userInput}\nAI: ${aiMessage.text}`,
          });

          const followUps: string[] = Array.isArray(data.followUps)
            ? data.followUps.slice(0, 4)
            : [];

          setFollowUpQuestions(followUps);
        } catch (err) {
          console.error("Follow-up questions error:", err);
          setFollowUpQuestions([]); // fallback to empty
        }
      })();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user?.id) return;
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
    <div className="w-full h-[calc(100vh-66px)] bg-gray-50 pt-5 pb-6">
      <div className="w-full h-full flex">
        {/* LEFT SIDE CHATS */}
        <div className="w-full mt-5">
          {messages.length == 0 ? (
            <>
              <div className="flex items-center gap-6 justify-center">
                <h1 className="text-4xl font-semibold font-sora">
                  Welcome {user?.userName}
                </h1>
                <div className="bg-gradient-to-br from-blue-300 via-pink-300 to-yellow-400 w-12 h-12 rounded-full"></div>
              </div>

              {user?.isQuizDone ? (
                <p className="mt-3 text-xl font-inter text-center px-16  ">
                  Lets get started with defining your career goals, and clearing
                  your doubts. Tell me what you want to become.
                </p>
              ) : (
                <p className="mt-3 text-xl font-raleway text-center  ">
                  Looks Like you havent done the quiz yet. Kindly finish it
                  first to get started.
                </p>
              )}
              {showSuggestion && user?.isQuizDone ? (
                // Career suggestions
                <div className="mt-5 grid grid-cols-3 gap-6 px-6">
                  {quizDataLoading
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <Skeleton
                          key={idx}
                          className="h-12 w-full rounded-xl"
                        />
                      ))
                    : careerSkillOptions.map((option, idx) => (
                        <div
                          key={idx}
                          className="h-11 flex items-center justify-center rounded-md shadow p-1 
              bg-white text-black border hover:shadow-md hover:bg-slate-100 
              transition text-center"
                        >
                          <p className="text-xs font-inter font-light tracking-tight line-clamp-2">
                            {option}
                          </p>
                        </div>
                      ))}
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-3 gap-6 px-6">
                  {/* 1 */}
                  <div className="bg-slate-800 shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-inter text-base font-medium tracking-tight text-white">
                        AI Voice Assistant
                      </h2>
                      <div className="bg-gradient-to-tr from-blue-300 to-pink-300 py-1 px-2 rounded-full">
                        <p className="text-xs font-inter font-light tracking-tight">
                          Try Now{" "}
                          <LuArrowUpRight className="text-black inline" />
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 max-w-[250px] mx-auto text-center font-inter text-gray-200 text-sm">
                      Test your knowledge. AI Voice Assistant made for Interview
                      Preparations.
                    </p>
                  </div>
                  {/* 2 */}
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-inter text-base font-medium text-black">
                        Clear Every Doubt
                      </h2>
                      <div className="bg-blue-100 w-9 h-9 flex items-center justify-center rounded-full">
                        <LuMessageCircleHeart className="text-blue-500 text-xl inline" />
                      </div>
                    </div>
                    <p className="mt-4 max-w-[250px] mx-auto text-center font-inter text-gray-600 text-sm">
                      Ask questions freely and get simple, accurate explanations
                      in seconds.
                    </p>
                  </div>
                  {/* 3 */}
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-inter text-base font-medium text-black">
                        Live Web Search
                      </h2>
                      <div className="bg-blue-100 w-9 h-9 flex items-center justify-center rounded-full">
                        <LuGlobe className="text-blue-500 text-xl inline" />
                      </div>
                    </div>
                    <p className="mt-4 max-w-[250px] mx-auto text-center font-inter text-gray-600 text-sm">
                      Always get real-time and latest, verified answers.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <ScrollArea className="h-[64vh]  px-4 py-2 w-[850px] mx-auto -mt-5 ">
                <div className="flex flex-col gap-5">
                  {messages.map((msg, idx) =>
                    msg.role === "user" ? (
                      // User message
                      <div
                        key={idx}
                        className="max-w-[70%] px-3 py-2 rounded-md text-sm font-inter tracking-tight leading-snug bg-blue-500 text-white self-end"
                      >
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      // AI message and dollow up questions
                      <>
                        <div
                          key={idx}
                          className="max-w-[75%] px-3 py-3 rounded-md text-sm font-inter tracking-normal leading-relaxed bg-blue-100 text-black flex  gap-2"
                        >
                          <BsStars
                            className="text-blue-600 mt-1 shrink-0"
                            size={30}
                          />
                          <div>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>

                        {followUpQuestions.length > 0 && (
                          <div className=" bg-gray-200 max-w-[700px] p-3 rounded-md shadow">
                            <p className="font-inter text-sm text-blue-600">
                              <LucideActivity className="w-4 h-4 inline" />{" "}
                              Follow Up
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-4">
                              {followUpQuestions.map((q, i) => (
                                <button
                                  key={i}
                                  className="bg-white hover:bg-blue-50 border hover:border-blue-300 cursor-pointer px-3 py-1 rounded-md transition text-xs font-inter"
                                  onClick={() => {
                                    setInput(q);
                                  }}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  )}
                  {aiLoading && (
                    <div className="flex self-start mt-2 ml-2">
                      <AILoadingState />
                    </div>
                  )}

                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-[480px] mx-auto">
            <div className="bg-gray-200 rounded-md pb-2 pt-1 px-2">
              <div className="flex items-center justify-between px-6 mb-2">
                {messages.length > 0 ? (
                  <Button
                    onClick={clearChat}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 font-inter text-sm"
                  >
                    Clear
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-inter text-sm text-black"
                    onClick={() => setShowSuggestion(!showSuggestion)}
                  >
                    {showSuggestion ? (
                      <>
                        Hide Suggestions{" "}
                        <LuChevronDown className="text-black inline ml-1" />
                      </>
                    ) : (
                      <>
                        Show Suggestions{" "}
                        <LuChevronUp className="text-black inline ml-1" />
                      </>
                    )}
                  </Button>
                )}

                <p className="text-gray-600 font-sora text-sm">5 searchs -</p>
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Ask me anything"
                  rows={60}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="resize-none h-[105px] bg-gray-50 placeholder:text-gray-600 text-black font-sora text-sm"
                />

                <div className="absolute bottom-2 left-4">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-500 text-blue-500">
                    <LucideGlobe size={18} />
                    <p className="text-sm tracking-tight">Web</p>
                  </div>
                </div>
                <div className="absolute bottom-2 right-4">
                  <div
                    className="flex items-center gap-2 bg-blue-100 p-2 rounded  text-gray-600 hover:text-blue-600 cursor-pointer"
                    onClick={sendMessage}
                  >
                    <LucideSendHorizontal size={18} className="-rotate-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator orientation="vertical" className="h-full" />
        {/* RIGHT SIDE AI VOICE ASSITANT CARD */}
        <div className="w-[30%] h-full flex flex-col gap-3 p-2">
          <div className="bg-white overflow-hidden w-full h-[380px] shadow-md rounded-lg relative">
            <div
              className="absolute inset-0 z-0"
              style={{
                background: `
        radial-gradient(ellipse 80% 60% at 70% 20%, rgba(175, 109, 255, 0.85), transparent 68%),
        radial-gradient(ellipse 70% 60% at 20% 80%, rgba(255, 100, 180, 0.75), transparent 68%),
        radial-gradient(ellipse 60% 50% at 60% 65%, rgba(255, 235, 170, 0.98), transparent 68%),
        radial-gradient(ellipse 65% 40% at 50% 60%, rgba(120, 190, 255, 0.3), transparent 68%),
        linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)
      `,
              }}
            />
            <div className="relative z-30">
              <h2 className="font-sora text-2xl font-semibold text-center mt-3">
                AI Voice Assistant
              </h2>
              <p className="text-center text-sm font-light tracking-tight font-inter mt-3 px-2">
                AI Voice Assistant made for Interview Preparations. Try it out
                now
              </p>

              <div className="w-full flex items-center justify-center mt-5">
                <Button className="cursor-pointer bg-white text-black hover:bg-gray-100 ">
                  Talk Now <LuMic className="ml-2" />
                </Button>
              </div>
              <div className="absolute top-40 overflow-hidden">
                <Image
                  src="/ai_assistant.png"
                  alt="AI Assistant"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover "
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-2 shadow-md rounded-lg w-full h-[268px]">
            <h2 className="text-center font-inter text-base ">
              History <LucideHistory className="ml-4 inline" size={20} />
            </h2>
            <Separator className="my-2" />
          </div>
        </div>
      </div>

      {/* Quiz Required Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Quiz First</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You need to complete the quiz before talking to the AI.
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowQuizDialog(false);
                router.push("/start-quiz");
              }}
            >
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerCoach;
