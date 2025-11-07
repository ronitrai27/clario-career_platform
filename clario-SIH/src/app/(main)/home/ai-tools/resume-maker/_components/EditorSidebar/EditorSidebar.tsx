// components/resume/EditorSidebar/EditorSidebar.tsx
// [ Basic Bio ] → [ Summary ] → [ Skills ] → [ Education ] → [ Experience ] → [ Projects ] → [ Custom ]
//          progress bar

"use client";

import { useState } from "react";
import BioForm from "./BioForm";
import SummaryForm from "./SummaryForm";
import { LuBrain } from "react-icons/lu";


const steps = [
  { id: "bio", label: "Basic Bio", component: BioForm },
  { id: "summary", label: "Summary", component: SummaryForm },

];

export default function EditorStepper() {
  const [stepIndex, setStepIndex] = useState(0);
  const current = steps[stepIndex];

  const FormComponent = current.component;

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));

  return (
    <div className="bg-white p-4 shadow-sm flex flex-col h-full">
      {/* PROGRESS BAR */}
      <div>
        <h2 className="text-center font-inter tracking-tight text-xl font-semibold">AI Resume Maker <LuBrain className="inline ml-2"/></h2>
        <p className="text-sm font-medium mb-2">{current.label}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ACTIVE FORM */}
      <div className="flex-1 overflow-y-auto mt-6">
        <FormComponent />
      </div>

      {/* NEXT/PREV BUTTONS */}
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 border rounded-lg text-sm disabled:opacity-30"
          disabled={stepIndex === 0}
          onClick={prev}
        >
          Previous
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          onClick={next}
          disabled={stepIndex === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
