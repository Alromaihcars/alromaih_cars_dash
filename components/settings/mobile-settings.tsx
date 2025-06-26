"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Smartphone, Save, Download, Settings, Key, Shield } from "lucide-react"
import { SystemSettings } from "@/lib/api/queries/system-settings"
import { BinaryImageUpload } from "@/components/ui/binary-image-upload"
import { useState } from "react"

interface MobileSettingsProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => Promise<boolean>;
  loading?: boolean;
}

export function MobileSettings({ settings, onUpdate, loading }: MobileSettingsProps) {
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
        console.log('Mobile settings saved successfully')
      }
    } catch (error) {
      console.error('Failed to save mobile settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* App Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Branding
          </CardTitle>
          <CardDescription>
            Configure your mobile app's branding and visual elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="app_name">App Name</Label>
            <Input
              id="app_name"
              value={formData.app_name || ''}
              onChange={(e) => handleInputChange('app_name', e.target.value)}
              placeholder="Alromaih Cars"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* App Logo Upload */}
            <BinaryImageUpload
              label="App Logo"
              value={formData.app_logo || ''}
              onChange={(value) => handleInputChange('app_logo', value)}
              placeholder="Upload your app logo"
              maxWidth={200}
              maxHeight={200}
              helpText="Recommended size: 512x512px or 1024x1024px. Square format required for app stores."
            />

            {/* App Splash Screen Upload */}
            <BinaryImageUpload
              label="App Splash Screen"
              value={formData.app_splash_screen || ''}
              onChange={(value) => handleInputChange('app_splash_screen', value)}
              placeholder="Upload your splash screen"
              maxWidth={200}
              maxHeight={300}
              helpText="Recommended size: 1080x1920px (9:16 aspect ratio). Used when app is loading."
            />
          </div>

          {/* CDN URLs */}
          {formData.app_logo_cdn_url && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground">
              <p>App Logo CDN: {formData.app_logo_cdn_url}</p>
              {formData.app_splash_screen_cdn_url && (
                <p>Splash Screen CDN: {formData.app_splash_screen_cdn_url}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Store Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            App Store Links
          </CardTitle>
          <CardDescription>
            Configure download links for your mobile app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="app_store_url">iOS App Store URL</Label>
              <Input
                id="app_store_url"
                value={formData.app_store_url || ''}
                onChange={(e) => handleInputChange('app_store_url', e.target.value)}
                placeholder="https://apps.apple.com/app/your-app"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="play_store_url">Google Play Store URL</Label>
              <Input
                id="play_store_url"
                value={formData.play_store_url || ''}
                onChange={(e) => handleInputChange('play_store_url', e.target.value)}
                placeholder="https://play.google.com/store/apps/details?id=your.app"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Version Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Version Control
          </CardTitle>
          <CardDescription>
            Manage app versions and update requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="android_app_version">Android App Version</Label>
              <Input
                id="android_app_version"
                value={formData.android_app_version || ''}
                onChange={(e) => handleInputChange('android_app_version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="android_min_version">Android Minimum Version</Label>
              <Input
                id="android_min_version"
                value={formData.android_min_version || ''}
                onChange={(e) => handleInputChange('android_min_version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ios_app_version">iOS App Version</Label>
              <Input
                id="ios_app_version"
                value={formData.ios_app_version || ''}
                onChange={(e) => handleInputChange('ios_app_version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ios_min_version">iOS Minimum Version</Label>
              <Input
                id="ios_min_version"
                value={formData.ios_min_version || ''}
                onChange={(e) => handleInputChange('ios_min_version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="force_update"
              checked={formData.force_update || false}
              onCheckedChange={(checked) => handleInputChange('force_update', checked)}
            />
            <Label htmlFor="force_update">Force Update</Label>
            <span className="text-sm text-muted-foreground">
              Require users to update to the latest version
            </span>
          </div>
        </CardContent>
      </Card>

      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Features
          </CardTitle>
          <CardDescription>
            Enable or disable specific app features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable_app_notifications"
                checked={formData.enable_app_notifications ?? true}
                onCheckedChange={(checked) => handleInputChange('enable_app_notifications', checked)}
              />
              <Label htmlFor="enable_app_notifications">Push Notifications</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_in_app_chat"
                checked={formData.enable_in_app_chat ?? true}
                onCheckedChange={(checked) => handleInputChange('enable_in_app_chat', checked)}
              />
              <Label htmlFor="enable_in_app_chat">In-App Chat</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_car_comparison"
                checked={formData.enable_car_comparison ?? true}
                onCheckedChange={(checked) => handleInputChange('enable_car_comparison', checked)}
              />
              <Label htmlFor="enable_car_comparison">Car Comparison</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_app_booking"
                checked={formData.enable_app_booking ?? true}
                onCheckedChange={(checked) => handleInputChange('enable_app_booking', checked)}
              />
              <Label htmlFor="enable_app_booking">Car Booking</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable_app_reviews"
                checked={formData.enable_app_reviews ?? true}
                onCheckedChange={(checked) => handleInputChange('enable_app_reviews', checked)}
              />
              <Label htmlFor="enable_app_reviews">Car Reviews</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cars_per_page">Cars Per Page</Label>
              <Input
                id="cars_per_page"
                type="number"
                value={formData.cars_per_page || 10}
                onChange={(e) => handleInputChange('cars_per_page', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_cars_limit">Featured Cars Limit</Label>
              <Input
                id="featured_cars_limit"
                type="number"
                value={formData.featured_cars_limit || 6}
                onChange={(e) => handleInputChange('featured_cars_limit', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Integration
          </CardTitle>
          <CardDescription>
            Configure API keys for app integrations (handle with care)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clerk_api_key">Clerk API Key</Label>
              <Input
                id="clerk_api_key"
                type="password"
                value={formData.clerk_api_key || ''}
                onChange={(e) => handleInputChange('clerk_api_key', e.target.value)}
                placeholder="sk_..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="push_notification_key">Push Notification Key</Label>
              <Input
                id="push_notification_key"
                type="password"
                value={formData.push_notification_key || ''}
                onChange={(e) => handleInputChange('push_notification_key', e.target.value)}
                placeholder="Enter push notification key"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bunny_cdn_api_key">Bunny CDN API Key</Label>
              <Input
                id="bunny_cdn_api_key"
                type="password"
                value={formData.bunny_cdn_api_key || ''}
                onChange={(e) => handleInputChange('bunny_cdn_api_key', e.target.value)}
                placeholder="Enter Bunny CDN API key"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure app performance and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance_mode"
              checked={formData.maintenance_mode || false}
              onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
            />
            <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
            <span className="text-sm text-muted-foreground">
              Enable to put the app in maintenance mode
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cache_duration">Cache Duration (minutes)</Label>
              <Input
                id="cache_duration"
                type="number"
                value={formData.cache_duration || 60}
                onChange={(e) => handleInputChange('cache_duration', parseInt(e.target.value))}
                min="1"
                max="1440"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={formData.session_timeout || 30}
                onChange={(e) => handleInputChange('session_timeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
              <Input
                id="max_login_attempts"
                type="number"
                value={formData.max_login_attempts || 5}
                onChange={(e) => handleInputChange('max_login_attempts', parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ip_blocking_enabled"
              checked={formData.ip_blocking_enabled ?? true}
              onCheckedChange={(checked) => handleInputChange('ip_blocking_enabled', checked)}
            />
            <Label htmlFor="ip_blocking_enabled">IP Blocking</Label>
            <span className="text-sm text-muted-foreground">
              Enable automatic IP blocking for failed login attempts
            </span>
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