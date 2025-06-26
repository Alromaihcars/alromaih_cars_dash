"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Eye, Image, FileImage, AlertCircle, CheckCircle } from "lucide-react"
import { fileToBase64, binaryDataUtils, logoReaderUtils } from "@/lib/api/queries/system-settings"
import { validateImageFile, FIELD_ALLOWED_TYPES } from "@/lib/utils/image-utils"

interface BinaryImageUploadProps {
  label: string;
  value?: string; // base64 encoded image
  onChange: (base64: string | undefined) => void;
  placeholder?: string;
  maxWidth?: number;
  maxHeight?: number;
  accept?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  fieldType?: keyof typeof FIELD_ALLOWED_TYPES; // For field-specific validation
  fieldName?: 'logo_arabic' | 'logo_english' | 'website_favicon' | 'app_logo' | 'app_splash_screen'; // For smart URL generation
}

export function BinaryImageUpload({
  label,
  value,
  onChange,
  placeholder = "Click to upload image",
  maxWidth = 200,
  maxHeight = 150,
  accept = "image/*",
  disabled = false,
  required = false,
  helpText,
  fieldType,
  fieldName
}: BinaryImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewInfo, setPreviewInfo] = useState<ReturnType<typeof binaryDataUtils.getPreviewInfo> | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate smart image URL (inspired by car brands pattern)
  const getImageUrl = (): string | undefined => {
    if (!value) return undefined;
    
    // If we have a field name, use the smart logo URL generator
    if (fieldName) {
      // Create a mock settings object for the logoReaderUtils
      const mockSettings = { [fieldName]: value } as any;
      return logoReaderUtils.getLogoUrl(mockSettings, fieldName);
    }
    
    // Fallback to basic binary data utils
    return binaryDataUtils.toDataURL(value);
  };

  // Update preview info when value changes
  useEffect(() => {
    if (value) {
      const info = binaryDataUtils.getPreviewInfo(value, fieldName || fieldType || 'image');
      setPreviewInfo(info);
      
      // Generate image URL for preview
      const url = getImageUrl();
      setImageUrl(url);
      
      // Clear error if we have valid data
      if (info.isValid) {
        setError(null);
      } else if (info.hasData && !info.isValid) {
        setError('Invalid image data detected. Please upload a new image.');
      }
    } else {
      setPreviewInfo(null);
      setImageUrl(undefined);
      setError(null);
    }
  }, [value, fieldType, fieldName]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Validate file with field-specific validation
      const validation = validateImageFile(file, fieldType);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Convert to base64
      const base64 = await fileToBase64(file);
      
      // Validate the base64 data
      const isValidBase64 = binaryDataUtils.isValidBase64(base64);
      if (!isValidBase64) {
        setError('Failed to process image data. Please try a different image.');
        return;
      }

      onChange(base64);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
    setPreviewInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const hasValidImage = previewInfo?.hasData && previewInfo?.isValid;
  const hasInvalidImage = previewInfo?.hasData && !previewInfo?.isValid;

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '_')}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area */}
      <Card className={`transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'}`}>
        <CardContent className="p-4">
          {hasValidImage ? (
            // Valid image preview
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={imageUrl || previewInfo?.dataURL}
                  alt={label}
                  className="rounded-lg shadow-sm object-cover border"
                  style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
                  onError={(e) => {
                    setError('Failed to display image preview');
                  }}
                />
                {!disabled && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Image info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Size: {previewInfo?.size || 0}KB</span>
                  <span>•</span>
                  <span>Valid binary data</span>
                </div>
                {fieldName && (
                  <div className="text-xs text-blue-600">
                    Field: {fieldName}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!disabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openFileDialog}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(imageUrl || previewInfo?.dataURL, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
              </div>
            </div>
          ) : hasInvalidImage ? (
            // Invalid image data
            <div className="space-y-3">
              <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-sm text-red-700 font-medium">Invalid Image Data</p>
                  <p className="text-xs text-red-600">The image data is corrupted or in an unsupported format.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={isUploading || disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Image
                </Button>
                
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Upload area
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={disabled ? undefined : openFileDialog}
            >
              <div className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  ) : fieldType === 'favicon' ? (
                    <FileImage className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Image className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {isUploading ? 'Uploading...' : placeholder}
                  </p>
                  <p className="text-gray-500">
                    Drag and drop or click to browse
                  </p>
                </div>
                
                <div className="text-xs text-gray-400">
                  {fieldType === 'favicon' 
                    ? 'Supports: ICO, PNG, SVG, JPG, GIF, WebP, BMP, TIFF (max 1MB)' 
                    : 'Supports: PNG, JPG, GIF, WebP, SVG, BMP, TIFF (max 5MB)'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
} 