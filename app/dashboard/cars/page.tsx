"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Car, Star, Eye, EyeOff, Image, Palette, Settings, BarChart3, Activity, MessageSquare, AlertCircle, CheckCircle, Clock, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { gql, gqlMutate } from "@/lib/api"
import { 
  GET_CARS,
  UPDATE_CAR,
  CREATE_CAR,
  DELETE_CAR,
  getLocalizedText,
  type AlromaihCar,
  type CarFilters,
  type CarSortOptions
} from "@/lib/api/queries/cars"

export default function CarsPage() {
  const [cars, setCars] = useState<AlromaihCar[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOptions, setSortOptions] = useState<CarSortOptions>({
    field: "write_date",
    direction: "desc"
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchCars()
  }, [showInactive, statusFilter, sortOptions])

  const fetchCars = async () => {
    try {
      setLoading(true)
      
      // Build domain filter based on current filters
      const domain = []
      
      if (!showInactive) {
        domain.push(["active", "=", true])
      }
      
      if (statusFilter !== "all") {
        domain.push(["status", "=", statusFilter])
      }
      
      if (searchTerm) {
        domain.push([
          "|", "|", "|", "|",
          ["name", "ilike", searchTerm],
          ["description", "ilike", searchTerm],
          ["brand_id.name", "ilike", searchTerm],
          ["model_id.name", "ilike", searchTerm],
          ["trim_id.name", "ilike", searchTerm]
        ])
      }

      const order = `${sortOptions.field} ${sortOptions.direction}`
      
      const data = await gql(GET_CARS, {
        domain: domain.length > 0 ? domain : null,
        limit: 50,
        offset: 0,
        order
      })

      console.log("Enhanced cars data received:", data)
      
      if (data?.AlromaihCar) {
        setCars(data.AlromaihCar)
        console.log(`Loaded ${data.AlromaihCar.length} cars with enhanced data`)
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
      toast({
        title: "Error",
        description: "Failed to fetch cars",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (car: AlromaihCar) => {
    window.location.href = `/dashboard/cars/${car.id}`
  }

  const handleDelete = async (car: AlromaihCar) => {
    if (!confirm(`Are you sure you want to delete "${getLocalizedText(car.name)}"?`)) return
    
    try {
      await gqlMutate(DELETE_CAR, {
        id: parseInt(car.id)
      })
      
      toast({
        title: "Success",
        description: "Car deleted successfully"
      })
      
      fetchCars()
    } catch (error) {
      console.error("Error deleting car:", error)
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft", icon: Clock },
      published: { variant: "default" as const, label: "Published", icon: CheckCircle },
      out_of_stock: { variant: "destructive" as const, label: "Out of Stock", icon: Package },
      discontinued: { variant: "outline" as const, label: "Discontinued", icon: AlertCircle },
      coming_soon: { variant: "outline" as const, label: "Coming Soon", icon: Clock }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getActivityBadge = (activityState: string | false | undefined) => {
    if (!activityState) return null
    
    const activityConfig = {
      overdue: { variant: "destructive" as const, label: "Overdue", icon: AlertCircle },
      today: { variant: "default" as const, label: "Due Today", icon: Clock },
      planned: { variant: "secondary" as const, label: "Planned", icon: Activity }
    }
    
    const config = activityConfig[activityState as keyof typeof activityConfig]
    if (!config) return null
    
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(price)
  }

  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return "text-green-600"
    if (completion >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredCars = cars.filter(car => {
    const carName = getLocalizedText(car.name)
    const matchesSearch = !searchTerm || carName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || car.status === statusFilter
    const matchesActive = showInactive || car.active
    return matchesSearch && matchesStatus && matchesActive
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cars Management</h1>
          <p className="text-muted-foreground">
            Comprehensive car inventory with specifications, media, and analytics
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cars/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Car
          </Link>
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <p className="text-2xl font-bold">{cars.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {cars.filter(car => car.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
                 <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Completed</p>
                 <p className="text-2xl font-bold">
                   {cars.filter(car => (car.specification_completion || 0) >= 100).length}
                 </p>
               </div>
               <CheckCircle className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
        
                 <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">With Offers</p>
                 <p className="text-2xl font-bold">
                   {cars.filter(car => car.has_active_offer).length}
                 </p>
               </div>
               <BarChart3 className="h-8 w-8 text-purple-500" />
             </div>
           </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Cars ({filteredCars.length})
          </CardTitle>
          <CardDescription>
            Complete car inventory with pricing, specifications, and media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cars, brands, models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={`${sortOptions.field}-${sortOptions.direction}`} 
              onValueChange={(value) => {
                const [field, direction] = value.split('-')
                setSortOptions({ 
                  field: field as CarSortOptions['field'], 
                  direction: direction as CarSortOptions['direction'] 
                })
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="write_date-desc">Recently Updated</SelectItem>
                <SelectItem value="create_date-desc">Recently Created</SelectItem>
                <SelectItem value="cash_price-asc">Price (Low-High)</SelectItem>
                <SelectItem value="cash_price-desc">Price (High-Low)</SelectItem>
                <SelectItem value="sequence-asc">Sequence</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Show Inactive</Label>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          {car.thumbnail ? (
                            <img 
                              src={car.thumbnail} 
                              alt={getLocalizedText(car.name)}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Car className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{getLocalizedText(car.name) || 'Unnamed Car'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {car.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getLocalizedText(car.brand_id?.name || '')} • {getLocalizedText(car.model_id?.name || '')}
                          </div>
                          {car.trim_id && (
                            <div className="text-xs text-muted-foreground">
                              {getLocalizedText(car.trim_id.name)} • {getLocalizedText(car.year_id?.name || '')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatPrice(car.cash_price || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          With VAT: {formatPrice(car.cash_price_with_vat || 0)}
                        </div>
                        {car.finance_price && (
                          <div className="text-sm text-muted-foreground">
                            Finance: {formatPrice(car.finance_price)}
                          </div>
                        )}
                        {car.has_active_offer && (
                          <Badge variant="outline" className="text-green-600 text-xs">
                            Active Offer
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(car.status || "draft")}
                        {car.is_featured && (
                          <Badge variant="outline" className="text-yellow-600 text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {car.active ? (
                          <Badge variant="outline" className="text-green-600 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={car.specification_completion || 0} 
                            className="w-16 h-2"
                          />
                          <span className={`text-xs font-medium ${getCompletionColor(car.specification_completion || 0)}`}>
                            {car.specification_completion || 0}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {car.filled_specifications || 0}/{car.total_specifications || 0} specs
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Colors: {car.color_ids?.length || 0}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {getActivityBadge(car.activity_state)}
                        {car.message_needaction_counter ? (
                          <Badge variant="outline" className="text-blue-600 text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {car.message_needaction_counter}
                          </Badge>
                        ) : null}
                        {car.message_has_error_counter ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {car.message_has_error_counter} errors
                          </Badge>
                        ) : null}
                        {!car.activity_state && !car.message_needaction_counter && !car.message_has_error_counter && (
                          <div className="text-xs text-muted-foreground">No activity</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {car.color_ids?.length || 0} colors
                        </span>
                        {car.primary_color_id && (
                          <div 
                            className="w-3 h-3 rounded-full border ml-2" 
                            style={{ backgroundColor: car.primary_color_id.color_picker }}
                          />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(car)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(car)}
                          className="text-red-600 hover:text-red-700"
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

          {!loading && filteredCars.length === 0 && (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cars found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter || !showInactive
                  ? "Try adjusting your filters"
                  : "Get started by adding your first car"}
              </p>
              <Button asChild>
                <Link href="/dashboard/cars/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Car
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 