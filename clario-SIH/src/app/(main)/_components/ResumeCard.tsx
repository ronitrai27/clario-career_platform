import { ArrowRight, Book, LucideArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ResumeCard = () => {
  const card = {
    id: 2,
    title: "ATS friendly Resume Builder",
    description:
      "Create a professional resume optimized for Applicant Tracking Systems (ATS) to increase your chances of landing your dream job.",
    accent: "border-amber-500",
    gradient: "from-purple-200 to-indigo-400",
    textAccent: "text-blue-600",
    buttonGradient: "from-blue-500 to-indigo-600",
    image: "/re1.png",
  };

  return (
    <div className="relative w-full max-w-[1200px] mx-auto p-4">
      <div className="relative h-52 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white flex items-center">
        <div
          className={`absolute -top-14 -left-5 inset-0 bg-gradient-to-r ${card.gradient}/40 blur-2xl w-20 h-36 rounded-full `}
        ></div>
        {/* Left Side - Content */}
        <div className="flex-1 px-12 py-10 relative z-20">
          <div className="max-w-lg">
            <h2 className="text-[27px] font-bold text-black mb-4 leading-tight font-inter">
              {card.title}
            </h2>
            <p className="text-base text-gray-700 font-inter mb-8 ">
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
            className="absolute w-full h-full object-contain z-10 scale-125 top-3"
          />
          <Image
            src="/ca2.png"
            alt="Decorative Element"
            width={200}
            height={200}
            className=" absolute -right-16 -bottom-16 "
          />
           <Image
            src="/hero2.png"
            alt="Decorative Element"
            width={65}
            height={65}
            className=" absolute -left-40 top-0 -rotate-12 "
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
