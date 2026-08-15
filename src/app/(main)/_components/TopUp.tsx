"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRazorpayStore } from "@/lib/store/RazorpayStore";

const TOP_UP_OPTIONS = [25, 50, 100, 200];

export function TopupCard() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);

  const { setAmount, startPayment, loading } = useRazorpayStore();

  const discountedPrice = selectedAmount * 20 - 90; 
  const razorpayAmount = discountedPrice; 

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white/50 p-6 backdrop-blur transition-all duration-300">
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Top Up Credits</h3>

        <div className="flex items-baseline gap-3">
          <p className="text-4xl font-bold text-black">₹{discountedPrice}</p>

          <p className="text-2xl text-gray-500 line-through">
            ₹{selectedAmount * 20}
          </p>

          <span className="text-gray-500 text-sm">One Time</span>
        </div>

        <p className="text-sm text-gray-600">Boost your credits anytime</p>
      </div>

      {/* Credit Amount Selection */}
      <div className="mb-6 grid grid-cols-2 gap-5">
        {TOP_UP_OPTIONS.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`rounded-lg border-2 py-3 font-semibold transition-all ${
              selectedAmount === amount
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white text-gray-800 hover:border-gray-400"
            }`}
          >
            {amount}
          </button>
        ))}
      </div>

      {/* Razorpay trigger */}
      <Button
        onClick={() => {
          setAmount(razorpayAmount); 
          startPayment();
        }}
        disabled={loading}
        className="mb-6 rounded-full border border-gray-800 bg-transparent font-semibold text-gray-800 transition-colors hover:bg-gray-100"
        variant="outline"
      >
        {loading ? "Processing..." : "Top Up Now"}
      </Button>
    </div>
  );
}
