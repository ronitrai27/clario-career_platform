"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useState } from "react"

const chartData = {
  "7days": [
    { date: "Mon", completed: 4, rejected: 1 },
    { date: "Tue", completed: 6, rejected: 2 },
    { date: "Wed", completed: 3, rejected: 0 },
    { date: "Thu", completed: 8, rejected: 3 },
    { date: "Fri", completed: 5, rejected: 1 },
    { date: "Sat", completed: 2, rejected: 0 },
    { date: "Sun", completed: 1, rejected: 1 },
  ],
  "30days": [
    { date: "Week 1", completed: 28, rejected: 5 },
    { date: "Week 2", completed: 32, rejected: 8 },
    { date: "Week 3", completed: 25, rejected: 3 },
    { date: "Week 4", completed: 35, rejected: 7 },
  ],
  "1month": [
    { date: "Jan", completed: 120, rejected: 15 },
    { date: "Feb", completed: 98, rejected: 12 },
    { date: "Mar", completed: 135, rejected: 18 },
    { date: "Apr", completed: 142, rejected: 22 },
    { date: "May", completed: 128, rejected: 16 },
    { date: "Jun", completed: 156, rejected: 20 },
  ],
}

export function MeetingsChart() {
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "1month">("7days")

  return (
    <Card className="bg-white mt-16">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-black font-inter">Meeting Analytics</CardTitle>
            <p className="text-sm font-inter text-gray-500 mt-1">Daily completed vs rejected meeting trends</p>
          </div>
          <div className="flex gap-2">
            {/* Time filter buttons - unchanged functionality */}
            <Button
              variant={timeFilter === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("7days")}
              className={timeFilter === "7days" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              7 days
            </Button>
            <Button
              variant={timeFilter === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("30days")}
              className={timeFilter === "30days" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              30 days
            </Button>
            <Button
              variant={timeFilter === "1month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("1month")}
              className={timeFilter === "1month" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              6 months
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData[timeFilter]}>
              {/* Grid styling - unchanged */}
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

              {/* Axis configuration - unchanged */}
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />

              {/* Tooltip styling - unchanged */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="completed"
                stroke="#0051FF"
                strokeWidth={3}
                dot={{ fill: "#0051FF", strokeWidth: 2, r: 4 }}
                name="Completed Meetings"
              />

              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#4B87FF"
                strokeWidth={3}
                dot={{ fill: "#4B87FF", strokeWidth: 2, r: 4 }}
                name="Rejected Meetings"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
