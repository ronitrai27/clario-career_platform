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
  SheetFooter,
} from "@/components/ui/sheet";
import { useAssistantSheetStore } from "@/lib/store/useAssistantSheet";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LuSend } from "react-icons/lu";

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
          className="relative bg-gradient-to-br from-blue-300/30 to-white w-11 h-11 rounded-full flex items-center justify-center shadow-md cursor-pointer"
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

        <p className="font-sora text-base text-black">
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
             AI Assistant at your help anytime and anywhere.
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 px-2 mt-5">
              <div className="p-2 rounded-sm bg-blue-200 border-2 cursor-none border-blue-600 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Getting started with Clario</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Get To know more about Clario</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Creating Tickets to solve complex quiries</p>
              </div>
              <div className="p-2 rounded-sm bg-blue-200 border-2 border-blue-500 text-black font-sora text-xs tracking-tight text-center hover:bg-blue-200 hover:scale-105 transition-all duration-200">
                <p>Billing or Pricing Details</p>
              </div>
            </div>

               <SheetFooter className="shrink-0">
          <div>
            <Label className="text-white font-inter text-sm tracking-tight font-medium mt-2 mb-2">
              Send a message
            </Label>
            <div className="relative">
              <Textarea
                placeholder="Write a message"
                // value={input}
                // onChange={(e) => setInput(e.target.value)}
                // onKeyDown={handleKeyDown}
                className="bg-black text-gray-200 font-inter text-sm tracking-tight font-medium mt-2 mb-2 h-28 resize-none"
              />
              <Button
                className="absolute right-2 bottom-2 bg-gray-600"
                // onClick={sendMessage}
              >
                <LuSend className="text-white" size={10} />
              </Button>
            </div>
          </div>
        </SheetFooter>
        </SheetContent>
      
      </Sheet>
    </>
  );
}
