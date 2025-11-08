// components/resume/EditorSidebar/SummaryForm.tsx
// =============SUMMARY FORM BINDING TO ZUSTAND================
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { LuBrain } from "react-icons/lu";

const MAX = 600;

export default function SummaryForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "summary")
  );
  const updateSection = useResumeStore((s) => s.updateSection);
  const value = (
    section && section.type === "summary" ? section.data : ""
  ) as string;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button
          className="font-inter text-sm bg-gradient-to-br from-purple-300 to-blue-500"
          size="sm"
        >
          Generate <LuBrain className="w-5 h-5 inline-block ml-2" />
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => {
          const next = e.target.value.slice(0, MAX);
          updateSection("summary", { data: next });
        }}
        placeholder="Write a concise 3–4 line summary…"
        className="min-h-[140px] font-inter"
      />
      <p className="text-xs text-muted-foreground text-right">
        {MAX - value.length} chars left
      </p>
    </div>
  );
}
