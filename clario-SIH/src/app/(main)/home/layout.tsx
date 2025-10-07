"use client";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/(main)/_components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/app/(main)/_components/Navbar";
import { QuizDataProvider } from "@/context/userQuizProvider";
import { usePathname } from "next/navigation";
import GetUserLocation from "@/app/(main)/_components/GeoLocation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar =
    (pathname.startsWith("/home/mentor-connect/") &&
      pathname !== "/home/mentor-connect") ||
    pathname === "/home/profile";

  return (
    <div className="w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <QuizDataProvider>
            {!hideNavbar && <Navbar />}
            {children}
          </QuizDataProvider>
        </main>
        <Toaster />
        <GetUserLocation />
      </SidebarProvider>
    </div>
  );
}
