"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useUserData } from "@/context/UserDataProvider";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  LuActivity,
  LuBookOpenCheck,
  LuBriefcaseBusiness,
  LuCircleFadingPlus,
  LuInbox,
  LuVideo,
  LuWorkflow,
} from "react-icons/lu";

const AiSuggestedBoxHome = () => {
  const { user } = useUserData();
  const [showAltCard, setShowAltCard] = useState(false);
  const { open: sidebarOpen, isMobile } = useSidebar();

  // Auto toggle every 5s
  useEffect(() => {
    if (user?.isQuizDone) {
      const interval = setInterval(() => {
        setShowAltCard((prev) => !prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.isQuizDone]);

  return (
    <div className="flex flex-col items-center justify-center mt-12 ">
      <AnimatePresence mode="wait">
        {user?.isQuizDone ? (
          showAltCard ? (
            <motion.div
              key="alt-card"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`border border-amber-400 bg-yellow-50 w-full rounded-md ${sidebarOpen ? "max-w-[980px]": "max-w-[980px]"} h-60 mx-auto flex items-center justify-center text-center  relative overflow-hidden`}
            >
              <div className="flex relative h-full w-full">
                {/* Left side images */}
                <div>
                  <Image
                    src="/prep2.png"
                    alt="Decorative Element"
                    width={300}
                    height={300}
                    className="object-contain absolute left-0 -bottom-12 z-50"
                  />
                  <Image
                    src="/staic6.png"
                    alt="Decorative Element"
                    width={300}
                    height={300}
                    className="absolute -left-2 -top-10"
                  />
                </div>

                {/* Right Decorative shapes */}
                <div className="absolute -bottom-16 right-0 w-16 h-16">
                  <div className="w-full h-full bg-yellow-200/40 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
                </div>

                <div className="absolute bottom-20 -right-10 w-16 h-16">
                  <div className="w-full h-full bg-yellow-300/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                </div>

                <div className="absolute -bottom-10 left-[45%] w-16 h-16">
                  <div className="w-full h-full bg-yellow-400/40 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                </div>

                {/* Right Content */}
                <div className="w-[64%] ml-auto h-full py-4 px-3">
                  <h2 className="font-sora text-3xl font-extrabold tracking-tight text-pretty text-center capitalize leading-normal text-black">
                    Prepare Well For Your Job Interviews.
                  </h2>

                  <div className="flex items-center gap-5 mt-10 justify-center">
                    <Button className="bg-yellow-500 text-white font-inter text-sm hover:bg-amber-600">
                      Job Tracker <LuBriefcaseBusiness />
                    </Button>
                    <Button className="bg-yellow-500 text-white font-inter text-sm hover:bg-amber-600">
                      Interview Prep <LuVideo />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz-card"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`border border-rose-400 bg-gradient-to-br from-rose-50 via-rose-50 to-rose-300 rounded-md w-full rounded-md ${sidebarOpen ? "max-w-[980px]": "max-w-[980px]"} h-60 mx-auto relative overflow-hidden`}
            >
              <div className="flex relative h-full">
                {/* Left side images */}
                <Image
                  src="/static1.png"
                  alt="Decorative Element"
                  width={300}
                  height={300}
                  className="object-contain absolute left-0 -bottom-12 z-50"
                />
                <Image
                  src="/static5.png"
                  alt="Decorative Element"
                  width={300}
                  height={300}
                  className="absolute -left-2 -top-10"
                />

                {/* Right Decorative shapes */}
                <div className="absolute -bottom-16 right-0 w-16 h-16">
                  <div className="w-full h-full bg-white/40 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
                </div>

                <div className="absolute bottom-20 -right-10 w-16 h-16">
                  <div className="w-full h-full bg-white/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                </div>

                <div className="absolute -bottom-10 left-[45%] w-16 h-16">
                  <div className="w-full h-full bg-white/40 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                </div>

                {/* Right Content */}
                <div className="w-[64%] ml-auto h-full py-4 px-3">
                  <h2 className="font-sora text-3xl font-extrabold tracking-tight text-pretty text-center capitalize leading-normal bg-gradient-to-br from-slate-800 via-rose-500 to-rose-300 text-transparent bg-clip-text">
                    It&apos;s time to take your career to the next level and
                    shine!
                  </h2>

                  <div className="flex items-center gap-5 mt-5 justify-center">
                    <Button className="bg-white text-black font-inter text-sm hover:bg-gray-100">
                      Check Job Listings <LuInbox />
                    </Button>
                    <Button className="bg-white text-black font-inter text-sm hover:bg-gray-100">
                      Check Courses <LuBookOpenCheck />
                    </Button>
                  </div>

                  <div className="flex items-center gap-5 mt-5 justify-center">
                    <Button className="bg-white text-black font-inter text-sm hover:bg-gray-100">
                      Go To Career Board <LuWorkflow />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        ) : (
          // 🔵 QUIZ NOT DONE CARD (same as yours)
          <motion.div
            key="not-done-card"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="border border-dashed border-blue-500 bg-blue-50 rounded-md pt-4 px-4 w-[820px] mx-auto"
          >
            <h2 className="text-[22px] font-semibold font-sora text-center">
              Complete Your Quiz To Unlock Your Career Potential
            </h2>
            <div className="flex justify-center my-8">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center">
                <LuCircleFadingPlus className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="w-full my-6 flex justify-center">
              <Button className="bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-400 hover:to-blue-600 text-white">
                Get Started <LuActivity className="ml-2" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Image
                src="/element8.png"
                alt="Decorative Element"
                width={200}
                height={200}
                className="object-cover -mt-48 -ml-3"
              />
              <Image
                src="/element7.png"
                alt="Decorative Element"
                width={200}
                height={200}
                className="object-cover -mt-48"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 🔵 Indicator dots */}
      {user?.isQuizDone && (
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                showAltCard === (i === 1)
                  ? "bg-blue-500 scale-110"
                  : "bg-gray-300 opacity-70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AiSuggestedBoxHome;
