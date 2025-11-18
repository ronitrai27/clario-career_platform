"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import { Button } from "@/components/ui/button";
import { PricingFeaturesTable } from "./Pfeature";
import { TopupCard } from "./TopUp";

const PRICING_PLANS = [
  {
    name: "Free Plan",
    price: 0,
    description: "For Newcomers",
    features: [
      "Limited Access to AI tools",
      "2K+ Welcome Bonus",
      "Limited Features",
    ],
    isFeatured: false,
  },
  {
    name: "Pro Plan",
    price: 699,
    description: "Best for Full Coverage",
    features: [
      "AI Interview Prep (Voice Agent)",
      "AI Resume Maker",
      "AI Personalised Tracks.",
      "100 Credits/ Month",
      "Acess to More advance Features",
    ],
    isFeatured: true,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="w-full  px-4 py-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-inter font-bold text-center mb-8">
          Our Plan Scale With{" "}
          <span className="text-muted-foreground">Your Interests</span>
        </h1>

        {/* Billing Toggle */}
        <div className="mb-12 flex items-center justify-center gap-6">
          <span
            className={`text-sm font-medium ${
              !isYearly ? "text-black" : "text-gray-500"
            }`}
          >
            Monthly Billing
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              isYearly ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isYearly ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isYearly ? "text-black" : "text-gray-500"
              }`}
            >
              Yearly Billing
            </span>
            {isYearly && (
              <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 md:gap-4">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} {...plan} isYearly={isYearly} />
          ))}
          <TopupCard />
        </div>

        {/* Pricing Features Table */}
        <div className="mt-16">
          <PricingFeaturesTable />
        </div>
      </div>
    </div>
  );
}
