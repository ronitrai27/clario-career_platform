"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCircularProgressBarProps {
  max?: number
  min?: number
  gaugePrimaryColor: string
  gaugeSecondaryColor: string
  className?: string
}

export function AnimatedCircularProgressBar({
  max = 10,
  min = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
}: AnimatedCircularProgressBarProps) {
  // 👇 countdown state
  const [progress, setProgress] = useState(10)

  // 👇 countdown effect (10 → 0 → restart)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev <= 0 ? 10 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ---- circular gauge math ----
  const circumference = 2 * Math.PI * 45
  const percentPx = circumference / 100
  const currentPercent = Math.round(((progress - min) / (max - min)) * 100)

  return (
    <div
      className={cn("relative size-40 text-2xl font-semibold", className)}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "1s",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {/* Secondary (background) circle */}
        {currentPercent <= 90 && currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-100"
            style={
              {
                stroke: gaugeSecondaryColor,
                "--stroke-percent": 90 - currentPercent,
                "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
                strokeDasharray:
                  "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
                transform:
                  "rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)",
                transition: "all var(--transition-length) ease var(--delay)",
                transformOrigin:
                  "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
              } as React.CSSProperties
            }
          />
        )}

        {/* Primary (animated) circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: gaugePrimaryColor,
              "--stroke-percent": currentPercent,
              strokeDasharray:
                "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
              transition:
                "var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)",
              transitionProperty: "stroke-dasharray,transform",
              transform:
                "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))",
              transformOrigin:
                "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
            } as React.CSSProperties
          }
        />
      </svg>

      {/* Countdown text in center */}
      <span
        data-current-value={currentPercent}
        className="animate-in fade-in absolute text-4xl inset-0 m-auto size-fit delay-[var(--delay)] duration-[var(--transition-length)] ease-linear"
      >
        {progress}
      </span>
    </div>
  )
}
