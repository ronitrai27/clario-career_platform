/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheck, LuLoader } from "react-icons/lu";

export default function InsightsReveal({ insights }: { insights: any }) {
  const steps = [
    {
      key: "stream",
      loadingText: "🔍 Analyzing your academic stream...",
      completedText: "Stream",
      value: insights?.stream,
      delay: 1500,
    },
    {
      key: "Interest",
      loadingText: "🎯 Identifying your core interests...",
      completedText: "Interests",
      value: insights?.Interest,
      delay: 2000,
    },
    {
      key: "degree",
      loadingText: "🎓 Finding suitable degree programs...",
      completedText: "Suggested Degrees",
      value: insights?.degree?.join(", "),
      delay: 2500,
    },
    {
      key: "careerOptions",
      loadingText: "💼 Exploring career opportunities...",
      completedText: "Career Options",
      value: insights?.careerOptions?.join(", "),
      delay: 2000,
    },
    {
      key: "summary",
      loadingText: "📝 Generating personalized summary...",
      completedText: "AI Summary",
      value: insights?.summary,
      delay: 3000,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<"loading" | "done">("loading");
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    if (currentStep < steps.length) {
      // Phase 1: show loading text
      setStatus("loading");

      const timer = setTimeout(() => {
        // Phase 2: show actual value
        setStatus("done");

        // After a short pause, move to next step
        const nextTimer = setTimeout(() => {
          setRevealed((prev) => [...prev, currentStep]);
          setCurrentStep((prev) => prev + 1);
        }, 800);

        return () => clearTimeout(nextTimer);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="space-y-2">
      {steps.map((step, index) => {
        const isActive = currentStep === index;

        return (
          <div key={step.key}>
            {/* Loading text */}
            {isActive && status === "loading" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base font-inter text-gray-800 font-medium bg-blue-50 px-3 py-3 flex items-center gap-2 border border-blue-300 rounded-md"
              >
                <LuLoader className="animate-spin inline mr-6 text-2xl" />{" "}
                {step.loadingText}
              </motion.p>
            )}

            {/* Final value after reveal */}
            {(revealed.includes(index) || (isActive && status === "done")) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-2 rounded-md bg-white border border-gray-200 flex items-center gap-2"
              >
                <p>
                  <span className="bg-green-500 rounded-full w-2 h-2 inline-block mr-4 font-inter"></span>{" "}
                  <span className="mb-2 text-base font-semibold font-inter">
                    {step.completedText}:
                  </span>{" "}
                  <br />
                  <span className="ml-6 font-raleway font-medium text-sm">
                    {step.value}
                  </span>
                </p>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* ✅ Final message after last step */}
      {currentStep === steps.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mt-6 p-4 bg-green-50 border border-green-500 rounded-md flex items-start gap-3"
        >
          <LuCheck className=" text-green-600" size={35}/>
          <p className="text-sm font-inter text-gray-800">
            <span className="font-semibold font-sora">Analysis Complete!</span>
            <br />
            Your personalized career insights are ready. Use this information to
            guide your academic and career decisions.
          </p>
        </motion.div>
      )}
    </div>
  );
}
