// app/home/ai-tools/interview-maker/start/page.tsx
// +------------+--------------------+-----------------------------+
// |   Style    |      Editor        |            Preview           |
// |  Sidebar   |   (step wizard)    |         Live Resume          |
// +------------+--------------------+-----------------------------+

"use client";

import { useState } from "react";
import EditorStepper from "@/app/(main)/home/ai-tools/resume-maker/_components/EditorSidebar/EditorSidebar";
import { ResumePreview } from "@/app/(main)/home/ai-tools/resume-maker/_components/Preview/ResumePreviewOne";
import { LucideMenuSquare } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";


export default function ResumeStart() {
  const [styleSidebarOpen, setStyleSidebarOpen] = useState(false);
   const { open: sidebarOpen, isMobile } = useSidebar();

  return (
    <div className={`h-screen ${sidebarOpen ? "w-[calc(100vw-14.7rem)] " : ""} transition-all duration-100  overflow-hidden flex bg-gray-50 p-6`}>


      {/* LEFT COLLAPSIBLE STYLE SIDEBAR */}
      <div
        className={`transition-all duration-300 bg-white border-r shadow-md h-full p-4 
        ${styleSidebarOpen ? "w-52" : "w-14"}`}
      >
        <div className="flex justify-center">
          <button
            onClick={() => setStyleSidebarOpen(!styleSidebarOpen)}
            className=""
          >
            <LucideMenuSquare className="text-xl" />
          </button>
        </div>

        {styleSidebarOpen && (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium text-neutral-700">Theme Settings</p>

            <button className="text-sm text-blue-600 underline">Change Colors</button>
            <button className="text-sm text-blue-600 underline">Change Font Size</button>
            <button className="text-sm text-blue-600 underline">Change Font Family</button>
          </div>
        )}
      </div>

      {/* FORM EDITOR SIDEBAR */}
      <div className={`${styleSidebarOpen ? "w-[340px]" : "w-[380px]"} transition-all duration-200  bg-white overflow-y-auto`}>
        <EditorStepper />
      </div>

      {/* PREVIEW SECTION */}
      <div className="flex-1 overflow-y-auto flex justify-center items-start p-4 cursor-all-scroll">
        <ResumePreview />
      </div>
    </div>
  );
}

