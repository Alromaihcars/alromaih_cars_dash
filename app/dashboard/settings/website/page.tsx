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
  Globe, 
  Palette, 
  Building2, 
  Share2, 
  BarChart3, 
  Settings, 
  Save, 
  RotateCcw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { 
  AlromaihSystemSettings, 
  AlromaihSystemSettingsInput,
  GET_SYSTEM_SETTINGS,
  UPDATE_SYSTEM_SETTINGS,
  CREATE_SYSTEM_SETTINGS,
  WEBSITE_SETTINGS_GROUPS,
  getLocalizedText,
  getOdooBoolean,
  getOdooNumber
} from '@/lib/api/queries/system-settings'
import { gql, gqlMutate } from '@/lib/api'

// Helper function to convert Odoo data to clean UI format
const convertOdooToUI = (odooSettings: AlromaihSystemSettings): AlromaihSystemSettingsInput => {
  return {
    active: getOdooBoolean(odooSettings.active),
    display_name: getLocalizedText(odooSettings.display_name),
    website_name: getLocalizedText(odooSettings.website_name),
    website_logo: getLocalizedText(odooSettings.website_logo),
    website_favicon: getLocalizedText(odooSettings.website_favicon),
    meta_title: getLocalizedText(odooSettings.meta_title),
    meta_description: getLocalizedText(odooSettings.meta_description),
    meta_keywords: getLocalizedText(odooSettings.meta_keywords),
    primary_color: getLocalizedText(odooSettings.primary_color) || '#0056b3',
    secondary_color: getLocalizedText(odooSettings.secondary_color) || '#32618b',
    footer_text: getLocalizedText(odooSettings.footer_text),
    cars_per_page: getOdooNumber(odooSettings.cars_per_page, 12),
    enable_car_comparison: getOdooBoolean(odooSettings.enable_car_comparison),
    company_phone: getLocalizedText(odooSettings.company_phone),
    company_email: getLocalizedText(odooSettings.company_email),
    company_address: getLocalizedText(odooSettings.company_address),
    facebook_url: getLocalizedText(odooSettings.facebook_url),
    twitter_url: getLocalizedText(odooSettings.twitter_url),
    instagram_url: getLocalizedText(odooSettings.instagram_url),
    youtube_url: getLocalizedText(odooSettings.youtube_url),
    google_analytics_id: getLocalizedText(odooSettings.google_analytics_id),
    meta_pixel_id: getLocalizedText(odooSettings.meta_pixel_id),
    linkedin_pixel_id: getLocalizedText(odooSettings.linkedin_pixel_id),
    snapchat_pixel_id: getLocalizedText(odooSettings.snapchat_pixel_id),
    tiktok_pixel_id: getLocalizedText(odooSettings.tiktok_pixel_id),
    x_pixel_id: getLocalizedText(odooSettings.x_pixel_id)
  }
}

