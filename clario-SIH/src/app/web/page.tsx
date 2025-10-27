"use client";
import { Button } from "@/components/ui/button";
import NavbarWeb from "@/components/web-content/navbar";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { LightRays } from "@/components/ui/light-rays";
import Link from "next/link";
import React from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LuChevronRight, LuPlus, LuTrendingUp, LuVideo } from "react-icons/lu";
import Image from "next/image";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Separator } from "@/components/ui/separator";

const Webpage = () => {
  return (
    <div className="min-h-screen w-full">
      <NavbarWeb />
      {/* Hero page */}
      <main className="flex flex-col items-center justify-center sm:mt-14 mt-10  h-full w-full relative">
        {/* Introducing Clario */}
        <div className="z-10 flex  items-center justify-center">
          <div
            className={cn(
              "group rounded-full border border-blue-800/30 bg-blue-50 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-50 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            )}
          >
            <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out text-muted-foreground font-inter hover:text-neutral-600 hover:duration-300 tracking-wide font-extralight">
              <span>✨ Introducing Clario</span>
              <LuChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
            </AnimatedShinyText>
          </div>
        </div>
        {/* main text */}
        <div className="flex flex-col space-y-3 mb-2 mt-5">
          <div className="flex md:flex-row flex-col gap-2 mt-10">
            <h1 className="md:text-7xl text-6xl bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-300 text-transparent bg-clip-text tracking-tight font-sora font-extrabold">
              Collaborate
            </h1>
            <div className="flex items-center justify-center">
              <div className="flex -space-x-6">
                <Image
                  src="/a1.png"
                  alt="Client 1"
                  width={58}
                  height={58}
                  className="rounded-full h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] border-2 border-white shadow-md object-cover"
                />
                <Image
                  src="/a2.png"
                  alt="Client 2"
                  width={58}
                  height={58}
                  className="rounded-full  h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] border-2 border-white shadow-md object-cover"
                />
                <Image
                  src="/a3.png"
                  alt="Client 3"
                  width={58}
                  height={58}
                  className="rounded-full  h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] border-2 border-white shadow-md object-cover"
                />
              </div>
            </div>

            <h1 className="md:text-7xl  tracking-tight font-sora font-extrabold">
              Discover <LuTrendingUp className="inline-block text-yellow-500" />
            </h1>
          </div>
          <div className="flex gap-3 items-center justify-center">
            <h1 className="md:text-6xl  tracking-tight font-sora font-extrabold">
              Thrive.
            </h1>
            <h2 className="md:text-5xl tracking-wide font-inter font-black text-muted-foreground">
              Anytime & Anywhere
            </h2>
          </div>
        </div>

        {/* Secondary text */}
        <p className="max-w-[700px] mx-auto text-center font-inter text-muted-foreground text-xl my-3">
          Get clear about your path, and confident in your next step. Clario
          helps you learn, plan, and grow your career with purpose.
        </p>

        {/* IMAGE */}
        <div className=" relative  w-fit ">
          <Image
            src="/hero1.png"
            width={500}
            height={500}
            alt="img"
            className="object-cover md:h-[660px] h-[300px]  w-full rounded-lg"
          />

          <div className="bg-blue-50 p-2 rounded-lg shadow-lg absolute top-0 -rotate-6 ">
            <Image
              src="/hero3.png"
              width={100}
              height={100}
              alt="img"
              className="object-cover  h-[150px] w-[150px] rounded-md "
            />
          </div>

          <div className="bg-yellow-50 border border-dashed border-yellow-500 p-3 rounded-lg absolute bottom-4 -right-10 w-[270px] h-[160px] flex items-center justify-center">
            <h1 className="font-inter text-lg leading-relaxed tracking-wide">
              <LuVideo className="inline-block text-yellow-500 text-3xl" />{" "}
              Connect with Expert mentors on 1:1 Video call{" "}
              <span className="text-gray-400">and gain practical insights</span>
            </h1>
          </div>
        </div>

        <Image
          src="/hero2.png"
          width={100}
          height={100}
          alt="img"
          className="object-cover absolute top-44 right-48 -rotate-12"
        />
      </main>

      {/* SECTION 2  STATS*/}
      <section className="my-20 px-4 py-4 w-full max-w-[1350px] mx-auto relative ">
        <div className="flex justify-between w-full ">
          <div>
            <h2 className=" text-muted-foreground font-inter text-3xl font-extrabold opacity-40">
              OUR FOCUS IS CLEAR
            </h2>
            <h1 className="md:text-6xl font-sora font-extrabold mt-3">
              Providing{" "}
              <span className="bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-300 text-transparent bg-clip-text tracking-tight font-sora font-extrabold">
                Clarity
              </span>
            </h1>
          </div>

          <div className="max-w-[500px] ">
            <p className="font-inter text-lg text-muted-foreground font-light tracking-tight leading-loose">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam
              eveniet amet optio magni doloremque porro eos
            </p>
          </div>
        </div>

        <div className="flex  w-[100%] gap-20">
          {/* LEFT SIDE */}
          <div className="w-[50%]">
            <div className="flex mt-10 w-full gap-8">
              <div className="flex flex-col space-y-5 w-full">
                {/* 1 */}
                <div className="border rounded-xl p-4 h-[360px] flex flex-col">
                  <h2 className="font-inter font-semibold opacity-50 tracking-tight">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Dicta, dolorum.
                  </h2>

                  <div className="mt-auto flex items-center justify-between">
                    <h2 className="font-sora text-5xl font-extrabold">90% </h2>
                    <p>Lorem, ipsum dolor.</p>
                  </div>
                </div>
                {/* 2 */}
                <div className="border rounded-xl p-4 h-[120px] flex items-center justify-center gap-5">
                  <div className="flex -space-x-5">
                    <Image
                      src="/a1.png"
                      alt="Client 1"
                      width={58}
                      height={58}
                      className="rounded-full h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
                    />
                    <Image
                      src="/a4.png"
                      alt="Client 2"
                      width={58}
                      height={58}
                      className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
                    />
                    <Image
                      src="/a3.png"
                      alt="Client 3"
                      width={58}
                      height={58}
                      className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
                    />
                    <div
                      className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md bg-white flex items-center
               justify-center"
                    >
                      <LuPlus className="text-[25px] text-black cursor-pointer" />
                    </div>
                  </div>
                  <p className="font-semibold font-inter text-xl">200+ </p>
                </div>
              </div>

              <div className="flex flex-col space-y-5 w-full">
                <div className="border rounded-xl p-4 h-[360px] flex flex-col">
                  <p className="font-inter text-lg tracking-tight leading-tight">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Amet aliquam eaque nulla!
                  </p>
                  <div className="mt-auto">
                    <p className="text-5xl font-extrabold font-sora">500+</p>
                    <p>Lorem ipsum dolor sit.</p>
                  </div>
                </div>
                <div className=" p-4 h-[120px]">
                  <p className="font-inter tracking-tight text-blue-600">
                    Lorem ipsum dolor sit amet consectetur adipisicing. Libero,
                    iure.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* RIGHT SIDE */}
          <div className="w-[45%] bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl relative overflow-hidden p-4 flex flex-col">
            <h2 className="font-inter text-white text-xl tracking-tight ">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. A
              veritatis vel totam dolores excepturi, quod obcaecati eaque modi
              beatae mollitia?
            </h2>
            <LuTrendingUp className="absolute w-[400px] h-[400px] text-white opacity-15 -left-10 -bottom-5" />

            <div className="mt-auto flex justify-between">
              <p className="font-sora text-6xl font-extrabold text-white">
                4.8/5
              </p>
              <div></div>
            </div>
          </div>
        </div>

        <Image
          src="/sec2.png"
          alt="sec"
          width={200}
          height={200}
          className="absolute  -top-10 left-[36%]"
        />
      </section>

      {/* SECTION 3 FEATURE*/}

      <section className="my-20 px-4 py-4 w-full max-w-[1400px] mx-auto relative min-h-screen">
        <div className="w-full flex items-center justify-between">
          <div>
            <h2 className=" text-muted-foreground font-inter text-3xl font-extrabold opacity-40">
              WELCOME TO CLARIO
            </h2>
            <h1 className="md:text-3xl font-sora font-extrabold mt-3">
              Lorem ipsum dolor sit amet consectetur.
              <span className="bg-gradient-to-br from-blue-700 via-blue-500 to-indigo-300 text-transparent bg-clip-text tracking-tight font-sora font-extrabold">
                Clarity
              </span>
            </h1>
          </div>

          <div className=" flex items-center gap-3">
            <div className="border rounded-full py-1 px-2 w-fit">
              <p className="font-inter font-light tracking-wide">intelligent</p>
            </div>
            <div className="border rounded-full py-1 px-2 w-fit">
              <p className="font-inter font-light tracking-wide">Desire</p>
            </div>
            <div className="border rounded-full py-1 px-2 w-fit">
              <p className="font-inter font-light tracking-wide">Sexy</p>
            </div>
            <div className="border rounded-full py-1 px-2 w-fit">
              <LuPlus className="text-[20px] text-black cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="mt-20 md:w-[1080px] md:h-[350px] mx-auto rounded-xl overflow-hidden relative">
          {/* Background Image */}
          <Image
            src="/sec4.jpg"
            alt="background"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />

          <Image
            src="/sec6.png"
            alt="overlay"
            width={200}
            height={200}
            className="absolute bottom-0 left-[25%] -translate-x-1/2 w-1/2 h-full transform  object-contain z-10"
          />

          <Image
            src="/sec7.png"
            alt="overlay"
            width={200}
            height={200}
            className="absolute bottom-0 left-[60%] -translate-x-1/2 w-1/2 h-full transform  object-contain z-10"
          />

          <div className="bg-white/20 backdrop-blur-md w-[220px] h-[140px] rounded-xl p-3 absolute right-2 bottom-2"></div>
        </div>

        {/* 3 BOXES WHY CHOOSE US */}
        <h2 className=" text-blue-600 font-inter text-3xl font-extrabold  text-center mt-20">
          WHY CLARIO
        </h2>
        <h1 className="mt-2 text-5xl font-extrabold text-center font-sora">
          Lorem ipsum, dolor sit amet consectetur.
        </h1>
        <p className="font-inter text-xl opacity-50 mt-2 text-center tracking-wide text-muted-foreground ">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit.lorem5
        </p>
        <div className="w-full grid md:grid-cols-3 justify-items-center mt-20 md:max-w-[1080px] mx-auto ">
          {/* 1 */}
          <div className="w-[320px] h-[320px] rounded-xl bg-gradient-to-br from-slate-600 to-slate-900 p-4 flex flex-col">
            <div className="flex -space-x-5">
              <Image
                src="/a1.png"
                alt="Client 1"
                width={58}
                height={58}
                className="rounded-full h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
              />
              <Image
                src="/a4.png"
                alt="Client 2"
                width={58}
                height={58}
                className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
              />
              <Image
                src="/a3.png"
                alt="Client 3"
                width={58}
                height={58}
                className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
              />
              <div
                className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md bg-white flex items-center
               justify-center"
              >
                <LuPlus className="text-[25px] text-black cursor-pointer" />
              </div>
            </div>

            <p className="text-muted-foreground mt-8 font-inter text-base tracking-tight">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti,
              numquam.
            </p>

            <div className="mt-auto">
              <Separator className="my-4 bg-muted-foreground" />

              <h2 className="font-sora text-lg font-semibold text-white">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </h2>
            </div>
          </div>
          {/* 2 */}
          <div className="w-[320px] h-[320px] rounded-xl bg-gradient-to-br from-blue-300 to-blue-700 p-4 flex flex-col relative overflow-hidden">
            <Image
              src="/element7.png"
              alt="ele"
              width={100}
              height={100}
              className="w-full h-full object- absolute opacity-50 inset-0"
            />

            <p className="text-white font-inter text-base tracking-tight">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti,
              numquam.
            </p>

            <div className="mt-auto">
              <h2 className="font-sora text-lg font-semibold text-white backdrop-blur-xl px-2 py-4 rounded-xl overflow-hidden">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </h2>
            </div>
          </div>

          {/* 3 */}
          <div className="w-[320px] h-[320px] rounded-xl bg-gradient-to-br from-blue-100 to-indigo-700 shadow-md border border-gray-200 p-4 flex flex-col relative overflow-hidden">
            <div className="p-2 backdrop-blur-lg bg-white/30 rounded-xl">
              <div className="flex items-center gap-4">
                <Image
                  src="/a4.png"
                  alt="Client 2"
                  width={58}
                  height={58}
                  className="rounded-full  h-[50px] w-[50px] sm:h-[50px] sm:w-[50px] border-2 border-white shadow-md object-cover"
                />
                <p className="font-inter text-white ">Rakesh sharma</p>
              </div>

              <p className="font-sora text-4xl font-extrabold text-white mt-5 ">500+</p>
              <p className="font-inter text-base text-white tracking-tight mt-2">Lorem ipsum dolor sit amet cons.</p>
            </div>

            <h2 className="font-sora text-2xl tracking-tight font-semibold mt-auto text-center">Lorem, ipsum dolor.</h2>
            <p className="font-inter text-lg text-center leading-tight mt-2">Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          </div>
        </div>
      </section>

      {/* <SmoothCursor /> */}
    </div>
  );
};

export default Webpage;
