"use client";

import { useState, useEffect } from "react";
import { ChevronRight, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Chevron } from "react-day-picker";

const cards = [
  {
    id: 1,
    title: "Get Industry Insights",
    description:
      "Jobs, courses, colleges, and much more to help you prepare for your career.",
    gradient: "from-blue-200 to-blue-600",
    image: "/element8.png",
  },
  {
    id: 2,
    title: "Know Your Career Fit",
    description:
      "Personalized AI assestment to help you determine whether you're ready for your career.",
    gradient: "from-yellow-100 to-amber-500",
    image: "/sec6.png",
  },
];

const SingleCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[1080px] mx-auto overflow-hidden ">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="min-w-full h-52 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white flex items-center relative"
          >
            {/* Gradient Glow */}
            <div
              className={`absolute -top-14 -left-5 inset-0 bg-gradient-to-r ${card.gradient} blur-3xl w-20 h-36 rounded-full`}
            ></div>

            {/* Left Content */}
            <div className="flex-1 px-12 py-10 relative z-20">
              <div className="max-w-lg">
                <h2 className="text-[27px] font-semibold text-black mb-4 leading-tight font-inter">
                  {card.title}
                </h2>
                <p className="text-base  font-inter mb-8 leading-snug">
                  {card.description}
                </p>

                <div className="flex items-center gap-8">
                  {card?.id === 1 ? (
                    <Button className="cursor-pointer" variant="outline">
                      Learn More <LucideArrowRight size={18} />
                    </Button>
                  ) : (
                    <Button className="cursor-pointer font-inter" variant="outline">
                      Check Out <ChevronRight size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 h-full relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`}
              ></div>
              <Image
                src={card.image}
                alt={card.title}
                width={200}
                height={200}
                className="absolute w-full h-full object-contain z-10 scale-125"
              />
              <Image
                src={card.id === 1 ? "/static7.png" : "/staic6.png"}
                alt="Decorative Element"
                width={800}
                height={800}
                className="absolute w-full h-full -top-2"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-500 ${
              currentIndex === index ? "bg-blue-500 w-4" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SingleCard;
