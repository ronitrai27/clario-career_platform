"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function MentorSessionsTabs() {
  return (
    <Tabs defaultValue="pending" className="w-full max-w-5xl mx-auto mt-10 bg-gray-100 p-4 rounded-lg">
      <TabsList className="grid w-full grid-cols-3 font-inter text-lg font-semibold">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="accepted-rejected">Accepted / Rejected</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="p-6 bg-white">
        <p className="text-center text-gray-600">Here you’ll see all pending session requests.</p>
      </TabsContent>

      <TabsContent value="accepted-rejected" className="p-6 bg-white">
        <p className="text-center text-gray-600">Here you’ll see all accepted or rejected sessions.</p>
      </TabsContent>

      <TabsContent value="completed" className="p-6 bg-white">
        <p className="text-center text-gray-600">Here you’ll see all completed sessions.</p>
      </TabsContent>
    </Tabs>
  );
}
