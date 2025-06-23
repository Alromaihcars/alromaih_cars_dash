'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, X, FileIcon, ImageIcon, Video, FileText, 
  AlertCircle, CheckCircle, Loader2 
} from 'lucide-react'
import { CONTENT_TYPES, validateFileType, validateFileSize, formatFileSize } from '@/lib/api/queries/car-media'

interface FileUploadItem {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  base64?: string
}

interface MultiFileUploadProps {
  contentType: string
  onFilesChange: (files: FileUploadItem[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function MultiFileUpload({ 
  contentType, 
  onFilesChange, 
  maxFiles = 10, 
  disabled = false 
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const contentTypeConfig = CONTENT_TYPES[contentType]

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const validateFile = (file: File): string | null => {
    if (!validateFileType(file, contentType)) {
      return `Invalid file type. Accepted types: ${contentTypeConfig.acceptedTypes.join(', ')}`
    }
    
    if (!validateFileSize(file, contentType)) {
      const maxSize = contentTypeConfig.maxSize
      return `File too large. Maximum size: ${maxSize}MB`
    }
    
    return null
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = async (newFiles: File[]) => {
    if (disabled) return

    // Check file limit
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files at once`,
        variant: "destructive"
      })
      return
    }

    const fileItems: FileUploadItem[] = newFiles.map(file => {
      const error = validateFile(file)
      return {
        file,
        id: generateId(),
        status: error ? 'error' : 'pending',
        progress: 0,
        error
      }
    })

    const updatedFiles = [...files, ...fileItems]
    setFiles(updatedFiles)

    // Process valid files
    const validFiles = fileItems.filter(item => item.status === 'pending')
    
    for (const fileItem of validFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading', progress: 25 }
            : f
        ))

        // Convert to base64
        const base64 = await convertFileToBase64(fileItem.file)
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, progress: 75 }
            : f
        ))

        // Complete
        setFiles(prev => {
          const updated = prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'success', progress: 100, base64 }
              : f
          )
          onFilesChange(updated)
          return updated
        })

      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', error: 'Failed to process file' }
            : f
        ))
      }
    }
  }

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    processFiles(selectedFiles)
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeFile = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const clearAll = () => {
    setFiles([])
    onFilesChange([])
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-4 w-4" />
    } else if (file.type === 'application/pdf' || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />
    }
    return <FileIcon className="h-4 w-4" />
  }

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Only show upload area for file-based content types
  const showUploadArea = contentTypeConfig.acceptedTypes.length > 0

  if (!showUploadArea) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>File upload not available for this content type.</p>
        <p className="text-sm">Use the URL/link fields below instead.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`transition-colors border-2 border-dashed ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <Upload className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">
                {isDragOver ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {contentTypeConfig.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {contentTypeConfig.maxSize ? `${contentTypeConfig.maxSize}MB` : 'No limit'}
              </p>
            </div>

            <Button variant="outline" size="sm" disabled={disabled} type="button">
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={contentTypeConfig.acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                Uploaded Files ({files.length}/{maxFiles})
              </h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAll}
                disabled={disabled}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {files.map((fileItem) => (
                <div 
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(fileItem.file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            fileItem.status === 'success' ? 'default' :
                            fileItem.status === 'error' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {fileItem.status}
                        </Badge>
                        {getStatusIcon(fileItem.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(fileItem.file.size / (1024 * 1024))}</span>
                      <span>{fileItem.file.type}</span>
                    </div>

                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="mt-2 h-1" />
                    )}

                    {fileItem.error && (
                      <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total size:</span>
                <span>
                  {formatFileSize(
                    files.reduce((sum, f) => sum + f.file.size, 0) / (1024 * 1024)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Successfully uploaded:</span>
                <span className="text-green-600">
                  {files.filter(f => f.status === 'success').length} files
                </span>
              </div>
              {files.some(f => f.status === 'error') && (
                <div className="flex justify-between text-sm">
                  <span>Failed:</span>
                  <span className="text-red-600">
                    {files.filter(f => f.status === 'error').length} files
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 