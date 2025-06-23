'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Grid, List, Search, Play, ExternalLink, 
  ChevronLeft, ChevronRight, X, Star,
  ImageIcon, Eye, Heart, Filter
} from 'lucide-react'

import { 
  type AlromaihCarMedia, 
  MEDIA_TYPES, 
  CONTENT_TYPES,
  getMediaDisplayUrl,
  getMediaThumbnailUrl,
  formatFileSize
} from '@/lib/api/queries/car-media'

interface MediaGalleryProps {
  media: AlromaihCarMedia[]
  getLocalizedText: (field: any) => string
  onMediaClick?: (media: AlromaihCarMedia) => void
  showFilters?: boolean
  viewMode?: 'grid' | 'list'
  allowFullscreen?: boolean
}

export function MediaGallery({ 
  media, 
  getLocalizedText, 
  onMediaClick,
  showFilters = true,
  viewMode: initialViewMode = 'grid',
  allowFullscreen = true
}: MediaGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<AlromaihCarMedia | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const filteredMedia = media.filter(item => {
    const matchesSearch = searchQuery === '' || 
      getLocalizedText(item.name).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || item.media_type === selectedType
    return matchesSearch && matchesType && item.active
  })

  const openLightbox = (media: AlromaihCarMedia, index: number) => {
    if (!allowFullscreen) return
    setSelectedMedia(media)
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const MediaItem = ({ item, index }: { item: AlromaihCarMedia, index: number }) => {
    const mediaType = MEDIA_TYPES[item.media_type]
    const contentType = CONTENT_TYPES[item.content_type]
    const thumbnailUrl = getMediaThumbnailUrl(item)

    const handleItemClick = () => {
      if (onMediaClick) {
        onMediaClick(item)
      } else if (allowFullscreen) {
        openLightbox(item, index)
      }
    }

    if (viewMode === 'list') {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer" onClick={handleItemClick}>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={getLocalizedText(item.name)} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-2xl">{contentType.icon}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate cursor-pointer hover:text-primary" onClick={handleItemClick}>
                  {getLocalizedText(item.name)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <span className="mr-1">{mediaType.icon}</span>
                    {mediaType.label}
                  </Badge>
                  {item.is_primary && <Star className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="group overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square relative bg-muted overflow-hidden cursor-pointer" onClick={handleItemClick}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={getLocalizedText(item.name)} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-4xl">{contentType.icon}</span>
            </div>
          )}

          {item.is_primary && (
            <div className="absolute top-2 left-2">
              <Badge variant="default" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Primary
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs bg-white/90">
              <span className="mr-1">{mediaType.icon}</span>
              {mediaType.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-3">
          <h4 className="font-medium text-sm truncate mb-1">
            {getLocalizedText(item.name)}
          </h4>
          <p className="text-xs text-muted-foreground truncate">
            {getLocalizedText(item.car_id.display_name) || getLocalizedText(item.car_id.name)}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
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

              <div className="flex items-center bg-muted rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No media found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No media items available.'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'list' 
            ? 'space-y-4'
            : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
        }>
          {filteredMedia.map((item, index) => (
            <MediaItem key={item.id} item={item} index={index} />
          ))}
        </div>
      )}

      {allowFullscreen && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black">
            {selectedMedia && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="w-full h-full flex items-center justify-center p-8">
                  {selectedMedia.content_type === 'image' && selectedMedia.image ? (
                    <img 
                      src={getMediaDisplayUrl(selectedMedia)}
                      alt={getLocalizedText(selectedMedia.name)}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">
                        {CONTENT_TYPES[selectedMedia.content_type].icon}
                      </div>
                      <p className="text-lg">
                        {getLocalizedText(selectedMedia.name)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-2">
                      {getLocalizedText(selectedMedia.name)}
                    </h3>
                    <p className="text-sm opacity-75">
                      {getLocalizedText(selectedMedia.car_id.display_name) || getLocalizedText(selectedMedia.car_id.name)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 