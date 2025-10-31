"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizData } from "@/context/userQuizProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LuActivity,
  LuBriefcase,
  LuBuilding,
  LuBuilding2,
  LuChartColumnDecreasing,
  LuChevronRight,
  LuTreePine,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ExternalLink,
  PinIcon,
  Search,
  Building2,
  LucideActivity,
  Save,
} from "lucide-react";
import CareerCourses from "./CourseData";
import { Separator } from "@/components/ui/separator";
import CollegesList from "./CollegesDataUi";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { useSidebar } from "@/components/ui/sidebar";

interface Job {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  apply_options: { title: string; link: string }[];
}

// demo data just-------------
const demoJobs: Job[] = [
  {
    title: "Frontend Developer",
    company_name: "Vrsa solution PVT Ltd",
    location: "Bengaluru, India",
    via: "LinkedIn",
    description:
      "Work on modern web applications using React, Tailwind, and Next.js.",
    apply_options: [
      {
        title: "Apply on Company Site",
        link: "https://technova.com/jobs/frontend",
      },
      {
        title: "Apply via LinkedIn",
        link: "https://linkedin.com/jobs/frontend",
      },
    ],
  },
  {
    title: "Backend Engineer",
    company_name: "CodeSphere Solutions",
    location: "Hyderabad, India",
    via: "Naukri",
    description: "Develop scalable APIs with Node.js, Express, and PostgreSQL.",
    apply_options: [
      { title: "Apply on Naukri", link: "https://naukri.com/jobs/backend" },
    ],
  },
  {
    title: "Full Stack Developer",
    company_name: "CloudEdge Systems",
    location: "Remote, India",
    via: "Indeed",
    description: "End-to-end development with React, Node.js, and AWS.",
    apply_options: [
      { title: "Apply on Indeed", link: "https://indeed.com/fullstack" },
    ],
  },
  {
    title: "Data Analyst",
    company_name: "Insight Analytics",
    location: "Pune, India",
    via: "Glassdoor",
    description:
      "Analyze business data and create dashboards using Python & PowerBI.",
    apply_options: [
      {
        title: "Apply on Glassdoor",
        link: "https://glassdoor.com/data-analyst",
      },
    ],
  },
  {
    title: "Machine Learning Engineer",
    company_name: "AI Innovators",
    location: "Gurgaon, India",
    via: "LinkedIn",
    description: "Build ML models for NLP and Computer Vision tasks.",
    apply_options: [
      { title: "Apply via LinkedIn", link: "https://linkedin.com/ml-engineer" },
    ],
  },
  {
    title: "UI/UX Designer",
    company_name: "DesignHive Studio",
    location: "Mumbai, India",
    via: "Company Website",
    description:
      "Create engaging designs using Figma, Adobe XD, and prototyping tools.",
    apply_options: [
      {
        title: "Apply on Company Site",
        link: "https://designhive.com/careers/uiux",
      },
    ],
  },
  {
    title: "DevOps Engineer",
    company_name: "CloudOps Pvt Ltd",
    location: "Chennai, India",
    via: "LinkedIn",
    description:
      "Manage CI/CD pipelines and cloud infrastructure on AWS & GCP.",
    apply_options: [
      { title: "Apply on LinkedIn", link: "https://linkedin.com/jobs/devops" },
    ],
  },
  {
    title: "Mobile App Developer",
    company_name: "AppWorks Technologies",
    location: "Noida, India",
    via: "Indeed",
    description: "Build cross-platform apps using React Native and Flutter.",
    apply_options: [
      { title: "Apply on Indeed", link: "https://indeed.com/mobile-dev" },
    ],
  },
  {
    title: "Cybersecurity Analyst",
    company_name: "SecureNet India",
    location: "Kolkata, India",
    via: "Naukri",
    description:
      "Monitor and secure enterprise IT infrastructure against threats.",
    apply_options: [
      { title: "Apply on Naukri", link: "https://naukri.com/cybersecurity" },
    ],
  },
  {
    title: "AI Research Intern",
    company_name: "DeepThink Labs",
    location: "Remote, India",
    via: "Company Website",
    description:
      "Assist in cutting-edge AI research projects on LLMs and Generative AI.",
    apply_options: [
      {
        title: "Apply on Company Site",
        link: "https://deepthink.ai/internships",
      },
    ],
  },
];

