"use client";
import { ArrowRight, Book, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SingleCard = () => {
  const router = useRouter();
  const card = {
    id: 2,
    title: "Connect With Skilled Mentors",
    description:
      "Learn from industry experts who will guide you through your professional journey.",
    accent: "border-indigo-500",
    gradient: "from-yellow-200 to-amber-300",
    textAccent: "text-blue-600",
    buttonGradient: "from-yellow-300 to-amber-400",
    image: "/static1.png",
  };

  return (
    <div className="relative w-full max-w-[1000px] mx-auto p-4">
      <div className="relative h-52 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white flex items-center">
        <div
          className={`absolute -top-14 -left-5 inset-0 bg-gradient-to-r ${card.gradient}/40 blur-2xl w-20 h-36 rounded-full `}
        ></div>
        {/* Left Side - Content */}
        <div className="flex-1 px-12 py-10 relative z-20">
          <div className="max-w-lg">
            <h2 className="text-[27px] font-semibold text-black mb-4 leading-tight font-sora">
              {card.title}
            </h2>
            <p className="text-base text-muted-foreground font-raleway mb-8 leading-snug">
              {card.description}
            </p>

            {/* Call-to-action buttons */}
            <div className="flex items-center gap-8">
              <Button
                className={`bg-gradient-to-r ${card.buttonGradient} text-white rounded-lg font-medium transition-all duration-200 group cursor-pointer`}
                onClick={()=>router.push("/home/mentor-connect")}
              >
                Book Now
                <Book
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
             
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="flex-1 h-full relative">
          <div
            className={`absolute inset-0 bg-gradient-to-l ${card.gradient} opacity-60`}
          ></div>

          <Image
            src={card.image}
            alt={card.title}
            width={200}
            height={200}
            className="absolute w-full h-full object-contain z-10 scale-125"
          />
          <Image
            src="/staic6.png"
            alt="Decorative Element"
            width={300}
            height={300}
            className=" absolute -left-0 -top-10 "
          />
        </div>
      </div>
    </div>
  );
};

export default SingleCard;
