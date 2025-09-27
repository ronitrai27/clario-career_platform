/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  LuBook,
  LuFilter,
  LuHistory,
  LuLinkedin,
  LuLoader,
  LuPlus,
  LuScreenShare,
  LuSearch,
  LuUsersRound,
} from "react-icons/lu";
import SingleCard from "../../_components/Mentor-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllMentorsPaginated,
  getRandomMentorVideos,
} from "@/lib/functions/dbActions";
import { DBMentor } from "@/lib/types/allTypes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Grid2X2, List, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Video } from "@imagekit/next";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";

const fallbackAvatars = [
  "/a1.png",
  "/a2.png",
  "/a3.png",
  "/a4.png",
  "/a5.png",
  "/a6.png",
];
interface MentorVideo {
  id: string;
  video_url: string;
}

export default function MentorConnect() {
  const {user} = useUserData();
  const [mentorData, setMentorData] = useState<DBMentor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [totalMentors, setTotalMentors] = useState(0);

  const [videos, setVideos] = useState<MentorVideo[]>([]);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if(!user) return
    const fetchVideos = async () => {
      const res = await getRandomMentorVideos();
      setVideos(res);
      setLoadingVideo(false);
    };
    fetchVideos();
  }, [user]);

  const loadMentors = async (pageNum: number) => {
    setLoadingMentors(true);
    const {
      mentors: newMentors,
      hasMore,
      total: total,
    } = await getAllMentorsPaginated(pageNum, 6);

    setMentorData((prev) => {
      if (pageNum === 1) {
        return newMentors;
      }
      return [...prev, ...newMentors];
    });

    setHasMore(hasMore);
    setTotalMentors(total);
    setLoadingMentors(false);
  };

  useEffect(() => {
    loadMentors(1);
  }, []);
  const borderColors = [
    "border-blue-500",
    "border-green-500",
    "border-yellow-500",
    "border-pink-500",
  ];
  const bgColors = ["bg-white", "bg-white", "bg-white", "bg-white"];

  function getRandomBorderColor(id: string) {
    const index = id
      ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        borderColors.length
      : Math.floor(Math.random() * borderColors.length);
    return borderColors[index];
  }
  function getRandomBgColor(id: string) {
    const index = id
      ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        bgColors.length
      : Math.floor(Math.random() * bgColors.length);
    return bgColors[index];
  }

  const getAvatar = (mentor: any) => {
    if (mentor.avatar) return mentor.avatar;
    const randomIndex = Math.floor(Math.random() * fallbackAvatars.length);
    return fallbackAvatars[randomIndex];
  };

  //   console.log("Mentors", mentorData);

  return (
    <div className="bg-gray-50 py-6 px-4 h-full w-full">
      <div className="flex flex-col space-y-4">
        <SingleCard />

        <h2 className="ml-10 text-3xl font-semibold font-sora">
          Discover Mentors <LuUsersRound className="inline ml-3" />
        </h2>

        {/* Scrollable Skeleton Row */}
        {loadingVideo ? (
          <div className="w-full max-w-[1150px] mx-auto px-6">
            <div className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide max-w-full">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[280px] w-[280px] rounded-lg shrink-0"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[1150px] mx-auto px-6">
            <div className="flex space-x-6 overflow-x-auto px-2 scrollbar-hide max-w-full">
              {videos.map((video) => {
                const videoPath = video.video_url.split("/").slice(4).join("/");
                return (
                  <div
                    key={video.id}
                    className="h-[280px] w-[280px] rounded-lg shrink-0 relative overflow-hidden hover:scale-105 duration-200 cursor-pointer"
                  >
                    <Video
                      urlEndpoint={
                        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                      }
                      src={videoPath}
                      autoPlay
                      muted
                      controls
                      loop
                      loading="lazy"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="max-w-[1000px] w-full mx-auto flex items-center justify-between  px-4 py-2 my-6">
          {/* Search Bar */}
          <div className="flex items-center w-[560px] bg-white border border-gray-200 rounded-full px-3 py-1">
            <Input
              placeholder="Search mentors"
              className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            <LuSearch className="text-lg text-gray-600 ml-2" />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors bg-blue-50 py-2 px-4 rounded-md border border-blue-500">
            <LuFilter className="text-lg" />
            <p className="text-sm font-medium">Filter</p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid2X2 className="text-lg" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="text-lg" />
            </Button>
          </div>

          {/* History */}
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors bg-blue-50 border border-blue-500 py-2 px-4 rounded-md">
            <LuHistory className="text-lg" />
            <p className="text-sm font-medium">History</p>
          </div>
        </div>

        {/* ALL mentors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5  gap-x-6 gap-y-14 px-2 max-w-[1260px] mx-auto">
          {mentorData.map((mentor) => {
            const bgColor = getRandomBgColor(mentor.id);
            const borderColor = getRandomBorderColor(mentor.id);
            return (
              <div
                key={mentor.id}
                className={`border-l-4 ${borderColor} rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden h-[240px]`}
              >
                <div className="flex h-full">
                  {/* Left Section */}
                  <div
                    className={`w-[65%] ${bgColor} flex flex-col justify-between p-3`}
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-semibold font-inter text-center tracking-tight capitalize">
                        {mentor?.current_position || "Position unavailable"}
                      </p>
                      <p className="text-base font-inter text-center mb-3 line-clamp-2">
                        {mentor?.bio || "No bio available"}
                      </p>
                      <h2 className="text-sm font-raleway text-center">
                        Expertise:{" "}
                        {mentor?.expertise?.join(", ") || "No expertise added"}
                      </h2>
                    </div>

                    <div className="fmt-4 w-full">
                    
                      <Button size="sm" variant="outline" className="w-full cursor-pointer" onClick={()=> router.push(`/home/mentor-connect/${mentor.id}`)}>
                        Connect <LuScreenShare className="ml-2" />
                      </Button>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="bg-gray-300" />

                  {/* Right Section */}
                  <div className="flex flex-col items-center justify-center w-[35%] px-2 py-4 text-center space-y-2 ">
                    <span
                      className={`inline-block -mt-4 mb-6 px-2 py-1 text-xs text-black font-inter rounded-full font-medium ${
                        mentor?.availability
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {mentor?.availability ? "Available" : "Available"}
                    </span>
                    <div className="relative mb-4">
                      <Image
                        src={mentor?.avatar || "/user.png"}
                        alt={mentor?.full_name || "User"}
                        width={75}
                        height={75}
                        className="rounded-full border border-gray-200"
                      />
                      <p className=" absolute -bottom-2 right-1 bg-white border-2 border-yellow-500 rounded-full px-2 flex items-center text-sm">
                        <Star
                          className="inline mr-1 fill-yellow-500 text-yellow-400"
                          size={15}
                        />{" "}
                        {mentor?.rating}
                      </p>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 capitalize">
                      {mentor?.full_name}
                    </h2>
                    <Link
                      target="_blank"
                      href={
                        mentor?.linkedin ||
                        "https://www.linkedin.com/in/ronit-rai-aa53a1300/"
                      }
                      className="text-base text-blue-600 hover:underline truncate max-w-[100px]"
                    >
                      <div className="flex items-center gap-2">
                        <p className=" font-inter tracking-tight">linkedin</p>
                        <Image
                          src="/linkedin.png"
                          alt="linkedin"
                          width={20}
                          height={20}
                        />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More button */}
        {hasMore && (
          <div className="flex justify-center mt-14">
            <Button
              variant="outline"
              onClick={() =>
                loadMentors(page + 1).then(() => setPage(page + 1))
              }
              disabled={loadingMentors}
            >
              {loadingMentors ? (
                <>
                  <LuLoader className="animate-spin inline mr-4 text-2xl" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <LuPlus className="inline mr-4 text-2xl" />
                  <span>Load More</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
