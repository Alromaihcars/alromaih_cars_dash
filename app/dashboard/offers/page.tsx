"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Search, Edit, Trash2, Tag, Calendar, Percent, DollarSign, Star, Eye, EyeOff, Upload, X, Image, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { 
  validateImageFile, 
  createImageUrl, 
  revokeImageUrl, 
  formatFileSize, 
  getImageDimensions,
  fileToBase64String,
  SUPPORTED_IMAGE_TYPES 
} from "@/lib/utils/image-utils"
import { gql, gqlMutate } from "@/lib/api"
import { 
  GET_CAR_OFFERS,
  GET_CARS_FOR_DROPDOWN,
  CREATE_CAR_OFFER,
  UPDATE_CAR_OFFER,
  DELETE_CAR_OFFER,
  type CarOffer,
  type CarOfferValues,
  getDisplayName,
  getDisplayDescription,
  createCarOfferValues,
  formatOfferPrice,
  getOfferStatus,
  isOfferActive,
  getOfferTagColor,
  getOfferTagIcon,
  useCarOffers
} from "@/lib/api/queries/car-offers"

interface Car {
  id: string
  name: any
  display_name?: string
}

interface ImagePreviewData {
  url: string
  file?: File
  filename?: string
  size?: number
  mimeType?: string
  dimensions?: { width: number; height: number }
}

// Utility function to get Odoo banner image URL
const getOdooBannerUrl = (offer: CarOffer): string | undefined => {
  // Check if banner_image exists and is a valid string
  if (typeof offer.banner_image === 'string' && offer.banner_image.length > 0) {
    // Check if it's already a full URL or base64 data
    if (offer.banner_image.startsWith('http') || offer.banner_image.startsWith('data:')) {
      return offer.banner_image
    }
    
    // If it's a base64 string without data prefix, add it
    if (offer.banner_image.length > 100 && !offer.banner_image.startsWith('data:')) {
      return `data:image/jpeg;base64,${offer.banner_image}`
    }
    
    // Construct Odoo image URL pattern with proper authentication
    const bannerUrl = `https://portal.alromaihcars.com/web/image/alromaih.car.offer/${offer.id}/banner_image?access_token=public`
    return bannerUrl
  }
  
  return undefined
}

