"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Smartphone, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  SystemSettings, 
  binaryDataUtils, 
  logoReaderUtils
} from '@/lib/api/queries/system-settings';

interface BrandingPreviewProps {
  settings?: SystemSettings;
  onRefresh?: () => void;
}

interface AssetStatusInfo {
  status: 'ready' | 'not-set' | 'invalid';
  url?: string;
  size?: string;
  type?: string;
}

export default function BrandingPreview({ settings, onRefresh }: BrandingPreviewProps) {
  const [assetStatuses, setAssetStatuses] = useState<Record<string, AssetStatusInfo>>({});

  // Update asset statuses when settings change
  useEffect(() => {
    if (settings) {
      updateAssetStatuses(settings);
    }
  }, [settings]);

  const updateAssetStatuses = (data: SystemSettings) => {
    const assetFields = ['logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen'];
    const statuses: Record<string, AssetStatusInfo> = {};

    assetFields.forEach(field => {
      const url = logoReaderUtils.getLogoUrl(data, field as any);
      
      if (url) {
        const binaryData = data[field as keyof SystemSettings] as string || '';
        const previewInfo = binaryDataUtils.getPreviewInfo(binaryData, field);
        statuses[field] = {
          status: previewInfo.isValid ? 'ready' : 'invalid',
          url,
          size: previewInfo.hasData ? `${Math.round(previewInfo.size / 1024)}KB` : '0KB',
          type: previewInfo.hasData ? 'binary' : 'none'
        };
      } else {
        statuses[field] = {
          status: 'not-set'
        };
      }
    });

    setAssetStatuses(statuses);
  };

  const getAssetStatusBadge = (status: 'ready' | 'not-set' | 'invalid') => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Ready</Badge>;
      case 'not-set':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Not Set</Badge>;
      case 'invalid':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Invalid</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Asset Status Overview */}
    <Card>
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Asset Status Overview
          </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { field: 'logo_arabic', label: 'Arabic Logo' },
              { field: 'logo_english', label: 'English Logo' },
              { field: 'website_favicon', label: 'Favicon' },
              { field: 'app_logo', label: 'App Logo' },
              { field: 'app_splash_screen', label: 'App Splash' }
            ].map(({ field, label }) => (
              <div key={field} className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  {assetStatuses[field]?.url ? (
                    <img 
                      src={assetStatuses[field].url} 
                      alt={label}
                      className="max-w-full max-h-full object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{label}</p>
                  {getAssetStatusBadge(assetStatuses[field]?.status || 'not-set')}
                  {assetStatuses[field]?.size && (
                    <p className="text-xs text-gray-500">{assetStatuses[field].size}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Tabs defaultValue="website" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="website">Website Preview</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="mobile">Mobile App</TabsTrigger>
        </TabsList>

        {/* Website Preview */}
        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Website Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Browser Mockup */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Browser Chrome */}
                <div className="bg-gray-100 p-3 border-b flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
                  <div className="flex items-center gap-2 ml-4">
                    {assetStatuses.website_favicon?.url && (
                      <img 
                        src={assetStatuses.website_favicon.url} 
                        alt="Favicon"
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm text-gray-600">
                      {settings?.website_name || 'Your Website'}
                    </span>
                      </div>
                    </div>
                    
                {/* Website Content */}
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {assetStatuses.logo_arabic?.url && (
                        <img 
                          src={assetStatuses.logo_arabic.url} 
                          alt="Arabic Logo"
                          className="h-8 object-contain"
                        />
                      )}
                      <span className="text-xl font-bold">
                        {settings?.website_name || 'Your Website'}
                      </span>
                      {assetStatuses.logo_english?.url && (
                        <img 
                          src={assetStatuses.logo_english.url} 
                          alt="English Logo"
                          className="h-8 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Welcome to our automotive dealership</p>
                    <p>Browse our extensive collection of premium vehicles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
                
        {/* Social Media Preview */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  Facebook
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {assetStatuses.logo_english?.url ? (
                      <img 
                        src={assetStatuses.logo_english.url} 
                        alt="Logo"
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">No Logo</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{settings?.website_name || 'Your Website'}</h3>
                    <p className="text-sm text-gray-600">{settings?.meta_description || 'Website description'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twitter Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {assetStatuses.logo_english?.url ? (
                      <img 
                        src={assetStatuses.logo_english.url} 
                        alt="Logo"
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">No Logo</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{settings?.website_name || 'Your Website'}</h3>
                    <p className="text-sm text-gray-600">{settings?.meta_description || 'Website description'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  LinkedIn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {assetStatuses.logo_english?.url ? (
                      <img 
                        src={assetStatuses.logo_english.url} 
                        alt="Logo"
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">No Logo</div>
                    )}
            </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{settings?.website_name || 'Your Website'}</h3>
                    <p className="text-sm text-gray-600">{settings?.meta_description || 'Website description'}</p>
          </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {assetStatuses.logo_english?.url ? (
                      <img 
                        src={assetStatuses.logo_english.url} 
                        alt="Logo"
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400">No Logo</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold">{settings?.website_name || 'Your Website'}</h3>
                    <p className="text-sm text-gray-600">{settings?.meta_description || 'Website description'}</p>
              </div>
                </div>
              </CardContent>
            </Card>
              </div>
        </TabsContent>

        {/* Mobile App Preview */}
        <TabsContent value="mobile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* App Icon Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  App Icon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-lg flex items-center justify-center">
                    {assetStatuses.app_logo?.url ? (
                      <img 
                        src={assetStatuses.app_logo.url} 
                        alt="App Logo"
                        className="w-24 h-24 object-contain rounded-2xl"
                      />
                    ) : (
                      <div className="text-white text-sm">No Logo</div>
                    )}
                </div>
                </div>
                <p className="text-center mt-2 font-medium">
                  {settings?.app_name || 'Your App'}
                </p>
              </CardContent>
            </Card>

            {/* Phone Mockup */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile App Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs mx-auto">
                  {/* Phone Frame */}
                  <div className="bg-black rounded-3xl p-2">
                    <div className="bg-white rounded-2xl overflow-hidden">
                      {/* Splash Screen */}
                      <div className="aspect-[9/16] bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white">
                        {assetStatuses.app_splash_screen?.url ? (
                          <img 
                            src={assetStatuses.app_splash_screen.url} 
                            alt="Splash Screen"
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <>
                            {assetStatuses.app_logo?.url && (
                              <img 
                                src={assetStatuses.app_logo.url} 
                                alt="App Logo"
                                className="w-20 h-20 object-contain mb-4"
                              />
                            )}
                            <h2 className="text-xl font-bold text-center">
                              {settings?.app_name || 'Your App'}
                            </h2>
                            <p className="text-sm opacity-80 mt-2">Loading...</p>
                          </>
          )}
        </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 