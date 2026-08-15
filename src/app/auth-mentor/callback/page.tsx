/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MentorOnboarding from "../_components/mentor-onbaording";
import Image from "next/image";
import { useUserData } from "@/context/UserDataProvider";
import { toast } from "sonner";
import { LuLoader } from "react-icons/lu";

const MentorCallback = () => {
  const supabase = createClient();
  const router = useRouter();
  const { mentor, isNewMentor, loading, ensureUserInDB } = useUserData();

  async function signOut() {
    try {
      await supabase.auth.signOut();
      router.push("/auth-mentor");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  useEffect(() => {
    ensureUserInDB();
  }, []);

  useEffect(() => {
    if (!loading && mentor) {
      const isOnboardingIncomplete =
        typeof window !== "undefined" &&
        localStorage.getItem("isOnboardingDoneMentor") === "false";

      if (isNewMentor) {
        toast(`Welcome aboard, ${mentor?.email}!`);
      } else if (isOnboardingIncomplete || mentor?.is_verified === false) {
        toast("Resuming your onboarding Process");
      } else {
        toast(`Welcome back, ${mentor?.full_name}!`);
        router.push("/dashboard");
      }
    }
  }, [isNewMentor, loading, mentor]);

  if (loading || !mentor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex items-center text-2xl font-raleway font-medium tracking-wide">
          <LuLoader className="animate-spin inlinr mr-4" />
          <p>Validating user...</p>
        </div>
        <p className="mt-8 font-inter text-xl tracking-wide">
          Please wait and tighten your seatbelt
        </p>
      </div>
    );
  }

  const onboardingStatus =
    typeof window !== "undefined"
      ? localStorage.getItem("isOnboardingDoneMentor")
      : null;

  console.log(onboardingStatus);
  if (onboardingStatus === "false" || isNewMentor) {
    return (
      <div className="h-screen w-full relative bg-white ">
        <div className="absolute top-2 left-5 z-50">
          <div className="flex items-center ">
            <Image
              src="/clarioWhite.png"
              alt="logo"
              width={60}
              height={60}
              className=""
            />
            <h1 className="font-raleway text-3xl font-bold text-white">
              Clario
            </h1>
          </div>
        </div>
        {/* <Button onClick={signOut}>Sign out</Button> */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
          }}
        />
        <div className="flex items-center justify-center h-full z-50 relative">
          <MentorOnboarding />
        </div>

        {/* just for testing */}
        {/* <div className="absolute bottom-5 right-0 z-50">
          <Button onClick={signOut} className="cursor-pointer">
            Sign out
          </Button>
        </div> */}
      </div>
    );
  }
};

export default MentorCallback;
