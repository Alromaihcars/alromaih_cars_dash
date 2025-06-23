"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Settings, Car } from "lucide-react"
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
import { gql, gqlMutate } from "@/lib/api"
import { 
  GET_CAR_TRIMS, 
  GET_CAR_MODELS_FOR_DROPDOWN,
  CREATE_CAR_TRIM, 
  UPDATE_CAR_TRIM, 
  DELETE_CAR_TRIM,
  type CarTrim as CarTrimType,
  type CarModel as CarModelType,
  type CarTrimValues,
  getDisplayName,
  getDisplayDescription,
  createCarTrimValues
} from "@/lib/api/queries/car-trims"

export default function TrimsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [trims, setTrims] = useState<CarTrimType[]>([])
  const [models, setModels] = useState<CarModelType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrim, setEditingTrim] = useState<CarTrimType | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    modelId: "",
    code: "",
    active: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchTrims()
      fetchModels()
    }
  }, [mounted])

  const fetchTrims = async () => {
    try {
      setLoading(true)
      const response = await gql(GET_CAR_TRIMS)

      if (response?.CarTrim) {
        setTrims(response.CarTrim.filter((trim: CarTrimType) => 
          showInactive ? true : trim.active
        ))
      }
    } catch (error) {
      console.error("Error fetching trims:", error)
      toast({
        title: t('common.error'),
        description: "Failed to fetch car trims",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchModels = async () => {
    try {
      const response = await gql(GET_CAR_MODELS_FOR_DROPDOWN)
      if (response?.CarModel) {
        setModels(response.CarModel)
      }
    } catch (error) {
      console.error("Error fetching models:", error)
    }
  }

  // Helper function to get model by ID
  const getModelById = (modelId?: number): CarModelType | undefined => {
    if (!modelId) return undefined
    return models.find(model => model.id === modelId)
  }

  // Helper function to get brand logo URL
  const getBrandLogoUrl = (modelId?: number): string | undefined => {
    const model = getModelById(modelId)
    const brand = model?.brand_id
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
        description: "Please fill in trim name in at least one language",
        variant: "destructive"
      })
      return
    }

    if (!formData.modelId) {
      toast({
        title: t('common.error'),
        description: "Please select a model",
        variant: "destructive"
      })
      return
    }
    
    try {
      const values = createCarTrimValues(
        formData.name,
        parseInt(formData.modelId),
        formData.description,
        formData.code,
        formData.active
      )

      if (editingTrim) {
        await gqlMutate(UPDATE_CAR_TRIM, {
          id: editingTrim.id,
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Trim updated successfully"
        })
      } else {
        await gqlMutate(CREATE_CAR_TRIM, {
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Trim created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ 
        name: { en_US: "", ar_001: "" },
        description: { en_US: "", ar_001: "" },
        modelId: "",
        code: "",
        active: true 
      })
      setEditingTrim(null)
      setIsDialogOpen(false)
      await fetchTrims()
    } catch (error) {
      console.error('Error submitting trim:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorOccurred'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (trim: CarTrimType) => {
    setEditingTrim(trim)
    
    // Convert the trim data to form format
    let nameData = { en_US: '', ar_001: '' }
    let descriptionData = { en_US: '', ar_001: '' }
    
    if (typeof trim.name === 'object' && trim.name !== null) {
      nameData = {
        en_US: (trim.name as any).en_US || (trim.name as any)['en_US'] || '',
        ar_001: (trim.name as any).ar_001 || (trim.name as any).ar || (trim.name as any).ar_SA || (trim.name as any).arabic || ''
      }
    } else if (typeof trim.name === 'string') {
      nameData = {
        en_US: trim.name,
        ar_001: ''
      }
    }

    if (trim.description && typeof trim.description === 'object' && trim.description !== null) {
      descriptionData = {
        en_US: (trim.description as any).en_US || (trim.description as any)['en_US'] || '',
        ar_001: (trim.description as any).ar_001 || (trim.description as any).ar || (trim.description as any).ar_SA || (trim.description as any).arabic || ''
      }
    } else if (typeof trim.description === 'string') {
      descriptionData = {
        en_US: trim.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      description: descriptionData,
      modelId: String(trim.model_id?.id || ''),
      code: trim.code || '',
      active: trim.active
    })
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (trim: CarTrimType) => {
    const trimName = getDisplayName(trim, 'en_US') || getDisplayName(trim, 'ar_001') || 'this trim'
    if (!confirm(`Are you sure you want to delete "${trimName}"?`)) {
      return
    }

    try {
      await gqlMutate(DELETE_CAR_TRIM, {
        id: trim.id
      })
      
      toast({
        title: "Success",
        description: "Trim deleted successfully"
      })
      
      await fetchTrims()
    } catch (error) {
      console.error('Error deleting trim:', error)
      toast({
        title: "Error",
        description: "Failed to delete trim. It may be used by existing cars.",
        variant: "destructive"
      })
    }
  }

  const handleNewTrim = () => {
    setEditingTrim(null)
    setFormData({ 
      name: { en_US: "", ar_001: "" },
      description: { en_US: "", ar_001: "" },
      modelId: "",
      code: "",
      active: true 
    })
    setIsDialogOpen(true)
  }

  const filteredTrims = trims.filter(trim => {
    if (!showInactive && !trim.active) return false
    
    const searchLower = searchTerm.toLowerCase()
    
    // Safely get trim name values with fallbacks
    let enName = ''
    let arName = ''
    
    if (typeof trim.name === 'object' && trim.name !== null) {
      enName = (trim.name as any).en_US || (trim.name as any)['en_US'] || ''
      arName = (trim.name as any).ar_001 || (trim.name as any)['ar_001'] || ''
    } else if (typeof trim.name === 'string') {
      enName = trim.name
      arName = ''
    }

    // Also search in model and brand names
    const model = getModelById(trim.model_id?.id)
    let modelEnName = ''
    let modelArName = ''
    let brandEnName = ''
    let brandArName = ''
    
    if (model?.name) {
      if (typeof model.name === 'object' && model.name !== null) {
        modelEnName = (model.name as any).en_US || (model.name as any)['en_US'] || ''
        modelArName = (model.name as any).ar_001 || (model.name as any)['ar_001'] || ''
      } else if (typeof model.name === 'string') {
        modelEnName = model.name
        modelArName = ''
      }
    }

    if (model?.brand_id?.name) {
      if (typeof model.brand_id.name === 'object' && model.brand_id.name !== null) {
        brandEnName = (model.brand_id.name as any).en_US || (model.brand_id.name as any)['en_US'] || ''
        brandArName = (model.brand_id.name as any).ar_001 || (model.brand_id.name as any)['ar_001'] || ''
      } else if (typeof model.brand_id.name === 'string') {
        brandEnName = model.brand_id.name
        brandArName = ''
      }
    }

    const matchesSearch = 
      enName.toLowerCase().includes(searchLower) ||
      arName.toLowerCase().includes(searchLower) ||
      modelEnName.toLowerCase().includes(searchLower) ||
      modelArName.toLowerCase().includes(searchLower) ||
      brandEnName.toLowerCase().includes(searchLower) ||
      brandArName.toLowerCase().includes(searchLower) ||
      (trim.code && trim.code.toLowerCase().includes(searchLower))

    const matchesModel = selectedModelFilter === "all" || String(trim.model_id?.id || '') === selectedModelFilter
    
    return matchesSearch && matchesModel
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
            <CardTitle>Car Trims</CardTitle>
            <CardDescription>Manage car trim levels and configurations</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchTrims()}>
              Refresh
            </Button>
            <Button onClick={handleNewTrim}>
              <Plus className="mr-2 h-4 w-4" />
              Add Trim
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search trims, models, and brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={selectedModelFilter} onValueChange={setSelectedModelFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {models.map((model) => {
                    const displayName = getDisplayName(model as any, 'en_US') ||
                                      getDisplayName(model as any, 'ar_001') ||
                                      model.display_name ||
                                      'Unknown Model'
                    const brandName = model.brand_id && getDisplayName(model.brand_id as any, 'en_US') ||
                                     model.brand_id && getDisplayName(model.brand_id as any, 'ar_001') ||
                                     'Unknown Brand'
                    return (
                      <SelectItem key={model.id} value={String(model.id)}>
                        {brandName} - {displayName}
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
                  <p className="mt-2 text-sm text-muted-foreground">Loading trims...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Trim Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrims.map((trim) => {
                    const model = getModelById(trim.model_id?.id)
                    const brand = model?.brand_id
                    const brandLogoUrl = getBrandLogoUrl(trim.model_id?.id)
                    return (
                      <TableRow key={trim.id}>
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
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{getDisplayName(trim, 'en_US')}</div>
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {getDisplayName(trim, 'ar_001')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {trim.code && (
                            <Badge variant="outline">
                              {trim.code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={trim.active ? "default" : "secondary"}>
                            {trim.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(trim)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(trim)}
                              disabled={!trim.active}
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

            {!loading && filteredTrims.length === 0 && (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No trims found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedModelFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first car trim"
                  }
                </p>
                {!searchTerm && selectedModelFilter === "all" && (
                  <Button onClick={handleNewTrim}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Trim
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTrim ? 'Edit Trim' : 'Add Trim'}</DialogTitle>
            <DialogDescription>
              {editingTrim 
                ? 'Edit the trim details below.' 
                : 'Fill in the trim details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
              id="trimName"
              label="Trim Name"
              placeholder="Enter trim name..."
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />

            <MultilingualInput
              id="trimDescription"
              label="Description"
              placeholder="Enter trim description..."
              value={formData.description}
              onChange={(value) => {
                setFormData({ ...formData, description: value })
              }}
              multiline
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelId">Model *</Label>
                <Select 
                  value={formData.modelId} 
                  onValueChange={(value) => setFormData({ ...formData, modelId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => {
                      const displayName = getDisplayName(model as any, 'en_US') ||
                                        getDisplayName(model as any, 'ar_001') ||
                                        model.display_name ||
                                        'Unknown Model'
                      const brandName = model.brand_id && getDisplayName(model.brand_id as any, 'en_US') ||
                                       model.brand_id && getDisplayName(model.brand_id as any, 'ar_001') ||
                                       'Unknown Brand'
                      return (
                        <SelectItem key={model.id} value={String(model.id)}>
                          {brandName} - {displayName}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Trim Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., LX, EX, Sport"
                />
              </div>
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
                {editingTrim ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 