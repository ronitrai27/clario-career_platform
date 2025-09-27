"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Webpage = () => {
  return (
    <div>
      <h1 className="text-center my-20">Webpage for marketing</h1>
      <div className="flex items-center justify-center gap-20">
        <Link href="/auth">
          <Button variant="outline">Get Started</Button>
        </Link>
        <Link href="/auth-mentor">
          <Button variant="outline">signup as Mentor</Button>
        </Link>
      </div>
    </div>
  );
};

export default Webpage;
