"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, TrendingUp, TrendingDown, DollarSign, Tag, Star, Package } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: "Total Cars",
      value: stats.totalCars.toLocaleString(),
      description: `${stats.publishedCars} published, ${stats.draftCars} draft`,
      icon: Car,
      trend: { value: "+12%", isPositive: true },
      color: "text-blue-600",
    },
    {
      title: "Total Revenue",
      value: `SAR ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      description: `SAR ${(stats.monthlyRevenue / 1000000).toFixed(1)}M this month`,
      icon: DollarSign,
      trend: { value: "+8.2%", isPositive: true },
      color: "text-green-600",
    },
    {
      title: "Active Offers",
      value: stats.activeOffers.toString(),
      description: `${stats.totalOffers} total offers`,
      icon: Tag,
      trend: { value: "+3", isPositive: true },
      color: "text-orange-600",
    },
    {
      title: "Featured Cars",
      value: stats.featuredCars.toString(),
      description: "Premium showcase vehicles",
      icon: Star,
      trend: { value: "+5", isPositive: true },
      color: "text-yellow-600",
    },
    {
      title: "Car Variants",
      value: stats.totalVariants.toLocaleString(),
      description: "Different color options",
      icon: Palette,
      trend: { value: "+18", isPositive: true },
      color: "text-purple-600",
    },
    {
      title: "Brands",
      value: stats.totalBrands.toString(),
      description: "Active automotive brands",
      icon: Package,
      trend: { value: "0", isPositive: true },
      color: "text-indigo-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statsData.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <Badge variant={stat.trend.isPositive ? "default" : "destructive"} className="text-xs">
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.trend.value}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Import Palette icon
import { Palette } from "lucide-react"
