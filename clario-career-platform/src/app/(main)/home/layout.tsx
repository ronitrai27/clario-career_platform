"use client";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(main)/_components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(main)/_components/Navbar";
import { QuizDataProvider } from "@/context/userQuizProvider";
import { usePathname } from "next/navigation";
import GetUserLocation from "@/app/(main)/_components/GeoLocation";
import { InterviewProvider } from "@/context/InterviewContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    (pathname.startsWith("/home/mentor-connect/") &&
      pathname !== "/home/mentor-connect" &&
      pathname !== "/home/mentor-connect/bookings") ||
    pathname === "/home/profile" ||
      pathname === "/home/calendar" ||
    pathname === "/home/settings/billing" ||
    pathname === "/home/ai-tools/resume-maker/start" ||
    pathname === "/home/interview-prep/start" ||
    pathname.includes("/mocktest/");

  const hideSidebar = pathname.includes("/mocktest");

  return (
    <div className="w-screen ">
      <SidebarProvider>
        {!hideSidebar && <AppSidebar />}
        <main className="flex-1 flex flex-col">
          <QuizDataProvider>
            <InterviewProvider>
              {!hideNavbar && <Navbar />}
              {children}
            </InterviewProvider>
          </QuizDataProvider>
        </main>
        <Toaster />
        <GetUserLocation />
      </SidebarProvider>
    </div>
  );
}
