"use client";
import { PricingSection } from "@/app/(main)/_components/Psection";
import React from "react";

const Billing = () => {
  return (
    <div className="bg-gray-50 w-full h-full flex flex-col items-center justify-center py-8 px-5">
      <div className="px-6 py-1 bg-gradient-to-br from-indigo-50 to-rose-200 border rounded-full shadow">
        <p className="font-inter text-sm "> Flexibile Pricing</p>
      </div>

      <PricingSection />
    </div>
  );
};

export default Billing;
