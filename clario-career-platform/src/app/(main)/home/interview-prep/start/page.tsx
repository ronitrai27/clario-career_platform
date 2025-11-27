"use client";
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

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

if (!VAPI_PUBLIC_KEY) {
  throw new Error(
    "NEXT_PUBLIC_VAPI_PUBLIC_KEY is required. Please set it in your .env.local file."
  );
}

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
  const supabase = createClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [vapi] = useState(() => new Vapi(VAPI_PUBLIC_KEY));

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
      setIsMicOn(false);
      toast.success("Mic turned off");
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicOn(true);
        toast.success("Mic turned on");
      } catch (err) {
        console.error("Mic access error:", err);
      }
    }
  };
 
  // ----------------------------VAPI SETUP--------------------------------
  useEffect(() => {
    if (!interviewData) return;

    if (!interviewData.jobTitle) {
      toast.error("Job title is missing for this interview.");
      return;
    }
    startCall();
  }, [interviewData]);

  const startCall = async () => {
    const questionList = interviewData?.questions
      ?.map((q: any) => q.question)
      .join(", ");

      // gpt-4.1-mini
    const jobTitle = interviewData?.jobTitle;
    try {
      await vapi.start({
        model: {
          provider: "google",
          model: "gemini-2.5-pro",
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

        // silenceTimeoutSeconds: 20,
        maxDurationSeconds: 300,
      });

      console.log("🎤 Vapi Interview started successfully!");
    } catch (error) {
      console.error("❌ Error starting call:", error);
      // setVapiError(error);
      setLoading(false);
    }
  };

  vapi.on("speech-start", () => {
    setActiveUser(true);
  });

  vapi.on("speech-end", () => {
    setActiveUser(false);
  });

  vapi.on("call-start", () => {
    console.log("Call has started");
    setIsCallActive(true);
    setLoading(false);
    toast.info("Interview Has been started", {
      description: (
        <span className="text-sm text-gray-500 font-medium">
          Your Interview Has Been started!{" "}
          <span className="text-blue-600">All the best</span>
        </span>
      ),
    });
  });

  vapi.on("call-end", () => {
    setIsCallActive(false);
    setCallFinished(true);
  });
  useEffect(() => {
    if (callFinished) {
      GenerateFeedback();
      setIsDialogOpen(true);
      toast.success("Interview Has been Ended", {
        description: (
          <span className="text-sm text-gray-500 font-medium">
            Your Interview Has Been Ended!{" "}
          </span>
        ),
      });
    }
  }, [callFinished]);

  // ------------------------GENERATE FEEDBACK FUNCTION------------
  const GenerateFeedback = async () => {
    setFeedbackLoading(true);

    try {
      const response = await axios.post("/api/feedback", {
        conversation: messages,
      });

      const feedbackData = response.data?.data;
      console.log("🧠 Feedback Response:", feedbackData);

      const { data, error } = await supabase.from("others").insert([
        {
          userId: user?.id,
          jobTitle: interviewData?.jobTitle,
          interviewInsights: feedbackData,
        },
      ]);

      toast.success("Feedback generated successfully!");

      if (error) {
        console.error("❌ Supabase Insert Error:", error);
        toast.error("Failed to save feedback to database!");
        toast.success("Feedback generated successfully!");
      }
    } catch (error: any) {
      console.error("❌ Feedback Error:", error);
      toast.error("Failed to generate feedback. Try again!");
    } finally {
      setFeedbackLoading(false);
    }
  };

  // ---------------------------VAPI MESSAGE SETUP--------------------------
  useEffect(() => {
    vapi.on("message", (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "user" ? "user" : "assistant";
        const content = message.transcript;

        //  Prevent duplicates
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
    });
  }, [vapi]);

  const handleEnd = () => {
    stopCamera();
    vapi.stop();
    setIsMicOn(false);
    toast.success("Call ended");
  };

  console.log("🎯 Current Job: start-----------", interviewData.jobTitle);
  console.log("🧠 Questions: start-------------", interviewData.questions);

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
      // Reset timer when call ends
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
  // ------------------------TESTING--------------------------

  const demoConversation: Message[] = [
    { type: "assistant", content: "Hi, Renit. How are you?" },
    {
      type: "assistant",
      content: "Ready for your interview on React and Next.js vs Vue?",
    },
    { type: "assistant", content: "Able to work with MongoDB, PostgreSQL..." },
    {
      type: "user",
      content: "Uh, yes. I'm ready for that. I'm pretty excited.",
    },
    {
      type: "assistant",
      content:
        "Awesome. Let's kick things off, tell me among React, Next.js, Vue.js",
    },
    { type: "assistant", content: "Which one will you use and why?" },
    {
      type: "user",
      content: "Well, I will use Next.js for sure, because of its SSR and SSG",
    },
    { type: "assistant", content: "Thats great renit" },
    {
      type: "assistant",
      content: "Now tell me about your experience with react",
    },
    {
      type: "user",
      content:
        "I have worked with React for 2 years, where i learned lazy loading, hooks, context api",
    },
    {
      type: "assistant",
      content: "okay so tell me with your backend experience",
    },
    {
      type: "user",
      content: "Yes i worked with node , express , flask and even supabase.",
    },
    {
      type: "assistant",
      content: "Great, tell me something bout your projects?",
    },
    {
      type: "assistant",
      content:
        "Tell me any third party packages you have worked with in your project",
    },
    {
      type: "user",
      content:
        "yes, i created a neuratwin web app,  that uses openai api to generate text, langchain , mongodb , vapi ai for voice assistants, and sync with googpe calenders.",
    },
  ];

  const testing = async () => {
    setIsDialogOpen(true);
    setFeedbackLoading(true);
    toast.success("Interview Has been Ended", {
      description: (
        <span className="text-sm text-gray-500 font-medium">
          Your Interview Has Been Ended!{" "}
        </span>
      ),
    });
    try {
      const response = await axios.post("/api/feedback", {
        conversation: demoConversation,
      });
      const feedbackData = response.data?.data;
      console.log("🧠 Feedback Response:", feedbackData);

      const { data, error } = await supabase.from("others").insert([
        {
          userId: user?.id,
          jobTitle: interviewData?.jobTitle,
          interviewInsights: feedbackData,
        },
      ]);

      toast.success("Feedback generated successfully!");

      if (error) {
        console.error("❌ Supabase Insert Error:", error);
        toast.error("Failed to save feedback to database!");
        toast.success("Feedback generated successfully!");
      }
    } catch (error: any) {
      console.error("❌ Feedback Error:", error);
      toast.error("Failed to generate feedback. Try again!");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden  bg-white p-4">
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
                <div className="w-5 h-5 bg-red-400 rounded-full animate-bounce"></div>
                <p className="font-inter text-base tracking-wide">
                  Connecting...
                </p>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
                <p className="font-inter text-base tracking-wide">Connected</p>
              </div>
            )}

            <p className="text-xl flex items-center gap-3 font-semibold">
              <Timer /> {formatTime(seconds)}
            </p>
          </div>
          {/* VIDEO PART */}
          <div className="flex  justify-center w-full h-[520px] border rounded-lg shadow relative overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
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
              {!loading && (
                <div className="mt-10 flex flex-col space-y-1">
                  <AI_Voice />
                  {activeUser ? (
                    <p className="text-center font-inter text-sm">Speaking</p>
                  ) : (
                    <p className="text-center font-inter text-sm">Listening</p>
                  )}
                </div>
              )}
            </div>
          </div>

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

            {/* TESTING BUTTON */}
            {/* <Button className="text-sm font-inter" onClick={testing}>
              Test
            </Button> */}
          </div>
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
          <h1 className="text-center font-semibold font-inter text-xl">
            Interview Ended Successfully{" "}
            <LuActivity className="inline w-5 h-5 ml-2" />
          </h1>
          <p className=" mt-3 font-inter text-center text-muted-foreground">
            Kindly wait , insights are being generated for you. Then you can
            sefely leave this board.
          </p>

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

          {/* <Image src="/element1.png" alt="success" width={100} height={100} className="mx-auto h-full w-full object-cover -mt-20" /> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewStart;
