"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUserData } from "@/context/UserDataProvider";
import { LucideActivity, LucideEdit } from "lucide-react";
import Image from "next/image";
import React from "react";
import { LuCopy } from "react-icons/lu";

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
      {/* ALL INFO */}
      <div className="mt-16 px-12">
        <h2 className=" text-2xl font-semibold font-inter">
          Personal Information
        </h2>
        <div className="space-y-3 mt-6">
          <div className="flex items-center max-w-[440px] gap-8">
            <Label className="font-sora text-base" htmlFor="email">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={user?.userName}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[440px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="email"
            >
              Email
            </Label>
            <Input
              id="email"
              type="text"
              value={user?.userEmail}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[440px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="email"
            >
              Phone No.
            </Label>
            <Input
              id="phone"
              type="text"
              value={user?.userPhone}
              readOnly
              className="bg-white w-full font-inter"
            />
          </div>
           <div className="flex items-center max-w-[50px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="email"
            >
              Invite Link
            </Label>
            <Input
              id="phone"
              type="text"
              value={user?.invite_link}
              readOnly
              className="bg-white w-full font-inter"
            />
            <LuCopy className="cursor-pointer" size={26} />
          </div>
        </div>
        <Separator className="my-6 max-w-[700px]" />
        <h2 className=" text-2xl font-semibold font-inter">
          Basic Information
        </h2>
        <div className="space-y-3 mt-6">
          <div className="flex items-center max-w-[600px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="email"
            >
              Institute/College Name
            </Label>
            <Input
              id="name"
              type="text"
              value={user?.institutionName}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[450px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="current_status"
            >
              Current Occupation
            </Label>
            <Input
              id="current_status"
              type="text"
              value={user?.current_status}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[450px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="mainFocus"
            >
              Main Focus
            </Label>
            <Input
              id="mainFocus"
              type="text"
              value={user?.mainFocus}
              readOnly
              className="bg-white w-full font-inter"
            />
          </div>
        </div>
        <Separator className="my-6 max-w-[700px]" />
        <h2 className=" text-2xl font-semibold font-inter">Work Information</h2>
         <div className="space-y-3 mt-6">
          <div className="flex items-center max-w-[600px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="email"
            >
              Choosed Career 
            </Label>
            <Input
              id="name"
              type="text"
              value={user?.institutionName}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[450px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="current_status"
            >
              Current Occupation
            </Label>
            <Input
              id="current_status"
              type="text"
              value={user?.current_status}
              readOnly
              className="bg-white w-full font-raleway"
            />
          </div>
          <div className="flex items-center max-w-[450px] gap-8">
            <Label
              className="font-sora text-base whitespace-nowrap"
              htmlFor="mainFocus"
            >
              Main Focus
            </Label>
            <Input
              id="mainFocus"
              type="text"
              value={user?.mainFocus}
              readOnly
              className="bg-white w-full font-inter"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
