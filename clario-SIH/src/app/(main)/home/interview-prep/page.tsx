"use client";

import { Separator } from "@/components/ui/separator";
import SingleCard from "../../_components/InterviewSingleCard";
import { LuCircleFadingArrowUp } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { LucideActivity, LucideHistory } from "lucide-react";
import Image from "next/image";

const InterviewDefault = () => {
  return (
    <div className="bg-gray-50 h-full overflow-hidden w-full px-2 py-4">
      <SingleCard />
      <div className="mt-6 flex w-full h-full">
        {/* LEFT SIDE */}
        <div className="w-[320px] flex flex-col px-1">
          <h1 className="text-2xl font-semibold font-sora mb-8">Create AI Interviews</h1>
          <div className="w-full px-4">
            {" "}
            <h2 className="font-medium font-inter text-base">
              Create New Interview{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />
            </h2>
            <Button className="text-sm font-inter mt-4 w-full" variant="outline">
              Create New{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />{" "}
            </Button>
            <h2 className="font-medium font-inter text-base mt-5">
              Create From Job Tracker Board{" "}
              <LucideActivity className="inline w-5 h-5 ml-2" />
            </h2>
            <Button className="text-sm font-inter mt-4 w-full" variant="outline">
              Job Tracker <LucideActivity className="inline w-5 h-5 ml-2" />{" "}
            </Button>
          </div>
          <div className="h-[180px] bg-gradient-to-br from-yellow-50 via-yellow-200 to-yellow-400 w-full mt-10 rounded-lg p-2 relative overflow-hidden">
            <Image
            src="/element1.png"
            alt="element"
            width={200}
            height={200}
            className="w-full h-full object-cover absolute -left-28"
            />
            <h2 className="font-extrabold font-inter text-black text-4xl absolute top-[34%] right-[40%]">5</h2>
            <h2 className="font-medium font-inter text-black text-xl absolute top-[60%] right-5 text-center max-w-[180px]">Interview Creation left for this month</h2>
          </div>
        </div>
        <Separator orientation="vertical" className="mx-2 " />
        {/* Right side */}
        <div className="flex-1 ">
          <h1 className="text-2xl font-semibold font-sora tracking-wide ml-4">Interviews History <LucideHistory className="inline w-6 h-6 ml-2" /></h1>
        </div>
      </div>
    </div>
  );
};

export default InterviewDefault;
