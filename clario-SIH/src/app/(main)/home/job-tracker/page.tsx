"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { JobTrackerCard } from "@/lib/types/allTypes";
import { Filter, Icon, Info, InfoIcon, LucideCheckCircle } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  LuActivity,
  LuBookMarked,
  LuBriefcaseBusiness,
  LuBuilding2,
  LuChevronDown,
  LuChevronRight,
  LuCircleFadingPlus,
  LuEye,
  LuNotebookPen,
  LuPen,
  LuPenTool,
} from "react-icons/lu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useDroppable,
  useDraggable,
  DragOverlay, 
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities"; // For transform styles during drag
import axios from "axios";
import ShimmerText from "@/components/kokonutui/shimmer-text";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useInterview } from "@/context/InterviewContext";

const stages = [
  {
    key: "saved",
    name: "Saved",
    color: "bg-orange-400",
    cardcolor: "bg-orange-100",
  },
  {
    key: "applied",
    name: "Applied",
    color: "bg-blue-400",
    cardcolor: "bg-blue-100",
  },
  {
    key: "interviewing",
    name: "Interviewing",
    color: "bg-green-400",
    cardcolor: "bg-green-100",
  },
  {
    key: "negotiating",
    name: "Negotiating",
    color: "bg-yellow-400",
    cardcolor: "bg-yellow-100",
  },
  {
    key: "hired",
    name: "Hired",
    color: "bg-emerald-400",
    cardcolor: "bg-emerald-100",
  },
  {
    key: "rejected",
    name: "Rejected",
    color: "bg-rose-400",
    cardcolor: "bg-rose-100",
  },
];

const messages = [
  "Generating interview questions...",
  "Analyzing job description...",
  "Setting up your preparation environment...",
  "Optimizing question difficulty...",
  "Almost ready to launch your interview prep!",
];

