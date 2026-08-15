"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { LuLoader } from "react-icons/lu";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);

  const messages = [
    "Checking connection...",
    "Configuring session...",
    "Almost there...",
  ];

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // Animate loading messages
      messages.forEach((_, i) => {
        setTimeout(() => setStep(i), i * 1000);
      });

      if (error) {
        console.log("❌ Error fetching session:", error.message);
        setTimeout(() => router.replace("/auth"), 3000);
        return;
      }

      if (session && session.user) {
        console.log("✅ Session found:", session.user.email);

        // Check role from user_metadata
        const role = session.user.user_metadata?.role;
        if (role === "mentor") {
          setTimeout(() => router.replace("/auth-mentor/callback"), 3000);
        } else {
          setTimeout(() => router.replace("/auth/callback"), 3000);
        }
      } else {
        console.log("❌ No session, redirecting to /web");
        // web----
        setTimeout(() => router.replace("/auth"), 3000);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(125% 125% at 50% 10%, #ffffff 40%, #6366f1 100%)
          `,
          backgroundSize: "100% 100%",
        }}
      />
      <main className="z-50 relative flex flex-col items-center justify-center w-full h-full">
        <div className="flex items-center">
          <Image src="/clarioBlack.png" alt="logo" width={80} height={80} priority/>
          <h1 className="font-raleway text-3xl font-bold ml-2">Clario</h1>
        </div>

        <h2 className="capitalize text-xl font-raleway font-semibold tracking-wide mt-2">
          One Stop Path to your future
        </h2>

        <p className="mt-14 font-inter text-lg flex items-center gap-3">
          <LuLoader className="animate-spin text-2xl" /> {messages[step]}
        </p>
      </main>
    </div>
  );
}
