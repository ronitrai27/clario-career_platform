"use client";

import * as React from "react";
import { useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizData } from "@/context/userQuizProvider";
import { LuActivity, LuChevronRight } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import CareerCourses from "./CourseData";

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
  const [activeTab, setActiveTab] = React.useState("jobs");
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { quizData } = useQuizData();

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
    <div className="max-w-[1100px] bg-white rounded-lg mx-auto border p-6">
      <div className="w-full my-4 text-center">
        {activeTab === "jobs" && (
          <>
            <h1 className="text-3xl font-sora font-semibold mb-2">
              Find Relevant Jobs
            </h1>
            <p className="text-muted-foreground font-inter text-lg ">
              Jobs just made for you, apply anytime.
            </p>
          </>
        )}
        {activeTab === "colleges" && (
          <>
            <h1 className="text-3xl font-sora font-semibold mb-2">
              Recommended Colleges
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

        <TabsContent value="jobs">
          <div className="  bg-white">
            {loading ? (
              <p className="text-muted-foreground">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-muted-foreground">
                No jobs found for {quizData?.selectedCareer}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {jobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-3 h-[320px] bg-blue-50 border rounded-lg hover:shadow-md transition-shadow shadow flex flex-col"
                  >
                    <h3 className="font-semibold font-inter tracking-tight text-center text-lg">
                      {job.title}
                    </h3>
                    <p className="text-base font-raleway text-muted-foreground text-center mt-3">
                      <span className="font-semibold text-blue-500">
                        {job.company_name}
                      </span>{" "}
                      • {job.location}
                    </p>
                    <p className="font-inter font-medium my-2 text-left">
                      Platforms: {job.via}
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
                            className="text-white font-inter text-xs inline-block"
                          >
                            Click to Apply{" "}
                          </a>
                          <LuActivity className="inline-block" />
                        </Button>
                      )}

                      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-blue-100">
                        <Heart className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                ))}
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
