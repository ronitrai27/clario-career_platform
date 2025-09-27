"use client";
import React from 'react'
import MentorMessagesList from './MentorMessageList';

const MessageRightSide = () => {
  return (
     <div className="h-full flex flex-col gap-5 w-[30%]">
         <div className="bg-white w-full p-2 rounded-lg h-full border shadow">
        <p className="font-medium text-xl text-center tracking-tight font-inter mb-4">
          Previous Chats
        </p>

        <MentorMessagesList />
      </div>
      
    </div>
  )
}

export default MessageRightSide
