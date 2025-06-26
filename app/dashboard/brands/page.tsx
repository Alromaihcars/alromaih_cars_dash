"use client"
import { useState, useEffect, useRef } from "react"
import { Plus, Search, Edit, Trash2, Image, Eye, EyeOff, Upload, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { 
  GET_CAR_BRANDS, 
  CREATE_CAR_BRAND, 
  UPDATE_CAR_BRAND, 
  DELETE_CAR_BRAND,
  UPLOAD_CAR_BRAND_LOGO,
  REMOVE_CAR_BRAND_LOGO,
  type CarBrand as CarBrandType,
  type CarBrandValues,
  convertToTranslations,
  convertFromTranslations,
  getDisplayName,
  fetchGraphQL
} from "@/lib/api/queries/car-brands"

interface Translation {
  en_US: string
  ar_SA: string
}

interface CarBrand {
  id: number
  name: Translation | string
  logo: string | false | null
  active: boolean
  create_date: string
  write_date: string
  description?: Translation | string
  slug?: string
  display_name?: string
  model_ids?: Array<{ id: number; name: Translation | string }>
}

interface ImagePreviewData {
  url: string
  file?: File
  filename?: string
  size?: number
  mimeType?: string
  dimensions?: { width: number; height: number }
}

// Utility function to get Odoo image URL
const getOdooImageUrl = (brand: CarBrand): string | undefined => {
  // Check if logo exists and is a valid string (not false or null)
  if (typeof brand.logo === 'string' && brand.logo.length > 0) {
    // Check if it's already a full URL or base64 data
    if (brand.logo.startsWith('http') || brand.logo.startsWith('data:')) {
      return brand.logo
    }
    
    // If it's a base64 string without data prefix, add it
    if (brand.logo.length > 100 && !brand.logo.startsWith('data:')) {
      return `data:image/jpeg;base64,${brand.logo}`
    }
    
    // Construct Odoo image URL pattern with proper authentication
    const logoUrl = `https://portal.alromaihcars.com/web/image/car.brand/${brand.id}/logo?access_token=public`
    return logoUrl
  }
  
  return undefined
}

export default function BrandsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)
  const [brands, setBrands] = useState<CarBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<CarBrand | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    active: true
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<ImagePreviewData | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [imageValidationError, setImageValidationError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchBrands()
    }
  }, [mounted, showInactive])

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreview?.url) {
        revokeImageUrl(logoPreview.url)
      }
    }
  }, [logoPreview])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const data = await fetchGraphQL(GET_CAR_BRANDS)

      if (data?.CarBrand) {
        // EasyGraphQL with @multiLang returns data in the correct format already
        const filteredBrands = data.CarBrand.filter((brand: CarBrand) => 
          showInactive ? true : brand.active
        )
        
        setBrands(filteredBrands)
      }
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast({
        title: t('common.error'),
        description: t('brands.fetchError'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
      if (logoPreview?.url) {
        revokeImageUrl(logoPreview.url)
      }

      setLogoFile(file)
      setLogoPreview({
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

  const handleRemoveLogo = () => {
    if (logoPreview?.url) {
      revokeImageUrl(logoPreview.url)
    }
    
    setLogoFile(null)
    setLogoPreview(null)
    setImageValidationError(null)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadLogo = async (brandId: number) => {
    if (!logoFile) return

    try {
      setUploadingLogo(true)
      
      // Convert file to base64 for GraphQL
      const logoBase64 = await fileToBase64String(logoFile)
      
      const result = await fetchGraphQL(UPLOAD_CAR_BRAND_LOGO, {
        id: brandId.toString(),
        logo: logoBase64
      })
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully"
      })
      
      await fetchBrands()
    } catch (error) {
      console.error("Error uploading logo:", error)
      
      let errorMessage = "Failed to upload logo"
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
      setUploadingLogo(false)
    }
  }

  const handleRemoveBrandLogo = async (brandId: number) => {
    try {
      await fetchGraphQL(REMOVE_CAR_BRAND_LOGO, {
        id: brandId.toString()
      })
      
      toast({
        title: "Success",
        description: "Logo removed successfully"
      })
      
      await fetchBrands()
    } catch (error) {
      console.error("Error removing logo:", error)
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert form data to GraphQL format
      const nameTranslations = convertToTranslations(formData.name)
      
      const values: CarBrandValues = {
        name_translations: nameTranslations,
        active: formData.active
      }

      // Handle logo upload properly
      if (logoFile) {
        // Convert file to base64 for GraphQL
        const logoBase64 = await fileToBase64String(logoFile)
        values.logo = logoBase64
      }

      if (editingBrand) {
        // Update existing brand
        await fetchGraphQL(UPDATE_CAR_BRAND, {
          id: editingBrand.id.toString(),
          values: values
        })
        
        toast({
          title: t('common.success'),
          description: t('brands.updateSuccess')
        })
      } else {
        // Create new brand
        await fetchGraphQL(CREATE_CAR_BRAND, {
          values: values
        })
        
        toast({
          title: t('common.success'),
          description: t('brands.createSuccess')
        })
      }

      // Reset form and refresh data
      setFormData({ name: { en_US: "", ar_001: "" }, active: true })
      setEditingBrand(null)
      setIsDialogOpen(false)
      handleRemoveLogo()
      await fetchBrands()
    } catch (error) {
      console.error('Error submitting brand:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorOccurred'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (brand: CarBrand) => {
    setEditingBrand(brand)
    
    // Convert the brand name to form format
    let nameData = { en_US: '', ar_001: '' }
    
    if (typeof brand.name === 'object' && brand.name !== null) {
      // Handle both formats: direct object or processed multilingual data
      nameData = {
        en_US: (brand.name as any).en_US || (brand.name as any)['en_US'] || '',
        ar_001: (brand.name as any).ar_001 || (brand.name as any).ar || (brand.name as any).ar_SA || (brand.name as any).arabic || ''
      }
    } else if (typeof brand.name === 'string') {
      // If it's a string, put it in English field
      nameData = {
        en_US: brand.name,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      active: brand.active
    })
    
    // Set current logo as preview if exists
    const logoUrl = getOdooImageUrl(brand)
    if (logoUrl) {
      setLogoPreview({
        url: logoUrl,
        filename: `${nameData.en_US || nameData.ar_001 || 'brand'}_logo`,
        mimeType: 'image/jpeg' // Default, since we don't know the actual type
      })
    }
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (brand: CarBrand) => {
    const brandName = getDisplayName(brand, 'en_US') || getDisplayName(brand, 'ar_001') || 'this brand'
    
    if (!confirm(`Are you sure you want to delete "${brandName}"?`)) {
      return
    }

    try {
      await fetchGraphQL(DELETE_CAR_BRAND, {
        id: brand.id.toString()
      })
      
      toast({
        title: "Success",
        description: "Brand deleted successfully"
      })
      
      fetchBrands()
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast({
        title: "Error",
        description: "Failed to delete brand. It may have related models.",
        variant: "destructive"
      })
    }
  }

  const handleNewBrand = () => {
    setEditingBrand(null)
    setFormData({ name: { en_US: "", ar_001: "" }, active: true })
    handleRemoveLogo()
    setIsDialogOpen(true)
  }



  const filteredBrands = brands.filter(brand => {
    const searchLower = searchTerm.toLowerCase()
    
    // Safely get brand name values with fallbacks - handle different structures
    let enName = ''
    let arName = ''
    
    if (typeof brand.name === 'object' && brand.name !== null) {
      enName = (brand.name as any).en_US || (brand.name as any)['en_US'] || ''
      arName = (brand.name as any).ar_001 || (brand.name as any)['ar_001'] || ''
    } else if (typeof brand.name === 'string') {
      enName = brand.name
      arName = ''
    }
    
    return (
      enName.toLowerCase().includes(searchLower) ||
      arName.toLowerCase().includes(searchLower)
    )
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
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Car Brands</CardTitle>
            <CardDescription>Manage your car brands</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => fetchBrands()}>
              Refresh
            </Button>
            <Button onClick={handleNewBrand}>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label>Show Inactive</Label>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Models</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrands.map((brand) => {
                  const logoUrl = getOdooImageUrl(brand)
                  return (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <div className="relative group">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={logoUrl}
                              alt={getDisplayName(brand as any, 'en_US') || getDisplayName(brand as any, 'ar_001') || 'Brand logo'}
                            />
                            <AvatarFallback>
                              <Image className="h-6 w-6 opacity-50" />
                            </AvatarFallback>
                          </Avatar>
                          {logoUrl && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-white hover:text-red-400"
                                onClick={() => handleRemoveBrandLogo(brand.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getDisplayName(brand as any, 'en_US')}</div>
                        <div className="text-sm text-muted-foreground">{getDisplayName(brand as any, 'ar_001')}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {brand.model_ids?.length || 0} models
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.active ? "default" : "secondary"}>
                          {brand.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(brand)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(brand)}
                            disabled={!brand.active}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
            <DialogDescription>
              {editingBrand 
                ? 'Edit the brand details below.' 
                : 'Fill in the brand details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <Label>Brand Logo</Label>
              
              {/* Image validation error */}
              {imageValidationError && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{imageValidationError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={logoPreview.url} alt="Logo preview" />
                      <AvatarFallback>
                        <Image className="h-8 w-8 opacity-50" />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={Object.keys(SUPPORTED_IMAGE_TYPES).join(',')}
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
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    <p>Supported: JPEG, PNG, WebP, GIF, SVG</p>
                    {logoPreview && (
                      <div className="space-y-0.5">
                        <p>File: {logoPreview.filename}</p>
                        {logoPreview.size && <p>Size: {formatFileSize(logoPreview.size)}</p>}
                        {logoPreview.mimeType && <p>Type: {logoPreview.mimeType}</p>}
                        {logoPreview.dimensions && (
                          <p>Dimensions: {logoPreview.dimensions.width}×{logoPreview.dimensions.height}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <MultilingualInput
              id="brandName"
              label="Brand Name"
              placeholder="Enter brand name..."
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />
            
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">{t('common.active')}</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={uploadingLogo}>
                {uploadingLogo ? 'Uploading...' : editingBrand ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 