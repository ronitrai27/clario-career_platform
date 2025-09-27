/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
// import { MarqueeDemo } from "./_components/MarqueeLogin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { LuChevronRight, LuInfo, LuLoader } from "react-icons/lu";
import { AnimatedGradientTextDemo } from "@/app/auth/_components/GerdaientText";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Link from "next/link";
import { MarqueeDemo } from "../auth/_components/MarqueeLogin";

export default function AuthPage() {
  const captchaRef = useRef<HCaptcha>(null);
  const router = useRouter();
  // const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  // signup - create account, signin - login
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const supabase = createClient();

  async function HandleAuth() {
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: "mentor" },
            emailRedirectTo: `${window.location.origin}/email-verified`,
            // captchaToken: token || undefined,
          },
        });

        if (error) throw error;
        if (data.user && !data.session) {
          setError("Please check your email for verification link");
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // captchaToken: token || undefined,
          },
        });

        if (error) throw error;
        if (data.session) {
          router.push("/auth-mentor/callback");
        }
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      // captchaRef.current?.resetCaptcha();
      // setToken("");
      setLoading(false);
    }
  }

  return (
    <section>
      <main className="flex lg:flex-row gap-10">
        {/* LEFT SIDE */}
        <div className="h-screen w-[56%] bg-slate-900 relative">
          {/* Cosmic Aurora */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `
        radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),
        radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%)
      `,
            }}
          />
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <AnimatedGradientTextDemo />
          </div>
          <div className="absolute inset-0 ">
            <Image
              src="/clarioWhite.png"
              alt="Clario"
              width={100}
              height={100}
              className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ">
            <h1 className="text-[54px] font-bold text-white/70 font-sora tracking-tight text-center leading-tight">
              &quot;Empowering minds through <br />{" "}
              <span className="">your experience</span>&quot;
            </h1>
          </div>

          <div className="w-[99%] mx-auto absolute bottom-2">
            <MarqueeDemo />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1">
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Link href="/web">
              <div className="flex items-center mb-10">
                <Image
                  src="/clarioBlack.png"
                  alt="logo"
                  width={80}
                  height={80}
                  className=""
                />

                <h1 className="font-raleway text-3xl font-bold">Clario</h1>
              </div>
            </Link>

            <p className="text-center -mt-8 mb-10 font-raleway text-2xl font-semibold">
              Mentor Portal
            </p>

            {/* ---- */}
            <p className="font-inter text-lg font-light mb-7">
              {" "}
              Continue with{" "}
              <span className="font-medium font-raleway  text-blue-500  ml-4">
                {isSignup ? "Creating Account" : "Logging In"}
              </span>
            </p>

            <div className="flex flex-col gap-5 w-full max-w-[320px] mx-auto ">
              <div className="flex items-center justify-center gap-2 ">
                <Label className="font-inter">Email</Label>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border "
                />
              </div>
              <div className="flex items-center justify-center gap-2 mb-5">
                <Label className="font-inter">Pass</Label>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border "
                />
              </div>
              {/* 👇 hCaptcha here */}
              {/* <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={(captchaToken) => setToken(captchaToken)}
                ref={captchaRef}
                size="invisible"
                //  size="compact"
              /> */}

              <Button
                className="rounded border font-raleway cursor-pointer bg-black"
                disabled={loading}
                onClick={HandleAuth}
              >
                {loading ? (
                  <>
                    <LuLoader className="animate-spin" />
                    {isSignup ? "Signing up..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignup ? "Sign Up" : "Sign In"}
                    <LuChevronRight />
                  </>
                )}
              </Button>

              <p className="font-inter text-sm font-light">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <span
                  className="font-medium text-blue-500 text-sm font-raleway cursor-pointer"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </span>
              </p>
            </div>

            {error && (
              <p className="font-sora text-sm text-gray-600 text-center mt-10">
                <LuInfo className="mr-2 inline" /> {error}
              </p>
            )}
          </div>
        </div>
      </main>
    </section>
  );
}
