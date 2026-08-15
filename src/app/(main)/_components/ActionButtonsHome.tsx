"use client";

import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { Activity, ActivityIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Image from "next/image";
import { LuX } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { useQuizData } from "@/context/userQuizProvider";

export default function ActionsButtons() {
  const { user } = useUserData();
  const { quizData, loadingQuiz } = useQuizData();
  const router = useRouter();

  return (
    <div className="flex items-center gap-10">
      {/* QUIZ BUTTON */}
      {user?.isQuizDone === false && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-md shadow-md cursor-pointer font-inter text-base bg-gradient-to-b from-blue-300 to-blue-500 text-white hover:-translate-y-1 duration-200">
              Start Quiz <Activity className="ml-2" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-gradient-to-tr from-blue-200 to-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-sora mt-1 font-semibold text-center">
                Ready to start your quiz?
              </DialogTitle>
              <DialogDescription className=" font-inter  text-lg text-center leading-snug">
                This will help us generate personalized insights, customized
                roadmaps, and better career options for you.
              </DialogDescription>
            </DialogHeader>
            <div className="-mt-24">
              <Image
                src="/element1.png"
                alt="logo"
                width={200}
                height={200}
                className="h-full w-full object-cover"
              />
            </div>

            <DialogFooter className="-mt-8">
              <div className="flex items-center justify-center w-full gap-20">
                <DialogClose asChild>
                  <Button variant="outline">
                    Cancel <LuX className="ml-2" />
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => router.push("/start-quiz")}
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600"
                >
                  Start Quiz <ActivityIcon className="ml-2" />
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* DYNAMIC BUTTON */}

      <div className="">
        {quizData?.selectedCareer ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="font-sora text-base text-black bg-white py-2 px-4 shadow-sm rounded-md cursor-default">
                  <span className="font-medium font-inter">Career:</span>{" "}
                  {quizData.selectedCareer}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-inter text-sm max-w-[200px]">
                Your current career: <b>{quizData.selectedCareer}</b>.
                You can manually edit it anytime in your profile.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="outline"
            className="rounded-md shadow-md cursor-pointer font-inter text-base text-black hover:-translate-y-1 duration-200"
            onClick={() => router.push("/home/ai-tools/career-coach")}
          >
            Plan Your Career
          </Button>
        )}
      </div>
    </div>
  );
}
