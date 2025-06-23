'use client'

import { useState, useEffect } from 'react'
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
import { Plus, ListChecks, Palette, DollarSign, Ruler, Edit, MoreHorizontal, Trash2, Search, Star, Eye, Image as ImageIcon } from 'lucide-react'

// Import GraphQL queries and types
import {
  GET_PRODUCT_ATTRIBUTE_VALUES,
  CREATE_PRODUCT_ATTRIBUTE_VALUE,
  UPDATE_PRODUCT_ATTRIBUTE_VALUE,
  DELETE_PRODUCT_ATTRIBUTE_VALUE,
  type ProductAttributeValue,
  type ProductAttributeValueInput,
  fetchGraphQL
} from '@/lib/api/queries/specification-attribute-values'

interface Translation {
  en_US: string
  ar_001: string
}

export default function SpecificationAttributeValuesPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [attributeValues, setAttributeValues] = useState<ProductAttributeValue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingValue, setEditingValue] = useState<ProductAttributeValue | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    display_type: 'text',
    active: true,
    sequence: 10,
    color: "",
    html_color: "",
    is_custom: false,
    unit: "",
    image: ""
  })

  // Helper function to get localized text (same pattern as other pages)
  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    if (typeof field === "object") {
      return field.en_US || field.ar_001 || Object.values(field)[0] || ""
    }
    return String(field)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadAttributeValues()
    }
  }, [mounted, showInactive])

  const loadAttributeValues = async () => {
    setIsLoading(true)
    try {
      const data = await fetchGraphQL(GET_PRODUCT_ATTRIBUTE_VALUES)
      const values = data?.ProductAttributeValue || []
      
      const filteredData = showInactive ? values : values.filter((v: ProductAttributeValue) => v.active)
      setAttributeValues(filteredData)
    } catch (error) {
      console.error('Error loading attribute values:', error)
      toast({
        title: "Error",
        description: "Failed to load attribute values",
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
      const submitData = {
        name: getLocalizedText(formData.name),
        display_type: formData.display_type,
        active: formData.active,
        sequence: formData.sequence,
        color: formData.color,
        html_color: formData.html_color,
        is_custom: formData.is_custom,
        unit: formData.unit,
        image: formData.image
      }

      if (editingValue) {
        await fetchGraphQL(UPDATE_PRODUCT_ATTRIBUTE_VALUE, {
          id: editingValue.id,
          values: submitData
        })
        toast({
          title: "Success",
          description: "Value updated successfully"
        })
      } else {
        await fetchGraphQL(CREATE_PRODUCT_ATTRIBUTE_VALUE, {
          values: submitData
        })
        toast({
          title: "Success",
          description: "Value created successfully"
        })
      }
      
      await loadAttributeValues()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving value:', error)
      toast({
        title: "Error",
        description: editingValue ? "Failed to update value" : "Failed to create value",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (value: ProductAttributeValue) => {
    setEditingValue(value)
    
    // Convert the value data to form format
    let nameData = { en_US: '', ar_001: '' }
    
    if (typeof value.name === 'object' && value.name !== null) {
      nameData = {
        en_US: (value.name as any).en_US || (value.name as any)['en_US'] || '',
        ar_001: (value.name as any).ar_001 || (value.name as any).ar || (value.name as any).ar_SA || (value.name as any).arabic || ''
      }
    } else if (typeof value.name === 'string') {
      nameData = {
        en_US: value.name,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      display_type: value.display_type || 'text',
      active: value.active,
      sequence: value.sequence || 10,
      color: value.color || "",
      html_color: value.html_color || "",
      is_custom: value.is_custom,
      unit: value.unit || "",
      image: value.image || ""
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (value: ProductAttributeValue) => {
    if (!confirm('Are you sure you want to delete this value?')) return
    
    try {
      await fetchGraphQL(DELETE_PRODUCT_ATTRIBUTE_VALUE, { id: value.id })
      
      toast({
        title: "Success",
        description: "Value deleted successfully"
      })
      
      await loadAttributeValues()
    } catch (error) {
      console.error('Error deleting value:', error)
      toast({
        title: "Error",
        description: "Failed to delete value",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingValue(null)
    setFormData({
      name: { en_US: "", ar_001: "" },
      display_type: 'text',
      active: true,
      sequence: 10,
      color: "",
      html_color: "",
      is_custom: false,
      unit: "",
      image: ""
    })
  }

  // Filter values based on search term
  const filteredValues = attributeValues.filter(value => {
    const searchLower = searchTerm.toLowerCase()
    const name = getLocalizedText(value.name)
    
    const matchesSearch = searchTerm ? (
      name.toLowerCase().includes(searchLower) ||
      (value.display_type || '').toLowerCase().includes(searchLower) ||
      (value.color || '').toLowerCase().includes(searchLower) ||
      (value.unit || '').toLowerCase().includes(searchLower)
    ) : true
    
    const matchesStatus = showInactive ? true : value.active !== false
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: attributeValues.length,
    withColors: attributeValues.filter(v => v.color || v.html_color).length,
    withImages: attributeValues.filter(v => v.image).length,
    withUnits: attributeValues.filter(v => v.unit).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attribute Values</h1>
          <p className="text-muted-foreground">
            Manage predefined values for specification attributes (e.g., V6, V8, Automatic, Manual)
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Value
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingValue ? 'Edit Attribute Value' : 'Create New Attribute Value'}
              </DialogTitle>
              <DialogDescription>
                {editingValue 
                  ? 'Update the attribute value details'
                  : 'Create a new predefined value for specification attributes'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <MultilingualInput
                  label="Name"
                  value={formData.name}
                  onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  placeholder="Enter value name"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_type">Display Type</Label>
                    <Input
                      id="display_type"
                      value={formData.display_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_type: e.target.value }))}
                      placeholder="e.g., text, color, select"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sequence">Sequence</Label>
                    <Input
                      id="sequence"
                      type="number"
                      value={formData.sequence}
                      onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 10 }))}
                      min="1"
                      max="999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color Name</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., Red, Blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="html_color">HTML Color</Label>
                    <Input
                      id="html_color"
                      type="color"
                      value={formData.html_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, html_color: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., kg, liter, piece"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Image URL or upload path"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_custom"
                        checked={formData.is_custom}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_custom: checked }))}
                      />
                      <Label htmlFor="is_custom">Custom Value</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingValue ? 'Update' : 'Create'}
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
            <CardTitle className="text-sm font-medium">Total Values</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">attribute values</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Colors</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withColors}</div>
            <p className="text-xs text-muted-foreground">colored values</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withImages}</div>
            <p className="text-xs text-muted-foreground">image attachments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Units</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withUnits}</div>
            <p className="text-xs text-muted-foreground">with units</p>
          </CardContent>
        </Card>
      </div>

      {/* Attribute Values List */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Values</CardTitle>
          <CardDescription>
            Define predefined values that can be selected for specification attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search attribute values..."
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading attribute values...</div>
              </div>
            ) : filteredValues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ListChecks className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No attribute values found</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Create predefined values for attributes to make data entry easier and more consistent
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Value
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Sequence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredValues.map((value) => (
                      <TableRow key={value.id}>
                        <TableCell>
                          <ValuePreview value={value} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getLocalizedText(value.name)}</div>
                          {value.is_custom && <Badge variant="secondary" className="text-xs mt-1">Custom</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{value.display_type || 'text'}</Badge>
                        </TableCell>
                        <TableCell>
                          {value.unit && <Badge variant="secondary">{value.unit}</Badge>}
                        </TableCell>
                        <TableCell>{value.sequence}</TableCell>
                        <TableCell>
                          <Badge variant={value.active ? "default" : "secondary"}>
                            {value.active ? "Active" : "Inactive"}
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
                              <DropdownMenuItem onClick={() => handleEdit(value)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(value)}
                                className="text-red-600"
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    <NotificationContainer />
    </div>
  )
}

// Value Preview Component based on display type
function ValuePreview({ value }: { value: ProductAttributeValue }) {
  const name = typeof value.name === 'string' ? value.name : value.name?.en_US || value.name?.ar_001 || 'Unnamed'
  
  if (value.display_type === 'color' && value.html_color) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border" 
          style={{ backgroundColor: value.html_color }}
        />
        <span className="text-sm">{value.color || name}</span>
      </div>
    )
  }
  
  if (value.display_type === 'image' && value.image) {
    return (
      <div className="flex items-center gap-2">
        <img src={value.image} alt={name} className="w-6 h-6 rounded object-cover" />
        <span className="text-sm">{name}</span>
      </div>
    )
  }
  
  if (value.display_type === 'select' || value.display_type === 'radio') {
    return (
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-sm">{name}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center">
        <span className="text-xs">T</span>
      </div>
      <span className="text-sm">{name}</span>
    </div>
  )
} 