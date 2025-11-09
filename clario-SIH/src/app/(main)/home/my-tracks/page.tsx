"use client";
import Image from "next/image";
import React from "react";

const MyTracks = () => {
  return (
    <div className="bg-gray-50 h-full w-full p-4">
      {/* ======STARTER SINGLE CARD====== */}
      <div className="w-[90%] h-[220px] bg-gradient-to-br from-indigo-300 to-rose-400 rounded-lg mx-auto relative overflow-hidden p-4">
        <Image
          src="/tr1.png"
          alt="tr"
          width={200}
          height={200}
          className=" absolute -right-10 -bottom-20"
        />

        <div className="flex">
          <div className="w-[500px] mt-5">
            <h2 className="font-extrabold font-inter text-4xl text-white ml-2">
              Your Active Track To Success
            </h2>
            <p className="text-gray-200 font-inter text-lg mt-3">
              Complete the all Tracks to earn skills, Badges and unlock your dream job
            </p>
          </div>
          {/* RIGHT SIDE ACTIVE TRACK */}
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default MyTracks;
