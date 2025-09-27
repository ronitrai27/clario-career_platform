"use client";

import { useEffect, useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import { BsStars } from "react-icons/bs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAssistantSheetStore } from "@/lib/store/useAssistantSheet";
import Image from "next/image";

export default function AnimatedAssistant() {
  const [showWave, setShowWave] = useState(false);
  const [displayText, setDisplayText] = useState("AI Assistant");
  const { isOpen, open, close } = useAssistantSheetStore();

  const texts = [
    "Do You Need help?",
    "Ask me anything.",
    "AI Assistant",
    "How can I help today?",
  ];

  useEffect(() => {
    let waveTimeout: NodeJS.Timeout;
    let triggerTimeout: NodeJS.Timeout;

    const triggerEffect = () => {
      let newText = displayText;
      while (newText === displayText && texts.length > 1) {
        newText = texts[Math.floor(Math.random() * texts.length)];
      }
      setDisplayText(newText);

      setShowWave(true);
      waveTimeout = setTimeout(() => setShowWave(false), 1200);

      const nextDelay = Math.random() * 10000 + 8000;
      triggerTimeout = setTimeout(triggerEffect, nextDelay);
    };

    triggerEffect();

    return () => {
      clearTimeout(waveTimeout);
      clearTimeout(triggerTimeout);
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-4 relative">
        <div
          onClick={open}
          className="relative bg-white w-11 h-11 rounded-full flex items-center justify-center shadow-md cursor-pointer"
        >
          <BsStars className="text-[20px] text-black z-10" />
          {showWave && (
            <>
              <span className="absolute w-full h-full rounded-full bg-blue-400/20 animate-ping z-0" />
              <span className="absolute w-14 h-14 rounded-full bg-blue-400/10 animate-ping z-0" />
              <span className="absolute w-16 h-16 rounded-full bg-blue-200/10 animate-ping z-0" />
            </>
          )}
        </div>

        <p className="font-poppins text-base text-black">
          <Typewriter
            words={[displayText]}
            loop={1}
            typeSpeed={60}
            deleteSpeed={30}
            delaySpeed={2000}
          />
        </p>
      </div>

      {/* Sheet instead of Dialog */}
      <Sheet open={isOpen} onOpenChange={close}>
        <SheetContent
          side="right"
          className="sm:max-w-sm bg-slate-900 border-none"
        >
          <SheetHeader>
            <SheetTitle>
              {" "}
              <div className={`flex items-center justify-start `}>
                <Image
                  src="/clarioWhite.png"
                  alt="logo"
                  width={60}
                  height={60}
                  className=""
                />
                <h2 className="font-bold -ml-1 font-sora tracking-tight text-2xl text-white">
                  Clario
                </h2>
              </div>
            </SheetTitle>
            <SheetDescription>
              This is your future assistant panel.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </>
  );
}
