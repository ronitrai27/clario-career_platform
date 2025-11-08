// components/resume/Preview/ResumePreview.tsx
"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import TemplateOne from "./templates/TemplateOne";
import { useSidebar } from "@/components/ui/sidebar";
import { AirplayIcon } from "lucide-react";
import { GrResume } from "react-icons/gr";
import { LuActivity, LuChevronRight, LuCircleFadingPlus, LuDownload, LuFileBadge } from "react-icons/lu";
import { Button } from "@/components/ui/button";

export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
  const { open: sidebarOpen, isMobile } = useSidebar();

  return (
    <div className="">
      <h1 className="text-center font-inter text-3xl font-semibold">
        Live Resume Preview <LuFileBadge  className="w-7 h-7 inline-block ml-2" />
      </h1>
      <div className="flex items-center justify-evenly mt-6">
        <div className="bg-gradient-to-br from-indigo-200 to-blue-300 py-[6px] px-3 rounded-lg w-fit cursor-pointer">
          <h2 className="font-inter text-sm tracking-tight">
            Check Resume Score{" "}
            <LuCircleFadingPlus className="w-5 h-5 inline-block ml-2" />
          </h2>
        </div>

        <Button className="font-inter text-sm" variant="outline">Download <LuDownload className="w-6 h-6 inline-block ml-2" /></Button>
      </div>

      <div
        className={`mx-auto  bg-white w-[794px] h-[1123px] ${
          sidebarOpen ? "scale-75 -mt-20" : "scale-75 -mt-20"
        } shadow-lg rounded p-8`}
      >
        <TemplateOne resume={resume} />
      </div>
    </div>
  );
}
