'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { Plus, Ruler, Calculator, Scale, Zap, Gauge, Edit, MoreHorizontal, Trash2, Activity, Clock, Search } from 'lucide-react'
// Import GraphQL queries and client
import {
  GET_PRODUCT_ATTRIBUTE_UNITS,
  CREATE_PRODUCT_ATTRIBUTE_UNIT,
  UPDATE_PRODUCT_ATTRIBUTE_UNIT,
  DELETE_PRODUCT_ATTRIBUTE_UNIT,
  type ProductAttributeUnit as ProductAttributeUnitType,
  type ProductAttributeUnitInput as ProductAttributeUnitInputType
} from '@/lib/api/queries/specification-units'
import { gql, gqlMutate } from '@/lib/api'

// Use imported types
type ProductAttributeUnit = ProductAttributeUnitType;
type ProductAttributeUnitInput = ProductAttributeUnitInputType;

interface Translation {
  en_US: string
  ar_001: string
}

// Unit categories with their icons
const UNIT_CATEGORIES: Record<string, { label: string; icon: React.ComponentType<{className?: string}> }> = {
  length: { label: 'Length', icon: Ruler },
  weight: { label: 'Weight', icon: Scale },
  volume: { label: 'Volume', icon: Calculator },
  power: { label: 'Power', icon: Zap },
  speed: { label: 'Speed', icon: Gauge },
  pressure: { label: 'Pressure', icon: Gauge },
  temperature: { label: 'Temperature', icon: Gauge },
  other: { label: 'Other', icon: Calculator }
}

