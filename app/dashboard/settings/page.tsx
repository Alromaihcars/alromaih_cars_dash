"use client"

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, Smartphone, BarChart3, AlertTriangle, Info, Eye, RefreshCw, Settings, Building2 } from "lucide-react"
import WebsiteSettings from "@/components/settings/website-settings"
import BrandingPreview from "@/components/settings/branding-preview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSystemSettings } from '@/hooks/use-system-settings'
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/api/queries/system-settings'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('website')
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en_US')
  
  // Use the comprehensive system settings hook
  const {
    settings,
    isLoading,
    error,
    exists,
    hasUnsavedChanges,
    lastSaved,
    getTranslationStatus,
    refresh: refreshSettings
  } = useSystemSettings({ 
    language: currentLanguage, 
    includeBinary: true,
    autoRefresh: false
  })

  // Get translation status
  const translationStatus = getTranslationStatus()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-muted-foreground">Loading system settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load settings: {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refreshSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!exists) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No system settings found. Please contact your administrator to initialize the settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure your website, mobile app, and business information
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Language:</span>
              <div className="flex gap-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={currentLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentLanguage(lang.code)}
                    className="flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Refresh Button */}
            <Button variant="outline" onClick={refreshSettings} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Translation Progress</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {translationStatus.percentage}% Complete
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {translationStatus.completed} of {translationStatus.total}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Settings Status</p>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Unsaved Changes
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        All Saved
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">Business Info</p>
                  <p className="text-xs text-muted-foreground">
                    {settings?.website_name || 'Not Set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {lastSaved ? new Date(lastSaved).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Website Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Branding Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-6">
          <WebsiteSettings 
            language={currentLanguage}
            onSettingsChange={(updatedSettings) => {
              // Handle settings change if needed
              console.log('Settings changed:', updatedSettings)
            }}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <BrandingPreview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
