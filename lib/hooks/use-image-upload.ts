"use client"

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { 
  validateImageFile, 
  optimizeImageForUpload, 
  createImageUrl, 
  revokeImageUrl,
  formatFileSize,
  getImageDimensions,
  type ImageValidationResult,
  type ImageConversionOptions
} from '@/lib/utils/image-utils'

interface ImageUploadState {
  file: File | null
  preview: string | null
  isUploading: boolean
  error: string | null
  metadata: {
    filename?: string
    size?: number
    mimeType?: string
    dimensions?: { width: number; height: number }
  } | null
}

interface ImageUploadOptions {
  maxSize?: number
  acceptedTypes?: string[]
  optimizationOptions?: ImageConversionOptions
  autoOptimize?: boolean
}

interface ImageUploadResult {
  file: File
  base64: string
  mimeType: string
  filename: string
  size: number
  dimensions?: { width: number; height: number }
}

export function useImageUpload(options: ImageUploadOptions = {}) {
  const { toast } = useToast()
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes,
    optimizationOptions = {},
    autoOptimize = true
  } = options

  const [state, setState] = useState<ImageUploadState>({
    file: null,
    preview: null,
    isUploading: false,
    error: null,
    metadata: null
  })

  // Clear state and cleanup URLs
  const clear = useCallback(() => {
    if (state.preview && state.preview.startsWith('blob:')) {
      revokeImageUrl(state.preview)
    }
    
    setState({
      file: null,
      preview: null,
      isUploading: false,
      error: null,
      metadata: null
    })
  }, [state.preview])

  // Validate and process file
  const processFile = useCallback(async (file: File): Promise<ImageUploadResult | null> => {
    setState(prev => ({ ...prev, isUploading: true, error: null }))

    try {
      // Basic validation
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid image file')
      }

      // Check accepted types
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type. Accepted: ${acceptedTypes.join(', ')}`)
      }

      // Check file size
      if (file.size > maxSize) {
        throw new Error(`File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSize)}`)
      }

      // Get image dimensions
      const dimensions = await getImageDimensions(file)

      let processedFile = file
      let base64: string

      // Auto-optimize if enabled and file is large
      if (autoOptimize && file.size > 1024 * 1024) {
        const optimized = await optimizeImageForUpload(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          ...optimizationOptions
        })
        
        processedFile = optimized.file
        base64 = optimized.base64
      } else {
        // Convert to base64 without optimization
        const reader = new FileReader()
        base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      // Create preview URL
      const previewUrl = createImageUrl(processedFile)

      // Update state
      setState(prev => {
        // Cleanup previous preview
        if (prev.preview && prev.preview.startsWith('blob:')) {
          revokeImageUrl(prev.preview)
        }

        return {
          file: processedFile,
          preview: previewUrl,
          isUploading: false,
          error: null,
          metadata: {
            filename: file.name,
            size: processedFile.size,
            mimeType: processedFile.type,
            dimensions
          }
        }
      })

      return {
        file: processedFile,
        base64,
        mimeType: processedFile.type,
        filename: file.name,
        size: processedFile.size,
        dimensions
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image'
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }))

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })

      return null
    }
  }, [acceptedTypes, maxSize, autoOptimize, optimizationOptions, toast])

  // Handle file selection
  const selectFile = useCallback(async (file: File) => {
    return await processFile(file)
  }, [processFile])

  // Handle file input change
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      return await selectFile(file)
    }
    return null
  }, [selectFile])

  // Handle drag and drop
  const handleDrop = useCallback(async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      return await selectFile(imageFile)
    } else {
      toast({
        title: 'Error',
        description: 'Please drop an image file',
        variant: 'destructive'
      })
      return null
    }
  }, [selectFile, toast])

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()
  }, [])

  // Remove current file
  const removeFile = useCallback(() => {
    clear()
  }, [clear])

  // Set error manually
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  // Get upload data for GraphQL mutations
  const getUploadData = useCallback(() => {
    if (!state.file || !state.metadata) return null

    return {
      filename: state.metadata.filename || state.file.name,
      mimeType: state.metadata.mimeType || state.file.type,
      size: state.metadata.size || state.file.size,
      dimensions: state.metadata.dimensions
    }
  }, [state.file, state.metadata])

  return {
    // State
    file: state.file,
    preview: state.preview,
    isUploading: state.isUploading,
    error: state.error,
    metadata: state.metadata,
    
    // Actions
    selectFile,
    handleFileChange,
    handleDrop,
    handleDragOver,
    removeFile,
    clear,
    setError,
    getUploadData,
    
    // Utilities
    isValid: !state.error && state.file !== null,
    isEmpty: state.file === null,
    hasPreview: state.preview !== null
  }
} 