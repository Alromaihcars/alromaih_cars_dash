"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, Save, Eye, TrendingUp } from "lucide-react"
import { SystemSettings } from "@/lib/api/queries/system-settings"

interface AnalyticsSettingsProps {
  settings: SystemSettings;
  onUpdate: (updates: Partial<SystemSettings>) => Promise<boolean>;
  loading?: boolean;
}

export function AnalyticsSettings({ settings, onUpdate, loading }: AnalyticsSettingsProps) {
  const handleSave = async () => {
    console.log('Analytics settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Website Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Website Analytics
          </CardTitle>
          <CardDescription>Configure website analytics and tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
            <Input
              id="google_analytics_id"
              value={settings.google_analytics_id || ''}
              onChange={(e) => onUpdate({ google_analytics_id: e.target.value })}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            />
            <p className="text-sm text-muted-foreground">
              Your Google Analytics measurement ID (GA4) or tracking ID (Universal Analytics)
            </p>
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
          <CardDescription>Configure tracking pixels for social media advertising</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_pixel_id">Meta (Facebook) Pixel ID</Label>
              <Input
                id="meta_pixel_id"
                value={settings.meta_pixel_id || ''}
                onChange={(e) => onUpdate({ meta_pixel_id: e.target.value })}
                placeholder="123456789012345"
              />
              <p className="text-sm text-muted-foreground">
                Facebook/Instagram advertising pixel ID
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok_pixel_id">TikTok Pixel ID</Label>
              <Input
                id="tiktok_pixel_id"
                value={settings.tiktok_pixel_id || ''}
                onChange={(e) => onUpdate({ tiktok_pixel_id: e.target.value })}
                placeholder="C4XXXXXXXXXXXXXXXXXXXXXXXXXX"
              />
              <p className="text-sm text-muted-foreground">
                TikTok advertising pixel ID
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="snapchat_pixel_id">Snapchat Pixel ID</Label>
              <Input
                id="snapchat_pixel_id"
                value={settings.snapchat_pixel_id || ''}
                onChange={(e) => onUpdate({ snapchat_pixel_id: e.target.value })}
                placeholder="12345678-1234-1234-1234-123456789012"
              />
              <p className="text-sm text-muted-foreground">
                Snapchat advertising pixel ID
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_pixel_id">LinkedIn Pixel ID</Label>
              <Input
                id="linkedin_pixel_id"
                value={settings.linkedin_pixel_id || ''}
                onChange={(e) => onUpdate({ linkedin_pixel_id: e.target.value })}
                placeholder="123456"
              />
              <p className="text-sm text-muted-foreground">
                LinkedIn Insight Tag partner ID
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="x_pixel_id">X (Twitter) Pixel ID</Label>
              <Input
                id="x_pixel_id"
                value={settings.x_pixel_id || ''}
                onChange={(e) => onUpdate({ x_pixel_id: e.target.value })}
                placeholder="o1234"
              />
              <p className="text-sm text-muted-foreground">
                X (Twitter) advertising pixel ID
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Configuration
          </CardTitle>
          <CardDescription>Additional analytics settings and privacy configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Privacy Notice</h4>
            <p className="text-sm text-blue-800">
              Make sure to comply with local privacy laws (GDPR, CCPA, etc.) when implementing tracking pixels. 
              Consider implementing cookie consent banners and privacy policy updates.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Implementation Notes</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Analytics codes will be automatically injected into your website</li>
              <li>• Test your implementation using browser developer tools</li>
              <li>• Verify tracking in respective platform dashboards</li>
              <li>• Allow 24-48 hours for data to appear in analytics platforms</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Analytics Settings'}
        </Button>
      </div>
    </div>
  );
} 