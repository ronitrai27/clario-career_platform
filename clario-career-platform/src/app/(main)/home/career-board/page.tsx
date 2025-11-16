"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cpu, TrendingUp, Users, ListChecks } from "lucide-react";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import { getUserQuizData } from "@/lib/functions/dbActions";
import IndustryCharts from "../../_components/industryCharts";
import CareerTabsDemo from "../../_components/industryJobs";
import SingleCard from "../../_components/IndustrySingleCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuizData } from "@/context/userQuizProvider";
import CoursesList from "../../_components/CourseData";

const skills = [
  "Python",
  "Machine Learning",
  "Data Analysis",
  "SQL",
  "Statistics",
];

const CareerBoard = () => {
  const { user, loading } = useUserData();
  const router = useRouter();
  const { quizData } = useQuizData();

  return (
    <div className="bg-gray-50 w-full h-full p-4 pt-8">
      <SingleCard />

      {user?.isQuizDone === false ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-4xl font-semibold font-sora">
            Complete Your Quiz First!
          </h2>
          <p className="text-gray-800 max-w-lg font-inter">
            You need to complete the quiz to unlock Industry Insights. Take the
            quiz now to access valuable data and insights tailored for you.
          </p>
          <Button
            className="rounded-md shadow-md cursor-pointer font-inter text-base mt-10 bg-gradient-to-b from-blue-300 to-blue-500 text-white hover:-translate-y-1 duration-200"
            onClick={() => router.push("/start-quiz")}
          >
            Start Quiz
          </Button>
        </div>
      ) : !quizData?.selectedCareer ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-6 text-center">
          <h2 className="text-4xl font-semibold font-sora">
            You Haven’t Selected a Career Yet!
          </h2>
          <p className="text-gray-800 max-w-lg font-inter">
            Kindly select a career to unlock Industry Insights, jobs, and more
            personalized data for your growth.
          </p>
          <Button
            className="rounded-md shadow-md cursor-pointer font-inter text-base mt-10 bg-gradient-to-b from-blue-300 to-blue-500 text-white hover:-translate-y-1 duration-200"
            onClick={() => router.push("/home/ai-tools/career-coach")}
          >
            Select Career
          </Button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 px-4 w-full mt-10">
            {/* 1. Selected Career */}
            <Card className="flex-1 p-3">
              <CardHeader className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-lg font-inter">
                  Selected Career
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-2xl font-inter font-semibold">
                  {quizData?.selectedCareer}
                </p>
                <p className="text-base mt-auto text-muted-foreground font-inter">
                  Your selected career
                </p>
              </CardContent>
            </Card>

            {/* 2. Industry Growth */}
            <Card className="flex-1 p-3">
              <CardHeader className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <CardTitle className="text-lg font-inter">
                  Industry Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-2xl font-inter font-semibold">12.5%</p>
                <Progress
                  value={4.5}
                  max={10}
                  className="mt-2 h-2 rounded-full"
                />
                <p className="text-base mt-auto text-muted-foreground font-inter">
                  Industry Growth Rate
                </p>
              </CardContent>
            </Card>

            {/* 3. Demand Level */}
            <Card className="flex-1 p-3">
              <CardHeader className="flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-500" />
                <CardTitle className="text-lg font-inter">
                  Demand Level
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-2xl font-inter font-semibold">High</p>
                <Progress
                  value={100}
                  max={100}
                  className="mt-2 h-2 rounded-full"
                />
                <p className="text-base mt-auto text-muted-foreground font-inter">
                  Job Market Demand
                </p>
              </CardContent>
            </Card>

            {/* 4. Skills Required */}
            <Card className="flex-1 p-3 border border-gray-800 rounded-md bg-gradient-to-br from-gray-600 to-gray-800">
              <CardHeader className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-purple-500" />
                <CardTitle className="text-lg font-inter text-white">
                  Top Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 space-y-2 mt-2">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className=" whitespace-nowrap text-white p-1 rounded-md text-sm font-sora tracking-tight  "
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full mt-20 px-4">
            <IndustryCharts />
          </div>
          <div className="mt-20">
            <CareerTabsDemo />
          </div>
        </>
      )}
    </div>
  );
};

export default CareerBoard;
