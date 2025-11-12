"use client";

import { useState } from "react";
import BioForm from "./BioForm";
import SummaryForm from "./SummaryForm";
import { LuBrain, LuChevronLeft, LuChevronRight, LuInfo } from "react-icons/lu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import SkillsForm from "./SkillForm";
import EducationForm from "./EducationForm";
import ExperienceForm from "./ExpForm";
import ProjectsForm from "./ProjectForm";
import CustomSectionForm from "./CustomSectionForm";

const steps = [
  { id: "bio", label: "Basic Information", component: BioForm },
  { id: "summary", label: "Summary", component: SummaryForm },
  { id: "skills", label: "Skills", component: SkillsForm },
  { id: "education", label: "Education", component: EducationForm },
  { id: "experience", label: "Experience", component: ExperienceForm },
  { id: "projects", label: "Projects", component: ProjectsForm },
  { id: "custom", label: "Custom Section", component: CustomSectionForm },
];

export default function EditorStepper() {
  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[stepIndex];
  const totalSteps = steps.length;

  const FormComponent = current.component;

  const next = () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="bg-white p-4 shadow-sm flex flex-col h-full border rounded-r-lg">
      {/* HEADER */}
      <h2 className="text-center font-inter tracking-tight text-xl font-semibold">
        AI Resume Builder <LuBrain className="inline ml-2" />
      </h2>

      {/* STEP COUNTER */}
      <p className="text-sm text-muted-foreground font-inter mt-2 text-center">
        Step {stepIndex + 1} of {totalSteps}
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-center text-lg font-inter line-clamp-1">
          {current.label}
        </p>
        <Button
          className="font-inter text-sm tracking-tight"
          variant="outline"
          size="sm"
        >
          Info <LuInfo />
        </Button>
      </div>

      <Separator className="my-3" />

      {/* ACTIVE FORM */}
      <div className="flex-1 overflow-y-auto mt-2">
        <FormComponent />
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="flex justify-between mt-auto pb-1">
        <Button
          className="px-4 py-2 border rounded-lg font-inter text-sm disabled:opacity-30"
          disabled={stepIndex === 0}
          size="sm"
          variant="outline"
          onClick={prev}
        >
          <LuChevronLeft className="w-4 h-4 inline-block mr-2" /> Previous
        </Button>

        <Button
          className="px-4  font-inter bg-blue-600 text-white rounded-lg text-sm"
          onClick={next}
          size="sm"
          disabled={stepIndex === totalSteps - 1}
        >
          Next
          <LuChevronRight className="w-4 h-4 inline-block ml-2" />
        </Button>
      </div>
    </div>
  );
}
