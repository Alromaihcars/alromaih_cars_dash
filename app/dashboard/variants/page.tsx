"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Car, Image, Package, Star, Eye, EyeOff, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { gql, gqlMutate } from "@/lib/api"

interface Translation {
  en_US: string
  ar_001: string
}

interface CarColor {
  id: number
  name: Translation
  color_picker: string
}

interface Car {
  id: number
  name: Translation
}

interface CarVariant {
  id: number
  name: Translation
  description: Translation
  car_id: { id: number; name: Translation }
  color_id: { id: number; name: Translation; color_picker: string }
  is_primary: boolean
  image: string | null
  price: number
  qty_available: number
  qty_forecasted: number
  virtual_available: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'no_product'
  media_count: number
  has_exterior_images: boolean
  has_interior_images: boolean
  has_videos: boolean
  has_offer: boolean
  offer_price: number
  active: boolean
  create_date: string
  write_date: string
}

const GET_VARIANTS_QUERY = `
  query GetCarVariants {
    CarVariant(
      translation_fallback: true,
      order: "car_id,is_primary DESC,color_id",
      offset: 0,
      multilingual: true,
      limit: 100,
      language: "",
      domain: "",
      id: ""
    ) {
      id
      name
      description
      car_id {
        id
        name
      }
      color_id {
        id
        name
        color_picker
      }
      is_primary
      image
      price
      qty_available
      qty_forecasted
      virtual_available
      stock_status
      media_count
      has_exterior_images
      has_interior_images
      has_videos
      has_offer
      offer_price
      active
      create_date
      write_date
    }
  }
`

const GET_CARS_QUERY = `
  query GetCars {
    Car(
      translation_fallback: true,
      order: "name",
      offset: 0,
      multilingual: true,
      limit: 100,
      language: "",
      domain: "[('active', '=', True)]",
      id: ""
    ) {
      id
      name
    }
  }
`

const GET_COLORS_QUERY = `
  query GetCarColors {
    CarColor(
      translation_fallback: true,
      order: "name",
      offset: 0,
      multilingual: true,
      limit: 100,
      language: "",
      domain: "[('active', '=', True)]",
      id: ""
    ) {
      id
      name
      color_picker
    }
  }
`

const CREATE_VARIANT_MUTATION = `
  mutation CreateCarVariant($values: CarVariantValues!) {
    CarVariant(CarVariantValues: $values) {
      id
      name
      description
      car_id {
        id
        name
      }
      color_id {
        id
        name
      }
      price
      active
    }
  }
`

const UPDATE_VARIANT_MUTATION = `
  mutation UpdateCarVariant($id: String!, $values: CarVariantValues!) {
    CarVariant(id: $id, CarVariantValues: $values) {
      id
      name
      description
      car_id {
        id
        name
      }
      color_id {
        id
        name
      }
      price
      active
    }
  }
`

const DELETE_VARIANT_MUTATION = `
  mutation DeleteCarVariant($id: String!) {
    CarVariant(id: $id, CarVariantValues: { active: false }) {
      id
      active
    }
  }
`

const SET_PRIMARY_MUTATION = `
  mutation SetPrimaryVariant($id: String!) {
    CarVariant(id: $id, CarVariantValues: { is_primary: true }) {
      id
      is_primary
    }
  }
`

