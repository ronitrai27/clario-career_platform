"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizData } from "@/context/userQuizProvider";
import {
  LuActivity,
  LuBriefcase,
  LuBuilding,
  LuBuilding2,
  LuChevronRight,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ExternalLink,
  PinIcon,
  Search,
  Building2,
  LucideActivity,
} from "lucide-react";
import CareerCourses from "./CourseData";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { quizData } = useQuizData();

  const [visibleJobs, setVisibleJobs] = useState(6);
  const [loadingMore, setLoadingMore] = useState(false);

  // colleges---------------------------->
  const [nearbyActive, setNearbyActive] = useState(false);
  const [collegeType, setCollegeType] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!quizData?.selectedCareer) return;

  //   const fetchJobs = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await axios.get<Job[]>(
  //         `/api/jobs?q=${encodeURIComponent(quizData.selectedCareer)}`
  //       );
  //       setJobs(res.data);
  //     } catch (error) {
  //       console.error("Error fetching jobs:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchJobs();
  // }, [quizData?.selectedCareer]);

  // DEMO DATA-------------------------
  useEffect(() => {
    if (quizData?.selectedCareer) {
      setJobs(demoJobs);
    }
  }, [quizData?.selectedCareer]);

  return (
    <div className="max-w-[1120px] bg-white rounded-lg mx-auto border p-6 mb-20">
      <div className="w-full my-4 text-center">
        {activeTab === "jobs" && (
          <>
            <h1 className="text-3xl font-sora font-semibold mb-2">
              Recommended Jobs for you
            </h1>
            <p className="text-muted-foreground font-inter text-lg ">
              Explore job opportunities tailored to your career choice.
            </p>
          </>
        )}
        {activeTab === "colleges" && (
          <>
            <h1 className="text-3xl font-sora font-semibold mb-2">
              Recommended Colleges for you
            </h1>
            <p className="text-muted-foreground font-inter text-lg">
              Discover the best colleges for your career.
            </p>
          </>
        )}
        {activeTab === "courses" && (
          <>
            <h1 className="text-3xl font-sora font-semibold mb-2">
              Courses found just for you.
            </h1>
            <p className="text-muted-foreground font-inter text-lg">
              Browse courses to skill up in your field.
            </p>
          </>
        )}
      </div>

      <Tabs
        defaultValue="jobs"
        className="w-full"
        onValueChange={(val) => setActiveTab(val)}
      >
        <TabsList className="grid w-full grid-cols-3 max-w-[700px] mx-auto mb-6 font-inter">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
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

            <Button
              className="cursor-pointer font-inter text-sm"
              variant="outline"
            >
              Liked Jobs <Heart className="ml-2" />
            </Button>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="mb-8 flex items-center justify-between px-8">
            <h2 className="font-inter text-xl font-medium tracking-tight">
              Courses found for{" "}
              <span className="text-blue-500">{quizData?.selectedCareer}</span>
              <LuBriefcase className="inline-block ml-3 text-blue-500" />
            </h2>
          </div>
        )}

        {activeTab === "colleges" && (
          <div className="mb-8 flex items-center gap-10  px-8">
            <div className="relative w-full max-w-[340px] flex justify-between items-center border border-blue-300 rounded-md px-4 bg-blue-50">
              <Input
                type="text"
                placeholder="Search Colleges by Location..."
                className="font-inter text-sm bg-transparent border-none shadow-none focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <Search className=" text-blue-600" />
            </div>
            <Button
              onClick={() => setNearbyActive(!nearbyActive)}
              className={`font-inter text-sm cursor-pointer flex items-center hover:bg-blue-100 hover:border-blue-500 hover:text-blue-600
    ${nearbyActive ? "bg-blue-100 border-blue-500 text-blue-600" : ""}`}
              variant={nearbyActive ? "default" : "outline"}
            >
              Nearby <Building2 className="ml-2" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="font-inter text-sm cursor-pointer flex items-center"
                  variant="outline"
                >
                  {collegeType ? collegeType : "Type"}{" "}
                  <LucideActivity className="ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2 font-inter">
                  <Button
                    variant={collegeType === "Private" ? "default" : "outline"}
                    onClick={() => setCollegeType("Private")}
                  >
                    Private College
                  </Button>
                  <Button
                    variant={
                      collegeType === "Government" ? "default" : "outline"
                    }
                    onClick={() => setCollegeType("Government")}
                  >
                    Government College
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <TabsContent value="jobs">
          <div className="  bg-white">
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
                    className="p-3 h-[320px] bg-white border border-t-8 border-t-blue-500 rounded-lg hover:shadow-md transition-shadow shadow flex flex-col"
                  >
                    <h3 className="font-semibold font-inter tracking-tight text-center text-lg">
                      {job.title}
                    </h3>
                    <p className="text-base font-raleway text-muted-foreground text-left mt-3">
                      <LuBuilding2 className="inline-block mr-2 text-xl -mt-1 text-blue-600" />
                      <span className="font-semibold text-blue-500">
                        {job.company_name}
                      </span>
                    </p>
                    <p className="my-2 font-inter tracking-tight text-left text-sm">
                      <PinIcon
                        className="inline-block mr-2  -mt-1 text-blue-600"
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

                    {/* push this container to bottom */}
                    <div className="flex items-center justify-center gap-10 mt-auto">
                      {job.apply_options[0]?.link && (
                        <Button>
                          <a
                            href={job.apply_options[0].link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-inter text-xs inline-block cursor-pointer"
                          >
                            Click to Apply{" "}
                          </a>
                          <ExternalLink className="inline-block ml-5 cursor-pointer" />
                        </Button>
                      )}

                      <div className="w-9 h-9 rounded-md flex items-center justify-center bg-blue-100 cursor-pointer">
                        <Heart className="w-4 h-4 text-blue-500" />
                      </div>
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
          <div className="p-4  bg-white"></div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="p-6  bg-white">
            <CareerCourses />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
