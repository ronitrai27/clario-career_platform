// components/resume/EditorSidebar/SummaryForm.tsx
// =============SUMMARY FORM BINDING TO ZUSTAND================
"use client";

import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/store/useResumeStore";

const MAX = 600;

export default function SummaryForm() {
  const section = useResumeStore(s => s.resume.sections.find(sec => sec.id === "summary"));
  const updateSection = useResumeStore(s => s.updateSection);
  const value = (section && section.type === "summary" ? section.data : "") as string;

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => {
          const next = e.target.value.slice(0, MAX);
          updateSection("summary", { data: next });
        }}
        placeholder="Write a concise 3–4 line summary…"
        className="min-h-[140px]"
      />
      <p className="text-xs text-muted-foreground text-right">
        {MAX - value.length} chars left
      </p>
    </div>
  );
}
