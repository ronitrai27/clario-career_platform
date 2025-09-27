"use client";
import { useUserData } from "@/context/UserDataProvider";
import React from "react";
import { GraduationCap, Map, Users, FileText } from "lucide-react";
import Link from "next/link";

type Profession =
  | "10th Student"
  | "12th Student"
  | "Diploma"
  | "Graduate"
  | "Postgraduate";

export default function ActionBox() {
  const { user } = useUserData();
  const status = user?.current_status?.toLowerCase();

  const isSchoolStudent =
    status === "10th student" || status === "12th student";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-7 my-14 px-6 max-w-[1000px] mx-auto">
      {/* 1*/}
      <Link href="/home/ai-tools/career-coach/">
        <div className="relative overflow-hidden rounded-md shadow-lg px-3 py-2 text-black hover:scale-105 transition bg-gradient-to-br from-white via-white to-blue-100 cursor-pointer  border-l-8 border-blue-500">
          <div className="flex  items-center gap-4">
            <div className="p-2 bg-blue-500/15 rounded-full backdrop-blur-sm">
              <GraduationCap className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium font-inter tracking-tight">
              AI Career Coach
            </h3>
          </div>
          <div>
            <p className="mt-3 text-sm font-sora text-center">
              Unlock your potential with AI-guided career wisdom.
            </p>
          </div>
        </div>
      </Link>
      {/* 2 */}
      <Link href="/home/ai-tools/roadmap-maker/">
        <div className="relative overflow-hidden rounded-md shadow-lg px-3 py-2 text-black hover:scale-105 transition bg-gradient-to-br from-white via-white to-yellow-50 cursor-pointer  border-l-8 border-yellow-500">
          <div className="flex  items-center gap-2">
            <div className="p-2 bg-yellow-100/70 rounded-full backdrop-blur-sm">
              <Map className="w-6 h-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-mediumtracking-tight leading-tight font-inter">
              AI Roadmap Maker
            </h3>
          </div>
          <div>
            <p className="mt-3 text-sm font-sora text-center">
              {" "}
              Chart your journey with a clear, personalized path..
            </p>
          </div>
        </div>
      </Link>
      {/* Conditional third card */}
      {isSchoolStudent ? (
       <Link href="/home/mentor-connect">
         <div className="relative overflow-hidden rounded-md shadow-lg px-3 py-2 text-black hover:scale-105 transition bg-gradient-to-br from-white via-white to-pink-50 cursor-pointer border-l-8 border-pink-500">
          <div className="flex  items-center gap-3">
            <div className="p-2 bg-pink-100/70 rounded-full backdrop-blur-sm">
              <Users className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium leading-tight font-inter">
              Connect Mentors
            </h3>
          </div>
          <div>
            <p className="mt-3 text-sm font-sora text-center">
              {" "}
              Learn from mentors who’ve walked the path before you.
            </p>
          </div>
        </div>
       </Link>
      ) : (
        <div className="relative overflow-hidden rounded-md shadow-lg px-3 py-2 text-black hover:scale-105 transition bg-gradient-to-br from-white to-blue-100 cursor-pointer  border-l-8 border-blue-500">
          <div className="flex  items-center gap-4">
            <div className="p-2 bg-blue-500/15 rounded-full backdrop-blur-sm">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold font-raleway">
              AI Resume Maker
            </h3>
          </div>
          <div>
            <p className="mt-2 text-sm font-inter text-center">
              {" "}
              Transform your resume into a recruiter-ready story.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
