"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Save, Eye, TrendingUp, Database } from "lucide-react"
import { SystemSettings } from "@/lib/api/queries/system-settings"
import { useState } from "react"

interface AnalyticsSettingsProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => Promise<boolean>;
  loading?: boolean;
}

export function AnalyticsSettings({ settings, onUpdate, loading }: AnalyticsSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<SystemSettings>>(settings)

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const success = await onUpdate(formData)
      if (success) {
        console.log('Analytics settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save analytics settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Google Analytics
          </CardTitle>
          <CardDescription>
            Configure Google Analytics and Google Tag Manager for website tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
              <Input
                id="google_analytics_id"
                value={formData.google_analytics_id || ''}
                onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Your Google Analytics 4 measurement ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
              <Input
                id="google_tag_manager_id"
                value={formData.google_tag_manager_id || ''}
                onChange={(e) => handleInputChange('google_tag_manager_id', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Your Google Tag Manager container ID
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Pixels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Social Media Tracking Pixels
          </CardTitle>
          <CardDescription>
            Configure tracking pixels for social media advertising platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="meta_pixel_id">Meta (Facebook) Pixel ID</Label>
              <Input
                id="meta_pixel_id"
                value={formData.meta_pixel_id || ''}
                onChange={(e) => handleInputChange('meta_pixel_id', e.target.value)}
                placeholder="123456789012345"
              />
              <p className="text-xs text-muted-foreground">
                Facebook/Instagram advertising pixel ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
              <Input
                id="tiktok_pixel_id"
                value={formData.tiktok_pixel_id || ''}
                onChange={(e) => handleInputChange('tiktok_pixel_id', e.target.value)}
                placeholder="C4XXXXXXXXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                TikTok for Business pixel ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="snapchat_pixel_id">Snapchat Pixel ID</Label>
              <Input
                id="snapchat_pixel_id"
                value={formData.snapchat_pixel_id || ''}
                onChange={(e) => handleInputChange('snapchat_pixel_id', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <p className="text-xs text-muted-foreground">
                Snapchat Ads pixel ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_pixel_id">LinkedIn Pixel ID</Label>
              <Input
                id="linkedin_pixel_id"
                value={formData.linkedin_pixel_id || ''}
                onChange={(e) => handleInputChange('linkedin_pixel_id', e.target.value)}
                placeholder="123456"
              />
              <p className="text-xs text-muted-foreground">
                LinkedIn Campaign Manager pixel ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="x_pixel_id">X (Twitter) Pixel ID</Label>
              <Input
                id="x_pixel_id"
                value={formData.x_pixel_id || ''}
                onChange={(e) => handleInputChange('x_pixel_id', e.target.value)}
                placeholder="o1234"
              />
              <p className="text-xs text-muted-foreground">
                X Ads pixel ID (formerly Twitter)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hasura & Database Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Hasura GraphQL Configuration
          </CardTitle>
          <CardDescription>
            Configure Hasura GraphQL Engine for real-time data analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hasura_url">Hasura URL</Label>
            <Input
              id="hasura_url"
              type="url"
              value={formData.hasura_url || ''}
              onChange={(e) => handleInputChange('hasura_url', e.target.value)}
              placeholder="https://your-app.hasura.app/v1/graphql"
            />
            <p className="text-xs text-muted-foreground">
              Your Hasura GraphQL endpoint URL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hasura_api_key">Hasura API Key</Label>
              <Input
                id="hasura_api_key"
                type="password"
                value={formData.hasura_api_key || ''}
                onChange={(e) => handleInputChange('hasura_api_key', e.target.value)}
                placeholder="Enter Hasura API key"
              />
              <p className="text-xs text-muted-foreground">
                API key for Hasura authentication
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasura_admin_secret">Hasura Admin Secret</Label>
              <Input
                id="hasura_admin_secret"
                type="password"
                value={formData.hasura_admin_secret || ''}
                onChange={(e) => handleInputChange('hasura_admin_secret', e.target.value)}
                placeholder="Enter admin secret"
              />
              <p className="text-xs text-muted-foreground">
                Admin secret for Hasura console access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Summary
          </CardTitle>
          <CardDescription>
            Overview of configured analytics tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Google Analytics Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Google Analytics</span>
                <div className={`w-2 h-2 rounded-full ${formData.google_analytics_id ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.google_analytics_id ? 'Configured' : 'Not configured'}
              </p>
            </div>

            {/* Google Tag Manager Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tag Manager</span>
                <div className={`w-2 h-2 rounded-full ${formData.google_tag_manager_id ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.google_tag_manager_id ? 'Configured' : 'Not configured'}
              </p>
            </div>

            {/* Meta Pixel Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Meta Pixel</span>
                <div className={`w-2 h-2 rounded-full ${formData.meta_pixel_id ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.meta_pixel_id ? 'Configured' : 'Not configured'}
              </p>
            </div>

            {/* TikTok Pixel Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">TikTok Pixel</span>
                <div className={`w-2 h-2 rounded-full ${formData.tiktok_pixel_id ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.tiktok_pixel_id ? 'Configured' : 'Not configured'}
              </p>
            </div>

            {/* Snapchat Pixel Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Snapchat Pixel</span>
                <div className={`w-2 h-2 rounded-full ${formData.snapchat_pixel_id ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.snapchat_pixel_id ? 'Configured' : 'Not configured'}
              </p>
            </div>

            {/* Hasura Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hasura GraphQL</span>
                <div className={`w-2 h-2 rounded-full ${formData.hasura_url && formData.hasura_api_key ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.hasura_url && formData.hasura_api_key ? 'Configured' : 'Not configured'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p>
                <strong>Google Analytics:</strong> Use GA4 for comprehensive website analytics. Track page views, user behavior, and conversions.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p>
                <strong>Social Media Pixels:</strong> Install pixels to track visitors from social media ads and measure campaign effectiveness.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p>
                <strong>Hasura GraphQL:</strong> Enable real-time analytics and advanced querying capabilities for your dashboard.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <p>
                <strong>Privacy Compliance:</strong> Ensure all tracking complies with GDPR, CCPA, and local privacy regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || loading}
          className="min-w-32"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
} 