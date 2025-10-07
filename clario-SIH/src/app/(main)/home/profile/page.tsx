"use client";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataProvider";
import { LucideActivity, LucideEdit } from "lucide-react";
import Image from "next/image";
import React from "react";

const UserProfile = () => {
  const { user } = useUserData();
  return (
    <div className="w-full h-full bg-gray-50 ">
      <div className="bg-gradient-to-br from-indigo-400 to-blue-200 p-4 h-[140px] relative ">
        <Image
          src={user?.avatar || "/user.png"}
          alt="User Avatar"
          width={80}
          height={80}
          className="w-[120px] h-[120px] absolute top-16 left-16 rounded-full"
        />
        <div className="flex items-center gap-12 absolute top-24 left-[260px]">
          <Button className="font-inter" variant="outline">
            Edit Profile
            <LucideEdit />
          </Button>
          <Button className="font-sora " variant="outline">
            {user?.isPro ? "Pro user" : "Upgrade Now"}
            <LucideActivity />
          </Button>
        </div>

        <Image
          src="/design100.png"
          alt="User Avatar"
          width={80}
          height={80}
          className="w-[120px] h-[120px] absolute top-10 right-5 rounded-full opacity-20"
        />
      </div>
    </div>
  );
};

export default UserProfile;
