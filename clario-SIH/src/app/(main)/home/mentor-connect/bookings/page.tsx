"use client";
import SingleCard from "@/app/(main)/_components/Mentor-card";
import React from "react";
import { LuChevronLeft } from "react-icons/lu";

const Bookings = () => {
  return (
    <div className="w-full h-full bg-gray-50 p-3">
      <SingleCard />

      <div className="mt-4 flex items-center  w-full">
        <p className="text-sm font-inter ml-5 cursor-pointer "><LuChevronLeft className="inline mr-2" /> Back</p>

        <h2 className="font-inter text-2xl font-semibold text-center mx-auto">My Bookings</h2>
      </div>
    </div>
  );
};

export default Bookings;
