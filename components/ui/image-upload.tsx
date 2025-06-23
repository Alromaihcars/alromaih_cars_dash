"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, X, Image as ImageIcon, Info, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  validateImageFile, 
  createImageUrl, 
  revokeImageUrl, 
  formatFileSize, 
  getImageDimensions,
  SUPPORTED_IMAGE_TYPES,
  type ImageValidationResult
} from "@/lib/utils/image-utils"

interface ImagePreviewData {
  url: string
  file?: File
  filename?: string
  size?: number
  mimeType?: string
  dimensions?: { width: number; height: number }
}

interface ImageUploadProps {
  label?: string
  value?: File | string | null
  onChange?: (file: File | null) => void
  onError?: (error: string) => void
  placeholder?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showPreview?: boolean
  showDetails?: boolean
  accept?: string[]
  maxSize?: number
  disabled?: boolean
  required?: boolean
}

const SIZE_CONFIG = {
  sm: {
    avatar: "h-12 w-12",
    container: "gap-2",
    button: "text-xs"
  },
  md: {
    avatar: "h-16 w-16",
    container: "gap-4",
    button: "text-sm"
  },
  lg: {
    avatar: "h-24 w-24",
    container: "gap-6",
    button: "text-base"
  }
}

export function ImageUpload({
  label = "Image",
  value,
  onChange,
  onError,
  placeholder = "Upload image",
  className = "",
  size = "md",
  showPreview = true,
  showDetails = true,
  accept,
  maxSize,
  disabled = false,
  required = false
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<ImagePreviewData | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const sizeConfig = SIZE_CONFIG[size]
  const acceptedTypes = accept || Object.keys(SUPPORTED_IMAGE_TYPES)

  // Initialize preview from value
  useEffect(() => {
    if (value) {
      if (value instanceof File) {
        handleFilePreview(value)
      } else if (typeof value === 'string') {
        setPreview({
          url: value,
          filename: 'Current image',
          mimeType: 'image/jpeg' // Default
        })
      }
    } else {
      cleanupPreview()
    }
  }, [value])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreview()
    }
  }, [])

  const cleanupPreview = () => {
    if (preview?.url && preview.url.startsWith('blob:')) {
      revokeImageUrl(preview.url)
    }
    setPreview(null)
  }

  const handleFilePreview = async (file: File) => {
    try {
      const dimensions = await getImageDimensions(file)
      const previewUrl = createImageUrl(file)
      
      cleanupPreview()
      
      setPreview({
        url: previewUrl,
        file,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        dimensions
      })
    } catch (error) {
      console.error('Error creating preview:', error)
      const errorMsg = 'Failed to create image preview'
      setValidationError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setValidationError(null)
    
    if (!file) return

    // Validate the image file
    const validation = validateImageFile(file)
    
    // Custom validation for accepted types
    if (accept && !accept.includes(file.type)) {
      const errorMsg = `Unsupported file type. Accepted types: ${accept.join(', ')}`
      setValidationError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Custom validation for max size
    if (maxSize && file.size > maxSize) {
      const errorMsg = `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`
      setValidationError(errorMsg)
      onError?.(errorMsg)
      return
    }

    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid image file')
      onError?.(validation.error || 'Invalid image file')
      return
    }

    try {
      await handleFilePreview(file)
      onChange?.(file)
    } catch (error) {
      console.error('Error processing file:', error)
      const errorMsg = 'Failed to process image file'
      setValidationError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const handleRemove = () => {
    cleanupPreview()
    setValidationError(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    onChange?.(null)
  }

  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const getSupportedFormatsText = () => {
    if (accept) {
      return accept.map(type => SUPPORTED_IMAGE_TYPES[type]?.extension || type).join(', ').toUpperCase()
    }
    return 'JPEG, PNG, WebP, GIF, SVG'
  }

  const getMaxSizeText = () => {
    if (maxSize) {
      return formatFileSize(maxSize)
    }
    return '10MB'
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {/* Validation Error */}
      {validationError && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
      <div className={`flex items-center ${sizeConfig.container}`}>
        {/* Preview */}
        {showPreview && (
          <div className="relative group">
            <Avatar className={sizeConfig.avatar}>
              <AvatarImage src={preview?.url} alt="Preview" />
              <AvatarFallback>
                <ImageIcon className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6'} opacity-50`} />
              </AvatarFallback>
            </Avatar>
            
            {/* Remove button */}
            {preview && !disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {/* Full preview button */}
            {preview && (
              <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Image Preview</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={preview.url} 
                        alt="Full preview" 
                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      />
                    </div>
                    {showDetails && preview && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Filename:</span> {preview.filename}
                        </div>
                        {preview.size && (
                          <div>
                            <span className="font-medium">Size:</span> {formatFileSize(preview.size)}
                          </div>
                        )}
                        {preview.mimeType && (
                          <div>
                            <span className="font-medium">Type:</span> {preview.mimeType}
                          </div>
                        )}
                        {preview.dimensions && (
                          <div>
                            <span className="font-medium">Dimensions:</span> {preview.dimensions.width}×{preview.dimensions.height}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
        
        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={disabled}
            className={`w-full ${sizeConfig.button}`}
          >
            <Upload className="mr-2 h-4 w-4" />
            {preview ? 'Change Image' : placeholder}
          </Button>
          
          {/* File Info */}
          {showDetails && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supported: {getSupportedFormatsText()}</p>
              <p>Max size: {getMaxSizeText()}</p>
              {preview && (
                <div className="space-y-0.5 pt-1 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {preview.filename}
                    </Badge>
                    {preview.size && (
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(preview.size)}
                      </Badge>
                    )}
                  </div>
                  {preview.mimeType && (
                    <p>Type: {preview.mimeType}</p>
                  )}
                  {preview.dimensions && (
                    <p>Dimensions: {preview.dimensions.width}×{preview.dimensions.height}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 