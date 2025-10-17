"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { JobTrackerCard } from "@/lib/types/allTypes";
import { Filter } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  LuBookMarked,
  LuBriefcaseBusiness,
  LuChevronDown,
  LuChevronRight,
  LuCircleFadingPlus,
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

const stages = [
  { key: "saved", name: "Saved", color: "bg-gray-100" },
  { key: "applied", name: "Applied", color: "bg-blue-100" },
  { key: "interviewing", name: "Interviewing", color: "bg-green-100" },
  { key: "negotiating", name: "Negotiating", color: "bg-yellow-100" },
  { key: "hired", name: "Hired", color: "bg-emerald-100" },
  { key: "rejected", name: "Rejected", color: "bg-red-100" },
];

const JobTracker = () => {
  const supabase = createClient();
  const { user } = useUserData();
  const { open: sidebarOpen, isMobile } = useSidebar();
  const [jobs, setJobs] = useState<JobTrackerCard[]>([]);
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
      <div className={`w-full h-full mx-auto ${sidebarOpen ? "max-w-[1180px]" : "max-w-[1400px]"}  `}>
        <div className="flex h-full w-full overflow-x-auto scroll-smooth mt-5">
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
              className="font-inter text-base shadow-sm mt-10"
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
          <div className="flex h-auto min-w-max gap-4">
            {/* Saved */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-gray-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Saved <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3">{/* Job cards */}</div>
            </div>

            {/* Applied */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-blue-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Applied <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>

            {/* Interviewing */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-green-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Interviewing <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Negotiating */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-yellow-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Negotiating <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Hired */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-emerald-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Hired <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Rejected */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-red-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Rejected <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
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
              // onClick={handleSubmit}
              variant="default"
              className="cursor-pointer bg-blue-400"
            >
              Add Job <LuCircleFadingPlus className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobTracker;
