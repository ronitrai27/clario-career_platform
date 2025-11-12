"use client";

import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LuPlus, LuTrash } from "react-icons/lu";

const allowedTitles = [
  "Achievements & Certifications",
  "Patents & Publications",
  "Hobbies",
  "Languages",
];

export default function CustomSectionForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "custom")
  );
  const updateSection = useResumeStore((s) => s.updateSection);

  const custom = (section?.type === "custom" ? section.data : []) as any[];
  const title = section?.title || "Achievements & Certifications";

  const addItem = () => {
    const newItem = { title: "", description: "", date: "" };
    updateSection("custom", { data: [...custom, newItem] });
  };

  const updateField = (index: number, field: string, value: string) => {
    const updated = custom.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateSection("custom", { data: updated });
  };

  const removeItem = (index: number) => {
    const filtered = custom.filter((_, i) => i !== index);
    updateSection("custom", { data: filtered });
  };

  const changeTitle = (newTitle: string) => {
    updateSection("custom", { title: newTitle });
  };

  return (
    <div className="space-y-6 pb-5 font-inter">
      <div>
        <Label  className="font-semibold font-inter text-sm tracking-tight">Select Section Type</Label>
        <select
          className="w-full border rounded-md px-2 py-1 mt-1 text-sm"
          value={title}
          onChange={(e) => changeTitle(e.target.value)}
        >
          {allowedTitles.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {custom.map((item, i) => (
        <div key={i} className="p-3 border rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">Item {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => removeItem(i)}>
              <LuTrash className="w-4 h-4" />
            </Button>
          </div>

          <Label  className="font-semibold font-inter text-sm tracking-tight">Title</Label>
          <Input
            placeholder="Title (e.g. AWS Certified Developer)"
            value={item.title}
            onChange={(e) => updateField(i, "title", e.target.value)}
          />

          <Label  className="font-semibold font-inter text-sm tracking-tight">Description</Label>
          <Textarea
            placeholder="Description (optional)"
            value={item.description}
            onChange={(e) => updateField(i, "description", e.target.value)}
          />

          <Label  className="font-semibold font-inter text-sm tracking-tight">Date (optional)</Label>
          <Input
            placeholder="e.g. June 2023"
            value={item.date || ""}
            onChange={(e) => updateField(i, "date", e.target.value)}
          />
        </div>
      ))}

      <Button onClick={addItem} className="w-full">
        <LuPlus className="mr-2" /> Add Item
      </Button>
    </div>
  );
}
