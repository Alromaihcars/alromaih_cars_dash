"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Globe, Smartphone, Palette, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BinaryImageUpload } from '@/components/ui/binary-image-upload';
import { 
  SystemSettings, 
  SystemSettingsInput, 
  binaryDataUtils,
  LanguageCode
} from '@/lib/api/queries/system-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LocalizedInput } from "@/components/ui/localized-input"
import { useNotifications } from "@/components/ui/notification"
import { useSystemSettings } from "@/hooks/use-system-settings"
import { 
  Save, 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Phone,
  MapPin,
  Building,
  Clock,
  ExternalLink,
  Settings
} from "lucide-react"

interface WebsiteSettingsProps {
  settings?: SystemSettings;
  onSettingsChange?: (settings: SystemSettings) => void;
  loading?: boolean;
  language?: LanguageCode;
}

export default function WebsiteSettings({
  settings,
  onSettingsChange,
  loading = false,
  language = 'en_US'
}: WebsiteSettingsProps) {
  const { addNotification, NotificationContainer } = useNotifications()
  const {
    settings: systemSettings,
    isLoading,
    isUpdating,
    error,
    exists,
    hasUnsavedChanges,
    lastSaved,
    updateSettings,
    updateField,
    updateTranslation,
    uploadBinaryAsset,
    getLocalizedValue,
    getBinaryAssetUrl,
    validateSettings,
    isFieldComplete,
    getTranslationStatus,
    refresh
  } = useSystemSettings({ 
    language, 
    includeBinary: true, 
    autoRefresh: false 
  })

  const [localSettings, setLocalSettings] = useState<SystemSettingsInput>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [binaryAssets, setBinaryAssets] = useState<SystemSettings | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Update local settings when prop changes
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        website_name: settings.website_name || '',
        website_name_translations: settings.website_name_translations,
        company_phone: settings.company_phone || '',
        company_phone_translations: settings.company_phone_translations,
        company_email: settings.company_email || '',
        company_email_translations: settings.company_email_translations,
        company_address: settings.company_address || '',
        company_address_translations: settings.company_address_translations,
        whatsapp_business_number: settings.whatsapp_business_number || '',
        customer_support_email: settings.customer_support_email || '',
        business_registration_number: settings.business_registration_number || '',
        vat_number: settings.vat_number || '',
        copyright_text: settings.copyright_text || '',
        copyright_text_translations: settings.copyright_text_translations,
        business_hours_open: settings.business_hours_open || '',
        business_hours_close: settings.business_hours_close || '',
        business_days: settings.business_days || '',
        business_days_translations: settings.business_days_translations,
        google_analytics_id: settings.google_analytics_id || '',
        google_tag_manager_id: settings.google_tag_manager_id || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        meta_pixel_id: settings.meta_pixel_id || '',
        snapchat_pixel_id: settings.snapchat_pixel_id || '',
        linkedin_pixel_id: settings.linkedin_pixel_id || '',
        x_pixel_id: settings.x_pixel_id || '',
        meta_title: settings.meta_title || '',
        meta_title_translations: settings.meta_title_translations,
        meta_description: settings.meta_description || '',
        meta_description_translations: settings.meta_description_translations,
        meta_keywords: settings.meta_keywords || '',
        meta_keywords_translations: settings.meta_keywords_translations,
        primary_color: settings.primary_color || '#46194F',
        secondary_color: settings.secondary_color || '#',
        facebook_url: settings.facebook_url || '',
        instagram_url: settings.instagram_url || '',
        youtube_url: settings.youtube_url || '',
        snapchat_url: settings.snapchat_url || '',
        tiktok_url: settings.tiktok_url || '',
        linkedin_url: settings.linkedin_url || '',
        x_url: settings.x_url || '',
        app_name: settings.app_name || '',
        app_store_url: settings.app_store_url || '',
        play_store_url: settings.play_store_url || '',
        android_app_version: settings.android_app_version || '',
        android_min_version: settings.android_min_version || '',
        ios_app_version: settings.ios_app_version || '',
        ios_min_version: settings.ios_min_version || ''
      });
      
      // Use settings directly as binary assets source
      setBinaryAssets(settings);
    }
  }, [settings]);

  const handleInputChange = (field: keyof SystemSettingsInput, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBinaryAssetUpload = async (field: string, base64Data: string | undefined) => {
    if (!base64Data) {
      console.log(`🗑️ Clearing ${field}`);
      setLocalSettings(prev => ({
        ...prev,
        [field]: undefined
      }));
      
      // Clear any existing errors for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      
      return;
    }

    try {
      console.log(`📤 Uploading ${field}:`, {
        field,
        dataLength: base64Data.length,
        isValidBase64: binaryDataUtils.isValidBase64(base64Data),
        preview: base64Data.substring(0, 100) + '...'
      });

      // Clear any existing errors for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      // Update local state immediately for UI responsiveness
      setLocalSettings(prev => ({
        ...prev,
        [field]: base64Data
      }));

      // Update via real API immediately for binary assets
      if (onSettingsChange && settings) {
        const updatedSettings = { ...settings, [field]: base64Data };
        
        console.log(`🔄 Calling onSettingsChange for ${field}...`);
        await onSettingsChange(updatedSettings);
        console.log(`✅ ${field} upload completed successfully`);
      } else {
        throw new Error(`No settings change handler available or no current settings. Handler: ${!!onSettingsChange}, Settings: ${!!settings}`);
      }

      setSaveMessage(`${field} uploaded successfully!`);
      setTimeout(() => setSaveMessage(null), 3000);

      // Update binary assets state for preview
      setBinaryAssets(prev => ({
        ...prev,
        [field]: base64Data
      } as SystemSettings));

    } catch (error) {
      console.error(`❌ Failed to upload ${field}:`, {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        field,
        dataLength: base64Data?.length || 0,
        hasOnSettingsChange: !!onSettingsChange,
        hasSettings: !!settings,
        timestamp: new Date().toISOString()
      });
      
      // Provide user-friendly error messages
      let userFriendlyMessage = `Failed to upload ${field}`;
      
      if (error instanceof Error) {
        if (error.message.includes('No settings change handler')) {
          userFriendlyMessage = `Configuration error - upload handler not available for ${field}`;
        } else if (error.message.includes('GraphQL')) {
          userFriendlyMessage = `API error uploading ${field} - please try again`;
        } else if (error.message.includes('network')) {
          userFriendlyMessage = `Network error uploading ${field} - check your connection`;
        } else if (error.message.includes('size') || error.message.includes('large')) {
          userFriendlyMessage = `File too large for ${field} - please use a smaller image`;
        } else {
          userFriendlyMessage = `${field} upload failed: ${error.message}`;
        }
      }
      
      setErrors(prev => ({
        ...prev,
        [field]: userFriendlyMessage
      }));
      
      // Revert local state on error
      setLocalSettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[field as keyof typeof newSettings];
        return newSettings;
      });
      
      // Clear binary assets state on error
      setBinaryAssets(prev => {
        if (!prev) return prev;
        const newAssets = { ...prev };
        delete newAssets[field as keyof typeof newAssets];
        return newAssets;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!localSettings.website_name?.trim()) {
      newErrors.website_name = 'Website name is required';
    }

    if (localSettings.company_email && !localSettings.company_email.includes('@')) {
      newErrors.company_email = 'Please enter a valid email address';
    }

    if (localSettings.customer_support_email && !localSettings.customer_support_email.includes('@')) {
      newErrors.customer_support_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Call the real onSettingsChange function which uses the actual API
      if (onSettingsChange) {
        const updatedSettings = { ...settings, ...localSettings } as SystemSettings;
        await onSettingsChange(updatedSettings);
        setSaveMessage('Settings saved successfully!');
      } else {
        throw new Error('No save handler provided');
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLogoPreview = (fieldName: string): string | undefined => {
    // Check local changes first
    const localValue = localSettings[fieldName as keyof SystemSettingsInput] as string;
    if (localValue) {
      return binaryDataUtils.toDataURL(localValue);
    }
    
    // Fall back to binary assets or settings
    const settingsData = binaryAssets || settings;
    if (settingsData) {
      const binaryField = settingsData[fieldName as keyof SystemSettings] as string;
      const cdnField = settingsData[`${fieldName}_cdn_url` as keyof SystemSettings] as string;
      
      if (binaryField) {
        return binaryDataUtils.toDataURL(binaryField);
      }
      
      if (cdnField) {
        return cdnField;
      }
    }
    
    return undefined;
  };

  // Get translation progress
  const translationStatus = getTranslationStatus()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Settings</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!exists) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No Settings Found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              No system settings have been configured yet. Please contact your administrator.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Website Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your website appearance, content, and localization
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Translation Progress */}
              <Badge variant="secondary" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {translationStatus.percentage}% Translated
              </Badge>
              
              {/* Save Status */}
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
              
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Last saved: {new Date(lastSaved).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Basic information about your website
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocalizedInput
                label="Website Name"
                value={localSettings.website_name || ''}
                translations={localSettings.website_name_translations}
                onChange={(value, translations) => handleInputChange('website_name', value)}
                placeholder="Enter your website name"
                required
                description="The main name of your website that appears in headers and titles"
              />

              <LocalizedInput
                label="Meta Title"
                value={localSettings.meta_title || ''}
                translations={localSettings.meta_title_translations}
                onChange={(value, translations) => handleInputChange('meta_title', value)}
                placeholder="SEO meta title"
                description="Title that appears in search engine results (50-60 characters recommended)"
              />

              <LocalizedInput
                label="Meta Description"
                value={localSettings.meta_description || ''}
                translations={localSettings.meta_description_translations}
                onChange={(value, translations) => handleInputChange('meta_description', value)}
                placeholder="Brief description for search engines"
                type="textarea"
                rows={3}
                description="Description shown in search results (150-160 characters recommended)"
              />

              <LocalizedInput
                label="Meta Keywords"
                value={localSettings.meta_keywords || ''}
                translations={localSettings.meta_keywords_translations}
                onChange={(value, translations) => handleInputChange('meta_keywords', value)}
                placeholder="keyword1, keyword2, keyword3"
                description="Comma-separated keywords for SEO (optional)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Contact details displayed on your website
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocalizedInput
                label="Company Phone"
                value={localSettings.company_phone || ''}
                translations={localSettings.company_phone_translations}
                onChange={(value, translations) => handleInputChange('company_phone', value)}
                placeholder="+966 XX XXX XXXX"
                description="Main company phone number"
              />

              <LocalizedInput
                label="Company Email"
                value={localSettings.company_email || ''}
                translations={localSettings.company_email_translations}
                onChange={(value, translations) => handleInputChange('company_email', value)}
                placeholder="info@company.com"
                required
                description="Primary company email address"
              />

              <LocalizedInput
                label="Company Address"
                value={localSettings.company_address || ''}
                translations={localSettings.company_address_translations}
                onChange={(value, translations) => handleInputChange('company_address', value)}
                placeholder="Street, City, Country"
                type="textarea"
                rows={3}
                description="Full company address"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>WhatsApp Business Number</Label>
                  <Input
                    value={localSettings.whatsapp_business_number || ''}
                    onChange={(e) => handleInputChange('whatsapp_business_number', e.target.value)}
                    placeholder="+966 XX XXX XXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    WhatsApp number for customer support
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Customer Support Email</Label>
                  <Input
                    value={localSettings.customer_support_email || ''}
                    onChange={(e) => handleInputChange('customer_support_email', e.target.value)}
                    placeholder="support@company.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dedicated support email address
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Registration Number</Label>
                  <Input
                    value={localSettings.business_registration_number || ''}
                    onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                    placeholder="CR Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>VAT Number</Label>
                  <Input
                    value={localSettings.vat_number || ''}
                    onChange={(e) => handleInputChange('vat_number', e.target.value)}
                    placeholder="VAT Registration Number"
                  />
                </div>
              </div>

              <LocalizedInput
                label="Copyright Text"
                value={localSettings.copyright_text || ''}
                translations={localSettings.copyright_text_translations}
                onChange={(value, translations) => handleInputChange('copyright_text', value)}
                placeholder="© 2024 Company Name. All rights reserved."
                description="Copyright notice displayed in the footer"
              />
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={localSettings.business_hours_open || ''}
                    onChange={(e) => handleInputChange('business_hours_open', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={localSettings.business_hours_close || ''}
                    onChange={(e) => handleInputChange('business_hours_close', e.target.value)}
                  />
                </div>
              </div>

              <LocalizedInput
                label="Operating Days"
                value={localSettings.business_days || ''}
                translations={localSettings.business_days_translations}
                onChange={(value, translations) => handleInputChange('business_days', value)}
                placeholder="Sunday to Thursday"
                description="Days when the business is open"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Define your brand colors and visual identity
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={localSettings.primary_color || '#46194F'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={localSettings.primary_color || '#46194F'}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#46194F"
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Main brand color used throughout the website
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={localSettings.secondary_color || '#6B7280'}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-20 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={localSettings.secondary_color || ''}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#6B7280"
                      className="font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secondary color for accents and highlights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload Sections would go here */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Brand Assets
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload logos and brand assets
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Brand asset uploads will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect your social media profiles
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    value={localSettings.facebook_url || ''}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    value={localSettings.instagram_url || ''}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/youraccount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    value={localSettings.youtube_url || ''}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>TikTok URL</Label>
                  <Input
                    value={localSettings.tiktok_url || ''}
                    onChange={(e) => handleInputChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@youraccount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Snapchat URL</Label>
                  <Input
                    value={localSettings.snapchat_url || ''}
                    onChange={(e) => handleInputChange('snapchat_url', e.target.value)}
                    placeholder="https://snapchat.com/add/youraccount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={localSettings.linkedin_url || ''}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>

                <div className="space-y-2">
                  <Label>X (Twitter) URL</Label>
                  <Input
                    value={localSettings.x_url || ''}
                    onChange={(e) => handleInputChange('x_url', e.target.value)}
                    placeholder="https://x.com/youraccount"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure analytics and tracking pixels
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={localSettings.google_analytics_id || ''}
                    onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Google Tag Manager ID</Label>
                  <Input
                    value={localSettings.google_tag_manager_id || ''}
                    onChange={(e) => handleInputChange('google_tag_manager_id', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meta Pixel ID</Label>
                  <Input
                    value={localSettings.meta_pixel_id || ''}
                    onChange={(e) => handleInputChange('meta_pixel_id', e.target.value)}
                    placeholder="123456789012345"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>TikTok Pixel ID</Label>
                  <Input
                    value={localSettings.tiktok_pixel_id || ''}
                    onChange={(e) => handleInputChange('tiktok_pixel_id', e.target.value)}
                    placeholder="C4XXXXXXXXXX"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Snapchat Pixel ID</Label>
                  <Input
                    value={localSettings.snapchat_pixel_id || ''}
                    onChange={(e) => handleInputChange('snapchat_pixel_id', e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>LinkedIn Pixel ID</Label>
                  <Input
                    value={localSettings.linkedin_pixel_id || ''}
                    onChange={(e) => handleInputChange('linkedin_pixel_id', e.target.value)}
                    placeholder="12345"
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label>X Pixel ID</Label>
                  <Input
                    value={localSettings.x_pixel_id || ''}
                    onChange={(e) => handleInputChange('x_pixel_id', e.target.value)}
                    placeholder="o1234"
                    className="font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges ? "You have unsaved changes" : "All changes are saved"}
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isUpdating || !hasUnsavedChanges}
              className="min-w-32"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <NotificationContainer />
    </div>
  );
} 