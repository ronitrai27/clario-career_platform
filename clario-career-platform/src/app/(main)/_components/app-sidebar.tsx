"use client";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useUserData } from "@/context/UserDataProvider";
import Image from "next/image";
import {
  LuArrowUpRight,
  LuBrain,
  LuCalendar,
  LuChevronDown,
  LuChevronsDownUp,
  LuCreditCard,
  LuHistory,
  LuLayoutDashboard,
  LuLoader,
  LuLogOut,
  LuMessageCircle,
  LuMessageSquare,
  LuSettings,
  LuShapes,
  LuSun,
  LuTelescope,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkle, Stars } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import Link from "next/link";
import { useAssistantSheetStore } from "@/lib/store/useAssistantSheet";
import { LuChartNoAxesColumn } from "react-icons/lu";

export function AppSidebar() {
  const { user, loading } = useUserData();
  const supabase = createClient();
  const router = useRouter();
  const [signoutLoading, setSignoutLoading] = useState(false);
  const pathname = usePathname();

  async function signOut() {
    setSignoutLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setSignoutLoading(false);
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="">
        <div className={`flex items-center justify-center `}>
          <Image
            src="/clarioWhite.png"
            alt="logo"
            width={60}
            height={60}
            className=""
          />
          <h2 className="font-bold -ml-1 font-sora tracking-tight text-2xl text-white">
            Clario
          </h2>
        </div>
        <div className="flex items-center text-gray-300 text-sm font-sora gap-3 justify-center">
          <span>connect</span>.<span>Learn</span>.<span>Grow</span>
        </div>

        <Separator className="mt-1 mb-2 " />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="p-2 space-y-2.5">
            {/* HOME */}
            <SidebarMenuItem
              className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
            ${
              pathname === "/home"
                ? "bg-blue-400 scale-105 hover:bg-white/10"
                : "hover:bg-white/10 hover:scale-105"
            }`}
            >
              <Link href="/home" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuLayoutDashboard className="text-xl" />
                  Home
                </p>
              </Link>
            </SidebarMenuItem>
            {/* Mentor Connect */}
            <SidebarMenuItem
              className={`flex cursor-pointer hover:scale-105 duration-200 ease-in-out rounded px-2 py-1  ${
                pathname === "/home/mentor-connect"
                  ? "bg-blue-400 scale-105 hover:bg-white/10"
                  : "hover:bg-white/10 hover:scale-105"
              }`}
            >
              <Link href="/home/mentor-connect" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuUsers className="text-xl" />
                  Mentor Connect
                </p>
              </Link>
            </SidebarMenuItem>
            {/* Career board */}
            <SidebarMenuItem
              className={`flex hover:bg-white/10 cursor-pointer hover:scale-105 duration-200 ease-in-out rounded px-2 py-1  ${
                pathname === "/home/career-board"
                  ? "bg-blue-400 scale-105 hover:bg-white/10"
                  : "hover:bg-white/10 hover:scale-105"
              }`}
            >
              <Link href="/home/career-board" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuChartNoAxesColumn className="text-xl" />
                  Career Board
                </p>
              </Link>
            </SidebarMenuItem>
            {/* MY TRACKS */}
            <SidebarMenuItem
              className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
            ${
              pathname.startsWith("/home/my-tracks")
                ? "bg-blue-400 scale-105 hover:bg-white/10"
                : "hover:bg-white/10 hover:scale-105"
            }`}
            >
              <Link href="/home/my-tracks" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuTelescope className="text-xl" />
                  My Tracks
                  <span className="font-inter text-sm text-pink-500 ml-auto">
                    Pro
                  </span>
                </p>
              </Link>
            </SidebarMenuItem>
            {/* CALENDAR */}
            <SidebarMenuItem
              className={`flex cursor-pointer hover:scale-105 duration-200 ease-in-out rounded px-2 py-1    ${
                pathname === "/home/calendar"
                  ? "bg-blue-400 scale-105 hover:bg-white/10"
                  : "hover:bg-white/10 hover:scale-105"
              }`}
            >
              <Link href="/home/calendar" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuCalendar className="text-xl" />
                  Calendar
                </p>
              </Link>
            </SidebarMenuItem>
            {/* MESSAGES */}
            <SidebarMenuItem
              className={`flex hover:bg-white/10 cursor-pointer hover:scale-105 duration-200 ease-in-out rounded px-2 py-1  ${
                pathname === "/home/messages"
                  ? "bg-blue-400 scale-105 hover:bg-white/10"
                  : "hover:bg-white/10 hover:scale-105"
              }`}
            >
              <Link href="/home/messages" className="w-full">
                <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
                  <LuMessageSquare className="text-xl" />
                  Messages
                </p>
              </Link>
            </SidebarMenuItem>
            {/* AI TOOLS COLLAPSIBLE */}
            <Collapsible className="mt-2" defaultOpen={true}>
              <CollapsibleTrigger asChild className="">
                <SidebarMenuButton className="w-full flex items-center justify-between hover:bg-white/10 cursor-pointer text-white hover:text-black group">
                  <p className="flex items-center gap-3 font-medium font-inter text-base ">
                    <LuBrain className="text-xl" /> AI Tools
                  </p>
                  <LuChevronDown className="text-xl group-hover:text-black " />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-0">
                <SidebarMenuSub className="pl-2 mt-3 space-y-2">
                  <SidebarMenuSubItem className="font-inter font-medium text-gray-200 cursor-pointer text-base hover:text-white hover:translate-x-2 duration-200">
                    <Link href="/home/ai-tools/career-coach">
                      AI Career Coach
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem className="font-inter font-medium text-gray-200 cursor-pointer text-base hover:text-white hover:translate-x-2 duration-200">
                    <Link href="/home/ai-tools/roadmap-maker">AI Roadmap </Link>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem className="font-inter font-medium text-gray-200 cursor-pointer text-base hover:text-white hover:translate-x-2 duration-200">
                    <Link href="/home/job-tracker">AI Job Tracker </Link>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem className="font-inter font-medium text-gray-200 cursor-pointer text-base hover:text-white hover:translate-x-2 duration-200 flex items-center whitespace-nowrap">
                    <Link href="/home/ai-tools/resume-maker">
                      AI Resume Maker
                      <span className="font-inter text-xs text-pink-500 ml-3">
                        Pro
                      </span>
                    </Link>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem className="font-inter font-medium text-gray-200 cursor-pointer text-base hover:text-white hover:translate-x-2 duration-200 whitespace-nowrap">
                    <Link href="/home/interview-prep">
                      AI Interview Prep{" "}
                      <span className="font-inter text-xs text-pink-500 ml-3">
                        Pro
                      </span>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-1 overflow-hidden">
        <div className="mb-4 mt-1 bg-gradient-to-br from-white via-blue-200 to-blue-400 w-[96%] mx-auto h-[120px] rounded-lg px-2 py-3">
          <div className="flex items-center gap-3">
            <LuWallet className="text-2xl text-blue-600" />

            <h2 className="font-raleway font-semibold text-base">Credits</h2>
          </div>
          <div className="flex  justify-between">
            <div className="flex flex-col items-center justify-start mt-2">
              <p className="text-center font-sora font-bold text-2xl tracking-tight">
                {user?.remainingCredits}
              </p>

              <button onClick={()=>router.push("/home/settings/billing")} className="text-xs tracking-tight font-inter cursor-pointer text-blue-600 bg-gray-100/40 hover:bg-gray-100/70  px-2 rounded-sm flex items-center gap-2 mt-3">
                Top Up <Sparkle className="" size={20} />
              </button>
            </div>
            <Image
              src="/card2.png"
              alt="logo"
              width={90}
              height={90}
              className="object-contain -mt-4 -rotate-12"
            />
          </div>
        </div>
        {loading ? (
          <div></div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <div className="bg-gray-50 py-2 px-2 flex items-center justify-between w-full rounded-md overflow-hidden cursor-pointer">
                <Image
                  src={user?.avatar || "/user.png"}
                  alt="logo"
                  width={46}
                  height={46}
                  className="rounded-full"
                />
                <div className="flex flex-col ">
                  <p className="text-base font-inter tracking-tight text-black">
                    {user?.userName}
                  </p>
                  <p className="text-gray-800 max-w-[130px] truncate text-sm font-inter">
                    {user?.userEmail}
                  </p>
                </div>
                <LuChevronsDownUp className="text-2xl cursor-pointer text-black" />
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0 rounded-xl shadow-lg mb-2 absolute left-[122px] bottom-8 overflow-hidden">
              {/* Top section with user details */}
              <div className="flex items-center gap-4 bg-blue-100/90 p-2 font-inter overflow-hidden">
                <Image
                  src={
                    user?.avatar || `/user${Math.ceil(Math.random() * 5)}.png`
                  }
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user?.userName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {user?.userEmail}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start gap-2 w-full font-roboto hover:bg-gray-50 rounded-none cursor-pointer"
                >
                  <LuArrowUpRight className="text-[18px]" />
                  Upgrade to Pro
                </Button>

                <Separator />

                <Button
                  variant="ghost"
                  onClick={() => router.push("/home/profile")}
                  className="justify-between w-full font-roboto hover:bg-gray-50 rounded-none cursor-pointer"
                >
                  <div className="flex gap-2 items-center">
                    <LuSettings className="text-[18px]" />
                    Profile
                  </div>
                  <kbd className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    Ctrl+Alt+P
                  </kbd>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push("/home/settings/billing")}
                  className="justify-start gap-2 w-full font-roboto hover:bg-gray-50 rounded-none cursor-pointer"
                >
                  <LuCreditCard className="text-[18px]" />
                  Billing
                </Button>

                <Button
                  variant="ghost"
                  className="justify-between w-full font-roboto hover:bg-gray-50 rounded-none cursor-pointer"
                >
                  <div className="flex gap-2 items-center">
                    <Stars className="text-[18px]" />
                    Ai Assistant
                  </div>
                  <kbd className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    Ctrl+Alt+D
                  </kbd>
                </Button>

                <Separator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-between text-red-600 hover:text-red-700 w-full font-roboto hover:bg-gray-50 rounded-none cursor-pointer"
                    >
                      <div className="flex gap-2 items-center font-inter">
                        <LuLogOut className="text-[18px]" />
                        Logout
                      </div>
                      <kbd className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded">
                        Ctrl+Alt+L
                      </kbd>
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-semibold font-inter text-xl">
                        Are you sure you want to logout?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-inter text-muted-foreground tracking-tight text-base">
                        This will end your session and you&apos;ll need to sign
                        in again. Despite you can simply close the tab.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-inter cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-blue-500 text-white hover:bg-blue-700 font-inter cursor-pointer"
                        onClick={signOut}
                      >
                        {signoutLoading ? (
                          <>
                            <LuLoader className="animate-spin mr-2 inline" />
                            <span>Signing Out..</span>
                          </>
                        ) : (
                          <>
                            <LuLogOut className="mr-2 inline" />
                            <span>Logout</span>
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
