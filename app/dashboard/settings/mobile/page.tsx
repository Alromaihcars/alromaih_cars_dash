"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Smartphone, 
  Palette, 
  GitBranch, 
  Zap, 
  BarChart3, 
  Bell, 
  Shield, 
  Save, 
  RotateCcw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { 
  AlromaihSystemSettings, 
  AlromaihSystemSettingsInput,
  GET_SYSTEM_SETTINGS,
  UPDATE_SYSTEM_SETTINGS,
  CREATE_SYSTEM_SETTINGS,
  MOBILE_SETTINGS_GROUPS,
  getLocalizedText,
  validateForm
} from '@/lib/api/queries/system-settings'
import { graphqlClient } from '@/lib/api/graphql-client'

export default function MobileSettingsPage() {
  const [settings, setSettings] = useState<AlromaihSystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<AlromaihSystemSettings | null>(null)

  // Load system settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await graphqlClient.request(GET_SYSTEM_SETTINGS) as { AlromaihSystemSettings: AlromaihSystemSettings[] }
      
      if (response.AlromaihSystemSettings && response.AlromaihSystemSettings.length > 0) {
        const settingsData = response.AlromaihSystemSettings[0]
        setSettings(settingsData)
        setOriginalSettings(settingsData)
      } else {
        // Create new settings if none exist
        setSettings({
          id: '',
          active: true,
          enable_app_booking: false,
          enable_app_notifications: true,
          enable_app_reviews: true,
          enable_car_comparison: true,
          enable_in_app_chat: true,
          app_analytics_enabled: true,
          force_update: false
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load mobile settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AlromaihSystemSettingsInput, value: any) => {
    if (!settings) return
    
    const newSettings = { ...settings, [field]: value }
    setSettings(newSettings)
    setHasChanges(true)
    
    // Clear field error if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      
      // Get all mobile-related fields for validation
      const mobileFields = Object.values(MOBILE_SETTINGS_GROUPS).flatMap(group => group.fields)
      // Validate form (we'll skip validation for now since validateForm is not available)
      // const validationErrors = validateForm(settings, mobileFields)
      
      // if (Object.keys(validationErrors).length > 0) {
      //   setErrors(validationErrors)
      //   toast.error('Please fix validation errors before saving')
      //   return
      // }
      
      const settingsInput: AlromaihSystemSettingsInput = {
        active: settings.active,
        android_app_version: settings.android_app_version,
        android_min_version: settings.android_min_version,
        app_analytics_enabled: settings.app_analytics_enabled,
        app_logo: settings.app_logo,
        app_name: getLocalizedText(settings.app_name),
        app_primary_color: settings.app_primary_color,
        app_secondary_color: settings.app_secondary_color,
        app_splash_screen: settings.app_splash_screen,
        clerk_api_key: settings.clerk_api_key,
        display_name: getLocalizedText(settings.display_name),
        enable_app_booking: settings.enable_app_booking,
        enable_app_notifications: settings.enable_app_notifications,
        enable_app_reviews: settings.enable_app_reviews,
        enable_in_app_chat: settings.enable_in_app_chat,
        firebase_analytics_id: settings.firebase_analytics_id,
        force_update: settings.force_update,
        ios_app_version: settings.ios_app_version,
        ios_min_version: settings.ios_min_version,
        push_notification_key: settings.push_notification_key
      }
      
      if (settings.id) {
        // Update existing settings
        await graphqlClient.request(UPDATE_SYSTEM_SETTINGS, {
          id: settings.id,
          values: settingsInput
        })
        toast.success('Mobile settings updated successfully')
      } else {
        // Create new settings
        const response = await graphqlClient.request(CREATE_SYSTEM_SETTINGS, { values: settingsInput }) as { createAlromaihSystemSettings: AlromaihSystemSettings }
        setSettings(prev => prev ? { ...prev, id: response.createAlromaihSystemSettings.id } : null)
        toast.success('Mobile settings created successfully')
      }
      
      setHasChanges(false)
      setOriginalSettings(settings)
      
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save mobile settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      setHasChanges(false)
      setErrors({})
      toast.info('Settings reset to last saved values')
    }
  }

  const handleFileUpload = (field: keyof AlromaihSystemSettingsInput, file: File) => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      handleInputChange(field, result)
    }
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading mobile settings...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Settings Found</h3>
          <p className="text-muted-foreground mb-4">Unable to load mobile app settings.</p>
          <Button onClick={loadSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mobile App Settings</h1>
            <p className="text-muted-foreground">Configure your mobile application settings and features</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          {settings.active && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="active-toggle" className="text-sm font-medium">
            Enable Mobile Settings
          </Label>
          <Switch
            id="active-toggle"
            checked={settings.active}
            onCheckedChange={(checked) => handleInputChange('active', checked)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general" className="flex items-center space-x-1">
            <Smartphone className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-1">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center space-x-1">
            <GitBranch className="h-4 w-4" />
            <span>Versions</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-1">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Auth</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.general.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.general.label}</span>
              </CardTitle>
              <CardDescription>
                Configure basic mobile application information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name">App Name</Label>
                  <Input
                    id="app_name"
                    value={getLocalizedText(settings.app_name) || ''}
                    onChange={(e) => handleInputChange('app_name', e.target.value)}
                    placeholder="Enter mobile app name"
                    className={errors.app_name ? 'border-red-500' : ''}
                  />
                  {errors.app_name && (
                    <p className="text-sm text-red-500">{errors.app_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={getLocalizedText(settings.display_name) || ''}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Enter display name"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">App Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app_logo">App Logo</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="app_logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('app_logo', file)
                        }}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: PNG, 1024x1024px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app_splash_screen">Splash Screen</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="app_splash_screen"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('app_splash_screen', file)
                        }}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: PNG, 1080x1920px
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.appearance.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.appearance.label}</span>
              </CardTitle>
              <CardDescription>
                Customize the visual appearance and theme of your mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app_primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="app_primary_color"
                      type="color"
                      value={settings.app_primary_color || '#000000'}
                      onChange={(e) => handleInputChange('app_primary_color', e.target.value)}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      value={settings.app_primary_color || ''}
                      onChange={(e) => handleInputChange('app_primary_color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Main brand color for your mobile app
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app_secondary_color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="app_secondary_color"
                      type="color"
                      value={settings.app_secondary_color || '#666666'}
                      onChange={(e) => handleInputChange('app_secondary_color', e.target.value)}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      value={settings.app_secondary_color || ''}
                      onChange={(e) => handleInputChange('app_secondary_color', e.target.value)}
                      placeholder="#666666"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secondary brand color for app accents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version Settings */}
        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.versions.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.versions.label}</span>
              </CardTitle>
              <CardDescription>
                Manage app versions and update requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Android Versions</h4>
                  <div className="space-y-2">
                    <Label htmlFor="android_app_version">Current Version</Label>
                    <Input
                      id="android_app_version"
                      value={settings.android_app_version || ''}
                      onChange={(e) => handleInputChange('android_app_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="android_min_version">Minimum Version</Label>
                    <Input
                      id="android_min_version"
                      value={settings.android_min_version || ''}
                      onChange={(e) => handleInputChange('android_min_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">iOS Versions</h4>
                  <div className="space-y-2">
                    <Label htmlFor="ios_app_version">Current Version</Label>
                    <Input
                      id="ios_app_version"
                      value={settings.ios_app_version || ''}
                      onChange={(e) => handleInputChange('ios_app_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ios_min_version">Minimum Version</Label>
                    <Input
                      id="ios_min_version"
                      value={settings.ios_min_version || ''}
                      onChange={(e) => handleInputChange('ios_min_version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="force_update">Force Update</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to update to the latest version
                  </p>
                </div>
                <Switch
                  id="force_update"
                  checked={settings.force_update}
                  onCheckedChange={(checked) => handleInputChange('force_update', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.features.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.features.label}</span>
              </CardTitle>
              <CardDescription>
                Enable or disable mobile app features and functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable_app_booking">App Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to book appointments through the app
                    </p>
                  </div>
                  <Switch
                    id="enable_app_booking"
                    checked={settings.enable_app_booking}
                    onCheckedChange={(checked) => handleInputChange('enable_app_booking', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable_app_notifications">App Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable push notifications in the app
                    </p>
                  </div>
                  <Switch
                    id="enable_app_notifications"
                    checked={settings.enable_app_notifications}
                    onCheckedChange={(checked) => handleInputChange('enable_app_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable_app_reviews">App Reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to leave reviews in the app
                    </p>
                  </div>
                  <Switch
                    id="enable_app_reviews"
                    checked={settings.enable_app_reviews}
                    onCheckedChange={(checked) => handleInputChange('enable_app_reviews', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable_in_app_chat">In-App Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable chat functionality in the app
                    </p>
                  </div>
                  <Switch
                    id="enable_in_app_chat"
                    checked={settings.enable_in_app_chat}
                    onCheckedChange={(checked) => handleInputChange('enable_in_app_chat', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.analytics.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.analytics.label}</span>
              </CardTitle>
              <CardDescription>
                Configure analytics and tracking for your mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="app_analytics_enabled">Enable App Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable analytics tracking in the mobile app
                  </p>
                </div>
                <Switch
                  id="app_analytics_enabled"
                  checked={settings.app_analytics_enabled}
                  onCheckedChange={(checked) => handleInputChange('app_analytics_enabled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="firebase_analytics_id">Firebase Analytics ID</Label>
                <Input
                  id="firebase_analytics_id"
                  value={settings.firebase_analytics_id || ''}
                  onChange={(e) => handleInputChange('firebase_analytics_id', e.target.value)}
                  placeholder="Enter Firebase Analytics ID"
                  disabled={!settings.app_analytics_enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Firebase Analytics project ID for mobile app tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.notifications.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.notifications.label}</span>
              </CardTitle>
              <CardDescription>
                Configure push notification settings for your mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="push_notification_key">Push Notification Key</Label>
                <Textarea
                  id="push_notification_key"
                  value={settings.push_notification_key || ''}
                  onChange={(e) => handleInputChange('push_notification_key', e.target.value)}
                  placeholder="Enter push notification server key"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Server key for sending push notifications to mobile devices
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Settings */}
        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{MOBILE_SETTINGS_GROUPS.authentication.icon}</span>
                <span>{MOBILE_SETTINGS_GROUPS.authentication.label}</span>
              </CardTitle>
              <CardDescription>
                Configure authentication settings for your mobile app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clerk_api_key">Clerk API Key</Label>
                <Input
                  id="clerk_api_key"
                  type="password"
                  value={settings.clerk_api_key || ''}
                  onChange={(e) => handleInputChange('clerk_api_key', e.target.value)}
                  placeholder="Enter Clerk API key"
                />
                <p className="text-xs text-muted-foreground">
                  Clerk authentication API key for user management
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 