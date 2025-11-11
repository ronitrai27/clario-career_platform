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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { LuBrain, LuChevronLeft, LuGrip } from "react-icons/lu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { LuArrowUp, LuArrowDown } from "react-icons/lu";

export default function ResumeStart() {
  const [styleSidebarOpen, setStyleSidebarOpen] = useState(false);
  const { open: sidebarOpen, isMobile } = useSidebar();
  const setThemeColor = useResumeStore((state) => state.setThemeColor);
  const sections = useResumeStore((s) => s.resume.sections);
  const reorderSections = useResumeStore((s) => s.reorderSections);

  return (
    <div className="bg-gray-50 pt-2 ">
      <div className="flex items-center justify-between w-full px-7">
        <div className="flex items-center gap-6">
          <SidebarTrigger />
          <h2>
            <LuChevronLeft className="w-5 h-5 inline-block ml-2" /> Back
          </h2>
        </div>

        <Button className="font-inter text-sm tracking-tight bg-gradient-to-br from-purple-300 to-blue-500">
          Generate with AI <LuBrain className="w-5 h-5 inline-block ml-2" />
        </Button>
      </div>

      <div
        className={`h-[98vh] ${
          sidebarOpen ? "w-[calc(100vw-14.7rem)] " : ""
        } transition-all duration-100  overflow-hidden flex bg-gray-50 py-4 px-4 `}
      >
        {/* ==========LEFT COLLAPSIBLE STYLE SIDEBAR=========== */}
        <div
          className={`transition-all duration-300 bg-white  h-full p-3 border rounded-l-lg
        ${styleSidebarOpen ? "w-60" : "w-16"}`}
        >
          <div className="flex justify-start">
            <button
              onClick={() => setStyleSidebarOpen(!styleSidebarOpen)}
              className=""
            >
              <LuGrip className="text-xl cursor-pointer text-blue-600" />
            </button>
          </div>

          {styleSidebarOpen && (
            <div className="mt-6 space-y-4">
              <h1 className="text-lg font-medium text-center font-inter tracking-tight">
                Customize Your Resume
              </h1>
              {/* ======== THEME COLOR SELECTOR ======== */}
              <div className="space-y-3">
                <p className="text-base font-sora font-medium">Theme Color</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "#000000",
                    "#3459FF",
                    "#2C358A",
                    "#B066FF",
                    "#643200",
                    "#FF344C",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className="w-8 h-8 rounded-full border shadow-sm"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
              {/* ========= REORDER SECTIONS =============== */}
              <div className="space-y-2 mt-6">
                <p className="text-base font-sora font-medium mb-4">
                  Reorder Sections
                </p>

                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition p-2 rounded-md border"
                    >
                      <span className="text-sm font-inter capitalize">
                        {section.title}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => reorderSections(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
                          title="Move up"
                        >
                          <LuArrowUp className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => reorderSections(index, index + 1)}
                          disabled={index === sections.length - 1}
                          className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
                          title="Move down"
                        >
                          <LuArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FORM EDITOR SIDEBAR */}
        <div
          className={`${
            styleSidebarOpen ? "w-[350px]" : "w-[420px]"
          } transition-all duration-200  bg-white overflow-y-auto`}
        >
          <EditorStepper />
        </div>

        {/* PREVIEW SECTION */}
        <ScrollArea
          className={`${
            sidebarOpen ? "max-w-[740px] " : "max-w-[800px]"
          }   bg-gradient-to-br from-gray-100 to-blue-100 flex justify-center items-start mx-auto rounded-md p-3 cursor-all-scroll`}
        >
          <ResumePreview />
        </ScrollArea>
      </div>
    </div>
  );
}
