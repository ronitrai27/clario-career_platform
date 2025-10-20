"use client";

import { Separator } from "@/components/ui/separator";
import SingleCard from "../../_components/InterviewSingleCard";
import { LuCircleFadingArrowUp } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { LucideActivity, LucideHistory } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { InterviewFeedback } from "@/lib/types/allTypes";
import { useUserData } from "@/context/UserDataProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const InterviewDefault = () => {
  const { user } = useUserData();
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InterviewFeedback | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user?.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("others")
        .select("*")
        .eq("userId", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase fetch error:", error);
      } else {
        setFeedbacks(data as InterviewFeedback[]);
      }
      setLoading(false);
    };

    fetchFeedbacks();
  }, [user]);

  return (
    <div className="bg-gray-50 h-full overflow-hidden w-full px-2 py-4">
      <SingleCard />
      <div className="mt-6 flex w-full h-full">
        {/* LEFT SIDE */}
        <div className="w-[320px] flex flex-col px-1">
          <h1 className="text-2xl font-semibold font-sora mb-8">
            Create AI Interviews
          </h1>
          <div className="w-full px-4">
            {" "}
            <h2 className="font-medium font-inter text-base">
              Create New Interview{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />
            </h2>
            <Button
              className="text-sm font-inter mt-4 w-full"
              variant="outline"
            >
              Create New{" "}
              <LuCircleFadingArrowUp className="inline w-5 h-5 ml-2" />{" "}
            </Button>
            <h2 className="font-medium font-inter text-base mt-5">
              Create From Job Tracker Board{" "}
              <LucideActivity className="inline w-5 h-5 ml-2" />
            </h2>
            <Button
              className="text-sm font-inter mt-4 w-full"
              variant="outline"
            >
              Job Tracker <LucideActivity className="inline w-5 h-5 ml-2" />{" "}
            </Button>
          </div>
          <div className="h-[180px] bg-gradient-to-br from-yellow-50 via-yellow-200 to-yellow-400 w-full mt-10 rounded-lg p-2 relative overflow-hidden">
            <Image
              src="/element1.png"
              alt="element"
              width={200}
              height={200}
              className="w-full h-full object-cover absolute -left-28"
            />
            <h2 className="font-extrabold font-inter text-black text-4xl absolute top-[34%] right-[40%]">
              5
            </h2>
            <h2 className="font-medium font-inter text-black text-xl absolute top-[60%] right-5 text-center max-w-[180px]">
              Interview Creation left for this month
            </h2>
          </div>
        </div>
        <Separator orientation="vertical" className="mx-2 " />
        {/* Right side */}
        <div className="flex-1 h-full bg-white rounded-md p-4">
          <h1 className="text-2xl font-semibold font-sora tracking-wide ml-4 -mt-4">
            Interviews History <LucideHistory className="inline w-6 h-6 ml-2" />
          </h1>
          {feedbacks.length > 0 ? (
            // All cards will be displayed
            <div className="grid grid-cols-3 gap-5 mt-6">
              {feedbacks.map((fb) => {
                const ratings = fb.interviewInsights.feedback.rating;
                const avgScore = (
                  Object.values(ratings).reduce(
                    (acc, val) => acc + (val || 0),
                    0
                  ) / Object.keys(ratings).length
                ).toFixed(1);

                return (
                  <Card
                    key={fb.id}
                    onClick={() => setSelected(fb)}
                    className="p-3 cursor-pointer hover:scale-[1.02] transition-all border border-gray-200 shadow-sm"
                  >
                    <h3 className="font-inter font-semibold text-base capitalize tracking-tight ">
                      {fb.jobTitle || "Interview "}
                    </h3>
                    <p className="text-sm text-muted-foreground font-inter -mt-4">
                      {format(new Date(fb.created_at), "dd MMM yyyy, hh:mm a")}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-inter text-sm text-gray-600">
                        Avg. Score
                      </p>
                      <p className="font-sora font-semibold text-blue-600 text-base">
                        {avgScore}/10
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div>
              <p>nothing found </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Dialog ---------- */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sora text-xl">
              {selected?.jobTitle}
            </DialogTitle>
            <p className="text-sm text-gray-500">
              {selected &&
                format(new Date(selected.created_at), "dd MMM yyyy, hh:mm a")}
            </p>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 mt-4">
              {Object.entries(selected.interviewInsights.feedback.rating).map(
                ([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{key}</span>
                      <span className="text-gray-600">{value ?? 0}/10</span>
                    </div>
                    <Progress value={(value ?? 0) * 10} />
                  </div>
                )
              )}

              <div className="mt-5">
                <h4 className="font-sora font-semibold mb-2">Summary</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.interviewInsights.feedback.summary}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InterviewDefault;
