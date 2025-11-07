// components/resume/Preview/ResumePreview.tsx
"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import TemplateOne from "./templates/TemplateOne";
import { useSidebar } from "@/components/ui/sidebar";

export function ResumePreview() {
  const resume = useResumeStore((s) => s.resume);
     const { open: sidebarOpen, isMobile } = useSidebar();

  return (
    <div className="">
        <h1 className="text-center">Live Preview</h1>
      <div className={`mx-auto -mt-20 bg-white w-[794px] h-[1123px] ${sidebarOpen ? "scale-75" : "scale-95"} shadow-sm p-8`}>
        <TemplateOne resume={resume} />
      </div>
    </div>
  );
}