export default function VariantsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [variants, setVariants] = useState<CarVariant[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [colors, setColors] = useState<CarColor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCar, setSelectedCar] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<CarVariant | null>(null)
  const [formData, setFormData] = useState({
    descriptionEn: "",
    descriptionAr: "",
    carId: "",
    colorId: "",
    price: 0,
    active: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchVariants()
      fetchCars()
      fetchColors()
    }
  }, [mounted, showInactive])

  const fetchVariants = async () => {
    try {
      setLoading(true)
      const data = await gql(GET_VARIANTS_QUERY)

      if (data?.CarVariant) {
        setVariants(data.CarVariant.filter((variant: CarVariant) => 
          showInactive ? true : variant.active
        ))
      }
    } catch (error) {
      console.error("Error fetching variants:", error)
      toast({
        title: t('common.error'),
        description: "Failed to fetch car variants",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCars = async () => {
    try {
      const data = await gql(GET_CARS_QUERY)
      if (data?.Car) {
        setCars(data.Car)
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
    }
  }

  const fetchColors = async () => {
    try {
      const data = await gql(GET_COLORS_QUERY)
      if (data?.CarColor) {
        setColors(data.CarColor)
      }
    } catch (error) {
      console.error("Error fetching colors:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.carId || !formData.colorId) {
      toast({
        title: t('common.error'),
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      const values = {
        description: formData.descriptionEn,
        description_translations: [
          { code: 'en_US', value: formData.descriptionEn },
          { code: 'ar_001', value: formData.descriptionAr || formData.descriptionEn }
        ],
        car_id: parseInt(formData.carId),
        color_id: parseInt(formData.colorId),
        price: formData.price,
        active: formData.active
      }

      if (editingVariant) {
        await gqlMutate(UPDATE_VARIANT_MUTATION, {
          id: String(editingVariant.id),
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Variant updated successfully"
        })
      } else {
        await gqlMutate(CREATE_VARIANT_MUTATION, {
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Variant created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ 
        descriptionEn: "", 
        descriptionAr: "", 
        carId: "",
        colorId: "",
        price: 0,
        active: true 
      })
      setEditingVariant(null)
      setIsDialogOpen(false)
      await fetchVariants()
    } catch (error) {
      console.error('Error submitting variant:', error)
      toast({
        title: t('common.error'),
        description: editingVariant ? "Failed to update variant" : "Failed to create variant",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (variant: CarVariant) => {
    setEditingVariant(variant)
    setFormData({
      descriptionEn: variant.description?.en_US || "",
      descriptionAr: variant.description?.ar_001 || "",
      carId: String(variant.car_id.id),
      colorId: String(variant.color_id.id),
      price: variant.price || 0,
      active: variant.active
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (variant: CarVariant) => {
    if (!confirm("Are you sure you want to delete this variant?")) {
      return
    }

    try {
      await gqlMutate(DELETE_VARIANT_MUTATION, {
        id: String(variant.id)
      })
      
      toast({
        title: t('common.success'),
        description: "Variant deleted successfully"
      })
      
      await fetchVariants()
    } catch (error) {
      console.error('Error deleting variant:', error)
      toast({
        title: t('common.error'),
        description: "Failed to delete variant",
        variant: "destructive"
      })
    }
  }

  const handleSetPrimary = async (variant: CarVariant) => {
    try {
      await gqlMutate(SET_PRIMARY_MUTATION, {
        id: String(variant.id)
      })
      
      toast({
        title: t('common.success'),
        description: "Primary variant updated successfully"
      })
      
      await fetchVariants()
    } catch (error) {
      console.error('Error setting primary variant:', error)
      toast({
        title: t('common.error'),
        description: "Failed to set primary variant",
        variant: "destructive"
      })
    }
  }

  const handleNewVariant = () => {
    setEditingVariant(null)
    setFormData({ 
      descriptionEn: "", 
      descriptionAr: "", 
      carId: "",
      colorId: "",
      price: 0,
      active: true 
    })
    setIsDialogOpen(true)
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock'
      case 'low_stock': return 'Low Stock'
      case 'out_of_stock': return 'Out of Stock'
      case 'no_product': return 'No Product'
      default: return status
    }
  }

  const filteredVariants = variants.filter(variant => {
    const matchesSearch = variant.name.en_US?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.name.ar_001?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variant.car_id.name.en_US?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCar = selectedCar === "all" || String(variant.car_id.id) === selectedCar
    
    const matchesStock = stockFilter === "all" || variant.stock_status === stockFilter
    
    return matchesSearch && matchesCar && matchesStock
  })

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Car Variants</h1>
          <p className="text-muted-foreground">
            Manage car color variants and inventory
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Variant" : "Add New Variant"}
              </DialogTitle>
              <DialogDescription>
                {editingVariant 
                  ? "Update the variant information below." 
                  : "Enter the details for the new car variant."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carId">Car *</Label>
                  <Select 
                    value={formData.carId} 
                    onValueChange={(value) => setFormData({ ...formData, carId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a car" />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={String(car.id)}>
                          {car.name.en_US || car.name.ar_001}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colorId">Color *</Label>
                  <Select 
                    value={formData.colorId} 
                    onValueChange={(value) => setFormData({ ...formData, colorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={String(color.id)}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.color_picker || '#000000' }}
                            />
                            <span>{color.name.en_US || color.name.ar_001}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (SAR)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter variant price"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Enter variant description in English"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder="Enter variant description in Arabic"
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVariant ? "Update Variant" : "Create Variant"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Car Variants</CardTitle>
              <CardDescription>
                {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search variants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={selectedCar} onValueChange={setSelectedCar}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by car" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cars</SelectItem>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={String(car.id)}>
                      {car.name.en_US || car.name.ar_001}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label className="text-sm">Show Inactive</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading variants...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVariants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={variant.image || undefined} alt={variant.name.en_US} />
                          <AvatarFallback>
                            <Car className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span>{variant.name.en_US}</span>
                            {variant.is_primary && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          {variant.name.ar_001 && (
                            <div className="text-sm text-muted-foreground" dir="rtl">
                              {variant.name.ar_001}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{variant.car_id.name.en_US}</div>
                        {variant.car_id.name.ar_001 && (
                          <div className="text-sm text-muted-foreground" dir="rtl">
                            {variant.car_id.name.ar_001}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: variant.color_id.color_picker || '#000000' }}
                        />
                        <div>
                          <div>{variant.color_id.name.en_US}</div>
                          {variant.color_id.name.ar_001 && (
                            <div className="text-sm text-muted-foreground" dir="rtl">
                              {variant.color_id.name.ar_001}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {variant.price > 0 && (
                          <div className="font-semibold">
                            SAR {variant.price.toLocaleString()}
                          </div>
                        )}
                        {variant.has_offer && variant.offer_price > 0 && (
                          <div className="text-sm text-green-600">
                            Offer: SAR {variant.offer_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getStockStatusColor(variant.stock_status)}>
                          {getStockStatusText(variant.stock_status)}
                        </Badge>
                        {variant.qty_available > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Qty: {variant.qty_available}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {variant.media_count} files
                        </Badge>
                        <div className="flex space-x-1">
                          {variant.has_exterior_images && (
                            <Image className="h-3 w-3 text-blue-500" />
                          )}
                          {variant.has_interior_images && (
                            <Camera className="h-3 w-3 text-green-500" />
                          )}
                          {variant.has_videos && (
                            <Package className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.active ? "default" : "secondary"}>
                        {variant.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!variant.is_primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(variant)}
                            title="Set as primary variant"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(variant)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredVariants.length === 0 && (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No variants found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCar !== "all" || stockFilter !== "all"
                  ? "Try adjusting your search criteria" 
                  : "Get started by adding your first car variant"
                }
              </p>
              {!searchTerm && selectedCar === "all" && stockFilter === "all" && (
                <Button onClick={handleNewVariant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Variant
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 