"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Smartphone, BarChart3, AlertTriangle } from "lucide-react"
import { useSystemSettings } from "@/hooks/use-system-settings"
import { WebsiteSettings } from "@/components/settings/website-settings"
import { MobileSettings } from "@/components/settings/mobile-settings"
import { AnalyticsSettings } from "@/components/settings/analytics-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { settings, loading, error, updateSettings } = useSystemSettings();

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your dashboard, website, and mobile app settings.</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Configure your dashboard, website, and mobile app settings.</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your dashboard, website, and mobile app settings.</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="website" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Website
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile App
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Website Settings */}
        <TabsContent value="website" className="space-y-6">
          {settings && (
            <WebsiteSettings 
              settings={settings} 
              onUpdate={updateSettings} 
              loading={loading} 
            />
          )}
        </TabsContent>

        {/* Mobile App Settings */}
        <TabsContent value="mobile" className="space-y-6">
          {settings && (
            <MobileSettings 
              settings={settings} 
              onUpdate={updateSettings} 
              loading={loading} 
            />
          )}
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics" className="space-y-6">
          {settings && (
            <AnalyticsSettings 
              settings={settings} 
              onUpdate={updateSettings} 
              loading={loading} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
