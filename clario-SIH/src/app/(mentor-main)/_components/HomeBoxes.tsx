"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CalendarClock, CheckCircle } from "lucide-react"

export function StatsBoxes() {
  return (
    <div className="grid grid-cols-3 gap-4 w-full my-5">
      {/* Total Revenue */}
      <Card className="p-4 hover:shadow-md transition bg-gradient-to-br from-blue-300/70 via-blue-200/60 to-purple-200/60 ">
        <CardHeader className="">
          <CardTitle className="text-lg font-sora font-medium flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" /> Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="-mt-2">
          <p className="text-3xl font-inter font-bold">₹7,500</p>
          <p className="text-sm mt-1 text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card className="p-3 hover:shadow-md transition">
        <CardHeader className="">
          <CardTitle className="text-lg font-sora font-medium flex items-center gap-2 whitespace-nowrap">
            <CalendarClock className="w-5 h-5 text-blue-500 -ml-2" /> Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-inter font-bold">5</p>
          <p className="text-sm mt-1 text-muted-foreground">Today: 2 sessions</p>
        </CardContent>
      </Card>

      {/* Completed Sessions */}
      <Card className="p-3 hover:shadow-md transition">
        <CardHeader className="">
          <CardTitle className="text-lg font-sora font-medium flex items-center gap-2 whitespace-nowrap">
            <CheckCircle className="w-5 h-5 text-blue-500 -ml-2" /> Completed Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-inter font-bold">18</p>
          <p className="text-sm mt-1 text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}