const JobTracker = () => {
  const supabase = createClient();
  const { user } = useUserData();
  const router = useRouter();
  const { open: sidebarOpen, isMobile } = useSidebar();
  const [jobs, setJobs] = useState<JobTrackerCard[]>([]);
  const [open, setOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setInterviewData } = useInterview();
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    description: "",
    stage: "saved",
    type: "full-time",
    applied_date: "",
    note: "",
  });

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("job_tracker")
        .select("*")
        .eq("userId", user?.id);
      if (!error && data) setJobs(data);
    };

    fetchJobs();
  }, [user?.id]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.job_title.trim() || !form.company.trim()) return;
    if (form.description.length < 30) {
      toast.error("Description should be at least 30 characters long.");
      return;
    }
    setLoading(true);
    const tempId = Date.now();
    const tempJob: JobTrackerCard = {
      ...form,
      id: tempId,
      created_at: new Date().toISOString(),
      userId: user?.id,
    };

    setJobs((prev) => [...prev, tempJob]);
    setOpen(false);

    try {
      const { data, error } = await supabase
        .from("job_tracker")
        .insert([{ ...form, userId: user?.id ?? "anonymous" }])
        .select()
        .single();

      if (error) throw error;
      setJobs((prev) => prev.map((j) => (j.id === tempId ? data : j)));
      setLoading(false);
      toast.success("Job saved successfully!");
      setForm({
        job_title: "",
        company: "",
        description: "",
        stage: "saved",
        type: "full-time",
        applied_date: "",
        note: "",
      });
    } catch (err) {
      console.error("Error saving job:", err);
      // rollback
      setJobs((prev) => prev.filter((j) => j.id !== tempId));
      toast.error("Failed to save job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------ANIMATION IN DIALOG------------------
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // --- Phase 1: Messages ---
  useEffect(() => {
    if (!prepOpen) return;

    setActiveIndex(0);
    setShowInstructions(false);

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % messages.length;

        if (nextIndex === 0 && prev === messages.length - 1) {
          toast.success("Interview prep is ready!");
          setShowInstructions(true);
        }

        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [prepOpen]);

  // --- Phase 2: Countdown Timer ---
  useEffect(() => {
    if (!showInstructions) return;
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          console.log("⏩ Redirecting to interview...");
          router.push("/home/interview-prep/start");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showInstructions, router]);
  // ------Last animation MAGICUI----------------
  const [value, setValue] = useState(0);
  useEffect(() => {
    const handleIncrement = (prev: number) => {
      if (prev === 100) {
        return 0;
      }
      return prev + 10;
    };
    setValue(handleIncrement);
    const interval = setInterval(() => setValue(handleIncrement), 2000);
    return () => clearInterval(interval);
  }, []);

  // --------------------------------QNA GENERATION--------------------
  const handleInterviewQna = async (job: any) => {
    console.log("Job Title:", job.job_title);
    console.log("Job Description:", job.description);

    setPrepOpen(true); // open dialog to show loading animation
    setIsLoading(true);

    try {
      const response = await axios.post("/api/ai/qna-generate", {
        jobTitle: job.job_title,
        jobDescription: job.description,
      });

      const questions = response.data?.data?.interviewQuestions || [];

      setInterviewData({
        jobTitle: job.job_title,
        questions,
      });

      console.log("🧠 AI Response:", response.data);
      toast.success("Interview QnA generated successfully!");
    } catch (error: any) {
      console.error(
        "❌ Error generating QnA:",
        error.response?.data || error.message
      );
      toast.error("Failed to generate QnA. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="h-full  bg-gray-50 p-2 pb-8">
      <div className="w-full flex px-8 gap-5 my-6">
        <p className="whitespace-nowrap text-2xl font-semibold font-sora flex gap-3 items-center">
          Your smart way of job tracking <LuChevronRight className="w-4 h-4" />
        </p>
        <div className="flex items-center gap-3 justify-end w-full">
          {/* <p className="font-inter tracking-tight text-sm">
            Bring jobs from career board to your job tracker
          </p> */}
          <Button variant="outline" className="font-inter text-sm">
            <LuBookMarked className="w-4 h-4 mr-2" />
            Career Board
          </Button>
        </div>
        <Button variant="outline" className="font-inter text-sm ml-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button
          variant="outline"
          className="font-inter text-sm bg-gradient-to-br from-blue-300 to-blue-500 text-white"
        >
          Add <LuCircleFadingPlus className="w-4 h-4 ml-2" />
        </Button>
      </div>
      {/* Job tracker */}
      <div
        className={`w-full h-full mx-auto ${
          sidebarOpen ? "max-w-[1180px]" : "max-w-[1400px]"
        }  `}
      >
        <div className="flex h-full mb-20 w-full overflow-x-auto scroll-smooth mt-5">
          {/* Left side */}
          <div className="w-[250px] flex flex-col h-full p-2 mr-5">
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 w-full h-[250px] rounded-md shadow-sm mb-4 relative p-3">
              <Image
                src="/jobasset1.png"
                alt="job"
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-md absolute opacity-40 inset-0 -top-10"
              />
              <div className="flex flex-col h-full">
                <h1 className="font-inter font-semibold text-2xl  text-white text-center mt-10">
                  Get Ready to crack your dream job
                </h1>

                <Button
                  variant="default"
                  className="font-inter text-sm mt-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                >
                  Ai Interview Prep
                  <LuChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="font-inter text-base shadow-sm mt-10 cursor-pointer"
              onClick={() => setOpen(true)}
            >
              Add Job <LuCircleFadingPlus className="w-4 h-4 ml-2" />
            </Button>

            <p className="font-inter mt-4 text-center text-sm text-muted-foreground">
              Click on the button to add a job. Drag and drop created job to
              reorder
            </p>
          </div>
          {/* Right side all columns */}
          <div className="flex  min-w-max gap-4">
            {stages.map((stage) => (
              <div
                key={stage.key}
                className="flex flex-col w-[300px] overflow-y-auto bg-white rounded-md shadow-sm border border-gray-200"
              >
                <div
                  className={`text-center py-3 font-semibold border-b border-gray-200 rounded shadow mb-5 ${stage.color}`}
                >
                  <h1 className="font-sora text-base text-white  flex items-center justify-center gap-5">
                    {stage.name}
                  </h1>
                </div>

                <div className="flex-1 space-y-3 py-2 px-3">
                  {jobs
                    .filter((job) => job.stage === stage.key)
                    .map((job) => (
                      <Card
                        key={job.id}
                        className={`p-2  border-none shadow-sm hover:shadow-md rounded-md transition  ${stage.cardcolor}`}
                      >
                        <CardContent className="flex flex-col h-[200px] p-1">
                          <div className="flex flex-col h-full">
                            <h2 className="font-semibold font-inter text-base tracking-wide  capitalize flex items-center  max-w-[200px] truncate  gap-2">
                              <LuBriefcaseBusiness className="w-4 h-4 mr-2 text-gray-800 shrink-0" />
                              {job.job_title}
                            </h2>
                            <p className="text-base font-inter tracking-tight flex items-center  gap-2">
                              <LuBuilding2 className="w-4 h-4 mr-2" />
                              {job.company}
                            </p>

                            <div className="mt-2 font-inter text-sm flex items-center justify-between w-full capitalize">
                              <p>
                                <span className="font-semibold">Type</span>:{" "}
                                {job.type}
                              </p>
                              <p>
                                <span className="font-semibold">Stage</span>:{" "}
                                {job.stage}
                              </p>
                            </div>
                            <p className="mt-4 line-clamp-2 font-inter text-sm tracking-tight text-center">
                              {job.description}
                            </p>

                            <div className="flex items-center justify-evenly w-full mt-auto">
                              <Button
                                variant="outline"
                                className={`text-xs font-inter cursor-pointer `}
                                onClick={() => handleInterviewQna(job)}
                              >
                                Start Prep{" "}
                                <LuActivity className="w-4 h-4 ml-2" />
                              </Button>
                              <Button
                                variant="outline"
                                className="text-xs font-inter cursor-pointer"
                              >
                                View <LuPen className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🟩 The Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-inter text-xl tracking-tight flex items-center gap-3">
              Add a Job here{" "}
              <LuBriefcaseBusiness className="w-5 h-5 text-blue-500" />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor="job_title"
                className="font-medium text-sm font-inter"
              >
                Job Title
              </Label>
              <Input
                id="job_title"
                placeholder="Enter job title"
                value={form.job_title}
                onChange={(e) => handleChange("job_title", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="company"
                className="font-medium font-inter text-sm"
              >
                Company Name
              </Label>
              <Input
                id="company"
                placeholder="Enter company name"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="description"
                className="font-medium font-inter text-sm"
              >
                Job Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter job description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="flex w-full justify-center gap-10 my-7">
              <Select
                value={form.type}
                onValueChange={(value) => handleChange("type", value)}
                defaultValue="full-time"
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Select Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
              {/* 🆕 Job Stage */}
              <Select
                value={form.stage}
                onValueChange={(value) => handleChange("stage", value)}
                defaultValue="saved"
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Select Job Stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/*  Applied Date */}
            <div className="space-y-1">
              <Label
                htmlFor="applied_date"
                className="font-medium font-inter text-sm"
              >
                Applied Date
              </Label>
              <Input
                id="applied_date"
                type="date"
                value={form.applied_date}
                onChange={(e) => handleChange("applied_date", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="company"
                className="font-medium font-inter text-sm"
              >
                Other Notes (any)
              </Label>
              <Textarea
                placeholder="Notes (optional)"
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="default"
              className="cursor-pointer bg-blue-400 flex items-center"
            >
              {loading ? (
                "Adding..."
              ) : (
                <>
                  Add Job <LuCircleFadingPlus className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prep DIALOG */}
      <Dialog open={prepOpen} onOpenChange={setPrepOpen}>
        <DialogContent className="sm:max-w-[750px] h-[500px] p-0 border-0 shadow-2xl rounded-lg overflow-hidden bg-transparent">
          <div className="flex h-full w-full">
            {/* LEFT SIDE */}
            <div
              className={`${
                showInstructions
                  ? "bg-gradient-to-br from-white to-blue-500"
                  : "bg-gradient-to-br from-white to-yellow-500"
              } h-full w-[300px] shrink-0 relative`}
            >
              {!showInstructions ? (
                <Image
                  src="/prep2.png"
                  alt="element1"
                  width={900}
                  height={900}
                  className=" h-full w-full -bottom-10 object-cover absolute z-20"
                />
              ) : (
                <Image
                  src="/element5.png"
                  alt="element1"
                  width={900}
                  height={900}
                  className=" h-full w-full  object-cover absolute z-20"
                />
              )}
              {!showInstructions ? (
                <Image
                  src="/staic6.png"
                  alt="element1"
                  width={900}
                  height={900}
                  className=" h-full w-full shrink-0 absolute -top-20 z-0"
                />
              ) : (
                <Image
                  src="/static7.png"
                  alt="element1"
                  width={900}
                  height={900}
                  className=" h-full w-full shrink-0 absolute -top-10 z-0"
                />
              )}
            </div>
            {/* RIGHT SIDE */}
            <div className="bg-white/90 w-full flex flex-col h-full">
              {!showInstructions ? (
                <>
                  <ShimmerText text="Preparing To Launch" />
                  {/* Animated list */}
                  <div className="flex flex-col space-y-4 ml-10 ">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3 font-inter text-base"
                        initial={{ opacity: 0.5 }}
                        animate={{
                          opacity: activeIndex === index ? 1 : 0.5,
                          scale: activeIndex === index ? 1.05 : 1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <LucideCheckCircle
                          className={`w-6 h-6 ${
                            activeIndex === index
                              ? "text-blue-600 animate-pulse"
                              : "text-black"
                          }`}
                        />
                        <span
                          className={`font-inter tracking-wide ${
                            activeIndex === index
                              ? "text-blue-600 font-semibold"
                              : "text-black font-medium"
                          }`}
                        >
                          {msg}
                        </span>
                      </motion.div>
                    ))}

                    {/* Optional connecting line */}
                    <div className="border-l-2 border-gray-300 h-full absolute left-3 top-3"></div>
                  </div>
                  {/* Bottom note */}
                  <div className="mt-auto mb-4 p-2 ">
                    <motion.div
                      className="text-center bg-white border border-blue-500 p-2 rounded-lg text-black"
                      // animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      Please wait while the system is setting up your interview
                      environment...
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="p-2 flex flex-col h-full">
                  <ShimmerText text="Starting Interview" />

                  <div className="w-full mx-auto flex items-center justify-center">
                    <AnimatedCircularProgressBar
                      // value={value}
                      gaugePrimaryColor="#3B82F6"
                      gaugeSecondaryColor="rgba(255, 255, 255, 0.3)"
                    />
                  </div>
                  <div className="text-sm mt-auto mb-5 font-inter space-y-3 tracking-tight bg-white p-3 rounded-lg border border-blue-500">
                    <p className="flex items-center gap-2">
                      <InfoIcon className="w-4 h-4 mr-2" /> Ensure proper
                      lighting and network in your room.
                    </p>
                    <p className="flex items-center gap-2">
                      <InfoIcon className="w-4 h-4 mr-2" /> Check your internet
                      connection for stability.
                    </p>
                    <p className="flex items-center gap-2">
                      <InfoIcon className="w-4 h-4 mr-2" /> Don't switch tabs or
                      refresh during the interview.
                    </p>
                    <p className="flex items-center gap-2">
                      <InfoIcon className="w-4 h-4 mr-2" /> Relax and be
                      yourself — you've got this!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobTracker;
