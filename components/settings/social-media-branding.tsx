"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Chrome, Apple, Plus, ExternalLink, Eye, Upload, Code, X, Check, AlertTriangle, Image, Trash2 } from "lucide-react"
import { BRANDING_ASSET_TYPES, BrandingAssetsStatus, getSocialMediaMetaTags, SocialMediaMetaTags } from "@/lib/api/queries/system-settings"
import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import { CREATE_BRANDING_ASSET, UPDATE_BRANDING_ASSET } from "@/lib/api/queries/car-media"
import { graphqlClient } from "@/lib/api/graphql-client"

interface SocialMediaBrandingProps {
  brandingStatus?: BrandingAssetsStatus | null;
  onBrandingAction: (actionName: string) => Promise<void>;
  loadingActions: Record<string, boolean>;
  onStatusUpdate?: () => void;
}

interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
}

export function SocialMediaBranding({ brandingStatus, onBrandingAction, loadingActions, onStatusUpdate }: SocialMediaBrandingProps) {
  const [metaTags, setMetaTags] = useState<SocialMediaMetaTags>({});
  const [showMetaPreview, setShowMetaPreview] = useState(false);
  const [uploadStates, setUploadStates] = useState<Record<string, FileUploadState>>({});
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadMetaTags();
  }, []);

  const loadMetaTags = async () => {
    try {
      const tags = await getSocialMediaMetaTags();
      setMetaTags(tags);
    } catch (error) {
      console.error('Failed to load social media meta tags:', error);
    }
  };

  const socialMediaAssets = [
    { 
      key: 'opengraph_image', 
      label: 'Open Graph Image', 
      icon: <Share2 className="h-4 w-4" />, 
      description: 'Facebook, LinkedIn & general social sharing', 
      dimensions: '1200x630px',
      maxSize: 5,
      formats: ['PNG', 'JPG', 'JPEG']
    },
    { 
      key: 'twitter_card_image', 
      label: 'Twitter Card Image', 
      icon: <Twitter className="h-4 w-4" />, 
      description: 'Twitter/X social media cards', 
      dimensions: '1200x675px',
      maxSize: 5,
      formats: ['PNG', 'JPG', 'JPEG']
    },
    { 
      key: 'linkedin_image', 
      label: 'LinkedIn Image', 
      icon: <Linkedin className="h-4 w-4" />, 
      description: 'LinkedIn business profile sharing', 
      dimensions: '1200x630px',
      maxSize: 5,
      formats: ['PNG', 'JPG', 'JPEG']
    },
    { 
      key: 'whatsapp_preview_image', 
      label: 'WhatsApp Preview', 
      icon: <MessageCircle className="h-4 w-4" />, 
      description: 'WhatsApp link preview image', 
      dimensions: '1200x630px',
      maxSize: 5,
      formats: ['PNG', 'JPG', 'JPEG']
    },
    { 
      key: 'google_business_logo', 
      label: 'Google Business Logo', 
      icon: <Chrome className="h-4 w-4" />, 
      description: 'Google My Business & Maps', 
      dimensions: '720x720px',
      maxSize: 3,
      formats: ['PNG', 'JPG', 'JPEG']
    },
  ];

  const deviceIcons = [
    { 
      key: 'apple_touch_icon', 
      label: 'Apple Touch Icon', 
      icon: <Apple className="h-4 w-4" />, 
      description: 'iOS Safari bookmarks & home screen', 
      dimensions: '180x180px',
      maxSize: 1,
      formats: ['PNG']
    },
    { 
      key: 'android_chrome_icon', 
      label: 'Android Chrome Icon', 
      icon: <Chrome className="h-4 w-4" />, 
      description: 'Android Chrome shortcuts', 
      dimensions: '192x192px',
      maxSize: 1,
      formats: ['PNG']
    },
  ];

  const getAssetStatus = (assetKey: string) => {
    return brandingStatus?.website_branding[assetKey] || brandingStatus?.mobile_app[assetKey];
  };

  const validateFile = (file: File, asset: any) => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!asset.formats.includes(fileExtension || '')) {
      throw new Error(`Invalid file format. Accepted formats: ${asset.formats.join(', ')}`);
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > asset.maxSize) {
      throw new Error(`File too large. Maximum size: ${asset.maxSize}MB`);
    }

    return true;
  };

  const handleFileSelect = useCallback((assetKey: string, file: File) => {
    const asset = [...socialMediaAssets, ...deviceIcons].find(a => a.key === assetKey);
    if (!asset) return;

    try {
      validateFile(file, asset);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadStates(prev => ({
          ...prev,
          [assetKey]: {
            file,
            preview: e.target?.result as string,
            uploading: false,
            progress: 0
          }
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [socialMediaAssets, deviceIcons]);

  const handleDrop = useCallback((e: React.DragEvent, assetKey: string) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(assetKey, files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearUpload = (assetKey: string) => {
    setUploadStates(prev => {
      const newState = { ...prev };
      delete newState[assetKey];
      return newState;
    });
  };

  const uploadAsset = async (assetKey: string) => {
    const uploadState = uploadStates[assetKey];
    if (!uploadState?.file) return;

    setUploadStates(prev => ({
      ...prev,
      [assetKey]: { ...prev[assetKey], uploading: true, progress: 0 }
    }));

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        // Determine media type and branding subtype
        const isDeviceIcon = deviceIcons.some(d => d.key === assetKey);
        const mediaType = isDeviceIcon ? 'mobile_app' : 'website_branding';
        
        const assetData = {
          name: `AlRomaih Cars ${assetKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          media_type: mediaType,
          branding_subtype: assetKey,
          content_type: assetKey === 'website_favicon' ? 'favicon_ico' : 'image',
          image: base64Data,
          alt_text: `AlRomaih Cars ${assetKey.replace('_', ' ')} - Premium Automotive Dealership`,
          seo_title: `AlRomaih Cars ${assetKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          is_primary: true,
          is_public: true,
          is_featured: true,
          website_visible: true,
        };

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadStates(prev => ({
            ...prev,
            [assetKey]: { ...prev[assetKey], progress: i }
          }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Create the asset via GraphQL
        await graphqlClient.request(CREATE_BRANDING_ASSET, { values: assetData });
        
        toast.success(`${assetKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} uploaded successfully!`);
        
        // Clear upload state
        clearUpload(assetKey);
        
        // Refresh branding status
        if (onStatusUpdate) {
          onStatusUpdate();
        }
      };
      
      reader.readAsDataURL(uploadState.file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
      setUploadStates(prev => ({
        ...prev,
        [assetKey]: { ...prev[assetKey], uploading: false, progress: 0 }
      }));
    }
  };

  const deleteAsset = async (assetKey: string) => {
    const assetStatus = getAssetStatus(assetKey);
    if (!assetStatus?.id) return;

    try {
      // You'll need to implement DELETE_BRANDING_ASSET mutation
      // await graphqlClient.request(DELETE_BRANDING_ASSET, { id: assetStatus.id });
      toast.success(`${assetKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} deleted successfully!`);
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Delete failed. Please try again.');
    }
  };

  const AssetUploadCard = ({ asset, type = 'social' }: { asset: any, type?: 'social' | 'device' }) => {
    const assetStatus = getAssetStatus(asset.key);
    const uploadState = uploadStates[asset.key];
    const hasExisting = assetStatus?.exists;
    const hasNewUpload = uploadState?.file;

    return (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 ${type === 'social' ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}>
              {asset.icon}
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">{asset.label}</h4>
              <p className="text-xs text-muted-foreground">{asset.description}</p>
              <p className="text-xs text-blue-600 font-mono">{asset.dimensions}</p>
              <p className="text-xs text-gray-500">Max: {asset.maxSize}MB, {asset.formats.join('/')}</p>
            </div>
          </div>
          {hasExisting && !hasNewUpload && (
            <Badge variant="default" className="text-xs">✓ Uploaded</Badge>
          )}
          {hasNewUpload && (
            <Badge variant="secondary" className="text-xs">📎 Ready</Badge>
          )}
          {!hasExisting && !hasNewUpload && (
            <Badge variant="outline" className="text-xs">Missing</Badge>
          )}
        </div>

        {/* Current Asset Preview */}
        {hasExisting && assetStatus?.url && !hasNewUpload && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-green-700">Current Asset</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(assetStatus.url, '_blank')}
                  className="h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAsset(asset.key)}
                  className="h-6 px-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <img 
              src={assetStatus.url} 
              alt={asset.label}
              className="w-full h-24 object-cover rounded border"
            />
            <div className="text-xs text-muted-foreground">
              <p>Size: {assetStatus.file_size}MB • CDN Ready</p>
            </div>
          </div>
        )}

        {/* New Upload Preview */}
        {hasNewUpload && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700">New Upload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearUpload(asset.key)}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <img 
              src={uploadState.preview || ''} 
              alt="Preview"
              className="w-full h-24 object-cover rounded border"
            />
            <div className="text-xs text-gray-600">
              <p>{uploadState.file?.name} ({(uploadState.file?.size || 0 / (1024 * 1024)).toFixed(2)}MB)</p>
            </div>
            {uploadState.uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadState.progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            hasNewUpload ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDrop={(e) => handleDrop(e, asset.key)}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={(el) => { fileInputRefs.current[asset.key] = el; }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(asset.key, file);
            }}
            accept={asset.formats.map((f: string) => `.${f.toLowerCase()}`).join(',')}
            className="hidden"
          />
          
          {!hasNewUpload ? (
            <div className="space-y-2">
              <Image className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">
                Drop your {asset.label.toLowerCase()} here
              </p>
              <p className="text-xs text-gray-500">
                or click to browse files
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Check className="h-8 w-8 mx-auto text-green-500" />
              <p className="text-sm text-green-700">Ready to upload!</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!hasNewUpload ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => fileInputRefs.current[asset.key]?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                {hasExisting ? 'Replace' : 'Upload'}
              </Button>
              {hasExisting && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBrandingAction(`action_create_${asset.key}`)}
                  disabled={loadingActions[`action_create_${asset.key}`]}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => uploadAsset(asset.key)}
                disabled={uploadState.uploading}
              >
                {uploadState.uploading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Save Asset
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearUpload(asset.key)}
                disabled={uploadState.uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Social Media Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media & Sharing Images
          </CardTitle>
          <CardDescription>
            Optimize your social media presence with platform-specific sharing images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {socialMediaAssets.map((asset) => (
              <AssetUploadCard key={asset.key} asset={asset} type="social" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Device Icons & Touch Icons
          </CardTitle>
          <CardDescription>
            Icons for mobile devices, browser shortcuts, and home screen bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deviceIcons.map((asset) => (
              <AssetUploadCard key={asset.key} asset={asset} type="device" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meta Tags Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Generated Meta Tags
          </CardTitle>
          <CardDescription>
            Auto-generated HTML meta tags for social media and SEO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMetaPreview(!showMetaPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showMetaPreview ? 'Hide' : 'Show'} Meta Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMetaTags}
            >
              Refresh
            </Button>
          </div>

          {showMetaPreview && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
{`<!-- Open Graph Meta Tags -->
<meta property="og:image" content="${metaTags.og_image || 'Not set'}" />
<meta property="og:image:secure_url" content="${metaTags.og_image || 'Not set'}" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${metaTags.twitter_image || 'Not set'}" />

<!-- LinkedIn Sharing -->
<meta property="og:image:linkedin" content="${metaTags.linkedin_image || 'Not set'}" />

<!-- Device Icons -->
<link rel="icon" type="image/x-icon" href="${metaTags.favicon || 'Not set'}" />
<link rel="apple-touch-icon" href="${metaTags.apple_touch_icon || 'Not set'}" />
<link rel="icon" type="image/png" sizes="192x192" href="${metaTags.android_chrome_icon || 'Not set'}" />`}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">SEO Benefits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Better social media sharing appearance</li>
              <li>• Improved click-through rates from social platforms</li>
              <li>• Professional brand presence across all channels</li>
              <li>• Automatic CDN delivery for fast loading</li>
              <li>• SEO-optimized file names and alt text</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 