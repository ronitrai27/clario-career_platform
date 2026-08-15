"use client";
import React, { useEffect, useState } from "react";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import { getUserQuizData } from "@/lib/functions/dbActions";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IndustryCharts = () => {
  const { user } = useUserData();
  const [careerSkillOptions, setCareerSkillOptions] = useState<string[]>([]);
  const [quizDataLoading, setQuizDataLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setQuizDataLoading(true);
      const data = await getUserQuizData(user.id);

      if (data.length > 0) {
        const firstQuiz = data[0];
        const options = firstQuiz.quizInfo?.careerOptions;

        if (Array.isArray(options)) {
          setCareerSkillOptions(options);
        }
      }
      setQuizDataLoading(false);
    };

    fetchData();
  }, [user?.id]);

  // 🔹 Fake salary data generator
  const chartData = careerSkillOptions.map((career) => ({
    name: career,
    avgSalary: Math.floor(Math.random() * 20 + 40), // 40–60
    highSalary: Math.floor(Math.random() * 30 + 70), // 70–100
  }));

  return (
    <Card className="w-full border rounded-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-sora font-medium">
        <h2>Career Salary Overview</h2>
        <p className="text-xl text-muted-foreground font-inter mt-1">Below is your Career Salary Overview for the suggested careers</p>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[350px]">
        {quizDataLoading ? (
          <p className="text-sm text-gray-500">Loading chart...</p>
        ) : careerSkillOptions.length === 0 ? (
          <p className="text-sm text-gray-500">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-400" />
              <XAxis dataKey="name" tick={{ fontSize: 16 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="avgSalary" fill="#334EFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highSalary" fill="#94AEFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IndustryCharts;
