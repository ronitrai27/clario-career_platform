"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LuPlus, LuTrash, LuBold, LuItalic } from "react-icons/lu";
import { MdFormatListBulleted, MdOutlineWrapText } from "react-icons/md";

export default function ExperienceForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "experience")
  );
  const updateSection = useResumeStore((s) => s.updateSection);

  const experience = (section?.type === "experience" ? section.data : []) as any[];

  const addExperience = () => {
    const newItem = {
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateSection("experience", { data: [...experience, newItem] });
  };

  const updateField = (index: number, field: string, value: string) => {
    const updated = experience.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateSection("experience", { data: updated });
  };

  const removeExperience = (index: number) => {
    const filtered = experience.filter((_, i) => i !== index);
    updateSection("experience", { data: filtered });
  };

  return (
    <div className="space-y-6 pb-5 font-inter">
      {experience.map((exp, i) => (
        <div key={i} className="p-3 border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">Experience {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => removeExperience(i)}>
              <LuTrash className="w-4 h-4" />
            </Button>
          </div>

          <Label className="text-sm font-semibold tracking-tight">Role / Job Title</Label>
          <Input
            placeholder="Role / Job Title"
            value={exp.role}
            onChange={(e) => updateField(i, "role", e.target.value)}
          />

          <Label className="text-sm font-semibold tracking-tight">Company / Organization</Label>
          <Input
            placeholder="Company / Organization"
            value={exp.company}
            onChange={(e) => updateField(i, "company", e.target.value)}
          />

          <Label className="text-sm font-semibold tracking-tight">Location</Label>
          <Input
            placeholder="Location (e.g., Delhi, India)"
            value={exp.location || ""}
            onChange={(e) => updateField(i, "location", e.target.value)}
          />

          <Label className="text-sm font-semibold tracking-tight">Dates</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Start Date"
              value={exp.startDate}
              onChange={(e) => updateField(i, "startDate", e.target.value)}
            />
            <Input
              placeholder="End Date"
              value={exp.endDate}
              onChange={(e) => updateField(i, "endDate", e.target.value)}
            />
          </div>

          <Label className="text-sm font-semibold tracking-tight">Description</Label>

          {/* Toolbar Icons (visual only for now) */}
          <div className="flex items-center gap-3 mb-2 border-b pb-2 text-gray-600">
            <LuBold className="w-4 h-4 cursor-pointer" />
            <LuItalic className="w-4 h-4 cursor-pointer" />
            <MdFormatListBulleted className="w-4 h-4 cursor-pointer" />
            <MdOutlineWrapText className="w-4 h-4 cursor-pointer" />
          </div>

          {/* Simple Textarea (no formatting) */}
          <Textarea
            placeholder="Description or bullet points"
            value={exp.description}
            onChange={(e) => updateField(i, "description", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      ))}

      <Button onClick={addExperience} className="w-full">
        <LuPlus className="mr-2" /> Add Experience
      </Button>
    </div>
  );
}
