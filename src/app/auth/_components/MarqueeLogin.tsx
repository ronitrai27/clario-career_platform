"use client";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Loreal",
    username: "@loreal_fredz",
    body: "Actually I love this platform offers so much of features to use.",
    img: "/a1.png",
  },
  {
    name: "Genny",
    username: "@Genny-097",
    body: "Just found wonderful mentorship platform. thats amazing!",
    img: "a2.png",
  },
  {
    name: "John",
    username: "@john",
    body: "The platform is so easy to use. I love it.",
    img: "/a6.png",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "i just got internship by using this platform. I love it.",
    img: "/a3.png",
  },
  {
    name: "Marta",
    username: "@marta",
    body: "alumni connect and mentor support, i used this while preparing for my competitive exams",
    img: "/a4.png",
  },
  {
    name: "James",
    username: "@james",
    body: "clario is so easy to use, fun and amazing. i must recomened this platform",
    img: "/a5.png",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-60 cursor-pointer overflow-hidden rounded-xl border px-3 py-2",
        // light styles
        "bg-gradient-to-br from-gray-100/50 via-white/60 to-blue-200 border border-white",
      )}
    >
      <div className="flex flex-row items-center gap-2 ">
        <img className="rounded-full" width="30" height="30" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium font-inter">
            {name}
          </figcaption>
          <p className="text-xs font-medium font-inter">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm tracking-tight leading-tight font-raleway">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/10"></div> */}
    </div>
  );
}