export default function WebsiteSettingsPage() {
  const [originalOdooSettings, setOriginalOdooSettings] = useState<AlromaihSystemSettings | null>(null)
  const [settings, setSettings] = useState<AlromaihSystemSettingsInput | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Load system settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await gql(GET_SYSTEM_SETTINGS)
      
      if (data?.AlromaihSystemSettings && data.AlromaihSystemSettings.length > 0) {
        const odooSettings = data.AlromaihSystemSettings[0] as AlromaihSystemSettings
        setOriginalOdooSettings(odooSettings)
        setSettings(convertOdooToUI(odooSettings))
      } else {
        // Create new settings if none exist
        setSettings({
          active: true,
          display_name: '',
          website_name: '',
          website_logo: '',
          website_favicon: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
          primary_color: '#0056b3',
          secondary_color: '#32618b',
          footer_text: '',
          cars_per_page: 12,
          enable_car_comparison: true,
          company_phone: '',
          company_email: '',
          company_address: '',
          facebook_url: '',
          twitter_url: '',
          instagram_url: '',
          youtube_url: '',
          google_analytics_id: '',
          meta_pixel_id: '',
          linkedin_pixel_id: '',
          snapchat_pixel_id: '',
          tiktok_pixel_id: '',
          x_pixel_id: ''
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load website settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof AlromaihSystemSettingsInput, value: any) => {
    if (!settings) return
    
    // Convert value based on field type for proper Odoo compatibility
    let convertedValue = value
    if (typeof value === 'boolean' || field.includes('enable_') || field === 'active' || field === 'force_update' || field === 'app_analytics_enabled') {
      convertedValue = value
    } else if (field === 'cars_per_page') {
      convertedValue = getOdooNumber(value, 12)
    } else if (typeof value === 'string' && value.trim() === '') {
      convertedValue = false // Empty strings become false in Odoo
    }
    
    const newSettings = { ...settings, [field]: convertedValue }
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
      
      const settingsInput: AlromaihSystemSettingsInput = {
        active: settings.active,
        cars_per_page: settings.cars_per_page,
        company_address: getLocalizedText(settings.company_address),
        company_email: settings.company_email,
        company_phone: settings.company_phone,
        display_name: getLocalizedText(settings.display_name),
        enable_car_comparison: settings.enable_car_comparison,
        facebook_url: settings.facebook_url,
        footer_text: getLocalizedText(settings.footer_text),
        google_analytics_id: settings.google_analytics_id,
        instagram_url: settings.instagram_url,
        linkedin_pixel_id: settings.linkedin_pixel_id,
        meta_description: getLocalizedText(settings.meta_description),
        meta_keywords: getLocalizedText(settings.meta_keywords),
        meta_pixel_id: settings.meta_pixel_id,
        meta_title: getLocalizedText(settings.meta_title),
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        snapchat_pixel_id: settings.snapchat_pixel_id,
        tiktok_pixel_id: settings.tiktok_pixel_id,
        twitter_url: settings.twitter_url,
        website_favicon: settings.website_favicon,
        website_logo: settings.website_logo,
        website_name: getLocalizedText(settings.website_name),
        x_pixel_id: settings.x_pixel_id,
        youtube_url: settings.youtube_url
      }
      
      if (originalOdooSettings?.id) {
        // Update existing settings using MCP
        await gqlMutate(UPDATE_SYSTEM_SETTINGS, {
          id: String(originalOdooSettings.id),
          values: settingsInput
        })
        toast.success('Website settings updated successfully')
      } else {
        // Create new settings using MCP
        await gqlMutate(CREATE_SYSTEM_SETTINGS, {
          values: settingsInput
        })
        toast.success('Website settings created successfully')
      }
      
      setHasChanges(false)
      await loadSettings() // Reload fresh data from server
      
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save website settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalOdooSettings) {
      setSettings(convertOdooToUI(originalOdooSettings))
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

  const validateUrl = (url: string) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading website settings...</span>
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
          <p className="text-muted-foreground mb-4">Unable to load website settings.</p>
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
          <div className="p-2 bg-green-100 rounded-lg">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Website Settings</h1>
            <p className="text-muted-foreground">Configure your website appearance, content, and integrations</p>
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
            Enable Website Settings
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-1">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-1">
            <Share2 className="h-4 w-4" />
            <span>Social</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{WEBSITE_SETTINGS_GROUPS.general.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.general.label}</span>
              </CardTitle>
              <CardDescription>
                Basic website information and branding elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_name">Website Name</Label>
                  <Input
                    id="website_name"
                    value={getLocalizedText(settings.website_name) || ''}
                    onChange={(e) => handleInputChange('website_name', e.target.value)}
                    placeholder="Enter website name"
                    className={errors.website_name ? 'border-red-500' : ''}
                  />
                  {errors.website_name && (
                    <p className="text-sm text-red-500">{errors.website_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    The name of your website displayed in browser titles
                  </p>
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
                <h4 className="text-sm font-medium">Website Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_logo">Website Logo</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="website_logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('website_logo', file)
                        }}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: PNG, 200x50px
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website_favicon">Website Favicon</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="website_favicon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload('website_favicon', file)
                        }}
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: ICO or PNG, 32x32px
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">SEO Settings</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={getLocalizedText(settings.meta_title) || ''}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="Enter meta title for SEO"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      Title tag for search engines (50-60 characters)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={getLocalizedText(settings.meta_description) || ''}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="Enter meta description for SEO"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      Description for search engines (150-160 characters)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta_keywords">Meta Keywords</Label>
                    <Input
                      id="meta_keywords"
                      value={getLocalizedText(settings.meta_keywords) || ''}
                      onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                      placeholder="Enter keywords separated by commas"
                    />
                    <p className="text-xs text-muted-foreground">
                      Keywords for search engines (comma-separated)
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
                <span>{WEBSITE_SETTINGS_GROUPS.appearance.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.appearance.label}</span>
              </CardTitle>
              <CardDescription>
                Customize the visual appearance and theme of your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings.primary_color || '#000000'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color || ''}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Main brand color for your website
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings.secondary_color || '#666666'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      value={settings.secondary_color || ''}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#666666"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secondary brand color for accents
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="footer_text">Footer Text</Label>
                <Textarea
                  id="footer_text"
                  value={getLocalizedText(settings.footer_text) || ''}
                  onChange={(e) => handleInputChange('footer_text', e.target.value)}
                  placeholder="Enter footer text"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Text displayed in the website footer
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{WEBSITE_SETTINGS_GROUPS.company.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.company.label}</span>
              </CardTitle>
              <CardDescription>
                Company contact information and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_email">Company Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={settings.company_email || ''}
                    onChange={(e) => handleInputChange('company_email', e.target.value)}
                    placeholder="contact@example.com"
                    className={errors.company_email ? 'border-red-500' : ''}
                  />
                  {errors.company_email && (
                    <p className="text-sm text-red-500">{errors.company_email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Main contact email address
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Company Phone</Label>
                  <Input
                    id="company_phone"
                    value={settings.company_phone || ''}
                    onChange={(e) => handleInputChange('company_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-muted-foreground">
                    Main contact phone number
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={getLocalizedText(settings.company_address) || ''}
                  onChange={(e) => handleInputChange('company_address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Full company address
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{WEBSITE_SETTINGS_GROUPS.social.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.social.label}</span>
              </CardTitle>
              <CardDescription>
                Social media profiles and links
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="facebook_url"
                      value={settings.facebook_url || ''}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className={!validateUrl(settings.facebook_url || '') ? 'border-red-500' : ''}
                    />
                    {settings.facebook_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="instagram_url"
                      value={settings.instagram_url || ''}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/yourpage"
                      className={!validateUrl(settings.instagram_url || '') ? 'border-red-500' : ''}
                    />
                    {settings.instagram_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="twitter_url"
                      value={settings.twitter_url || ''}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                      placeholder="https://twitter.com/yourpage"
                      className={!validateUrl(settings.twitter_url || '') ? 'border-red-500' : ''}
                    />
                    {settings.twitter_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="youtube_url"
                      value={settings.youtube_url || ''}
                      onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                      placeholder="https://youtube.com/yourchannel"
                      className={!validateUrl(settings.youtube_url || '') ? 'border-red-500' : ''}
                    />
                    {settings.youtube_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
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
                <span>{WEBSITE_SETTINGS_GROUPS.analytics.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.analytics.label}</span>
              </CardTitle>
              <CardDescription>
                Analytics and tracking pixels for website monitoring and advertising
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={settings.google_analytics_id || ''}
                    onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                  <p className="text-xs text-muted-foreground">
                    Google Analytics tracking ID
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
                  <Input
                    id="meta_pixel_id"
                    value={settings.meta_pixel_id || ''}
                    onChange={(e) => handleInputChange('meta_pixel_id', e.target.value)}
                    placeholder="Enter Meta (Facebook) Pixel ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta Pixel for Facebook advertising
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin_pixel_id">LinkedIn Pixel ID</Label>
                  <Input
                    id="linkedin_pixel_id"
                    value={settings.linkedin_pixel_id || ''}
                    onChange={(e) => handleInputChange('linkedin_pixel_id', e.target.value)}
                    placeholder="Enter LinkedIn Pixel ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    LinkedIn Insight Tag ID
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snapchat_pixel_id">Snapchat Pixel ID</Label>
                  <Input
                    id="snapchat_pixel_id"
                    value={settings.snapchat_pixel_id || ''}
                    onChange={(e) => handleInputChange('snapchat_pixel_id', e.target.value)}
                    placeholder="Enter Snapchat Pixel ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Snapchat Pixel for advertising
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
                  <Input
                    id="tiktok_pixel_id"
                    value={settings.tiktok_pixel_id || ''}
                    onChange={(e) => handleInputChange('tiktok_pixel_id', e.target.value)}
                    placeholder="Enter TikTok Pixel ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    TikTok Pixel for advertising
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="x_pixel_id">X (Twitter) Pixel ID</Label>
                  <Input
                    id="x_pixel_id"
                    value={settings.x_pixel_id || ''}
                    onChange={(e) => handleInputChange('x_pixel_id', e.target.value)}
                    placeholder="Enter X Pixel ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    X (formerly Twitter) Pixel ID
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{WEBSITE_SETTINGS_GROUPS.features.icon}</span>
                <span>{WEBSITE_SETTINGS_GROUPS.features.label}</span>
              </CardTitle>
              <CardDescription>
                Website functionality and feature settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enable_car_comparison">Enable Car Comparison</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to compare cars on the website
                  </p>
                </div>
                <Switch
                  id="enable_car_comparison"
                  checked={settings.enable_car_comparison}
                  onCheckedChange={(checked) => handleInputChange('enable_car_comparison', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="cars_per_page">Cars Per Page</Label>
                <Input
                  id="cars_per_page"
                  type="number"
                  value={settings.cars_per_page || ''}
                  onChange={(e) => handleInputChange('cars_per_page', parseInt(e.target.value) || 12)}
                  placeholder="12"
                  min="1"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">
                  Number of cars to display per page (1-100)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 