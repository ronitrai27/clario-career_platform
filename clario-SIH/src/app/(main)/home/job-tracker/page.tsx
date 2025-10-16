"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";
import Image from "next/image";
import React from "react";
import {
  LuBookMarked,
  LuChevronDown,
  LuChevronRight,
  LuCircleFadingPlus,
} from "react-icons/lu";

const JobTracker = () => {
  return (
    <div className="h-full bg-gray-50 p-2 pb-8">
      <div className="w-full flex px-8 gap-5 my-6">
        <p className="whitespace-nowrap text-2xl font-semibold font-sora flex gap-3 items-center">Your smart way of job tracking <LuChevronRight className="w-4 h-4" /></p>
        <div className="flex items-center gap-3 justify-end w-full">
          {/* <p className="font-inter tracking-tight text-sm">
            Bring jobs from career board to your job tracker
          </p> */}
          <Button variant="outline" className="font-inter text-sm">
            <LuBookMarked className="w-4 h-4 mr-2" />
            Career Board
          </Button>
        </div>
        <Button variant="outline" className="font-inter text-sm ml-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" className="font-inter text-sm bg-gradient-to-br from-blue-300 to-blue-500 text-white">
          Add <LuCircleFadingPlus className="w-4 h-4 ml-2" />
        </Button>
      </div>
      {/* Job tracker */}
      <div className="w-full h-full  max-w-[1150px] ">
        <div className="flex h-full w-full overflow-x-auto scroll-smooth mt-5">
          {/* Left side */}
          <div className="w-[250px] flex flex-col h-full p-2 mr-5">
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 w-full h-[250px] rounded-md shadow-sm mb-4 relative p-3">
              <Image
                src="/jobasset1.png"
                alt="jobtracker"
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-md absolute opacity-40 inset-0 -top-10"
              />
              <div className="flex flex-col h-full">
                <h1 className="font-inter font-semibold text-2xl  text-white text-center mt-10">
                  Get Ready to crack your dream job
                </h1>

                <Button
                  variant="default"
                  className="font-inter text-sm mt-auto bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                >
                  Ai Interview Prep
                  <LuChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className="font-inter text-base shadow-sm mt-10"
            >
              Add Job <LuCircleFadingPlus className="w-4 h-4 ml-2" />
            </Button>

            <p className="font-inter mt-4 text-center text-sm text-muted-foreground">
              Click on the button to add a job. Drag and drop created job to
              reorder
            </p>
          </div>
          {/* Right side all columns */}
          <div className="flex h-auto min-w-max gap-4">
            {/* Saved */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-gray-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Saved <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3">{/* Job cards */}</div>
            </div>

            {/* Applied */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-blue-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Applied <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>

            {/* Interviewing */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-green-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Interviewing <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Negotiating */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-yellow-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Negotiating <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Hired */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-emerald-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Hired <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
            {/* <Separator orientation="vertical" className="bg-gray-300" /> */}

            {/* Rejected */}
            <div className="flex flex-col w-[260px] bg-white rounded-md shadow-sm">
              <div className="text-center py-3 font-semibold border rounded shadow bg-red-100">
                <h1 className="font-sora text-base flex items-center justify-center gap-5">
                  Rejected <LuChevronDown className="w-4 h-4 ml-2" />
                </h1>
              </div>
              <div className="flex-1 p-3 space-y-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTracker;
