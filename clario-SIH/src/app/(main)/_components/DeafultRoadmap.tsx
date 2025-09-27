"use client";
import { useQuizData } from "@/context/userQuizProvider";
import Image from "next/image";
import React from "react";

interface DefaultRoadmapProps {
  setField: (val: string) => void;
  fetchRoadmap: () => void;
}

const DefaultRoadmap: React.FC<DefaultRoadmapProps> = ({ setField, fetchRoadmap }) => {
  const { quizData } = useQuizData();

  const handleClick = () => {
    if (quizData?.selectedCareer) {
      setField(quizData.selectedCareer);
      fetchRoadmap();
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-200 h-full p-4 relative overflow-hidden flex flex-col justify-center">
      <h2 className="capitalize text-4xl text-balance font-extrabold tracking-wide font-inter text-center -mt-4">
        welcome to your personalised learning roadmap
      </h2>

      <p className="text-muted-foreground text-center font-sora text-lg mt-6 px-6">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maiores animi
        placeat numquam provident repellendus quis enim deserunt delectus! Rem,
        esse!
      </p>

      {/* Clickable Box */}
      <div
        onClick={handleClick}
        className="mt-14 bg-white border border-gray-200 p-5 max-w-sm mx-auto rounded-xl shadow-sm relative hover:shadow-md transition cursor-pointer z-50"
      >
        <h2 className="text-2xl font-semibold font-sora text-center text-gray-900">
          Let’s Start Your Journey
        </h2>

        <p className="text-center mt-1 text-gray-600 text-base">
          as{" "}
          <span className="font-medium text-blue-500 text-xl font-inter capitalize">
            {quizData?.selectedCareer}
          </span>
        </p>

        <Image
          src="/element7.png"
          alt="roadmap"
          width={140}
          height={140}
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
    </div>
  );
};

export default DefaultRoadmap;
