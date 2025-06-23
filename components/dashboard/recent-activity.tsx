"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Car, Tag, ImageIcon, FileText, Clock, CheckCircle, AlertCircle, Upload } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  message: string
  timestamp: string
  user: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

const activityIcons = {
  car_created: Car,
  car_published: CheckCircle,
  car_updated: FileText,
  offer_activated: Tag,
  offer_expired: AlertCircle,
  media_uploaded: Upload,
  specification_updated: FileText,
}

const activityColors = {
  car_created: "text-blue-600",
  car_published: "text-green-600",
  car_updated: "text-yellow-600",
  offer_activated: "text-purple-600",
  offer_expired: "text-red-600",
  media_uploaded: "text-indigo-600",
  specification_updated: "text-orange-600",
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and changes in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || ImageIcon
            const iconColor = activityColors[activity.type as keyof typeof activityColors] || "text-gray-600"

            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">{getUserInitials(activity.user)}</AvatarFallback>
                    </Avatar>
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
