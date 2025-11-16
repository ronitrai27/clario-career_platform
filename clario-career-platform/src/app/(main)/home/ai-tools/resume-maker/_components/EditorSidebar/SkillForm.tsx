// components/resume/EditorSidebar/SkillsForm.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { useResumeStore } from "@/lib/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuPlus, LuX, LuArrowUp, LuArrowDown } from "react-icons/lu";

export default function SkillsForm() {
  const section = useResumeStore((s) =>
    s.resume.sections.find((sec) => sec.id === "skills")
  );
  const updateSection = useResumeStore((s) => s.updateSection);

  const skills = (
    section && section.type === "skills" ? section.data : []
  ) as string[];

  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const v = draft.trim();
    if (!v) return;
    if (skills.includes(v)) {
      setDraft("");
      return;
    }
    updateSection("skills", { data: [...skills, v] });
    setDraft("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (idx: number) => {
    const next = skills.filter((_, i) => i !== idx);
    updateSection("skills", { data: next });
  };

  const move = (idx: number, dir: "up" | "down") => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= skills.length) return;
    const next = [...skills];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateSection("skills", { data: next });
  };

  return (
    <div className="space-y-4 font-inter">
      {/* Input row */}
      <div className="flex gap-2 items-center">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. React, TypeScript, Tailwind"
        />
        <Button type="button" onClick={addSkill} size="sm">
          <LuPlus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Chips / list */}
      {skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add your first skill — press Enter to quick-add.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <div
              key={`${s}-${i}`}
              className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full border text-sm bg-blue-100"
            >
              <span className="font-medium">{s}</span>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => move(i, "up")}
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Move up"
                >
                  <LuArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, "down")}
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Move down"
                >
                  <LuArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  className="p-1 hover:bg-neutral-100 rounded"
                  title="Remove"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
