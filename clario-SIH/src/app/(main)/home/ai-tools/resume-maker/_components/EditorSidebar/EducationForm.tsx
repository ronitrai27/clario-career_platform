// components/resume/EditorSidebar/EducationForm.tsx
"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LuPlus, LuTrash } from "react-icons/lu";

export default function EducationForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "education")
  );
  const updateSection = useResumeStore((s) => s.updateSection);

  const education = (section?.type === "education" ? section.data : []) as any[];

  const addEducation = () => {
    const newItem = {
      institution: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
    };
    updateSection("education", { data: [...education, newItem] });
  };

  const updateField = (index: number, field: string, value: string) => {
    const updated = education.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateSection("education", { data: updated });
  };

  const removeEducation = (index: number) => {
    const filtered = education.filter((_, i) => i !== index);
    updateSection("education", { data: filtered });
  };

  return (
    <div className="space-y-6">
      {education.map((edu, i) => (
        <div key={i} className="p-3 border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">Education {i + 1}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeEducation(i)}
            >
              <LuTrash className="w-4 h-4" />
            </Button>
          </div>

          <Input
            placeholder="Institution Name"
            value={edu.institution}
            onChange={(e) => updateField(i, "institution", e.target.value)}
          />
          <Input
            placeholder="Location (e.g., Delhi, India)"
            value={edu.location || ""}
            onChange={(e) => updateField(i, "location", e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Start Date"
              value={edu.startDate}
              onChange={(e) => updateField(i, "startDate", e.target.value)}
            />
            <Input
              placeholder="End Date"
              value={edu.endDate}
              onChange={(e) => updateField(i, "endDate", e.target.value)}
            />
          </div>
          <Textarea
            placeholder="Description (e.g., Class 12 in Commerce)"
            value={edu.description}
            onChange={(e) => updateField(i, "description", e.target.value)}
          />
        </div>
      ))}

      <Button onClick={addEducation} className="w-full">
        <LuPlus className="mr-2" /> Add Education
      </Button>
    </div>
  );
}
