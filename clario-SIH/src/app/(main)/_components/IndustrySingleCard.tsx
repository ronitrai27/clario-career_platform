import { ArrowRight, Book, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const SingleCard = () => {
  const card = {
    id: 2,
    title: "Get Industry Insights",
    description:
      "Jobs , courses , colleges and much more to help you prepare for your career",
    accent: "border-indigo-500",
    gradient: "from-blue-200 to-indigo-300",
    textAccent: "text-blue-600",
    buttonGradient: "from-blue-300 to-purple-400",
    image: "/element8.png",
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
             
              <Button className="cursor-pointer" variant="outline">
                Learn More <LucideArrowRight size={18} />
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
            src="/static7.png"
            alt="Decorative Element"
            width={800}
            height={800}
            className=" absolute w-full h-full -top-2 "
          />
        </div>
      </div>
    </div>
  );
};

export default SingleCard;
