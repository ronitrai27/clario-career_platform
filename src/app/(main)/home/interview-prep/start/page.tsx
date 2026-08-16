"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useUserData } from "@/context/UserDataProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import React from "react";
import {
  LuActivity,
  LuChevronLeft,
  LuDownload,
  LuEye,
  LuFileVideo,
  LuGhost,
  LuLoader,
  LuMessagesSquare,
  LuMic,
  LuMicOff,
  LuVideo,
  LuVideoOff,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { LucideLoader2, Timer, X } from "lucide-react";
import { toast } from "sonner";
import Vapi from "@vapi-ai/web";
import AI_Voice from "@/components/kokonutui/ai-voice";
import { useInterview } from "@/context/InterviewContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamicImport from "next/dynamic";

const FaceDetectionCanvas = dynamicImport(
  () =>
    import("../_components/FaceDetectionCanvas").then(
      (mod) => mod.FaceDetectionCanvas
    ),
  { ssr: false }
);

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

interface Message {
  type: "user" | "assistant";
  content: string;
}

const InterviewStart = () => {
  const { user } = useUserData();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const { interviewData } = useInterview();
  const [activeUser, setActiveUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callFinished, setCallFinished] = useState<boolean>(false);
  const [feedbackloading, setFeedbackLoading] = useState<boolean>(false);
  const [faceCount, setFaceCount] = useState<number>(0);
  const supabase = createClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && VAPI_PUBLIC_KEY) {
      setVapi(new Vapi(VAPI_PUBLIC_KEY));
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success("Camera turned on");
      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    toast.success("Camera turned off");
    setIsCameraOn(false);
  };

  const toggleCamera = () => {
    if (isCameraOn) stopCamera();
    else startCamera();
  };

  const toggleMic = async () => {
    if (isMicOn) {
      try {
        if (isCallActive && vapi) {
          vapi.setMuted(true);
        }
      } catch (e) {
        console.error("Mute error:", e);
      }
      setIsMicOn(false);
      toast.success("Mic turned off");
    } else {
      try {
        if (isCallActive && vapi) {
          vapi.setMuted(false);
        }
      } catch (e) {
        console.error("Unmute error:", e);
      }
      setIsMicOn(true);
      toast.success("Mic turned on");
    }
  };

  // Register Vapi error handler
  useEffect(() => {
    if (!vapi) return;
    const handleVapiError = (err: any) => {
      console.error("Vapi background error:", err);
    };
    vapi.on("error", handleVapiError);
    return () => {
      vapi.off("error", handleVapiError);
    };
  }, [vapi]);

  // ----------------------------VAPI & CAMERA SETUP--------------------------------
  useEffect(() => {
    if (!interviewData || !vapi) return;

    if (!interviewData.jobTitle) {
      toast.error("Job title is missing for this interview.");
      return;
    }
    startCamera();
    startCall();
  }, [interviewData, vapi]);

  const startCall = async () => {
    if (!vapi) return;
    const questionList = interviewData?.questions
      ?.map((q: any) => q.question)
      .join(", ");

    const jobTitle = interviewData?.jobTitle;
    try {
      await vapi.start({
        model: {
          provider: "google",
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `
You are an AI interviewer conducting a verbal mock interview for the position of ${jobTitle}.
Your goal is to ask each question clearly and conversationally, like a friendly human interviewer.

Begin with a warm introduction:
"Hey there! Welcome to your ${jobTitle} interview. Let's get started with a few questions!"

Ask **one question at a time** and pause to let the candidate respond before moving on.
Keep your tone natural, curious, and friendly — not robotic.

Here are the interview questions to ask one by one:
${questionList}

💡 If the candidate struggles, gently offer a hint or rephrase the question, but don't reveal the full answer.
Example:
"Need a little hint? Think about how you'd handle state updates in React."

After each answer, give a short and engaging response such as:
"Nice, that makes sense!"
"Interesting approach!"
"That's close — maybe think about scalability next time."

Keep the flow light and engaging. Use casual transitions like:
"Alright, next one!" or "Let's dive into something trickier!"

Key Guidelines:
- Keep responses concise and human-like.
- Be encouraging and adaptive.
- Maintain focus on the ${jobTitle} domain.
          `.trim(),
            },
          ],
        },
        voice: {
          provider: "vapi",
          voiceId: "Hana",
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        firstMessage: `Hi ${
          user?.userName || "there"
        }, how are you? Ready for your interview on ${jobTitle}?`,
        endCallMessage:
          "Thanks for chatting! That was a solid interview — see you crushing it soon!",
        endCallPhrases: ["goodbye", "bye", "end call", "hang up"],
        maxDurationSeconds: 300,
      });

      console.log("🎤 Vapi Interview started successfully!");
    } catch (error) {
      console.error("❌ Error starting call:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vapi) return;
    const handleSpeechStart = () => setActiveUser(true);
    const handleSpeechEnd = () => setActiveUser(false);

    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);

    return () => {
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
    };
  }, [vapi]);

  useEffect(() => {
    if (!vapi) return;
    const handleCallStart = () => {
      console.log("Call has started");
      setIsCallActive(true);
      setIsMicOn(true);
      try {
        vapi.setMuted(false);
      } catch (e) {
        console.error("Default unmute error:", e);
      }
      setLoading(false);
      toast.info("Interview Has been started", {
        description: (
          <span className="text-sm text-black font-semibold" style={{ color: "#000000" }}>
            Your Interview Has Been started!{" "}
            <span className="text-blue-600 font-bold">All the best</span>
          </span>
        ),
      });
    };

    vapi.on("call-start", handleCallStart);
    return () => {
      vapi.off("call-start", handleCallStart);
    };
  }, [vapi]);

  const hasEndedRef = useRef<boolean>(false);
  const isGeneratingRef = useRef<boolean>(false);

  // ------------------------CLEAN END SESSION FUNCTION----------------
  const endInterviewSession = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    // 1. Stop Vapi session
    try {
      if (vapi) vapi.stop();
    } catch (e) {
      console.error("Vapi stop error:", e);
    }

    // 2. Stop camera tracks silently without redundant toasts
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);

    // 3. Update state cleanly
    setIsCallActive(false);
    setIsMicOn(false);
    setActiveUser(false);
    setCallFinished(true);
    setIsDialogOpen(true);

    // 4. Single toast notification
    toast.success("Interview Has been Ended", {
      description: (
        <span className="text-sm text-black font-semibold" style={{ color: "#000000" }}>
          Your Interview Has Been Ended!
        </span>
      ),
    });

    // 5. Trigger feedback generation exactly once
    GenerateFeedback();
  };

  useEffect(() => {
    if (!vapi) return;
    const handleCallEnd = () => {
      endInterviewSession();
    };
    vapi.on("call-end", handleCallEnd);
    return () => {
      vapi.off("call-end", handleCallEnd);
    };
  }, [vapi]);

  // ------------------------GENERATE FEEDBACK FUNCTION------------
  const GenerateFeedback = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setFeedbackLoading(true);

    try {
      const response = await axios.post(
        "/api/feedback",
        {
          conversation: messages,
          jobTitle: interviewData?.jobTitle || "Professional Candidate",
        },
        { timeout: 15000 }
      );

      const feedbackData = response.data?.data;
      console.log("🧠 Feedback Response:", feedbackData);

      if (user?.id) {
        const { error } = await supabase.from("others").insert([
          {
            userId: user?.id,
            jobTitle: interviewData?.jobTitle || "Professional Candidate",
            interviewInsights: feedbackData,
          },
        ]);

        if (error) {
          console.error("❌ Supabase Insert Error:", error);
        }
      }

      toast.success("Feedback generated successfully!");
    } catch (error: any) {
      console.error("❌ Feedback Error:", error);
      toast.error("Feedback generated with standard evaluation.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ---------------------------VAPI MESSAGE SETUP--------------------------
  useEffect(() => {
    if (!vapi) return;
    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "user" ? "user" : "assistant";
        const content = message.transcript;

        setMessages((prev) => {
          if (prev.length > 0) {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.type === role && lastMsg.content === content) {
              return prev;
            }
          }
          return [...prev, { type: role, content }];
        });
      }
    };

    vapi.on("message", handleMessage);
    return () => {
      vapi.off("message", handleMessage);
    };
  }, [vapi]);

  const handleEnd = () => {
    endInterviewSession();
  };

  // optional: cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // -------------------TIMER-----------------------------------
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isCallActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const mins = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="w-full min-h-screen bg-white p-4">
      <div className="flex justify-between w-full">
        <div>
          <div className="flex gap-3">
            <SidebarTrigger />
            <p className=" font-inter flex items-center gap-3 px-4">
              <LuChevronLeft className="w-4 h-4" /> Back
            </p>
          </div>
          <h1 className="text-[27px] font-sora font-semibold mt-2 flex items-center gap-4">
            AI Interview Prep <LuVideo className="w-6 h-6" />
          </h1>
        </div>
        <Image
          src={user?.avatar || "/user.png"}
          alt="User Avatar"
          width={70}
          height={70}
          className="rounded-full w-[72px] h-[72px] shrink-0"
        />
      </div>
      <Separator className="my-2 max-w-[90%] bg-gray-300 mx-auto" />

      {/* PARENT BOX - LEFT VIDEO / RIGHT - MESSAGE */}
      <div className="flex gap-5 ">
        {/* LEFT */}
        <div className="flex-1 p-2">
          <div className="flex justify-between mb-2">
            {loading ? (
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-amber-400 rounded-full animate-bounce"></div>
                <p className="font-inter text-base tracking-wide">
                  Connecting...
                </p>
              </div>
            ) : isCallActive ? (
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-green-500 rounded-full animate-bounce"></div>
                <p className="font-inter text-base tracking-wide">Connected</p>
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <p className="font-inter text-base tracking-wide text-red-600 font-semibold">
                  Interview Ended
                </p>
              </div>
            )}

            <p className="text-xl flex items-center gap-3 font-semibold">
              <Timer /> {formatTime(seconds)}
            </p>
          </div>
          {/* VIDEO PART */}
          <div
            className={`flex justify-center w-full h-[520px] rounded-lg shadow relative overflow-hidden transition-all duration-300 ${
              faceCount > 1
                ? "border-4 border-red-600 ring-4 ring-red-500/40 shadow-2xl shadow-red-500/40 bg-red-950/20 animate-pulse"
                : "border border-gray-200"
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
            />
            {/* Real-time Multi-Face AI Guard */}
            <FaceDetectionCanvas
              videoRef={videoRef}
              isCameraOn={isCameraOn}
              isCallActive={isCallActive}
              onAutoEnd={handleEnd}
              onFaceCountChange={setFaceCount}
            />
            {!isCameraOn && (
              <div>
                <Image
                  src={user?.avatar || "/user.png"}
                  alt="User Avatar"
                  width={70}
                  height={70}
                  className="rounded-full w-[200px] h-[200px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
            )}

            <div className="w-[180px] h-[180px] bg-blue-50 absolute top-3 right-3 rounded-lg border-2 border-blue-400 flex flex-col items-center justify-center overflow-hidden">
              <div className="  bg-white border rounded-full w-16 h-16 flex items-center justify-center shrink-0 -mb-5">
                <h1 className="font-extrabold font-inter text-2xl">AI</h1>
              </div>
              {!loading && isCallActive ? (
                <div className="mt-10 flex flex-col space-y-1">
                  <AI_Voice />
                  {activeUser ? (
                    <p className="text-center font-inter text-sm">Speaking</p>
                  ) : (
                    <p className="text-center font-inter text-sm">Listening</p>
                  )}
                </div>
              ) : (
                <div className="mt-10 flex flex-col space-y-1 items-center">
                  <p className="text-center font-inter text-xs text-gray-500 font-semibold">
                    Disconnected
                  </p>
                </div>
              )}
            </div>
          </div>

          {callFinished ? (
            <div className="mt-7 flex justify-center gap-6">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="font-inter text-sm shadow-md cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
              >
                <LuEye className="w-4 h-4 mr-2" />
                View Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/home/interview-prep")}
                className="font-inter text-sm shadow-md cursor-pointer"
              >
                <LuChevronLeft className="w-4 h-4 mr-2" />
                Back to Interview Prep
              </Button>
            </div>
          ) : (
            <div className="mt-7 flex justify-center gap-10">
              {/*  Video Button */}
              <Button
                variant={isCameraOn ? "default" : "outline"}
                onClick={toggleCamera}
                className="font-inter text-sm shadow-md cursor-pointer"
              >
                {isCameraOn ? (
                  <LuVideo className="w-4 h-4 mr-2 text-white" />
                ) : (
                  <LuVideoOff className="w-4 h-4 mr-2 text-black" />
                )}
                Video
              </Button>
              {/*  Mic Button */}
              <Button
                variant={isMicOn ? "default" : "outline"}
                onClick={toggleMic}
                className="font-inter text-sm shadow-md cursor-pointer"
              >
                {isMicOn ? (
                  <LuMic className="w-4 h-4 mr-2 text-white" />
                ) : (
                  <LuMicOff className="w-4 h-4 mr-2 text-black" />
                )}
                Mic
              </Button>
              {/*  End Button */}
              <Button
                variant="destructive"
                onClick={handleEnd}
                className="font-inter text-sm shadow-md cursor-pointer"
              >
                <X className="w-4 h-4 mr-2" />
                End
              </Button>
            </div>
          )}
        </div>
        {/* RIGHT */}
        <div className="w-[28%] bg-gray-50 rounded-lg border p-3 flex flex-col">
          <h2 className="flex items-center justify-center gap-3 font-inter text-xl">
            Transcribe <LuMessagesSquare className="w-6 h-6" />
          </h2>
          <div className="bg-blue-50 border border-blue-400 mt-4 px-3 py-6 rounded-md">
            <p className="font-inter tracking-tight text-sm text-center">
              All transcriptions appear here. Please give clear, relevant
              answers.
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full ">
              <h2 className="font-inter text-lg text-muted-foreground mb-2">
                No Transcriptions Available
              </h2>
              <LuGhost className="w-6 h-6 text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3 h-[380px] mt-5 overflow-y-scroll">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.type === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-xs tracking-tight font-inter shadow-sm ${
                      msg.type === "assistant"
                        ? "bg-white text-foreground rounded-bl-none"
                        : "bg-primary text-primary-foreground rounded-br-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div ref={scrollRef} />
                </div>
              ))}
            </div>
          )}

          <div className="w-full mt-auto">
            <Separator className="my-2" />
            <Button className="font-inter text-sm w-full bg-white text-black hover:bg-gray-100 cursor-pointer">
              Download Transcribe <LuDownload className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-4  rounded-md max-w-md  overflow-hidden ">
          <DialogTitle className="text-center font-semibold font-inter text-xl">
            Interview Ended Successfully{" "}
            <LuActivity className="inline w-5 h-5 ml-2" />
          </DialogTitle>
          <DialogDescription className=" mt-3 font-inter text-center text-muted-foreground">
            Kindly wait, insights are being generated for you. Then you can
            safely leave this board.
          </DialogDescription>

          {feedbackloading ? (
            <Button className="mt-5">
              <LucideLoader2 className="w-6 h-6 animate-spin " />
              Generating
            </Button>
          ) : (
            <Button
              className="font-inter text-sm mt-5"
              onClick={() => router.push("/home/interview-prep")}
            >
              <LuEye className="w-5 h-5 mr-2" />
              View Insights
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewStart;