export default function SpecificationUnitsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [units, setUnits] = useState<ProductAttributeUnit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<ProductAttributeUnit | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    code: '',
    active: true,
    category: 'other',
    conversion_factor: 1.0,
    display_position: 0
  })

  // Helper function to get localized text (same pattern as cars and categories pages)
  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    if (typeof field === "object") {
      // Try to get English first, then Arabic, then any available value
      return field.en_US || field.ar_001 || Object.values(field)[0] || ""
    }
    return String(field)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadUnits()
    }
  }, [mounted, showInactive])

  const loadUnits = async () => {
    setIsLoading(true)
    try {
      const data = await gql(GET_PRODUCT_ATTRIBUTE_UNITS)
      setUnits(data?.ProductAttributeUnit || [])
    } catch (error) {
      console.error('Error loading units:', error)
      toast({
        title: "Error",
        description: "Failed to load units. Please check your GraphQL endpoint configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert multilingual data to GraphQL format
      const values = {
        name: getLocalizedText(formData.name),
        display_name: getLocalizedText(formData.name), // Use name as display_name
        description: getLocalizedText(formData.description),
        code: formData.code,
        active: formData.active,
        category: formData.category,
        conversion_factor: formData.conversion_factor,
        display_position: formData.display_position
      }

      if (editingUnit) {
        await gqlMutate(UPDATE_PRODUCT_ATTRIBUTE_UNIT, {
          id: editingUnit.id,
          values: values
        })
        toast({
          title: "Success",
          description: "Unit updated successfully"
        })
      } else {
        await gqlMutate(CREATE_PRODUCT_ATTRIBUTE_UNIT, {
          values: values
        })
        toast({
          title: "Success", 
          description: "Unit created successfully"
        })
      }
      
      await loadUnits()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving unit:', error)
      toast({
        title: "Error",
        description: editingUnit ? "Failed to update unit" : "Failed to create unit",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (unit: ProductAttributeUnit) => {
    setEditingUnit(unit)
    
    // Convert the unit data to form format
    let nameData = { en_US: '', ar_001: '' }
    let descData = { en_US: '', ar_001: '' }
    
    if (typeof unit.name === 'object' && unit.name !== null) {
      nameData = {
        en_US: (unit.name as any).en_US || (unit.name as any)['en_US'] || '',
        ar_001: (unit.name as any).ar_001 || (unit.name as any).ar || (unit.name as any).ar_SA || (unit.name as any).arabic || ''
      }
    } else if (typeof unit.name === 'string') {
      nameData = {
        en_US: unit.name,
        ar_001: ''
      }
    }

    if (typeof unit.description === 'object' && unit.description !== null) {
      descData = {
        en_US: (unit.description as any).en_US || (unit.description as any)['en_US'] || '',
        ar_001: (unit.description as any).ar_001 || (unit.description as any).ar || (unit.description as any).ar_SA || (unit.description as any).arabic || ''
      }
    } else if (typeof unit.description === 'string') {
      descData = {
        en_US: unit.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      description: descData,
      code: unit.code || '',
      active: unit.active,
      category: unit.category || 'other',
      conversion_factor: unit.conversion_factor || 1.0,
      display_position: unit.display_position || 0
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (unit: ProductAttributeUnit) => {
    if (!confirm('Are you sure you want to delete this unit?')) return
    
    try {
      await gqlMutate(DELETE_PRODUCT_ATTRIBUTE_UNIT, { id: unit.id })
      toast({
        title: "Success",
        description: "Unit deleted successfully"
      })
      await loadUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
      toast({
        title: "Error",
        description: "Failed to delete unit",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingUnit(null)
    setFormData({
      name: { en_US: "", ar_001: "" },
      description: { en_US: "", ar_001: "" },
      code: '',
      active: true,
      category: 'other',
      conversion_factor: 1.0,
      display_position: 0
    })
  }

  const getStats = () => {
    const totalUnits = units.length
    const activeUnits = units.filter(unit => unit.active).length
    const inactiveUnits = totalUnits - activeUnits
    const categories = [...new Set(units.map(unit => unit.category))].length

    return {
      totalUnits,
      activeUnits,
      inactiveUnits,
      categories
    }
  }

  const stats = getStats()

  if (isLoading && units.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Units</h1>
            <p className="text-muted-foreground">
              Manage measurement units for product attributes
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </CardTitle>
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-1" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units</h1>
          <p className="text-muted-foreground">
            Manage measurement units for product attributes
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                </DialogTitle>
                <DialogDescription>
                  {editingUnit 
                    ? 'Update the unit details below.' 
                    : 'Create a new measurement unit for product attributes.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Basic Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          name: e.target.value,
                          display_name: prev.display_name || e.target.value // Auto-fill display_name
                        }))}
                        placeholder="Enter unit name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Enter display name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Enter unit code"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter unit description"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Enter category"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="conversion_factor">Conversion Factor</Label>
                      <Input
                        id="conversion_factor"
                        type="number"
                        step="0.01"
                        value={formData.conversion_factor || 1.0}
                        onChange={(e) => setFormData(prev => ({ ...prev, conversion_factor: parseFloat(e.target.value) || 1.0 }))}
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="display_position">Display Position</Label>
                    <Input
                      id="display_position"
                      type="number"
                      value={formData.display_position || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_position: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingUnit ? 'Update' : 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              All measurement units
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUnits}</div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Units</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactiveUnits}</div>
            <p className="text-xs text-muted-foreground">
              Disabled units
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
          <CardDescription>
            A list of all measurement units in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {units.length === 0 ? (
            <div className="text-center py-12">
              <Ruler className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No units found</h3>
              <p className="text-muted-foreground">
                Get started by creating your first measurement unit.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Conversion Factor</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getLocalizedText(unit.display_name) || getLocalizedText(unit.name)}</div>
                        {unit.description && (
                          <div className="text-sm text-muted-foreground">{getLocalizedText(unit.description)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {unit.category && UNIT_CATEGORIES[unit.category]?.icon && 
                          React.createElement(UNIT_CATEGORIES[unit.category].icon, { className: "h-4 w-4" })
                        }
                        {unit.category ? UNIT_CATEGORIES[unit.category]?.label || unit.category : 'Other'}
                      </div>
                    </TableCell>
                    <TableCell>{unit.conversion_factor}</TableCell>
                    <TableCell>{unit.display_position}</TableCell>
                    <TableCell>
                      <Badge variant={unit.active ? "default" : "secondary"}>
                        {unit.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(unit)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(unit)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 