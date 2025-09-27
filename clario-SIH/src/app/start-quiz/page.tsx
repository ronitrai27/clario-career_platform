"use client";
import React from "react";
import Quiz from "../(main)/_components/NewQuizComponent";

const StartQuiz = () => {
  return (
    <div className="h-screen w-full relative">
      {/* <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
        }}
      /> */}
     {/* <div className="relative z-50 w-full h-full flex items-center justify-center">
       <Quiz />
     </div> */}
     <Quiz/>
    </div>
  );
};

export default StartQuiz;
