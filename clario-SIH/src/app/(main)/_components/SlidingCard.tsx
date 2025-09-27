import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  LucideArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const SlidingCards = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cards = [
    {
      id: 1,
      title: "Find Your Dream Job Here",
      description:
        "Discover thousands of opportunities that match your skills and aspirations. ",
      accent: "border-blue-500",
      gradient: "from-blue-300 to-indigo-400",
      textAccent: "text-blue-600",
      buttonGradient: "from-blue-300 to-indigo-400",
      image: "/element4.png",
    },
    {
      id: 2,
      title: "Connect With Skilled Mentors",
      description:
        "Learn from industry experts who will guide you through your professional journey.",
      accent: "border-purple-500",
      gradient: "from-purple-300 to-pink-400",
      textAccent: "text-purple-600",
      buttonGradient: "from-purple-300 to-pink-400",
      image: "/element2.png",
    },
    {
      id: 3,
      title: "Build Your Career Path",
      description:
        "Take control of your professional future with our comprehensive career-building tools.",
      accent: "border-emerald-500",
      gradient: "from-amber-400 to-yellow-200",
      textAccent: "text-emerald-600",
      buttonGradient: "from-amber-400 to-yellow-200",
      image: "/element3.png",
    },
    {
      id: 4,
      title: "Turn Passion Into Profession",
      description:
        "Transform what you love into a successful career. Get guidance, resources, and opportunities.",
      accent: "border-rose-500",
      gradient: "from-rose-300 to-red-400",
      textAccent: "text-rose-600",
      buttonGradient: "from-rose-300 to-red-400",
      image: "/element5.png", // 🔹 you can replace with any image
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [cards.length]);

  const goToSlide = (index: React.SetStateAction<number>) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full max-w-[895px] mx-auto p-4">
      {/* Main Card Container */}
      <div className="relative h-60 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
        <div
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="min-w-full h-full flex items-center relative"
            >
              <div
                className={`absolute -top-14 -left-5 inset-0 bg-gradient-to-r ${card.gradient}/30 blur-2xl w-20 h-36 rounded-full `}
              ></div>
              {/* Left Side - Content */}
              <div className="flex-1 px-12 py-10">
                <div className="max-w-lg">
                  <h2 className="text-[27px] font-semibold text-black mb-4 leading-tight font-sora">
                    {card.title}
                  </h2>
                  <p className="text-base text-muted-foreground font-raleway mb-8 leading-snug">
                    {card.description}
                  </p>

                  {/* Call-to-action button */}
                  <div className="flex items-center gap-8">
                    <Button
                      className={`bg-gradient-to-r ${card.buttonGradient} text-white rounded-lg font-medium transition-all duration-200 group cursor-pointer`}
                    >
                      Get Started
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                    <Button className="cursor-pointer" variant="outline">
                      Lean More <LucideArrowRight size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side - Visual Element */}
              <div className="flex-1 h-full relative">
                {/* Subtle gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-l ${card.gradient} opacity-60`}
                ></div>

                <Image
                  src={card.image}
                  alt={card.title}
                  width={200}
                  height={200}
                  className="absolute  inset-0 w-full h-full object-cover z-10"
                />

                {/* Card number indicator */}
                <div className="absolute bottom-8 right-8">
                  <span
                    className={`text-6xl font-light ${card.textAccent} opacity-20`}
                  >
                    0{card.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-8 space-x-3">
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 cursor-pointer ${
              index === currentSlide
                ? `w-8 h-2 bg-blue-500 rounded-full`
                : "w-2 h-2 bg-slate-400 hover:bg-blue-500 rounded-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SlidingCards;
