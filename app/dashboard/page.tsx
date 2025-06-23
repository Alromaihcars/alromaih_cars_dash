"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, RefreshCw, Car, TrendingUp, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    // TODO: Implement real API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-6 dashboard-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dashboard-header">
        <div className="min-w-0 flex-1">
          <h1 className="text-fluid-3xl font-bold tracking-tight dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground text-fluid-base dashboard-description">
            Welcome back! Here's what's happening with your car inventory.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="flex-1 sm:flex-none">
            <RefreshCw className={`h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-fluid-sm">Refresh</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            <span className="text-fluid-sm hidden sm:inline">Add New Car</span>
            <span className="text-fluid-sm sm:hidden">Add Car</span>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      <div className="grid gap-6 grid-responsive-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-fluid-lg">
              <Calendar className="h-5 w-5 shrink-0" />
              <span className="truncate">Dashboard</span>
            </CardTitle>
            <CardDescription className="text-fluid-sm">Dashboard components will be connected to real data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Dashboard is ready for real data integration</p>
              <div className="space-y-3 max-w-sm mx-auto">
                <Button className="w-full justify-start text-fluid-sm" variant="outline">
                  <Car className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
                  <span className="truncate">Add New Car</span>
                </Button>
                <Button className="w-full justify-start text-fluid-sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
                  <span className="truncate">Create Offer</span>
                </Button>
                <Button className="w-full justify-start text-fluid-sm" variant="outline">
                  <Download className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
                  <span className="truncate">Export Data</span>
                </Button>
                <Button className="w-full justify-start text-fluid-sm" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2 shrink-0" />
                  <span className="truncate">View Analytics</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
