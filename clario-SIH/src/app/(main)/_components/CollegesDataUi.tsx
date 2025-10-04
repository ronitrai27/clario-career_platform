"use client";

import { useEffect, useState } from "react";
import { paginatedColleges } from "@/lib/functions/dbActions";
import type { College } from "@/lib/types/allTypes";
import Image from "next/image";
import { LuPi, LuPin } from "react-icons/lu";
import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Building2, LucideActivity, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollegesList() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // colleges---------------------------->
  const [nearbyActive, setNearbyActive] = useState(false);
  const [collegeType, setCollegeType] = useState<string | null>(null);

  useEffect(() => {
    loadMoreColleges(1, true);
  }, []);

  const loadMoreColleges = async (pageNum: number, reset = false, locationSearch?: string, collegeType?: string) => {
    setLoading(true);
    const newColleges = await paginatedColleges(pageNum, 6, locationSearch || null, collegeType || null);
    setColleges((prev) => (reset ? newColleges : [...prev, ...newColleges]));
    setLoading(false);
  };

   const handleSearch = () => {
    setPage(1);
    loadMoreColleges(1, true, searchQuery);
  };

  const handleCollegeTypeChange = (type: string) => {
  const newType = collegeType === type ? null : type;
  setCollegeType(newType);
  setPage(1);
  loadMoreColleges(1, true, searchQuery, newType!);
};


  return (
    <div>
     
      <div className="mb-10 flex items-center gap-10  px-8">
        <div className="relative w-full max-w-[340px] flex justify-between items-center border border-blue-300 rounded-md px-4 bg-blue-50">
          <Input
            type="text"
            placeholder="Search Colleges by Location..."
            className="font-inter text-sm bg-transparent border-none shadow-none focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Search className=" text-blue-600 cursor-pointer hover:scale-105" onClick={handleSearch} />
        </div>
        <Button
          onClick={() => setNearbyActive(!nearbyActive)}
          className={`font-inter text-sm cursor-pointer flex items-center hover:bg-blue-100 hover:border-blue-500 hover:text-blue-600
    ${nearbyActive ? "bg-blue-100 border-blue-500 text-blue-600" : ""}`}
          variant={nearbyActive ? "default" : "outline"}
        >
          Recomended <Building2 className="ml-2" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="font-inter text-sm capitalize cursor-pointer flex items-center"
              variant="outline"
            >
              {collegeType ? collegeType : "Type"}{" "}
              <LucideActivity className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col gap-2 font-inter">
              <Button
                variant={collegeType === "Private" ? "default" : "outline"}
                className="cursor-pointer border-none shadow-none"
               onClick={() => handleCollegeTypeChange("private")}
              >
                {" "}
                Private College{" "}
              </Button>{" "}
              <Button
              className="cursor-pointer border-none shadow-none"
                variant={collegeType === "Government" ? "default" : "outline"}
                onClick={() => handleCollegeTypeChange("government")}
              >
                {" "}
                Government College{" "}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

       {!loading && colleges.length === 0 && (
      <div className="my-8">
          <p className="text-center text-gray-800 font-inter text-xl">No colleges found.</p>
      </div>
      ) }

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <div
            key={college.id}
            className="border rounded-lg p-4 border-b-4 border-b-blue-500 shadow-sm hover:shadow-md bg-white relative overflow-hidden flex flex-col h-[290px]"
          >
            <div className="w-40 h-20 rounded-full absolute -top-7 -left-5 bg-blue-500 opacity-15 blur-xl"></div>
            <h2 className="font-semibold text-lg font-inter tracking-tight line-clamp-2  capitalize">
              {college.college_name}
            </h2>
            <p className="text-base font-inter  my-1 capitalize text-gray-600">
              <LuPin className="inline-block mr-1" />
              {college.location}
            </p>
            <p className="text-sm font-sora font-medium ">
              Type: {college.type}
            </p>
            <p className="text-base mt-4 font-inter ">
              1st Year Fees: {college.fees || "N/A"}
            </p>
            <Image
              src="/hat.png"
              width={200}
              height={200}
              alt="jobs"
              className="absolute opacity-10  -right-5  top-16 w-32 h-32"
            />

            <p className="text-base mt-2 font-inter ">
              Highest Placement: {college.placement || "N/A"}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="font-inter font-semibold text-blue-500">
                {" "}
                Best Suited For:
              </span>
              {college.best_suit_for.map((course, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-inter uppercase"
                >
                  {course}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-6">
        <Button
          disabled={loading}
          variant="outline"
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            loadMoreColleges(nextPage, false, searchQuery);
          }}
          className="px-4 py-2  disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </Button>
      </div>
    </div>
  );
}
