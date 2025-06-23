"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Smartphone, Save, Palette, Settings, Bell, Key } from "lucide-react"
import { SystemSettings } from "@/lib/api/queries/system-settings"
import { ImageUpload } from "@/components/ui/image-upload"

interface MobileSettingsProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => Promise<boolean>;
  loading?: boolean;
}

export function MobileSettings({ settings, onUpdate, loading }: MobileSettingsProps) {
  const handleSave = async () => {
    console.log('Mobile app settings saved');
  };

  const handleAppLogoUpload = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        await onUpdate({ app_logo: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSplashScreenUpload = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        await onUpdate({ app_splash_screen: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* App Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Branding
          </CardTitle>
          <CardDescription>Configure your mobile app's branding and visual identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="app_name">App Name</Label>
            <Input
              id="app_name"
              value={settings.app_name || ''}
              onChange={(e) => onUpdate({ app_name: e.target.value })}
              placeholder="Enter app name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>App Logo</Label>
              <ImageUpload
                onChange={handleAppLogoUpload}
                value={settings.app_logo}
                accept={['image/png', 'image/jpeg']}
                maxSize={2 * 1024 * 1024}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 512x512px, max 2MB (PNG, JPEG)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Splash Screen</Label>
              <ImageUpload
                onChange={handleSplashScreenUpload}
                value={settings.app_splash_screen}
                accept={['image/png', 'image/jpeg']}
                maxSize={3 * 1024 * 1024}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 1080x1920px, max 3MB (PNG, JPEG)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            App Theme
          </CardTitle>
          <CardDescription>Customize your mobile app's color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app_primary_color">App Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="app_primary_color"
                  type="color"
                  value={settings.app_primary_color || '#0056b3'}
                  onChange={(e) => onUpdate({ app_primary_color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={settings.app_primary_color || '#0056b3'}
                  onChange={(e) => onUpdate({ app_primary_color: e.target.value })}
                  placeholder="#0056b3"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_secondary_color">App Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="app_secondary_color"
                  type="color"
                  value={settings.app_secondary_color || '#6c757d'}
                  onChange={(e) => onUpdate({ app_secondary_color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={settings.app_secondary_color || '#6c757d'}
                  onChange={(e) => onUpdate({ app_secondary_color: e.target.value })}
                  placeholder="#6c757d"
                  className="flex-1"
                />
              </div>
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
          <CardDescription>Manage app versions and update requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="android_app_version">Android App Version</Label>
              <Input
                id="android_app_version"
                value={settings.android_app_version || ''}
                onChange={(e) => onUpdate({ android_app_version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="android_min_version">Android Minimum Version</Label>
              <Input
                id="android_min_version"
                value={settings.android_min_version || ''}
                onChange={(e) => onUpdate({ android_min_version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ios_app_version">iOS App Version</Label>
              <Input
                id="ios_app_version"
                value={settings.ios_app_version || ''}
                onChange={(e) => onUpdate({ ios_app_version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ios_min_version">iOS Minimum Version</Label>
              <Input
                id="ios_min_version"
                value={settings.ios_min_version || ''}
                onChange={(e) => onUpdate({ ios_min_version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Force Update</Label>
              <p className="text-sm text-muted-foreground">
                Force users to update to the latest version
              </p>
            </div>
            <Switch
              checked={settings.force_update || false}
              onCheckedChange={(checked) => onUpdate({ force_update: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            App Features
          </CardTitle>
          <CardDescription>Enable or disable specific app features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable push notifications in the mobile app
                </p>
              </div>
              <Switch
                checked={settings.enable_app_notifications || false}
                onCheckedChange={(checked) => onUpdate({ enable_app_notifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-App Chat</Label>
                <p className="text-sm text-muted-foreground">
                  Enable chat functionality within the app
                </p>
              </div>
              <Switch
                checked={settings.enable_in_app_chat || false}
                onCheckedChange={(checked) => onUpdate({ enable_in_app_chat: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Car Comparison</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to compare different car models
                </p>
              </div>
              <Switch
                checked={settings.enable_car_comparison || false}
                onCheckedChange={(checked) => onUpdate({ enable_car_comparison: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Car Booking</Label>
                <p className="text-sm text-muted-foreground">
                  Enable car booking functionality in the app
                </p>
              </div>
              <Switch
                checked={settings.enable_app_booking || false}
                onCheckedChange={(checked) => onUpdate({ enable_app_booking: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Car Reviews</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to write and read car reviews
                </p>
              </div>
              <Switch
                checked={settings.enable_app_reviews || false}
                onCheckedChange={(checked) => onUpdate({ enable_app_reviews: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>App Configuration</CardTitle>
          <CardDescription>Configure app behavior and content settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cars_per_page">Cars Per Page</Label>
            <Input
              id="cars_per_page"
              type="number"
              value={settings.cars_per_page || 10}
              onChange={(e) => onUpdate({ cars_per_page: parseInt(e.target.value) || 10 })}
              min="5"
              max="50"
              placeholder="10"
            />
            <p className="text-sm text-muted-foreground">
              Number of cars to display per page in the app (5-50)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>App Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Enable analytics tracking in the mobile app
              </p>
            </div>
            <Switch
              checked={settings.app_analytics_enabled || false}
              onCheckedChange={(checked) => onUpdate({ app_analytics_enabled: checked })}
            />
          </div>

          {settings.app_analytics_enabled && (
            <div className="space-y-2">
              <Label htmlFor="firebase_analytics_id">Firebase Analytics ID</Label>
              <Input
                id="firebase_analytics_id"
                value={settings.firebase_analytics_id || ''}
                onChange={(e) => onUpdate({ firebase_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* App API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Services
          </CardTitle>
          <CardDescription>Configure third-party service API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clerk_api_key">Clerk API Key</Label>
            <Input
              id="clerk_api_key"
              type="password"
              value={settings.clerk_api_key || ''}
              onChange={(e) => onUpdate({ clerk_api_key: e.target.value })}
              placeholder="pk_live_xxxxxxxxxxxxxxxx"
            />
            <p className="text-sm text-muted-foreground">
              API key for Clerk authentication service
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="push_notification_key">Push Notification Key</Label>
            <Input
              id="push_notification_key"
              type="password"
              value={settings.push_notification_key || ''}
              onChange={(e) => onUpdate({ push_notification_key: e.target.value })}
              placeholder="Firebase Cloud Messaging key"
            />
            <p className="text-sm text-muted-foreground">
              Firebase Cloud Messaging server key for push notifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Mobile Settings'}
        </Button>
      </div>
    </div>
  );
} 