export default function CareerTabsDemo() {
  const supabase = createClient();
  const { user } = useUserData();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { quizData } = useQuizData();

  const [visibleJobs, setVisibleJobs] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);
  const { open: sidebarOpen, isMobile } = useSidebar();

  // colleges---------------------------->
  const [nearbyActive, setNearbyActive] = useState(false);
  const [collegeType, setCollegeType] = useState<string | null>(null);

  useEffect(() => {
    if (!quizData?.selectedCareer) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Job[]>(
          `/api/jobs?q=${encodeURIComponent(quizData.selectedCareer)}`
        );
        setJobs(res.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [quizData?.selectedCareer]);

  // DEMO DATA-------------------------
  // useEffect(() => {
  //   if (quizData?.selectedCareer) {
  //     setJobs(demoJobs);
  //   }
  // }, [quizData?.selectedCareer]);

  // -----------------------------------DIALOG AND JOB TRACKING------------------------->
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    description: "",
    stage: "saved",
    type: "full-time",
    applied_date: "",
    note: "",
  });

  const handleOpen = (job: any) => {
    setForm({
      job_title: job.title || "",
      company: job.company_name || "",
      description: job.description || "",
      stage: "saved",
      type: "full-time",
      applied_date: "",
      note: "",
    });
    setOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (
      !form.job_title.trim() ||
      !form.description.trim() ||
      !form.applied_date.trim()
    ) {
      toast.error(
        "Please fill all required fields: title, description, and applied date."
      );
      return;
    }

    const { data, error } = await supabase.from("job_tracker").insert([
      {
        userId: user?.id,
        job_title: form.job_title,
        company: form.company,
        description: form.description,
        stage: form.stage,
        type: form.type,
        applied_date: form.applied_date,
        note: form.note,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to save job. Please try again.");
    } else {
      toast.success("Job saved successfully!");
      setOpen(false);
      setForm({
        job_title: "",
        company: "",
        description: "",
        stage: "saved",
        type: "full-time",
        applied_date: "",
        note: "",
      });
    }
  };

  return (
    <div
      className={` ${
        sidebarOpen ? "max-w-[1120px]" : "max-w-[1280px]"
      } mx-auto p-6 mb-20`}
    >
      <div className="w-full my-4 text-center bg-gradient-to-br from-blue-300 to-pink-300 py-12 rounded-lg relative overflow-hidden">
        {activeTab === "jobs" && (
          <>
           <Image
              src="/ca2.png"
              alt="ca1"
              width={150}
              height={150}
              className="absolute -top-3 -left-4"
            />
            <h1 className="text-4xl font-inter font-semibold mb-2">
              Recommended Jobs for you{" "}
              <LuBriefcase className="inline-block ml-3" />
            </h1>
            <p className="text-gray-700 font-inter text-lg ">
              Explore job opportunities tailored to your career choice.
            </p>
            <Image
              src="/ca1.png"
              alt="ca1"
              width={200}
              height={200}
              className="absolute top-10 right-0"
            />
          </>
        )}
        {activeTab === "colleges" && (
          <>
            <h1 className="text-4xl font-inter font-semibold mb-2">
              Recommended Colleges for you{" "}
              <LuBuilding2 className="inline-block ml-3" />
            </h1>
            <p className="text-gray-700 font-inter text-lg">
              Discover the best colleges for your career.
            </p>
            <Image
              src="/ca2.png"
              alt="ca1"
              width={200}
              height={200}
              className="absolute top-10 right-0"
            />
          </>
        )}
        {activeTab === "courses" && (
          <>
           <Image
              src="/ca1.png"
              alt="ca1"
              width={200}
              height={200}
              className="absolute top-10 left-0"
            />
            <h1 className="text-4xl font-inter font-semibold mb-2">
              Right Resources found just for you.{" "}
              <LucideActivity className="inline-block ml-3" />
            </h1>
            <p className="text-gray-700 font-inter text-lg">
              Browse Courses and Top rated Yt videos for your career.
            </p>
            <Image
              src="/ca2.png"
              alt="ca1"
              width={200}
              height={200}
              className="absolute top-10 right-0"
            />
          </>
        )}
      </div>

      <Tabs
        defaultValue="jobs"
        className="w-full"
        onValueChange={(val) => setActiveTab(val)}
      >
        <TabsList className="grid w-full grid-cols-3 max-w-[700px] mx-auto mb-6 font-inter">
          <TabsTrigger
            value="jobs"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            Jobs
          </TabsTrigger>
          <TabsTrigger
            value="colleges"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            Colleges
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
          >
            Courses
          </TabsTrigger>
        </TabsList>

        <Separator className="mb-5" />
        {/* Jobs */}
        {activeTab === "jobs" && (
          <div className="mb-8 flex items-center justify-between px-8">
            <h2 className="font-inter text-xl font-medium tracking-tight">
              Search results for{" "}
              <span className="text-blue-500">{quizData?.selectedCareer}</span>
              <LuBriefcase className="inline-block ml-3 text-blue-500" />
            </h2>

            <div className="flex -mr-[320px] items-center gap-1 font-inter text-sm font-light">
              <LuChartColumnDecreasing className="w-7 h-7 text-gray-400 " />
              Track Jobs Easily
            </div>
            <Button
              className="cursor-pointer font-inter text-sm"
              variant="outline"
            >
              Liked Jobs <Heart className="ml-2" />
            </Button>
          </div>
        )}

        {/* {activeTab === "courses" && (
          <div className="mb-8 flex items-center justify-between px-8">
            <h2 className="font-inter text-xl font-medium tracking-tight">
              Courses found for{" "}
              <span className="text-blue-500">{quizData?.selectedCareer}</span>
              <LuBriefcase className="inline-block ml-3 text-blue-500" />
            </h2>
          </div>
        )} */}

        <TabsContent value="jobs">
          <div className="">
            {loading ? (
              <p className="text-muted-foreground flex items-center justify-center text-center font-inter text-xl">
                Loading jobs...
              </p>
            ) : jobs.length === 0 ? (
              <p className="text-muted-foreground">
                No jobs found for {quizData?.selectedCareer}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {jobs.slice(0, visibleJobs).map((job, i) => (
                  <div
                    key={i}
                    className="p-3 h-[338px] bg-white border rounded-md hover:shadow-md transition-shadow shadow-sm flex flex-col relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold font-inter tracking-tight text-center text-lg line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="w-9 h-9 rounded-md flex items-center justify-center bg-blue-100 cursor-pointer">
                        <Heart className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-base font-raleway text-muted-foreground text-left mt-3">
                      <LuBuilding2 className="inline-block mr-2 text-base -mt-1 text-blue-600" />
                      <span className=" text-blue-500 font-inter">
                        {job.company_name}
                      </span>
                    </p>
                    <p className="my-2 font-inter tracking-tight text-left text-sm">
                      <PinIcon
                        className="inline-block mr-2  -mt-1 "
                        size={20}
                      />
                      {job?.location}
                    </p>
                    <p className="font-inter font-medium my-2 text-left tracking-tight">
                      Platform: {job.via}
                    </p>

                    <p className="font-inter line-clamp-3 mt-5 text-muted-foreground text-sm">
                      {job.description}
                    </p>
                    <Image
                      src="/jobs.png"
                      width={200}
                      height={200}
                      alt="jobs"
                      className="absolute opacity-5  -right-5  top-12 w-32 h-32"
                    />

                    {/* push this container to bottom */}
                    <div className="flex items-center justify-between gap-10 mt-auto w-full">
                      <Button
                        className="cursor-pointer w-3/4 bg-gradient-to-r from-blue-300 to-pink-200 text-black"
                        variant="outline"
                      >
                        <a
                          href={job.apply_options[0].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-inter text-sm inline-block cursor-pointer"
                        >
                          Click to Apply{" "}
                        </a>
                        <ExternalLink className="inline-block ml-5 cursor-pointer" />
                      </Button>
                      <Button
                        className="w-fit"
                        variant="outline"
                        onClick={() => handleOpen(job)}
                      >
                        {" "}
                        <LuChartColumnDecreasing className="w-7 h-7 text-gray-800 " />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {visibleJobs < jobs.length && (
              <div className="flex justify-center mt-10">
                <Button
                  disabled={loadingMore}
                  onClick={() => {
                    setLoadingMore(true);
                    setTimeout(() => {
                      setVisibleJobs(jobs.length);
                      setLoadingMore(false);
                    }, 2000);
                  }}
                  className="font-inter text-sm"
                  variant="outline"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="colleges">
          <div className="p-4 ">
            <CollegesList />
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="p-4  ">
            <CareerCourses />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-inter text-xl font-semibold tracking-tight">
              Track this Job <LuBriefcase className="inline-block ml-2" />
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Label className="font-inter text-sm tracking-tight">
              Job Title
            </Label>
            <Input
              name="job_title"
              value={form.job_title}
              onChange={handleChange}
              placeholder="Job Title"
              className="font-inter -mt-2"
            />
            <Label className="font-inter text-sm tracking-tight">Company</Label>
            <Input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="font-inter -mt-2"
            />
            <Label className="font-inter text-sm tracking-tight">
              Description
            </Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              rows={3}
              className="font-inter -mt-2"
            />
            <div className="flex w-full justify-evenly">
              <div>
                <label className="text-sm font-medium mb-1 block font-inter">
                  Stage
                </label>
                <Select
                  value={form.stage}
                  onValueChange={(value) => setForm({ ...form, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Dropdown */}
              <div>
                <label className="text-sm font-medium mb-1 block font-inter">
                  Type
                </label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label className="font-inter text-sm tracking-tight">
              Applied Date
            </Label>
            <Input
              name="applied_date"
              type="date"
              value={form.applied_date}
              onChange={handleChange}
              placeholder="Applied Date"
              className="font-inter -mt-2"
            />
            <Label className="font-inter text-sm tracking-tight">
              Any Note (optional)
            </Label>
            <Textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Additional Notes"
              className="font-inter -mt-2"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="cursor-pointer">
              Save <Save className="ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
