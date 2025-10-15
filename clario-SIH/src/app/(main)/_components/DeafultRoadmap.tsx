"use client";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { useQuizData } from "@/context/userQuizProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { LuActivity } from "react-icons/lu";

interface DefaultRoadmapProps {
  setField: (val: string) => void;
  fetchRoadmap: () => void;
}

const DefaultRoadmap: React.FC<DefaultRoadmapProps> = ({
  setField,
  fetchRoadmap,
}) => {
  const { user } = useUserData();
  const { quizData } = useQuizData();
  const router = useRouter();

  const handleClick = () => {
    if (quizData?.selectedCareer) {
      setField(quizData.selectedCareer);
      fetchRoadmap();
    }
  };

  return (
    <div className="bg-white h-full p-4 relative overflow-hidden flex flex-col justify-center">
      {user?.isQuizDone ? (
        <>
          <h2 className="capitalize text-4xl text-balance font-extrabold tracking-wide font-inter text-center -mt-4">
            welcome to your personalised learning roadmap
          </h2>

          <p className="text-muted-foreground text-center font-sora text-lg mt-6 px-6">
            Follow the Right Step towards your Dream Job. Easy download and
            share options available!
          </p>

          {/* Clickable Box */}
          <div
            onClick={handleClick}
            className="mt-14 bg-gradient-to-br from-blue-50 to-indigo-200 border p-4 max-w-sm mx-auto rounded-xl shadow-sm relative hover:shadow-md transition cursor-pointer z-50"
          >
            {quizData?.selectedCareer ? (
              <>
                <h2 className="text-2xl font-semibold font-sora text-center text-gray-900">
                  Let&apos;s Start Your Journey
                </h2>

                <p className="text-center mt-1 text-gray-600 text-base">
                  as{" "}
                  <span className="font-medium text-blue-500 text-xl font-inter capitalize">
                    {quizData?.selectedCareer}
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold font-sora text-center text-gray-900">
                  You haven&apos;t selected a career yet
                </h2>

                <p className="text-center mt-1 text-gray-600 text-base">
                  Select career to get personalised roadmaps.
                </p>
              </>
            )}

            <Image
              src="/element7.png"
              alt="roadmap"
              width={150}
              height={150}
              className="mx-auto mt-3"
            />
          </div>

          <Image
            src="/boxes.png"
            alt="roadmap"
            width={350}
            height={350}
            className="mx-auto mt-6 absolute -right-16 -bottom-24 opacity-30"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="font-sora capitalize text-3xl font-semibold">
            Complete your quiz first
          </h1>
          <p className="font-inter text-lg px-20 text-center mt-2">
            Complete quiz to get personlaised interest and roadmap aligned with
            our goals.
          </p>
          <Button
            className="mt-5 font-inter text-sm"
            onClick={() => router.push("/start-quiz")}
          >
            Start Quiz <LuActivity className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DefaultRoadmap;
