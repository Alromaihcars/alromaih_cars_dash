"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotifications } from "@/components/ui/notification"
import { useCarForm } from "@/hooks/use-car-form"
import { useCarMasterData, useCarModels, useCarTrims } from "@/hooks/use-car-data"

import {
  Save,
  Eye,
  Download,
  Trash2,
  Car,
  BarChart3,
  Tag,
  ImageIcon,
  Package,
  Upload,
  Check,
  Loader2,
  ArrowLeft,
  Crown,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gql } from "@/lib/api"
import { GET_CAR_BY_ID } from "@/lib/api/queries/cars"

export default function CarFormPage() {
  const params = useParams()
  const carId = params.id as string
  const isNewCar = carId === "new"
  
  const { addNotification, NotificationContainer } = useNotifications()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("car-info")
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown')
  const [loadingExistingCar, setLoadingExistingCar] = useState(!isNewCar)

  // Initialize car form with success/error handlers
  const carForm = useCarForm({
    onSuccess: (car) => {
      addNotification({
        type: "success",
        title: "Success",
        message: `Car "${car.name}" ${isNewCar ? 'created' : 'updated'} successfully!`,
        duration: 5000,
        action: {
          label: "View Car",
          onClick: () => router.push(`/dashboard/cars/${car.id}`),
        },
      })
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Error",
        message: error,
        duration: 5000,
      })
    }
  })

  // Load master data
  const { brands, colors, years, isLoading: masterDataLoading, error: masterDataError } = useCarMasterData()
  const { models, isLoading: modelsLoading } = useCarModels(carForm.data.brand_id)
  const { trims, isLoading: trimsLoading } = useCarTrims(carForm.data.model_id)

  // Load existing car data if editing
  useEffect(() => {
    if (!isNewCar && !loadingExistingCar) {
      loadExistingCar()
    }
  }, [carId, isNewCar])

  const loadExistingCar = async () => {
    try {
      setLoadingExistingCar(true)
      const data = await gql(GET_CAR_BY_ID, { id: parseInt(carId) })
      
      if (data?.AlromaihCar?.[0]) {
        const car = data.AlromaihCar[0]
        carForm.updateData({
          name: car.name || '',
          brand_id: car.brand_id?.toString() || '',
          model_id: car.model_id?.toString() || '',
          trim_id: car.trim_id?.toString() || '',
          year_id: car.year_id?.toString() || '',
          color_ids: car.color_ids || [],
          primary_color_id: car.primary_color_id?.toString() || '',
          cash_price: car.cash_price || 0,
          finance_price: car.finance_price || 0,
          vat_percentage: car.vat_percentage || 15,
          status: car.status || 'draft',
          active: car.active !== false,
          is_featured: car.is_featured || false,
        })
      }
    } catch (error) {
      console.error("Error loading car:", error)
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to load car data",
        duration: 5000,
      })
    } finally {
      setLoadingExistingCar(false)
    }
  }

  // Helper function to get localized text
  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    if (typeof field === "object" && field !== null) {
      const values = Object.values(field)
      return field.en_US || field.ar_001 || (values.length > 0 ? String(values[0]) : "") || ""
    }
    return String(field)
  }

  // Handle form changes
  const handleBrandChange = (brandId: string) => {
    console.log('🏷️ Brand selected:', brandId);
    carForm.updateData({
      brand_id: brandId,
      model_id: "",
      trim_id: "",
      year_id: "",
      color_ids: [],
      primary_color_id: "",
    })
  }

  const handleModelChange = (modelId: string) => {
    carForm.updateData({
      model_id: modelId,
      trim_id: "",
      year_id: "",
    })
  }

  const handleTrimChange = (trimId: string) => {
    carForm.updateData({
      trim_id: trimId,
      year_id: "",
    })
  }

  const handleColorToggle = (colorId: string) => {
    const currentColors = carForm.data.color_ids
    const newColors = currentColors.includes(colorId)
      ? currentColors.filter((id) => id !== colorId)
      : [...currentColors, colorId]

    carForm.updateData({ color_ids: newColors })
  }

  const handlePrimaryColorSelect = (colorId: string) => {
    const currentColors = carForm.data.color_ids
    
    if (!currentColors.includes(colorId)) {
      carForm.updateData({ 
        color_ids: [...currentColors, colorId],
        primary_color_id: colorId 
      })
    } else {
      carForm.updateData({ primary_color_id: colorId })
    }
  }

  const handleSave = async () => {
    console.log(`🚗 ${isNewCar ? 'Create' : 'Update'} button clicked - Starting car save process...`)
    
    if (!carForm.isValid) {
      const errors = Object.entries(carForm.errors).map(([field, error]) => `${field}: ${error}`).join(', ')
      console.error('❌ Form validation failed:', errors)
      
      addNotification({
        type: "error",
        title: "Validation Error",
        message: `Please complete all required fields: ${errors}`,
        duration: 8000,
      })
      return
    }

    const requiredFields = ['brand_id', 'model_id', 'trim_id', 'year_id']
    const missingFields = requiredFields.filter(field => !carForm.data[field as keyof typeof carForm.data])
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields)
      addNotification({
        type: "error",
        title: "Missing Required Fields",
        message: `Please select: ${missingFields.map(field => field.replace('_id', '')).join(', ')}`,
        duration: 5000,
      })
      return
    }

    try {
      const result = await carForm.saveForm()

      if (result.success) {
        addNotification({
          type: "success",
          title: `Car ${isNewCar ? 'Created' : 'Updated'} Successfully!`,
          message: `"${result.data?.name || carForm.data.name}" has been ${isNewCar ? 'created' : 'updated'} in Odoo`,
          duration: 5000,
          action: {
            label: "View Car",
            onClick: () => router.push(`/dashboard/cars/${result.data?.id}`),
          },
        })
        
        // If creating new car, redirect to edit mode
        if (isNewCar && result.data?.id) {
          router.push(`/dashboard/cars/${result.data.id}`)
        }
      } else {
        throw new Error(result.message || 'Unknown save error')
      }
    } catch (error) {
      console.error(`❌ ${isNewCar ? 'Create' : 'Update'} failed:`, error)
      
      let errorMessage = `Failed to ${isNewCar ? 'create' : 'update'} car in Odoo`
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      addNotification({
        type: "error",
        title: `${isNewCar ? 'Create' : 'Update'} Failed`,
        message: errorMessage,
        duration: 8000,
      })
    }
  }

  // Show loading state
  if (masterDataLoading || loadingExistingCar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-900 mb-2">
            {loadingExistingCar ? "Loading Car Data" : "Loading Configuration"}
          </h2>
          <p className="text-gray-500">
            {loadingExistingCar 
              ? "Please wait while we load the car details..." 
              : "Please wait while we load the car configuration options..."
            }
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (masterDataError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-red-900 mb-4">Connection Failed</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
            <p className="text-sm text-red-700 font-mono">{masterDataError}</p>
          </div>
          
          <div className="space-y-3">
                         <Button
               onClick={() => window.location.reload()}
               className="w-full"
             >
               <Wifi className="h-4 w-4 mr-2" />
               Retry Connection
             </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NotificationContainer />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/cars">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Cars
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {carForm.data.status === 'draft' && (
                <Button
                  onClick={() => carForm.updateData({ status: 'published' })}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Publish
                </Button>
              )}
              
              {carForm.data.status === 'published' && (
                <Button
                  onClick={() => carForm.updateData({ status: 'draft' })}
                  variant="outline"
                  size="sm"
                >
                  Unpublish
                </Button>
              )}
              
              <Button
                onClick={handleSave}
                disabled={carForm.isSaving || !carForm.isValid}
                className={`${
                  carForm.isSaving 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
                size="sm"
              >
                {carForm.isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    {isNewCar ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    {isNewCar ? 'Create Car' : 'Update Car'}
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Status:</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={carForm.data.status === 'published' ? 'default' : 'secondary'}
                  className={`${
                    carForm.data.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    carForm.data.status === 'published' ? 'bg-green-100 text-green-800' :
                    carForm.data.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {carForm.data.status === 'draft' && 'Draft'}
                  {carForm.data.status === 'published' && 'Published'}
                  {carForm.data.status === 'out_of_stock' && 'Out of Stock'}
                  {carForm.data.status === 'discontinued' && 'Discontinued'}
                </Badge>
                
                <div className="h-4 border-l border-gray-300 mx-2" />
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Featured:</span>
                    <Switch
                      checked={carForm.data.is_featured}
                      onCheckedChange={(checked) => carForm.updateData({ is_featured: checked })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Active:</span>
                    <Switch
                      checked={carForm.data.active}
                      onCheckedChange={(checked) => carForm.updateData({ active: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isNewCar ? "New Car" : (carForm.data.name || "Edit Car")}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>Completion: {carForm.completionPercentage}%</span>
                {carForm.isDirty && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Unsaved changes
                  </Badge>
                )}
                {!isNewCar && (
                  <span>ID: {carId}</span>
                )}
              </div>
            </div>
            
            {carForm.data.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Crown className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Rest of the form content... */}
      <div className="p-4 lg:p-6">
        {/* Car Configuration Form */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
          <Card className="xl:col-span-3 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg lg:text-xl text-primary-900 flex items-center justify-between">
                Car Configuration
                <div className="flex gap-2">
                  {carForm.data.is_featured && (
                    <Badge className="bg-primary-100 text-primary-800 border-primary-200 text-xs">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-primary-700 border-primary-300 text-xs">
                    {carForm.completionPercentage}% Complete
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 lg:space-y-6">
              {/* Car Name */}
              <div>
                <Label className="text-sm font-medium text-primary-900 mb-2 block">
                  Car Name (Auto-generated) {carForm.hasFieldError('name') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  value={carForm.data.name}
                  readOnly
                  placeholder="Complete the form to see auto-generated name"
                  className={`border-primary-200 bg-gray-50 text-gray-700 ${
                    carForm.hasFieldError('name') ? "border-red-300" : ""
                  }`}
                />
                {carForm.getFieldError('name') && <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('name')}</p>}
              </div>

              {/* Brand Selector */}
              <div>
                <Label className="text-sm font-medium text-primary-900 mb-3 block">
                  Brand {carForm.hasFieldError('brand_id') && <span className="text-red-500">*</span>}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 lg:gap-3">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => handleBrandChange(brand.id)}
                      className={`flex flex-col items-center p-2 lg:p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        carForm.data.brand_id === brand.id
                          ? "border-primary-500 bg-primary-50 shadow-md"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <div className="w-8 h-8 lg:w-12 lg:h-12 relative mb-1 lg:mb-2">
                        {brand.logo ? (
                          <Image
                            src={`data:image/png;base64,${brand.logo}`}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center">{brand.name}</span>
                    </div>
                  ))}
                </div>
                {carForm.getFieldError('brand_id') && <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('brand_id')}</p>}
              </div>

              {/* Model Selector */}
              {carForm.data.brand_id && (
                <div className="alromaih-fade-in">
                  <Label className="text-sm font-medium text-primary-900 mb-2 block">
                    Model {carForm.hasFieldError('model_id') && <span className="text-red-500">*</span>}
                  </Label>
                  <Select 
                    value={carForm.data.model_id} 
                    onValueChange={handleModelChange}
                    disabled={modelsLoading}
                  >
                    <SelectTrigger
                      className={`border-primary-200 focus:border-primary-500 ${
                        carForm.hasFieldError('model_id') ? "border-red-300" : ""
                      }`}
                    >
                      <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select model"} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {carForm.getFieldError('model_id') && <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('model_id')}</p>}
                </div>
              )}

              {/* Trim and Year */}
              {carForm.data.model_id && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 alromaih-fade-in">
                  <div>
                    <Label className="text-sm font-medium text-primary-900 mb-2 block">
                      Trim {carForm.hasFieldError('trim_id') && <span className="text-red-500">*</span>}
                    </Label>
                    <Select 
                      value={carForm.data.trim_id} 
                      onValueChange={handleTrimChange}
                      disabled={trimsLoading}
                    >
                      <SelectTrigger
                        className={`border-primary-200 focus:border-primary-500 ${
                          carForm.hasFieldError('trim_id') ? "border-red-300" : ""
                        }`}
                      >
                        <SelectValue placeholder={trimsLoading ? "Loading trims..." : "Select trim"} />
                      </SelectTrigger>
                      <SelectContent>
                        {trims.map((trim) => (
                          <SelectItem key={trim.id} value={trim.id}>
                            {trim.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {carForm.getFieldError('trim_id') && <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('trim_id')}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-primary-900 mb-2 block">
                      Year {carForm.hasFieldError('year_id') && <span className="text-red-500">*</span>}
                    </Label>
                    <Select
                      value={carForm.data.year_id}
                      onValueChange={(value) => carForm.updateData({ year_id: value })}
                    >
                      <SelectTrigger
                        className={`border-primary-200 focus:border-primary-500 ${
                          carForm.hasFieldError('year_id') ? "border-red-300" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {carForm.getFieldError('year_id') && <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('year_id')}</p>}
                  </div>
                </div>
              )}

              {/* Colors */}
              {carForm.data.trim_id && carForm.data.year_id && (
                <div className="alromaih-fade-in">
                  <Label className="text-sm font-medium text-primary-900 mb-3 block">
                    Available Colors
                    {carForm.getFieldError('color_ids') && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 lg:gap-3">
                    {colors.map((color) => {
                      const isSelected = carForm.data.color_ids.includes(color.id)
                      const isPrimary = carForm.data.primary_color_id === color.id
                      
                      return (
                        <div
                          key={color.id}
                          className={`relative flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 shadow-md"
                              : "border-gray-200 hover:border-primary-300"
                          }`}
                        >
                          <div className="relative">
                            <div
                              onClick={() => handleColorToggle(color.id)}
                              className="w-6 h-6 lg:w-8 lg:h-8 rounded-full mb-1 border-2 border-white shadow-sm"
                              style={{ backgroundColor: color.color_picker || '#000000' }}
                            />
                            {isPrimary && (
                              <div title="Primary Color">
                                <Crown 
                                  className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500"
                                />
                              </div>
                            )}
                          </div>
                          
                          <span className="text-xs font-medium text-center leading-tight">{color.name}</span>
                          
                          <div className="flex gap-1 mt-1">
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-600" />
                            )}
                            {isSelected && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePrimaryColorSelect(color.id)
                                }}
                                className="text-xs text-primary-600 hover:text-primary-800"
                                title="Set as primary"
                              >
                                {!isPrimary && <Crown className="h-3 w-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {carForm.getFieldError('color_ids') && (
                    <p className="text-red-500 text-xs mt-1">{carForm.getFieldError('color_ids')}</p>
                  )}
                  {carForm.data.primary_color_id && (
                    <p className="text-sm text-primary-600 mt-2">
                      Primary color: <strong>{colors.find(c => c.id === carForm.data.primary_color_id)?.name}</strong>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <Card className="xl:sticky xl:top-6 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-primary-900">Car Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Main Image", icon: Car },
                  { label: "Side View", icon: Car },
                  { label: "Interior", icon: Car },
                  { label: "Back View", icon: Car },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-primary-50 rounded-lg flex items-center justify-center border-2 border-dashed border-primary-200 hover:border-primary-400 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <item.icon className="h-5 w-5 lg:h-6 lg:w-6 mx-auto text-primary-400 mb-1" />
                      <p className="text-xs text-primary-600">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </Button>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium text-primary-700">{isNewCar ? "Create" : "Edit"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion:</span>
                    <span className="font-medium text-primary-700">{carForm.completionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{carForm.data.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Colors:</span>
                    <span className="font-medium">{carForm.data.color_ids.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid:</span>
                    <span className={`font-medium ${carForm.isValid ? "text-green-600" : "text-red-600"}`}>
                      {carForm.isValid ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs remain the same but could be enhanced for editing mode */}
        <p className="text-center text-gray-500 py-8">
          Additional tabs (Pricing, Specifications, etc.) can be added here...
        </p>
      </div>
    </div>
  )
}
