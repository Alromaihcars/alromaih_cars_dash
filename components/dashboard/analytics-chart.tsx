"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface ChartData {
  month: string
  cars: number
  revenue: number
  offers: number
}

interface AnalyticsChartProps {
  data: ChartData[]
  title?: string
  description?: string
}

export function AnalyticsChart({
  data,
  title = "Monthly Performance",
  description = "Cars sold and revenue generated over time",
}: AnalyticsChartProps) {
  // Calculate trends
  const currentMonth = data[data.length - 1]
  const previousMonth = data[data.length - 2]

  const carsTrend =
    currentMonth && previousMonth
      ? (((currentMonth.cars - previousMonth.cars) / previousMonth.cars) * 100).toFixed(1)
      : "0"

  const revenueTrend =
    currentMonth && previousMonth
      ? (((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100).toFixed(1)
      : "0"

  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const maxCars = Math.max(...data.map((d) => d.cars))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Cars Sold</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{currentMonth?.cars || 0}</span>
              <Badge variant={Number.parseFloat(carsTrend) >= 0 ? "default" : "destructive"}>
                {Number.parseFloat(carsTrend) >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(Number.parseFloat(carsTrend))}%
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Revenue</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">SAR {((currentMonth?.revenue || 0) / 1000000).toFixed(1)}M</span>
              <Badge variant={Number.parseFloat(revenueTrend) >= 0 ? "default" : "destructive"}>
                {Number.parseFloat(revenueTrend) >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(Number.parseFloat(revenueTrend))}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.month}</span>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{item.cars} cars</span>
                  <span>SAR {(item.revenue / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Cars Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Cars</span>
                  <span>{item.cars}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.cars / maxCars) * 100}%` }}
                  />
                </div>
              </div>

              {/* Revenue Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Revenue</span>
                  <span>SAR {(item.revenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
