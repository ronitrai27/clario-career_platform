'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404 – Not Found</h1>
      <p className="mt-4">Either you are unauthorized or the page does not exist.</p>
      <button
        onClick={() => router.back()}
        className="mt-6 inline-block text-blue-500 underline"
      >
        Go back
      </button>
    </div>
  );
}
