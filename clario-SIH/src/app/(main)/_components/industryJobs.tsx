"use client";

import * as React from "react";
import { useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizData } from "@/context/userQuizProvider";
import { LuChevronRight } from "react-icons/lu";

interface Job {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  apply_options: { title: string; link: string }[];
}

export default function CareerTabsDemo() {
  const [activeTab, setActiveTab] = React.useState("jobs");
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { quizData } = useQuizData();


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

  return (
    <div className="max-w-[1000px] bg-white mx-auto p-6">
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
          <div className="p-6 border rounded-lg shadow-sm bg-white">
            {loading ? (
              <p className="text-muted-foreground">Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-muted-foreground">
                No jobs found for {quizData?.selectedCareer}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <div
                    key={i}
                    className="p-4 bg-blue-50 border rounded-lg hover:shadow-md transition-shadow shadow"
                  >
                    <h3 className="font-semibold font-inter tracking-tight">{job.title}</h3>
                    <p className="text-base font-raleway text-muted-foreground">
                      <span className="font-semibold text-blue-500">{job.company_name}</span> • {job.location}
                    </p>

                    <p className="font-inter line-clamp-2 mt-3 text-muted-foreground text-sm">{job.description}</p>
                    {job.apply_options[0]?.link && (
                      <a
                        href={job.apply_options[0].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mt-2 inline-block"
                      >
                      Click to Apply <LuChevronRight className="inline-block" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="colleges">
          <div className="p-6 border rounded-lg shadow-sm bg-white">
            <p className="text-muted-foreground">
              College details will appear here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="p-6 border rounded-lg shadow-sm bg-white">
            <p className="text-muted-foreground">
              Course recommendations will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