export default function OffersPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [offers, setOffers] = useState<CarOffer[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<CarOffer | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    carId: "",
    startDate: "",
    endDate: "",
    discountType: "fixed" as "fixed" | "percentage",
    discountValue: 0,
    offerTag: "special" as "hot_deal" | "clearance" | "limited" | "special",
    isActive: true
  })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<ImagePreviewData | null>(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [imageValidationError, setImageValidationError] = useState<string | null>(null)

  const { fetchOffers, fetchCars, createOffer, updateOffer, deleteOffer, uploadBannerImage, removeBannerImage } = useCarOffers()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted])

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview?.url) {
        revokeImageUrl(bannerPreview.url)
      }
    }
  }, [bannerPreview])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageValidationError(null)
    
    if (!file) return

    // Validate the image file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setImageValidationError(validation.error || 'Invalid image file')
      toast({
        title: "Error",
        description: validation.error,
        variant: "destructive"
      })
      return
    }

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file)
      
      // Create preview URL
      const previewUrl = createImageUrl(file)
      
      // Clean up previous preview
      if (bannerPreview?.url) {
        revokeImageUrl(bannerPreview.url)
      }

      setBannerFile(file)
      setBannerPreview({
        url: previewUrl,
        file,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        dimensions
      })
    } catch (error) {
      console.error('Error processing image:', error)
      toast({
        title: "Error",
        description: "Failed to process image file",
        variant: "destructive"
      })
    }
  }

  const handleRemoveBanner = () => {
    if (bannerPreview?.url) {
      revokeImageUrl(bannerPreview.url)
    }
    
    setBannerFile(null)
    setBannerPreview(null)
    setImageValidationError(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadBanner = async (offerId: string) => {
    if (!bannerFile) return

    try {
      setUploadingBanner(true)
      
      // Convert file to base64 for GraphQL
      const bannerBase64 = await fileToBase64String(bannerFile)
      
      const result = await gqlMutate(UPLOAD_CAR_OFFER_BANNER, {
        id: offerId,
        banner_image: bannerBase64
      })
      
      toast({
        title: "Success",
        description: "Banner uploaded successfully"
      })
      
      await loadData()
    } catch (error) {
      console.error("Error uploading banner:", error)
      
      let errorMessage = "Failed to upload banner"
      if (error instanceof Error) {
        if (error.message.includes('Network error')) {
          errorMessage = "Network error - check your connection"
        } else if (error.message.includes('Authentication failed')) {
          errorMessage = "Authentication failed - check API key"
        } else if (error.message.includes('GraphQL Error')) {
          errorMessage = `Server error: ${error.message}`
      } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleRemoveOfferBanner = async (offerId: string) => {
    try {
      await gqlMutate(REMOVE_CAR_OFFER_BANNER, {
        id: offerId
      })
      
      toast({
        title: "Success",
        description: "Banner removed successfully"
      })
      
      await loadData()
    } catch (error) {
      console.error("Error removing banner:", error)
      toast({
        title: "Error",
        description: "Failed to remove banner",
        variant: "destructive"
      })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [offersData, carsData] = await Promise.all([
        fetchOffers(),
        fetchCars()
      ])
      
      setOffers(offersData)
      setCars(carsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: t('common.error'),
        description: "Failed to load offers data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.en_US && !formData.name.ar_001) {
      toast({
        title: t('common.error'),
        description: "Please fill in offer name in at least one language",
        variant: "destructive"
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: t('common.error'),
        description: "Please fill in start and end dates",
        variant: "destructive"
      })
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({
        title: t('common.error'),
        description: "End date must be after start date",
        variant: "destructive"
      })
      return
    }

    try {
      const values = createCarOfferValues(
        formData.name,
        formData.description,
        formData.offerTag,
        formData.discountType,
        formData.discountValue,
        formData.startDate,
        formData.endDate,
        formData.isActive,
        formData.carId ? parseInt(formData.carId) : undefined
      )

      // Handle banner upload properly
      if (bannerFile) {
        // Convert file to base64 for GraphQL
        const bannerBase64 = await fileToBase64String(bannerFile)
        values.banner_image = bannerBase64
        }

        if (editingOffer) {
        await updateOffer(editingOffer.id, values)
        toast({
          title: t('common.success'),
          description: "Offer updated successfully"
        })
        } else {
        await createOffer(values)
        toast({
          title: t('common.success'),
          description: "Offer created successfully"
      })
      }

      // Reset form and refresh data
      setFormData({ 
        name: { en_US: "", ar_001: "" },
        description: { en_US: "", ar_001: "" },
        carId: "",
        startDate: "",
        endDate: "",
        discountType: "fixed",
        discountValue: 0,
        offerTag: "special",
        isActive: true
      })
      setEditingOffer(null)
      setIsDialogOpen(false)
      handleRemoveBanner()
      await loadData()
    } catch (error) {
      console.error('Error submitting offer:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorOccurred'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (offer: CarOffer) => {
    setEditingOffer(offer)
    
    // Convert the offer data to form format
    let nameData = { en_US: '', ar_001: '' }
    let descriptionData = { en_US: '', ar_001: '' }
    
    if (typeof offer.name === 'object' && offer.name !== null) {
      nameData = {
        en_US: (offer.name as any).en_US || (offer.name as any)['en_US'] || '',
        ar_001: (offer.name as any).ar_001 || (offer.name as any).ar || (offer.name as any).ar_SA || (offer.name as any).arabic || ''
      }
    } else if (typeof offer.name === 'string') {
      nameData = {
        en_US: offer.name,
        ar_001: ''
      }
    }

    if (offer.description && typeof offer.description === 'object' && offer.description !== null) {
      descriptionData = {
        en_US: (offer.description as any).en_US || (offer.description as any)['en_US'] || '',
        ar_001: (offer.description as any).ar_001 || (offer.description as any).ar || (offer.description as any).ar_SA || (offer.description as any).arabic || ''
      }
    } else if (typeof offer.description === 'string') {
      descriptionData = {
        en_US: offer.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      description: descriptionData,
      carId: offer.car_id?.id || '',
      startDate: offer.start_date,
      endDate: offer.end_date,
      discountType: (offer.discount_type as "fixed" | "percentage") || "fixed",
      discountValue: offer.discount_value || 0,
      offerTag: (offer.offer_tag as "hot_deal" | "clearance" | "limited" | "special") || "special",
      isActive: offer.is_active
    })
    
    // Set current banner as preview if exists
    const bannerUrl = getOdooBannerUrl(offer)
    if (bannerUrl) {
      setBannerPreview({
        url: bannerUrl,
        filename: `${nameData.en_US || nameData.ar_001 || 'offer'}_banner`,
        mimeType: 'image/jpeg' // Default, since we don't know the actual type
    })
    }
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (offer: CarOffer) => {
    const offerName = getDisplayName(offer, 'en_US') || getDisplayName(offer, 'ar_001') || 'this offer'
    if (!confirm(`Are you sure you want to delete "${offerName}"?`)) {
      return
    }

    try {
      await deleteOffer(offer.id)
      
      toast({
        title: "Success",
        description: "Offer deleted successfully"
      })
      
      await loadData()
    } catch (error) {
      console.error("Error deleting offer:", error)
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive"
      })
    }
  }

  const handleNewOffer = () => {
    setEditingOffer(null)
    const today = new Date().toISOString().split('T')[0]
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    setFormData({ 
      name: { en_US: "", ar_001: "" },
      description: { en_US: "", ar_001: "" },
      carId: "",
      startDate: today,
      endDate: nextMonth,
      discountType: "fixed",
      discountValue: 0,
      offerTag: "special",
      isActive: true
    })
    handleRemoveBanner()
    setIsDialogOpen(true)
  }

  const getCarName = (car: any): string => {
    if (!car) return ''
    if (car.display_name) return car.display_name
    if (typeof car.name === 'string') return car.name
    if (typeof car.name === 'object' && car.name !== null) {
      return car.name.en_US || car.name.ar_001 || Object.values(car.name)[0] || `Car ${car.id}`
    }
    return `Car ${car.id}`
  }

  const filteredOffers = offers.filter(offer => {
    const searchLower = searchTerm.toLowerCase()
    const offerName = getDisplayName(offer)
    const matchesSearch = offerName.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && isOfferActive(offer)) ||
                         (statusFilter === "inactive" && !isOfferActive(offer))
    
    const matchesTag = tagFilter === "all" || offer.offer_tag === tagFilter
    
    return matchesSearch && matchesStatus && matchesTag
  })

  if (!mounted) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-none px-4 py-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Car Offers</h1>
            <p className="text-muted-foreground">Manage promotional offers and discounts</p>
        </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              Refresh
            </Button>
            <Button onClick={handleNewOffer}>
              <Plus className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
                </div>
                </div>
              </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-none p-4 border-b bg-background/95">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
              </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                  <SelectItem value="hot_deal">Hot Deal</SelectItem>
                  <SelectItem value="clearance">Clearance</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading offers...</p>
              </div>
            </div>
          ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block">
                    <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                            <TableHead>Banner</TableHead>
                  <TableHead>Offer Details</TableHead>
                            <TableHead>Car</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Status</TableHead>
                            <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                          {filteredOffers.map((offer) => {
                            const bannerUrl = getOdooBannerUrl(offer)
                            return (
                  <TableRow key={offer.id}>
                              <TableCell>
                                <div className="relative group">
                                  <div className="h-12 w-16 rounded overflow-hidden bg-muted">
                                    {bannerUrl ? (
                                      <img 
                                        src={bannerUrl}
                                        alt={getDisplayName(offer, 'en_US') || 'Offer banner'}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Image className="h-6 w-6 opacity-50" />
                                      </div>
                                    )}
                                  </div>
                                  {bannerUrl && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-white hover:text-red-400"
                                        onClick={() => handleRemoveOfferBanner(offer.id)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{getDisplayName(offer, 'en_US')}</span>
                        </div>
                                  {getDisplayName(offer, 'ar_001') && (
                          <div className="text-sm text-muted-foreground mt-1" dir="rtl">
                                      {getDisplayName(offer, 'ar_001')}
                          </div>
                        )}
                                  {getDisplayDescription(offer, 'en_US') && (
                          <div className="text-sm text-muted-foreground mt-1 max-w-xs truncate">
                                      {getDisplayDescription(offer, 'en_US')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                        {offer.car_id ? (
                                  <div className="font-medium">{getCarName(offer.car_id)}</div>
                        ) : (
                          <Badge variant="secondary">All Cars</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {offer.discount_type === 'percentage' ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                        <div>
                          <div className="font-semibold text-green-600">
                            {offer.discount_type === 'percentage' 
                              ? `${offer.discount_value}%` 
                                        : `SAR ${offer.discount_value?.toLocaleString()}`
                            }
                          </div>
                                    {offer.final_price && offer.final_price > 0 && (
                            <div className="text-sm text-muted-foreground">
                                        Final: {formatOfferPrice(offer.final_price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(offer.start_date).toLocaleDateString()}</div>
                        <div>to {new Date(offer.end_date).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                                <Badge className={getOfferTagColor(offer.offer_tag || 'special')}>
                        <div className="flex items-center space-x-1">
                                    <span>{getOfferTagIcon(offer.offer_tag || 'special')}</span>
                                    <span className="capitalize">{(offer.offer_tag || 'special').replace('_', ' ')}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                                <Badge variant={isOfferActive(offer) ? "default" : "secondary"}>
                                  {isOfferActive(offer) ? "Active" : getOfferStatus(offer)}
                      </Badge>
                    </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(offer)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                            )
                          })}
              </TableBody>
            </Table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {filteredOffers.map((offer) => {
                      const bannerUrl = getOdooBannerUrl(offer)
                      return (
                      <Card key={offer.id} className="p-4">
                        <div className="space-y-3">
                          {/* Banner Image */}
                          {bannerUrl && (
                            <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
                              <img 
                                src={bannerUrl} 
                                alt="Offer banner" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Offer Title & Status */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <h3 className="font-medium truncate">{getDisplayName(offer, 'en_US')}</h3>
                              </div>
                              {getDisplayName(offer, 'ar_001') && (
                                <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                                  {getDisplayName(offer, 'ar_001')}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <Badge variant={isOfferActive(offer) ? "default" : "secondary"}>
                                {isOfferActive(offer) ? "Active" : getOfferStatus(offer)}
                              </Badge>
                              <Badge className={getOfferTagColor(offer.offer_tag || 'special')}>
                                <div className="flex items-center space-x-1">
                                  <span>{getOfferTagIcon(offer.offer_tag || 'special')}</span>
                                  <span className="capitalize text-xs">{(offer.offer_tag || 'special').replace('_', ' ')}</span>
                                </div>
                              </Badge>
                            </div>
                          </div>

                          {/* Car Info */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Car:</span>
                            {offer.car_id ? (
                              <span className="font-medium">{getCarName(offer.car_id)}</span>
                            ) : (
                              <Badge variant="secondary">All Cars</Badge>
                            )}
                          </div>

                          {/* Discount */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Discount:</span>
                            <div className="flex items-center space-x-2">
                              {offer.discount_type === 'percentage' ? (
                                <Percent className="h-4 w-4 text-green-600" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-semibold text-green-600">
                                {offer.discount_type === 'percentage' 
                                  ? `${offer.discount_value}%` 
                                  : `SAR ${offer.discount_value?.toLocaleString()}`
                                }
                              </span>
                            </div>
                          </div>

                          {/* Period */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Period:</span>
                            <div className="text-right">
                              <div>{new Date(offer.start_date).toLocaleDateString()}</div>
                              <div>to {new Date(offer.end_date).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {/* Description */}
                          {getDisplayDescription(offer, 'en_US') && (
                            <div className="text-sm text-muted-foreground">
                              {getDisplayDescription(offer, 'en_US')}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(offer)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(offer)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                      )
                    })}
                  </div>
                </>
          )}

          {!loading && filteredOffers.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || tagFilter !== "all"
                  ? "Try adjusting your search criteria" 
                  : "Get started by creating your first promotional offer"
                }
              </p>
              {!searchTerm && statusFilter === "all" && tagFilter === "all" && (
                <Button onClick={handleNewOffer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Button>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>{editingOffer ? 'Edit Offer' : 'Create Offer'}</DialogTitle>
            <DialogDescription>
              {editingOffer 
                ? 'Edit the offer details below.' 
                : 'Fill in the offer details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4 p-1">
            <MultilingualInput
              id="offerName"
              label="Offer Title"
              placeholder="Enter offer title..."
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />

            <MultilingualInput
              id="offerDescription"
              label="Description"
              placeholder="Enter offer description..."
              value={formData.description}
              onChange={(value) => {
                setFormData({ ...formData, description: value })
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carId">Car (Optional)</Label>
              <Select 
                value={formData.carId} 
                onValueChange={(value) => setFormData({ ...formData, carId: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a car (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cars</SelectItem>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {getCarName(car)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select 
                  value={formData.discountType} 
                  onValueChange={(value: "fixed" | "percentage") => setFormData({ ...formData, discountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (SAR)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(SAR)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? "100" : undefined}
                  step={formData.discountType === 'percentage' ? "0.1" : "1"}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.discountType === 'percentage' ? "10.5" : "5000"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offerTag">Offer Tag</Label>
                <Select 
                  value={formData.offerTag} 
                  onValueChange={(value: "hot_deal" | "clearance" | "limited" | "special") => setFormData({ ...formData, offerTag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="special">Special Offer</SelectItem>
                    <SelectItem value="hot_deal">Hot Deal</SelectItem>
                    <SelectItem value="clearance">Clearance</SelectItem>
                    <SelectItem value="limited">Limited Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
              {/* Banner Upload Section */}
             <div className="space-y-2">
               <Label>Banner Image</Label>
               
               {/* Image validation error */}
               {imageValidationError && (
                 <Alert variant="destructive">
                   <Info className="h-4 w-4" />
                   <AlertDescription>{imageValidationError}</AlertDescription>
                 </Alert>
               )}
               
               <div className="flex items-center gap-4">
                 {bannerPreview ? (
                   <div className="relative">
                     <div className="h-16 w-24 border rounded overflow-hidden bg-muted">
                       <img 
                         src={bannerPreview.url} 
                         alt="Banner preview" 
                         className="w-full h-full object-cover"
                       />
                     </div>
                     <Button
                       type="button"
                       variant="destructive"
                       size="sm"
                       className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                       onClick={handleRemoveBanner}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                   </div>
                 ) : (
                   <div className="h-16 w-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                     <Image className="h-8 w-8 text-gray-400" />
                   </div>
                 )}
                 
                 <div className="flex-1">
                   <input
                     ref={fileInputRef}
                     type="file"
                     accept="image/*"
                     onChange={handleFileSelect}
                     className="hidden"
                   />
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full"
                   >
                     <Upload className="mr-2 h-4 w-4" />
                     {bannerPreview ? 'Change Banner' : 'Upload Banner'}
                   </Button>
                   <div className="text-xs text-muted-foreground mt-1 space-y-1">
                     <p>Supported: JPEG, PNG, WebP, GIF, SVG</p>
                     {bannerPreview && (
                       <div className="space-y-0.5">
                         <p>File: {bannerPreview.filename}</p>
                         {bannerPreview.size && <p>Size: {formatFileSize(bannerPreview.size)}</p>}
                         {bannerPreview.mimeType && <p>Type: {bannerPreview.mimeType}</p>}
                         {bannerPreview.dimensions && (
                           <p>Dimensions: {bannerPreview.dimensions.width}×{bannerPreview.dimensions.height}</p>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center gap-2">
               <Switch
                 id="isActive"
                 checked={formData.isActive}
                 onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
               />
               <Label htmlFor="isActive">Active</Label>
             </div>
             
                          <div className="flex justify-end gap-2 pt-4 border-t bg-background sticky bottom-0">
               <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                 {t('common.cancel')}
               </Button>
               <Button type="submit" disabled={uploadingBanner}>
                 {uploadingBanner ? 'Uploading...' : editingOffer ? t('common.update') : t('common.create')}
               </Button>
             </div>
           </form>
          </div>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 