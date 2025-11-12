"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LuPlus, LuTrash } from "react-icons/lu";

export default function ProjectsForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "projects")
  );
  const updateSection = useResumeStore((s) => s.updateSection);

  const projects = (section?.type === "projects" ? section.data : []) as any[];

  const addProject = () => {
    const newItem = { title: "", description: "", date: "" };
    updateSection("projects", { data: [...projects, newItem] });
  };

  const updateField = (index: number, field: string, value: string) => {
    const updated = projects.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateSection("projects", { data: updated });
  };

  const removeProject = (index: number) => {
    const filtered = projects.filter((_, i) => i !== index);
    updateSection("projects", { data: filtered });
  };

  return (
    <div className="space-y-6 pb-5 font-inter">
      {projects.map((proj, i) => (
        <div key={i} className="p-3 border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">Project {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => removeProject(i)}>
              <LuTrash className="w-4 h-4" />
            </Button>
          </div>

          <Label className="font-semibold font-inter text-sm tracking-tight">Title</Label>
          <Input
            placeholder="Project Title"
            value={proj.title}
            onChange={(e) => updateField(i, "title", e.target.value)}
          />

          <Label  className="font-semibold font-inter text-sm tracking-tight">Description</Label>
          <Textarea
            placeholder="Short project description"
            value={proj.description}
            onChange={(e) => updateField(i, "description", e.target.value)}
          />

          <Label className="font-semibold font-inter text-sm tracking-tight">Date</Label>
          <Input
            placeholder="e.g. March 2024"
            value={proj.date}
            onChange={(e) => updateField(i, "date", e.target.value)}
          />
        </div>
      ))}

      <Button onClick={addProject} className="w-full">
        <LuPlus className="mr-2" /> Add Project
      </Button>
    </div>
  );
}
