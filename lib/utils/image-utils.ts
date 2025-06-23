// Image utilities for handling MIME types and base64 conversion

export interface ImageMimeType {
  type: string
  extension: string
  quality: number
  maxSize: number // in bytes
}

export const SUPPORTED_IMAGE_TYPES: Record<string, ImageMimeType> = {
  'image/jpeg': {
    type: 'image/jpeg',
    extension: 'jpg',
    quality: 0.85,
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  'image/jpg': {
    type: 'image/jpeg',
    extension: 'jpg',
    quality: 0.85,
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  'image/png': {
    type: 'image/png',
    extension: 'png',
    quality: 1.0,
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  'image/webp': {
    type: 'image/webp',
    extension: 'webp',
    quality: 0.8,
    maxSize: 3 * 1024 * 1024 // 3MB
  },
  'image/gif': {
    type: 'image/gif',
    extension: 'gif',
    quality: 1.0,
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  'image/svg+xml': {
    type: 'image/svg+xml',
    extension: 'svg',
    quality: 1.0,
    maxSize: 1 * 1024 * 1024 // 1MB
  }
}

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  mimeType?: ImageMimeType
  file?: File
}

export interface ImageConversionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: string
  maintainAspectRatio?: boolean
}

// Validate image file
export const validateImageFile = (file: File): ImageValidationResult => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' }
  }

  // Check MIME type
  const mimeType = SUPPORTED_IMAGE_TYPES[file.type]
  if (!mimeType) {
    return { 
      isValid: false, 
      error: `Unsupported image format: ${file.type}. Supported formats: ${Object.keys(SUPPORTED_IMAGE_TYPES).join(', ')}` 
    }
  }

  // Check file size
  if (file.size > mimeType.maxSize) {
    const maxSizeMB = (mimeType.maxSize / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    return { 
      isValid: false, 
      error: `File size ${fileSizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB for ${file.type}` 
    }
  }

  // Check if file name has valid extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  if (fileExtension && !['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(fileExtension)) {
    return { 
      isValid: false, 
      error: `Invalid file extension: .${fileExtension}` 
    }
  }

  return { isValid: true, mimeType, file }
}

// Convert file to base64 with MIME type prefix
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const result = reader.result as string
      resolve(result) // This includes the data:image/type;base64, prefix
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

// Convert file to base64 without MIME prefix (just the base64 string)
export const fileToBase64String = async (file: File): Promise<string> => {
  const fullBase64 = await fileToBase64(file)
  return fullBase64.split(',')[1] // Remove data:image/type;base64, prefix
}

// Resize image if needed
export const resizeImage = (
  file: File, 
  options: ImageConversionOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      outputFormat = file.type,
      maintainAspectRatio = true
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions
      if (maintainAspectRatio) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        if (ratio < 1) {
          width *= ratio
          height *= ratio
        }
      } else {
        width = Math.min(width, maxWidth)
        height = Math.min(height, maxHeight)
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        outputFormat,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Create optimized image for upload
export const optimizeImageForUpload = async (
  file: File,
  options: ImageConversionOptions = {}
): Promise<{ file: File; base64: string; mimeType: string }> => {
  // Validate file first
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  let processedFile = file

  // Resize if image is too large
  if (file.size > 1024 * 1024) { // 1MB threshold for optimization
    const resizedBlob = await resizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      ...options
    })
    
    processedFile = new File([resizedBlob], file.name, {
      type: resizedBlob.type,
      lastModified: Date.now()
    })
  }

  // Convert to base64
  const base64 = await fileToBase64(processedFile)

  return {
    file: processedFile,
    base64,
    mimeType: processedFile.type
  }
}

// Extract MIME type from base64 string
export const getMimeTypeFromBase64 = (base64String: string): string | null => {
  const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/)
  return match ? match[1] : null
}

// Create image URL from base64 or file
export const createImageUrl = (source: string | File | Blob): string => {
  if (typeof source === 'string') {
    // If it's already a URL or base64, return as is
    if (source.startsWith('http') || source.startsWith('data:')) {
      return source
    }
    // If it's just base64 without prefix, add it
    return `data:image/jpeg;base64,${source}`
  }
  
  // If it's a File or Blob, create object URL
  return URL.createObjectURL(source)
}

// Clean up object URLs to prevent memory leaks
export const revokeImageUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get image dimensions
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    
    img.src = URL.createObjectURL(file)
  })
} 