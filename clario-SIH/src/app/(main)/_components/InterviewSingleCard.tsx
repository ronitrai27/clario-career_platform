import { ArrowRight, Book, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const SingleCard = () => {
  const card = {
    id: 2,
    title: "Prepare for your Career",
    description:
      "Practise Interview with most powerful AI Agent and Live video calls and Get Insights.",
    accent: "border-amber-500",
    gradient: "from-yellow-100 to-yellow-400",
    textAccent: "text-blue-600",
    buttonGradient: "from-amber-300 to-yellow-400",
    image: "/prep2.png",
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
                Start Now <LucideArrowRight size={18} />
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
