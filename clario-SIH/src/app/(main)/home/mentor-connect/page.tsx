/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  LuAccessibility,
  LuBook,
  LuBookMarked,
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
import { Award, Grid2X2, List, Ribbon, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Video } from "@imagekit/next";
import { useUserData } from "@/context/UserDataProvider";
import { useRouter } from "next/navigation";
import styled from "styled-components";

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
  const { user } = useUserData();
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
    if (!user) return;
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
  const bgColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];

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

        <div className="flex items-center justify-center gap-6 mt-8">
          <h2 className=" text-2xl font-semibold font-sora text-center">
            Discover More By Category
          </h2>
          <div className="flex items-center gap-1 font-inter text-sm bg-white p-2 shadow rounded-lg">
            <Award className="w-7 h-7 text-blue-500 " />
            Top Rated Mentors
          </div>
        </div>

        <div className=" w-full mx-auto flex items-center justify-between  px-4 py-2 my-6">
          <p className="font-inter text-base ">
            <span className="font-semibold">45</span> Mentors Found
          </p>
          <div className="flex items-center gap-5">
            {/* Search Bar */}
            <div className="flex items-center w-[320px] bg-white border border-gray-200 rounded-lg px-3 ">
              <LuSearch className="text-lg text-gray-600 ml-2" />
              <Input
                placeholder="Search mentors"
                className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            {/* Available Filters */}
            <div className="flex items-center gap-4 font-inter text-sm py-2 px-3 bg-white shadow rounded-md">
              <StyledWrapper>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider" />
                </label>
              </StyledWrapper>
              Available
            </div>
            {/* Bookings */}
            <Button className="font-inter text-sm cursor-pointer" variant="outline" onClick={()=>router.push("/home/mentor-connect/bookings")}>
              <LuHistory className="mr-2" />
              My Bookings
            </Button>
            {/* Filters */}
            <Button className="font-inter text-sm " variant="outline">
              <LuFilter className="mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* ALL mentors */}
        <div className="grid grid-cols-2 md:grid-cols-3 mt-5  lg:gap-x-12 md:gap-x-8 gap-y-14 px-2 max-w-[1260px] mx-auto">
          {mentorData.map((mentor) => {
            const bgColor = getRandomBgColor(mentor.id);
            const borderColor = getRandomBorderColor(mentor.id);
            return (
              <div
                key={mentor.id}
                className="bg-white border border-gray-200 shadow-md rounded-md h-[300px] w-[330px] overflow-hidden relative flex flex-col"
              >
                {/* HEADER */}
                <div className={`h-16 ${bgColor} w-full relative`}>
                  <Image
                    src={mentor?.avatar || "/user.png"}
                    alt={mentor?.full_name || "User"}
                    width={75}
                    height={75}
                    className="rounded-full border border-gray-200 absolute top-5 left-5 z-20"
                  />
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <div className="w-full h-full bg-white/25 rounded-tr-2xl rotate-45 transform origin-top-right"></div>
                  </div>

                  <div className="absolute top-0 left-0 w-16 h-16">
                    <div className="w-full h-full bg-white/30 rounded-tr-2xl rotate-6 transform origin-top-right"></div>
                  </div>

                  <div className="absolute py-1 px-3 text-sm font-inter rounded-full bg-gray-50 border top-12 right-5">
                    <Star
                      className="inline mr-1 fill-yellow-500 text-yellow-400"
                      size={15}
                    />{" "}
                    {mentor?.rating}
                  </div>
                </div>

                {/* BODY */}
                <div className="px-4 py-2 mt-6 flex flex-col flex-grow">
                  <h3 className="font-inter text-base font-semibold tracking-tight capitalize">
                    {mentor?.full_name}
                  </h3>
                  <h3 className="font-inter text-base text-muted-foreground capitalize">
                    {mentor?.current_position}
                  </h3>
                  <h2 className="text-sm font-inter mt-3 text-center">
                    <span className="font-semibold">Expertise: </span>
                    {mentor?.expertise?.join(" , ") || "No expertise added"}
                  </h2>

                  {/* FOOTER  */}
                  <div className="mt-auto pb-3">
                    <Button
                      variant="outline"
                      className="font-inter text-sm w-full cursor-pointer"
                      onClick={() =>
                        router.push(`/home/mentor-connect/${mentor.id}`)
                      }
                    >
                      Connect <LuScreenShare className="ml-2" />
                    </Button>
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
const StyledWrapper = styled.div`
  .switch {
    --secondary-container: #d3d3d3;
    --primary: #ffffff;
    font-size: 10px;
    position: relative;
    display: inline-block;
    width: 3.7em;
    height: 1.8em;
  }

  .switch input {
    display: none;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--secondary-container); /* grey track */
    transition: background-color 0.2s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    border-radius: 20px;
    left: 0.2em;
    bottom: 0.2em;
    background-color: var(--primary); /* white knob */
    transition: transform 0.4s, background-color 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input:checked + .slider::before {
    background-color: var(--primary);
  }

  input:checked + .slider {
    background-color: #84da89; /* green track when active */
  }
  input:focus + .slider {
    box-shadow: 0 0 1px var(--secondary-container);
  }

  input:checked + .slider:before {
    transform: translateX(1.9em);
  }
`;
