'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, Upload, FileText, Grid, List as ListIcon,
  Filter, Search, Star
} from 'lucide-react'
import { gql, gqlMutate } from '@/lib/api'


// Import GraphQL queries and types
import {
  GET_CAR_MEDIA,
  CREATE_CAR_MEDIA,
  UPDATE_CAR_MEDIA,
  DELETE_CAR_MEDIA,
  SET_MEDIA_AS_PRIMARY,
  SET_MEDIA_AS_FEATURED,
  TOGGLE_MEDIA_WEBSITE_VISIBILITY,
  type AlromaihCarMedia,
  type AlromaihCarMediaInput,
  MEDIA_TYPES,
  CONTENT_TYPES,
  getMediaDisplayUrl,
  getMediaThumbnailUrl,
  formatFileSize,
  validateFileType,
  validateFileSize
} from '@/lib/api/queries/car-media'

import { GET_CARS } from '@/lib/api/queries/cars'

export default function MediaPage() {
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<AlromaihCarMedia[]>([])
  const [cars, setCars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<AlromaihCarMedia | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [formData, setFormData] = useState<AlromaihCarMediaInput>({
    name: '',
    car_id: '',
    car_variant_id: '',
    media_type: 'exterior',
    content_type: 'image',
    sequence: 10,
    description: '',
    alt_text: '',
    is_primary: false,
    is_featured: false,
    is_public: true,
    website_visible: true
  })



  const { toast } = useToast()

  // Helper function to get localized text
  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    if (typeof field === "object" && field !== null) {
      const obj = field as { [key: string]: string }
      return obj.en_US || obj.ar_001 || Object.values(obj)[0] || ""
    }
    return String(field)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [mediaData, carsData] = await Promise.all([
        gql(GET_CAR_MEDIA, {
          domain: ['active', '=', true],
          limit: 50,
          offset: 0,
          order: 'sequence asc, name asc'
        }),
        gql(GET_CARS, {
          domain: ['active', '=', true],
          limit: 100,
          offset: 0,
          order: 'name asc'
        })
      ])
      
      setMediaItems(mediaData?.AlromaihCarMedia || [])
      setCars(carsData?.AlromaihCar || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load media data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter media items based on search and type
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      getLocalizedText(item.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocalizedText(item.description).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || item.media_type === selectedType
    
    return matchesSearch && matchesType && item.active
  })

  // Group media by type for stats
  const mediaStats = {
    total: filteredMedia.length,
    byType: Object.entries(MEDIA_TYPES).map(([key, type]) => ({
      key,
      label: type.label,
      count: filteredMedia.filter(item => item.media_type === key).length,
      color: type.color,
      icon: type.icon
    })).filter(stat => stat.count > 0),
    totalSize: filteredMedia.reduce((sum, item) => sum + (item.file_size || 0), 0),
    primaryCount: filteredMedia.filter(item => item.is_primary).length,
    featuredCount: filteredMedia.filter(item => item.is_featured).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingMedia) {
        await gqlMutate(UPDATE_CAR_MEDIA, {
          id: editingMedia.id,
          values: formData
        })
        toast({
          title: "Success",
          description: "Media updated successfully"
        })
      } else {
        await gqlMutate(CREATE_CAR_MEDIA, {
          values: formData
        })
        toast({
          title: "Success", 
          description: "Media created successfully"
        })
      }
      
      await loadData()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving media:', error)
      toast({
        title: "Error",
        description: editingMedia ? "Failed to update media" : "Failed to create media",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (media: AlromaihCarMedia) => {
    setEditingMedia(media)
    setFormData({
      name: getLocalizedText(media.name),
      car_id: media.car_id.id,
      car_variant_id: media.car_variant_id?.id || '',
      media_type: media.media_type,
      content_type: media.content_type,
      video_url: media.video_url || '',
      iframe_code: media.iframe_code || '',
      external_link: media.external_link || '',
      sequence: media.sequence,
      description: getLocalizedText(media.description) || '',
      alt_text: getLocalizedText(media.alt_text) || '',
      is_primary: media.is_primary,
      is_featured: media.is_featured,
      is_public: media.is_public,
      website_visible: media.website_visible,
      seo_title: getLocalizedText(media.seo_title) || '',
      seo_description: getLocalizedText(media.seo_description) || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (media: AlromaihCarMedia) => {
    if (!confirm('Are you sure you want to delete this media item?')) return

    try {
      await gqlMutate(DELETE_CAR_MEDIA, { id: media.id })
      toast({
        title: "Success",
        description: "Media deleted successfully"
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting media:', error)
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive"
      })
    }
  }

  const handleSetPrimary = async (media: AlromaihCarMedia) => {
    try {
      await gqlMutate(SET_MEDIA_AS_PRIMARY, { id: media.id })
      toast({
        title: "Success",
        description: "Media set as primary"
      })
      await loadData()
    } catch (error) {
      console.error('Error setting primary:', error)
      toast({
        title: "Error",
        description: "Failed to set media as primary",
        variant: "destructive"
      })
    }
  }

  const handleToggleFeatured = async (media: AlromaihCarMedia) => {
    try {
      await gqlMutate(SET_MEDIA_AS_FEATURED, {
        id: media.id,
        is_featured: !media.is_featured
      })
      toast({
        title: "Success",
        description: media.is_featured ? "Removed from featured" : "Added to featured"
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling featured:', error)
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive"
      })
    }
  }

  const handleToggleWebsiteVisibility = async (media: AlromaihCarMedia) => {
    try {
      await gqlMutate(TOGGLE_MEDIA_WEBSITE_VISIBILITY, {
        id: media.id,
        website_visible: !media.website_visible
      })
      toast({
        title: "Success",
        description: media.website_visible ? "Hidden from website" : "Visible on website"
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast({
        title: "Error",
        description: "Failed to update website visibility",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingMedia(null)
    setFormData({
      name: '',
      car_id: '',
      car_variant_id: '',
      media_type: 'exterior',
      content_type: 'image',
      sequence: 10,
      description: '',
      alt_text: '',
      is_primary: false,
      is_featured: false,
      is_public: true,
      website_visible: true
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Media</h1>
          <p className="text-muted-foreground">
            Manage images, videos, documents and other media for your car inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <ListIcon className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMedia ? 'Edit Media' : 'Add New Media'}
                </DialogTitle>
                <DialogDescription>
                  Upload files or add links to external media content
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Media Title *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter media title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="car_id">Car *</Label>
                    <Select
                      value={formData.car_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, car_id: value, car_variant_id: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select car" />
                      </SelectTrigger>
                      <SelectContent>
                        {cars.map((car) => (
                          <SelectItem key={car.id} value={car.id}>
                            {getLocalizedText(car.display_name) || getLocalizedText(car.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Media Type and Content Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="media_type">Media Type *</Label>
                    <Select
                      value={formData.media_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, media_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MEDIA_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content_type">Content Type *</Label>
                    <Select
                      value={formData.content_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONTENT_TYPES).map(([key, type]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Content Upload/Input Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Content</h4>
                  
                  {/* File Upload for file-based content types */}
                  {['image', 'video_file', 'document'].includes(formData.content_type || '') && (
                    <div className="p-4 border-2 border-dashed rounded-lg text-center">
                      <p className="text-sm text-gray-500">File upload component temporarily unavailable</p>
                    </div>
                  )}

                  {/* URL/Link inputs for non-file content types */}
                  {formData.content_type === 'video_url' && (
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL *</Label>
                      <Input
                        id="video_url"
                        value={formData.video_url || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a YouTube, Vimeo, or other video platform URL
                      </p>
                    </div>
                  )}

                  {formData.content_type === 'external_link' && (
                    <div className="space-y-2">
                      <Label htmlFor="external_link">External Link *</Label>
                      <Input
                        id="external_link"
                        value={formData.external_link || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, external_link: e.target.value }))}
                        placeholder="https://example.com/content"
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        Link to external content or website
                      </p>
                    </div>
                  )}

                  {(formData.content_type === 'iframe_360' || formData.content_type === 'iframe_code') && (
                    <div className="space-y-2">
                      <Label htmlFor="iframe_code">iFrame Code *</Label>
                      <Textarea
                        id="iframe_code"
                        value={formData.iframe_code || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, iframe_code: e.target.value }))}
                        placeholder="<iframe src='...' width='...' height='...'></iframe>"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Complete iframe HTML code for embedded content
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h4 className="font-medium">Additional Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sequence">Display Order</Label>
                      <Input
                        id="sequence"
                        type="number"
                        min="1"
                        value={formData.sequence}
                        onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 10 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alt_text">Alt Text</Label>
                      <Input
                        id="alt_text"
                        value={formData.alt_text || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                        placeholder="Alternative text for accessibility"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter media description"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_primary"
                        checked={formData.is_primary}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_primary: checked }))}
                      />
                      <Label htmlFor="is_primary">Set as Primary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                      />
                      <Label htmlFor="is_featured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_public"
                        checked={formData.is_public}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                      />
                      <Label htmlFor="is_public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="website_visible"
                        checked={formData.website_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, website_visible: checked }))}
                      />
                      <Label htmlFor="website_visible">Show on Website</Label>
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">SEO Settings</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seo_title">SEO Title</Label>
                      <Input
                        id="seo_title"
                        value={formData.seo_title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="Title for search engines"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seo_description">SEO Description</Label>
                      <Textarea
                        id="seo_description"
                        value={formData.seo_description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="Description for search engines"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingMedia ? 'Update Media' : 'Add Media')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.total}</div>
            <p className="text-xs text-muted-foreground">media items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(mediaStats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.primaryCount}</div>
            <p className="text-xs text-muted-foreground">primary media</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.featuredCount}</div>
            <p className="text-xs text-muted-foreground">featured items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">By Type</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaStats.byType.length}</div>
            <p className="text-xs text-muted-foreground">different types</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(MEDIA_TYPES).map(([key, type]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Media Content */}
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>
            Manage all your car media files and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading media...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(media => (
                <Card key={media.id} className="cursor-pointer hover:shadow-md" onClick={() => handleEdit(media)}>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      {media.image ? (
                        <img src={media.image} alt={String(media.name)} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium truncate">{getLocalizedText(media.name)}</h3>
                    <p className="text-sm text-gray-500">{media.media_type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


