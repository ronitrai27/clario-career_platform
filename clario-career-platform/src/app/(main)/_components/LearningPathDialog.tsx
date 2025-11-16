"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Image from "next/image"
import { useEffect, useState } from "react"

interface LearningPathDialogProps {
  showDialog: boolean
  setShowDialog: (show: boolean) => void
  loadingStep: number
}

const steps = [
  "Generating your personalized learning path...",
  "Analyzing roadmap data...",
  "Looking for external resources...",
  "Fetching YouTube tutorials...",
  "Connecting to the database...",
  "Finalizing your setup...",
]

export function LearningPathDialog({ showDialog, setShowDialog, loadingStep }: LearningPathDialogProps) {
  const [displayedSteps, setDisplayedSteps] = useState<string[]>([])

  useEffect(() => {
    if (showDialog && loadingStep >= 0) {
      const timeout = setTimeout(() => {
        setDisplayedSteps(steps.slice(0, Math.min(loadingStep + 1, steps.length)))
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [loadingStep, showDialog])

  const progress = ((loadingStep + 1) / steps.length) * 100

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <VisuallyHidden>
        <DialogTitle>Clario is Creating Your Personalized Learning Path</DialogTitle>
      </VisuallyHidden>

      <DialogContent className="sm:max-w-[800px] bg-white text-center font-inter p-0 h-[520px] overflow-hidden">
        <div className="flex h-full">
          {/* LEFT SIDE - UNCHANGED */}
          <div className="w-[40%] flex flex-col bg-gradient-to-br from-indigo-400 to-rose-400 h-full relative py-8 px-4">
            <h2 className="font-inter text-white font-semibold text-3xl text-pretty">
              A Well Defined Roadmap may Help You Learn Faster
            </h2>
            <Image
              src="/9.png"
              alt="Clario"
              width={800}
              height={800}
              className="absolute object-contain -bottom-5 left-0 scale-125"
            />
          </div>

          {/* RIGHT SIDE - PROFESSIONAL LOADING EXPERIENCE */}
          <div className="w-[60%] p-8 flex flex-col justify-between bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div>
              <h1 className="text-center font-semibold font-inter text-2xl text-gray-900 mb-2">
                Clario is Creating Your
              </h1>
              <p className="text-center font-inter text-sm text-indigo-600 font-medium">Personalized Learning Path</p>
            </div>

            {/* Loading Steps - Enhanced with staggered animation */}
            <div className="space-y-4 px-4 flex-1 flex flex-col justify-center">
              {displayedSteps.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    index < loadingStep
                      ? "opacity-100 translate-x-0"
                      : index === loadingStep
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-2"
                  }`}
                >
                  {/* Step indicator - animated based on completion */}
                  <div className="flex-shrink-0">
                    {index < loadingStep ? (
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : index === loadingStep ? (
                      <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>

                  {/* Step text */}
                  <p className="text-sm font-inter text-gray-700 capitalize flex-1 text-left">{msg}</p>
                </div>
              ))}
            </div>

            {/* Progress bar and time estimate */}
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 font-inter">
                {loadingStep === steps.length - 1 ? "Almost done..." : "This may take a few seconds..."}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
