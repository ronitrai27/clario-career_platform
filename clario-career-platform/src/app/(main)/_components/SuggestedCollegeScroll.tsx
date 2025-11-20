"use client";
import React, { useEffect, useState } from "react";
import { getSuggestedCollegeData } from "@/lib/functions/dbActions";
import { College } from "@/lib/types/allTypes";
import { useUserData } from "@/context/UserDataProvider";
import { useQuizData } from "@/context/userQuizProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { GrLocation, GrMoney } from "react-icons/gr";
import { TrendingUp, Users } from "lucide-react";
import { LuBuilding2, LuWalletCards } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const SuggestedCollegeScroll = () => {
  const { user } = useUserData();
  const { quizData } = useQuizData();
  const [suggestedCollegeData, setSuggestedCollegeData] = useState<College[]>(
    []
  );
  const [loadingCollege, setLoadingCollege] = useState(false);

  useEffect(() => {
    if (!user || user?.isQuizDone == false || !quizData) return;

    const fetchColleges = async () => {
      setLoadingCollege(true);

      const degrees: string[] = quizData?.quizInfo?.degree || [];

      // 1️⃣ Get user coordinates
      const lat = user?.latitude;
      const lon = user?.longitude;

      if (!lat || !lon) {
        console.warn("User coordinates not available");
        setLoadingCollege(false);
        return;
      }

      // 2️⃣ Convert coordinates → state name
      let state: string | null = null;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "MyCareerApp/1.0",
              "Accept-Language": "en",
            },
          }
        );

        const data = await res.json();
        const address = data?.address || {};

        console.log("FULL ADDRESS:", address);

        state =
          (
            address.state ||
            address.state_district ||
            address.city ||
            address.town ||
            address.village
          )?.toLowerCase() || null;
      } catch (err) {
        console.error("Error fetching state from coordinates:", err);
      }

      if (!state) {
        console.warn("Could not resolve user state from coordinates");
        setLoadingCollege(false);
        return;
      }

      // 3️⃣ Fetch colleges by state + degree
      const colleges = await getSuggestedCollegeData(degrees, state);
      setSuggestedCollegeData(colleges);

      setLoadingCollege(false);
    };

    fetchColleges();
  }, [user, quizData]);

  if (loadingCollege) {
    return (
      <div className="w-full  mx-auto px-6 mt-5">
        <div className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide w-full">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[250px] w-[360px] rounded-lg shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-5 mt-4">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {suggestedCollegeData.map((college, idx) => {
          // pastel color sets
          const pastelColors = [
            {
              bg: "bg-pink-50",
              border: "border-pink-400",
              outer: "border-pink-200",
              blob: "from-pink-300 via-rose-200 to-red-200",
            },
            {
              bg: "bg-purple-50",
              border: "border-purple-400",
              outer: "border-purple-200",
              blob: "from-purple-300 via-indigo-200 to-violet-200",
            },
            {
              bg: "bg-green-50",
              border: "border-green-400",
              outer: "border-green-200",
              blob: "from-green-300 via-teal-200 to-emerald-200",
            },
            {
              bg: "bg-yellow-50",
              border: "border-yellow-400",
              outer: "border-yellow-200",
              blob: "from-yellow-300 via-amber-200 to-orange-200",
            },
            {
              bg: "bg-blue-50",
              border: "border-blue-400",
              outer: "border-blue-200",
              blob: "from-blue-300 via-sky-200 to-cyan-200",
            },
          ];
          const palette = pastelColors[idx % pastelColors.length];

          return (
            <div
              key={college.id}
              className={`relative h-[250px] w-[360px] rounded-lg shadow-lg flex flex-col justify-between text-gray-800 bg-white border border-gray-300  flex-shrink-0 overflow-hidden`}
            >
              {/* Gradient Blobs inside card */}
              <div
                className={`absolute -top-10 -left-16 w-40 h-40 bg-gradient-to-br ${palette.blob} rounded-full blur-2xl opacity-30 pointer-events-none`}
              />
              {/* <div
                className={`absolute -bottom-20 -right-10 w-48 h-48 bg-gradient-to-br ${palette.blob} rounded-full opacity-20 blur-2xl pointer-events-none`}
              /> */}

              {/* <Image
                src="/static2.png"
                alt="blob"
                width={120}
                height={120}
                className="absolute -top-20 -left-5"
              /> */}
              <Image
                src="/static3.png"
                alt="blob"
                width={120}
                height={120}
                className="absolute -bottom-8 -right-4"
              />

              {/* Content */}
              <div className="relative py-3 px-3 z-10">
                {/* TYPE OF COLLEGE */}

                <h3 className="font-semibold text-base font-inter tracking-tight uppercase text-left line-clamp-2">
                  {college.college_name}
                </h3>
                <p className="text-sm font-inter text-gray-600 capitalize mt-1">
                  <GrLocation className="inline-block mr-1" />
                  {college.location}
                </p>
              </div>

              <div className="relative px-6 -mt-3 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LuWalletCards className="w-4 h-4 text-black" />
                    <span className="text-sm font-medium font-inter">
                      1st Year Fees
                    </span>
                  </div>
                  <span className="font-medium text-sm font-sora">
                    {college.fees || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-black" />
                    <span className="text-sm font-medium font-inter">
                      Highest Placement
                    </span>
                  </div>
                  <span className="font-medium text-sm font-sora">
                    {college.placement || "N/A"}
                  </span>
                </div>

                <p className="flex items-center gap-2">
                  <LuBuilding2 className="w-4 h-4 text-black" /> {college?.type}
                </p>
              </div>

              <div className="relative space-y-2 px-6 pb-2 z-10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-black" />
                  <span className="text-sm font-medium">Best suited for:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(college.best_suit_for)
                    ? college.best_suit_for
                    : [college.best_suit_for]
                  ).map((suit, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className={`text-sm font-raleway uppercase ${palette.bg} ${palette.border} px-2 border`}
                    >
                      {suit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedCollegeScroll;
