"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Check, Calendar, Target, Users, UserRound, GraduationCap, Mic2, SpeakerIcon, EarIcon } from "lucide-react"

type StepMeta = {
  key: number
  label: string
  icon: React.ReactNode
}

const steps: StepMeta[] = [
  { key: 1, label: "Basics", icon: <UserRound className="h-4 w-4" /> },
  { key: 2, label: "Profile", icon: <GraduationCap className="h-4 w-4" /> },
  { key: 3, label: "Focus", icon: <Target className="h-4 w-4" /> },
  { key: 4, label: "Info", icon: <EarIcon className="h-4 w-4" /> },
  { key: 5, label: "Invite", icon: <Users className="h-4 w-4" /> },
]

export function StepIndicator({
  current,
  onStepClick,
}: {
  current: number
  onStepClick?: (step: number) => void
}) {
  const progressPct = ((current - 1) / (steps.length - 1)) * 100

  return (
    <div aria-label="Onboarding progress" className="w-full">
      <div className="relative mb-6">
        <div className="h-2 w-full rounded-full bg-muted" />
        <div
          className="absolute left-0 top-0 h-1 rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
          aria-hidden="true"
        />
      </div>

      <ol className="flex items-center justify-between px-10">
        {steps.map((s) => {
          const isCompleted = s.key < current
          const isActive = s.key === current
          return (
            <li key={s.key} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!onStepClick) return
                  // Allow navigation only to current or previous steps
                  if (s.key <= current) onStepClick(s.key)
                }}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border text-foreground transition-colors",
                  isCompleted && "bg-emerald-50 border-emerald-200 text-emerald-700",
                  isActive && "bg-blue-600 border-blue-600 text-white",
                  !isCompleted && !isActive && "bg-background border-border",
                )}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${s.key}: ${s.label}`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : s.icon}
              </button>
              <div
                className={cn(
                  " font-medium text-center text-pretty font-inter text-sm",
                  isActive ? "text-blue-700" : "text-muted-foreground",
                )}
              >
                {s.label}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
