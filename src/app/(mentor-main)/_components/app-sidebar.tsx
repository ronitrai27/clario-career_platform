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
  LuMessagesSquare,
  LuSettings,
  LuShapes,
  LuSun,
  LuUpload,
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
  const { mentor, loading } = useUserData();
  const supabase = createClient();
  const router = useRouter();
  const [signoutLoading, setSignoutLoading] = useState(false);
  const pathname = usePathname();

  async function signOut() {
    setSignoutLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/auth-mentor");
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
      <SidebarContent className="p-2 space-y-2.5">
        {/* DASHBOARD */}
        <SidebarMenuItem
          className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
      ${
        pathname === "/dashboard"
          ? "bg-blue-400 scale-105 hover:bg-white/10"
          : "hover:bg-white/10 hover:scale-105"
      }`}
        >
          <Link href="/dashboard" className="w-full">
            <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
              <LuLayoutDashboard className="text-xl" />
              Dashboard
            </p>
          </Link>
        </SidebarMenuItem>
        {/* ALL REQUEST + HISTORY */}
         <SidebarMenuItem
          className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
      ${
        pathname === "/dashboard/history"
          ? "bg-blue-400 scale-105 hover:bg-white/10"
          : "hover:bg-white/10 hover:scale-105"
      }`}
        >
          <Link href="/dashboard/upload" className="w-full">
            <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
              <LuHistory className="text-xl" />
              All Sessions
            </p>
          </Link>
        </SidebarMenuItem>

        {/* MESSAGES */}
        <SidebarMenuItem
          className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
      ${
        pathname === "/dashboard/messages"
          ? "bg-blue-400 scale-105 hover:bg-white/10"
          : "hover:bg-white/10 hover:scale-105"
      }`}
        >
          <Link href="/dashboard/messages" className="w-full">
            <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
              <LuMessagesSquare className="text-xl" />
              Messages
            </p>
          </Link>
        </SidebarMenuItem>

        {/* CALENDAR */}
        <SidebarMenuItem
          className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
      ${
        pathname === "/dashboard/calender"
          ? "bg-blue-400 scale-105 hover:bg-white/10"
          : "hover:bg-white/10 hover:scale-105"
      }`}
        >
          <Link href="/dashboard/calender" className="w-full">
            <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
              <LuCalendar className="text-xl" />
              Calendar
            </p>
          </Link>
        </SidebarMenuItem>

        {/* UPLOAD VIDEO */}
        <SidebarMenuItem
          className={`flex cursor-pointer duration-200 ease-in-out rounded py-1 px-3
      ${
        pathname === "/dashboard/upload"
          ? "bg-blue-400 scale-105 hover:bg-white/10"
          : "hover:bg-white/10 hover:scale-105"
      }`}
        >
          <Link href="/dashboard/upload" className="w-full">
            <p className="flex items-center gap-3 font-medium font-inter text-base text-white tracking-wide">
              <LuUpload className="text-xl" />
              Upload Video
            </p>
          </Link>
        </SidebarMenuItem>

        
      </SidebarContent>

      <SidebarFooter className="px-1 overflow-hidden">
        {loading ? (
          <div></div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <div className="bg-gray-50 py-2 px-2 flex items-center justify-between w-full rounded-md overflow-hidden cursor-pointer">
                <Image
                  src={mentor?.avatar || "/user.png"}
                  alt="logo"
                  width={46}
                  height={46}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-base font-inter tracking-tight text-black">
                    {mentor?.full_name}
                  </p>
                  <p className="text-gray-800 max-w-[130px] truncate text-sm font-inter">
                    {mentor?.email}
                  </p>
                </div>
                <LuChevronsDownUp className="text-2xl cursor-pointer text-black" />
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0 rounded-xl shadow-lg mb-2 absolute left-[122px] bottom-8 overflow-hidden">
              {/* Top section with user details */}
              <div className="flex items-center gap-4 bg-blue-100/90 p-2 font-inter overflow-hidden">
                <Image
                  src={mentor?.avatar || "/user.png"}
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{mentor?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {mentor?.email}
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
                      <Button
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
                      </Button>
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
