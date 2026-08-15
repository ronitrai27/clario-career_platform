"use client";
import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Typewriter } from "react-simple-typewriter";

export default function SearchBar() {
  const [value, setValue] = useState("");

  return (
    <div className="relative flex items-center bg-white w-full max-w-[400px] px-2 rounded-full shadow-sm">
      {/* Input */}
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-transparent rounded-none border-none shadow-none focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="" // leave empty, we’ll use Typewriter
      />

      {/* Typewriter placeholder (shows only when input is empty) */}
      {value === "" && (
        <div className="absolute left-4 text-gray-500 pointer-events-none">
          <Typewriter
            words={[
              "Search for best tech mentors...",
              "Search for UPSC mentors...",
              "Search for career guidance...",
            ]}
            loop={0} // 0 = infinite
            cursor
            cursorStyle="|"
            typeSpeed={100}
            deleteSpeed={60}
            delaySpeed={1500}
          />
        </div>
      )}

      <LuSearch className="text-xl text-black absolute right-3" />
    </div>
  );
}
