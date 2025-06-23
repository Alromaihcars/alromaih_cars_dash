"use client"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { 
  type CarModel as CarModelType,
  type CarBrand as CarBrandType,
  getDisplayName,
  GET_CAR_MODELS,
  GET_CAR_BRANDS_FOR_DROPDOWN,
  CREATE_CAR_MODEL,
  UPDATE_CAR_MODEL,
  DELETE_CAR_MODEL,
  createCarModelValues
} from "@/lib/api/queries/car-models"
import { gql, gqlMutate } from "@/lib/api"

export default function ModelsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<CarModelType | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    brandId: "",
    active: true
  })

  // State management using unified client
  const [models, setModels] = useState<CarModelType[]>([])
  const [brands, setBrands] = useState<CarBrandType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch functions using unified client
  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await gql(GET_CAR_MODELS)
      
      if (response?.CarModel) {
        setModels(response.CarModel)
      }
      setError(null)
    } catch (err) {
      console.error('Error fetching car models:', err)
      setError('Failed to fetch car models')
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await gql(GET_CAR_BRANDS_FOR_DROPDOWN)
      
      if (response?.CarBrand) {
        setBrands(response.CarBrand)
      }
    } catch (err) {
      console.error('Error fetching car brands:', err)
      setBrands([])
    }
  }

  const createModel = async (
    name: any,
    brand_id?: number,
    active?: boolean
  ) => {
    try {
      const values = createCarModelValues(name, brand_id, active)
      const response = await gqlMutate(CREATE_CAR_MODEL, { values })
      
      if (response?.CarModel) {
        setModels(prev => [...prev, response.CarModel])
        return response.CarModel
      }
    } catch (err) {
      console.error('Error creating car model:', err)
      throw err
    }
  }

  const updateModel = async (
    id: string,
    name: any,
    brand_id?: number,
    active?: boolean
  ) => {
    try {
      const values = createCarModelValues(name, brand_id, active)
      const response = await gqlMutate(UPDATE_CAR_MODEL, { id, values })
      
      if (response?.CarModel) {
        setModels(prev => prev.map(model => 
          model.id === parseInt(id) ? response.CarModel : model
        ))
        return response.CarModel
      }
    } catch (err) {
      console.error('Error updating car model:', err)
      throw err
    }
  }

  const deleteModel = async (id: string) => {
    try {
      await gqlMutate(DELETE_CAR_MODEL, { id })
      setModels(prev => prev.filter(model => model.id !== parseInt(id)))
    } catch (err) {
      console.error('Error deleting car model:', err)
      throw err
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchModels()
      fetchBrands()
    }
  }, [mounted])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Helper function to get brand by ID
  const getBrandById = (brandId?: number): CarBrandType | undefined => {
    if (!brandId) return undefined
    return brands.find(brand => brand.id === brandId)
  }

  // Helper function to get brand logo URL
  const getBrandLogoUrl = (brandId?: number): string | undefined => {
    const brand = getBrandById(brandId)
    if (!brand?.logo) return undefined
    
    if (typeof brand.logo === 'string' && brand.logo.length > 0) {
      if (brand.logo.startsWith('http') || brand.logo.startsWith('data:')) {
        return brand.logo
      }
      
      if (brand.logo.length > 100 && !brand.logo.startsWith('data:')) {
        return `data:image/jpeg;base64,${brand.logo}`
      }
      
      const logoUrl = `https://portal.alromaihcars.com/web/image/car.brand/${brand.id}/logo?access_token=public`
      return logoUrl
    }
    
    return undefined
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.en_US && !formData.name.ar_001) {
      toast({
        title: t('common.error'),
        description: "Please fill in model name in at least one language",
        variant: "destructive"
      })
      return
    }

    if (!formData.brandId) {
      toast({
        title: t('common.error'),
        description: "Please select a brand",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (editingModel) {
        await updateModel(
          String(editingModel.id),
          formData.name,
          parseInt(formData.brandId),
          formData.active
        )
        
        toast({
          title: t('common.success'),
          description: "Model updated successfully"
        })
      } else {
        await createModel(
          formData.name,
          parseInt(formData.brandId),
          formData.active
        )
        
        toast({
          title: t('common.success'),
          description: "Model created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ 
        name: { en_US: "", ar_001: "" },
        brandId: "",
        active: true 
      })
      setEditingModel(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error submitting model:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorOccurred'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (model: CarModelType) => {
    setEditingModel(model)
    
    // Convert the model data to form format
    let nameData = { en_US: '', ar_001: '' }
    
    if (typeof model.name === 'object' && model.name !== null) {
      nameData = {
        en_US: (model.name as any).en_US || (model.name as any)['en_US'] || '',
        ar_001: (model.name as any).ar_001 || (model.name as any).ar || (model.name as any).ar_SA || (model.name as any).arabic || ''
      }
    } else if (typeof model.name === 'string') {
      nameData = {
        en_US: model.name,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      brandId: String(model.brand_id || ''),
      active: model.active
    })
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (model: CarModelType) => {
    const modelName = getDisplayName(model as any, 'en_US') || getDisplayName(model as any, 'ar_001') || 'this model'
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return
    }

    try {
      await deleteModel(String(model.id))
      
      toast({
        title: "Success",
        description: "Model deleted successfully"
      })
    } catch (error) {
      console.error("Error deleting model:", error)
      toast({
        title: "Error",
        description: "Failed to delete model. It may have related trims.",
        variant: "destructive"
      })
    }
  }

  const handleNewModel = () => {
    setEditingModel(null)
    setFormData({ 
      name: { en_US: "", ar_001: "" },
      brandId: "",
      active: true 
    })
    setIsDialogOpen(true)
  }

  const filteredModels = models.filter(model => {
    if (!showInactive && !model.active) return false
    
    const searchLower = searchTerm.toLowerCase()
    
    // Safely get model name values with fallbacks
    let enName = ''
    let arName = ''
    
    if (typeof model.name === 'object' && model.name !== null) {
      enName = (model.name as any).en_US || (model.name as any)['en_US'] || ''
      arName = (model.name as any).ar_001 || (model.name as any)['ar_001'] || ''
    } else if (typeof model.name === 'string') {
      enName = model.name
      arName = ''
    }

    // Also search in brand names
    const brand = getBrandById(model.brand_id)
    let brandEnName = ''
    let brandArName = ''
    
    if (brand?.name) {
      if (typeof brand.name === 'object' && brand.name !== null) {
        brandEnName = (brand.name as any).en_US || (brand.name as any)['en_US'] || ''
        brandArName = (brand.name as any).ar_001 || (brand.name as any)['ar_001'] || ''
      } else if (typeof brand.name === 'string') {
        brandEnName = brand.name
        brandArName = ''
      }
    }

    const matchesSearch = 
      enName.toLowerCase().includes(searchLower) ||
      arName.toLowerCase().includes(searchLower) ||
      brandEnName.toLowerCase().includes(searchLower) ||
      brandArName.toLowerCase().includes(searchLower)

    const matchesBrand = selectedBrandFilter === "all" || String(model.brand_id || '') === selectedBrandFilter
    
    return matchesSearch && matchesBrand
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
            <CardTitle>Car Models</CardTitle>
            <CardDescription>Manage your car models</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchModels()}>
              Refresh
            </Button>
            <Button onClick={handleNewModel}>
              <Plus className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search models and brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => {
                    const displayName = getDisplayName(brand as any, 'en_US') ||
                                      getDisplayName(brand as any, 'ar_001') ||
                                      brand.display_name ||
                                      'Unknown Brand'
                    return (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {displayName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label>Show Inactive</Label>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading models...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => {
                    const brand = getBrandById(model.brand_id)
                    const brandLogoUrl = getBrandLogoUrl(model.brand_id)
                    return (
                      <TableRow key={model.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={brandLogoUrl}
                                alt={getDisplayName(brand as any, 'en_US') || 'Brand logo'}
                              />
                              <AvatarFallback>
                                <Car className="h-5 w-5 opacity-50" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{getDisplayName(brand as any, 'en_US')}</div>
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {getDisplayName(brand as any, 'ar_001')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getDisplayName(model as any, 'en_US')}</div>
                            <div className="text-sm text-muted-foreground" dir="rtl">
                              {getDisplayName(model as any, 'ar_001')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.active ? "default" : "secondary"}>
                            {model.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(model)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(model)}
                              disabled={!model.active}
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
            )}

            {!loading && filteredModels.length === 0 && (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No models found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedBrandFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first car model"
                  }
                </p>
                {!searchTerm && selectedBrandFilter === "all" && (
                  <Button onClick={handleNewModel}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Model
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModel ? 'Edit Model' : 'Add Model'}</DialogTitle>
            <DialogDescription>
              {editingModel 
                ? 'Edit the model details below.' 
                : 'Fill in the model details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
              id="modelName"
              label="Model Name"
              placeholder="Enter model name..."
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="brandId">Brand *</Label>
              <Select 
                value={formData.brandId} 
                onValueChange={(value) => setFormData({ ...formData, brandId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => {
                    const displayName = getDisplayName(brand as any, 'en_US') ||
                                      getDisplayName(brand as any, 'ar_001') ||
                                      brand.display_name ||
                                      'Unknown Brand'
                    return (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {displayName}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
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
              <Button type="submit">
                {editingModel ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 