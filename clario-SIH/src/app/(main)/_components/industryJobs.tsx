"use client";

import * as React from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizData } from "@/context/userQuizProvider";

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

  // Fetch jobs once when component mounts or when selectedCareer changes
  React.useEffect(() => {
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
  }, [quizData?.selectedCareer]); // Only refetch if selectedCareer changes

  return (
    <div className="max-w-[1000px] bg-white mx-auto p-6">
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
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company_name} • {job.location}
                    </p>
                    {job.apply_options[0]?.link && (
                      <a
                        href={job.apply_options[0].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mt-2 inline-block"
                      >
                        Apply Here
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
            <p className="text-muted-foreground">College details will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="courses">
          <div className="p-6 border rounded-lg shadow-sm bg-white">
            <p className="text-muted-foreground">Course recommendations will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
