import React from "react";
import { LuMessageCircleHeart } from "react-icons/lu";

const Messages = () => {
  return (
    <div className="w-full bg-white border rounded-md  h-full p-5">
      <div className="flex flex-col items-center justify-center h-full -mt-20">
        <div className="w-12 h-12 rounded-md flex items-center justify-center bg-blue-100 mb-10">
          <LuMessageCircleHeart className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl font-sora font-semibold ">Welcome to Messages</h1>
        <p className="text-xl text-muted-foreground font-inter mt-3 text-center">Discover Students from your same Institution and start a conversation or get connect with mentors and experts</p>
      </div>
    </div>
  );
};

export default Messages;
