"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Globe, Save, Upload, Palette } from "lucide-react"
import { SystemSettings } from "@/lib/api/queries/system-settings"
import { ImageUpload } from "@/components/ui/image-upload"

interface WebsiteSettingsProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => Promise<boolean>;
  loading?: boolean;
}

export function WebsiteSettings({ settings, onUpdate, loading }: WebsiteSettingsProps) {
  const handleSave = async () => {
    // The settings are already being updated in real-time through onUpdate
    // This could trigger a toast notification or additional save logic
    console.log('Website settings saved');
  };

  const handleLogoUpload = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        await onUpdate({ website_logo: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = async (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        await onUpdate({ website_favicon: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Basic Information
          </CardTitle>
          <CardDescription>Configure your website's basic information and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website_name">Website Name</Label>
              <Input
                id="website_name"
                value={settings.website_name || ''}
                onChange={(e) => onUpdate({ website_name: e.target.value })}
                placeholder="Enter website name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={settings.company_email || ''}
                onChange={(e) => onUpdate({ company_email: e.target.value })}
                placeholder="info@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={settings.company_phone || ''}
                onChange={(e) => onUpdate({ company_phone: e.target.value })}
                placeholder="+966 11 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_address">Company Address</Label>
              <Input
                id="company_address"
                value={settings.company_address || ''}
                onChange={(e) => onUpdate({ company_address: e.target.value })}
                placeholder="Enter company address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer_text">Footer Text</Label>
            <Textarea
              id="footer_text"
              value={settings.footer_text || ''}
              onChange={(e) => onUpdate({ footer_text: e.target.value })}
              placeholder="© 2024 Your Company. All rights reserved."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Website Branding
          </CardTitle>
          <CardDescription>Upload your website logo and favicon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Website Logo</Label>
              <ImageUpload
                onChange={handleLogoUpload}
                value={settings.website_logo}
                accept={['image/jpeg', 'image/png', 'image/webp']}
                maxSize={2 * 1024 * 1024}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 200x60px, max 2MB (JPEG, PNG, WebP)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Website Favicon</Label>
              <ImageUpload
                onChange={handleFaviconUpload}
                value={settings.website_favicon}
                accept={['image/png', 'image/x-icon']}
                maxSize={1 * 1024 * 1024}
                className="h-32"
              />
              <p className="text-sm text-muted-foreground">
                Recommended: 32x32px, max 1MB (PNG, ICO)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colors & Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Colors & Theme
          </CardTitle>
          <CardDescription>Customize your website's color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color || '#0056b3'}
                  onChange={(e) => onUpdate({ primary_color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={settings.primary_color || '#0056b3'}
                  onChange={(e) => onUpdate({ primary_color: e.target.value })}
                  placeholder="#0056b3"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={settings.secondary_color || '#6c757d'}
                  onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={settings.secondary_color || '#6c757d'}
                  onChange={(e) => onUpdate({ secondary_color: e.target.value })}
                  placeholder="#6c757d"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Configure search engine optimization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={settings.meta_title || ''}
              onChange={(e) => onUpdate({ meta_title: e.target.value })}
              placeholder="Your website title for search engines"
              maxLength={60}
            />
            <p className="text-sm text-muted-foreground">
              {(settings.meta_title || '').length}/60 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={settings.meta_description || ''}
              onChange={(e) => onUpdate({ meta_description: e.target.value })}
              placeholder="Brief description of your website for search engines"
              maxLength={160}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              {(settings.meta_description || '').length}/160 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              value={settings.meta_keywords || ''}
              onChange={(e) => onUpdate({ meta_keywords: e.target.value })}
              placeholder="cars, automotive, dealership, saudi arabia"
            />
            <p className="text-sm text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Add your social media profile links</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                value={settings.facebook_url || ''}
                onChange={(e) => onUpdate({ facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter/X URL</Label>
              <Input
                id="twitter_url"
                value={settings.twitter_url || ''}
                onChange={(e) => onUpdate({ twitter_url: e.target.value })}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={settings.instagram_url || ''}
                onChange={(e) => onUpdate({ instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                value={settings.youtube_url || ''}
                onChange={(e) => onUpdate({ youtube_url: e.target.value })}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Website Settings'}
        </Button>
      </div>
    </div>
  );
} 