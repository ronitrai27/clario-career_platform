"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EmailVerified() {
  return (
    <div className="h-screen w-full flex items-center justify-center relative">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="absolute inset-0 z-0 top-5 left-5">
        <div className="flex items-center">
          <Image
            src="/clarioBlack.png"
            alt="logo"
            width={80}
            height={80}
            className=""
          />
          <h2 className="font-bold -ml-1 font-sora tracking-tight text-3xl">
            Clario
          </h2>
        </div>
      </div>

      {/* Card */}
      <Card className="relative z-10 w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
          <CardTitle className="text-xl font-semibold font-sora">
            Email Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-gray-600 text-sm text-center font-raleway">
            Your email has been successfully verified. You can now Go back and log in or click the button below.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full cursor-pointer">
              Go to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
