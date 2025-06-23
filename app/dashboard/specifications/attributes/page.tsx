'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { Plus, Tag, Star, Filter, Globe, Edit, MoreHorizontal, Trash2, Eye, Image, Settings, Palette, FileText, Search, X, Upload, Link, Hash, Type, Square } from 'lucide-react'
import { DisplayTypeSelector, DEFAULT_DISPLAY_TYPE_OPTIONS, type DisplayTypeOption } from '@/components/ui/display-type-selector'

// Import GraphQL queries and types
import {
  GET_PRODUCT_ATTRIBUTES,
  CREATE_PRODUCT_ATTRIBUTE,
  UPDATE_PRODUCT_ATTRIBUTE,
  DELETE_PRODUCT_ATTRIBUTE,
  getAttributeOptions,
  type ProductAttribute,
  type ProductAttributeInput,
  type AttributeOptionsResponse,
  type AttributeOption,
  fetchGraphQL
} from '@/lib/api/queries/specification-attributes'

import {
  GET_VALUES_BY_ATTRIBUTE_ID,
  GET_ATTRIBUTE_VALUES_BY_ATTRIBUTE,
  CREATE_VALUE_FOR_ATTRIBUTE,
  UPDATE_PRODUCT_ATTRIBUTE_VALUE,
  DELETE_PRODUCT_ATTRIBUTE_VALUE,
  type ProductAttributeValue,
  type ProductAttributeValueInput,
  getValueDisplayText,
  getValueColor,
  PREDEFINED_COLORS
} from '@/lib/api/queries/specification-attribute-values'

interface Translation {
  en_US: string
  ar_001: string
}

export default function SpecificationAttributesPage() {
  const { t } = useI18n()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null)
  const [options, setOptions] = useState<AttributeOptionsResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  
  // Value management state
  const [attributeValues, setAttributeValues] = useState<ProductAttributeValue[]>([])
  const [isValueFormOpen, setIsValueFormOpen] = useState(false)
  const [editingValue, setEditingValue] = useState<ProductAttributeValue | null>(null)
  const [isValuesLoading, setIsValuesLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    display_name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    active: true,
    is_key_attribute: false,
    is_filterable: false,
    is_website_spec: false,
    display_type: 'radio',
    display_in_car_info: false,
    create_variant: false,
    allow_multi_select: false,
    filter_priority: 10,
    edit_widget: 'default',
    icon: '',
    car_info_icon: '',
    category_type: 'basic'
  })
  
  // Value form data - using string for GraphQL compatibility
  const [valueFormData, setValueFormData] = useState({
    name: '',
    display_name: '',
    sequence: 10,
    active: true,
    color: '',
    html_color: '',
    image: '',
    is_custom: false,
    default_extra_price: 0
  })
  
  const { toast } = useToast()

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
      loadAttributes()
      loadOptions()
    }
  }, [mounted, showInactive])

  const loadAttributes = async () => {
    setIsLoading(true)
    try {
      const data = await fetchGraphQL(GET_PRODUCT_ATTRIBUTES)
      setAttributes(data?.ProductAttribute || [])
    } catch (error) {
      console.error('Error loading attributes:', error)
      toast({
        title: "Error",
        description: "Failed to load attributes. Please check your GraphQL endpoint configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadOptions = async () => {
    try {
      const data = getAttributeOptions()
      setOptions(data)
    } catch (error) {
      console.error('Error loading options:', error)
      // Fallback to empty options
      setOptions({
        AttributeDisplayTypes: { enumValues: [] },
        AttributeCategories: { enumValues: [] },
        FilterDisplayTypes: { enumValues: [] },
        EditWidgetTypes: { enumValues: [] }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert multilingual data to GraphQL format
      const submitData = {
        name: getLocalizedText(formData.name),
        display_name: getLocalizedText(formData.display_name) || getLocalizedText(formData.name),
        description: getLocalizedText(formData.description),
        active: formData.active,
        is_key_attribute: formData.is_key_attribute,
        is_filterable: formData.is_filterable,
        is_website_spec: formData.is_website_spec,
        display_type: formData.display_type,
        display_in_car_info: formData.display_in_car_info,
        create_variant: formData.create_variant,
        allow_multi_select: formData.allow_multi_select,
        filter_priority: formData.filter_priority,
        edit_widget: formData.edit_widget,
        icon: formData.icon,
        car_info_icon: formData.car_info_icon,
        category_type: formData.category_type
      }

      if (editingAttribute) {
        await fetchGraphQL(UPDATE_PRODUCT_ATTRIBUTE, {
          id: parseInt(editingAttribute.id),
          values: submitData
        })
        toast({
          title: "Success",
          description: "Attribute updated successfully"
        })
      } else {
        await fetchGraphQL(CREATE_PRODUCT_ATTRIBUTE, {
          values: submitData
        })
        toast({
          title: "Success", 
          description: "Attribute created successfully"
        })
      }
      
      await loadAttributes()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving attribute:', error)
      toast({
        title: "Error",
        description: editingAttribute ? "Failed to update attribute" : "Failed to create attribute",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute)
    
    // Convert the attribute data to form format
    let nameData = { en_US: '', ar_001: '' }
    let displayNameData = { en_US: '', ar_001: '' }
    let descData = { en_US: '', ar_001: '' }
    
    // Handle name field
    if (typeof attribute.name === 'object' && attribute.name !== null) {
      nameData = {
        en_US: (attribute.name as any).en_US || (attribute.name as any)['en_US'] || '',
        ar_001: (attribute.name as any).ar_001 || (attribute.name as any).ar || (attribute.name as any).ar_SA || (attribute.name as any).arabic || ''
      }
    } else if (typeof attribute.name === 'string') {
      nameData = {
        en_US: attribute.name,
        ar_001: ''
      }
    }

    // Handle display_name field
    if (typeof attribute.display_name === 'object' && attribute.display_name !== null) {
      displayNameData = {
        en_US: (attribute.display_name as any).en_US || (attribute.display_name as any)['en_US'] || '',
        ar_001: (attribute.display_name as any).ar_001 || (attribute.display_name as any).ar || (attribute.display_name as any).ar_SA || (attribute.display_name as any).arabic || ''
      }
    } else if (typeof attribute.display_name === 'string') {
      displayNameData = {
        en_US: attribute.display_name,
        ar_001: ''
      }
    }

    // Handle description field
    if (typeof attribute.description === 'object' && attribute.description !== null) {
      descData = {
        en_US: (attribute.description as any).en_US || (attribute.description as any)['en_US'] || '',
        ar_001: (attribute.description as any).ar_001 || (attribute.description as any).ar || (attribute.description as any).ar_SA || (attribute.description as any).arabic || ''
      }
    } else if (typeof attribute.description === 'string') {
      descData = {
        en_US: attribute.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      display_name: displayNameData,
      description: descData,
      active: attribute.active,
      is_key_attribute: attribute.is_key_attribute || false,
      is_filterable: attribute.is_filterable || false,
      is_website_spec: attribute.is_website_spec || false,
      display_type: attribute.display_type || 'text',
      display_in_car_info: attribute.display_in_car_info || false,
      category_type: attribute.category_type || 'basic',
      create_variant: attribute.create_variant || false,
      allow_multi_select: attribute.allow_multi_select || false,
      filter_priority: attribute.filter_priority || 10,
      edit_widget: attribute.edit_widget || 'default',
      icon: attribute.icon || '',
      car_info_icon: attribute.car_info_icon || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (attribute: ProductAttribute) => {
    if (!confirm('Are you sure you want to delete this attribute?')) return
    
    try {
      await fetchGraphQL(DELETE_PRODUCT_ATTRIBUTE, { id: attribute.id })
      toast({
        title: "Success",
        description: "Attribute deleted successfully"
      })
      await loadAttributes()
    } catch (error) {
      console.error('Error deleting attribute:', error)
      toast({
        title: "Error",
        description: "Failed to delete attribute",
        variant: "destructive"
      })
    }
  }

  const handleToggleKey = async (attribute: ProductAttribute) => {
    try {
      await fetchGraphQL(UPDATE_PRODUCT_ATTRIBUTE, { 
        id: parseInt(attribute.id), 
        values: { is_key_attribute: !attribute.is_key_attribute }
      })
      toast({
        title: "Success",
        description: attribute.is_key_attribute ? "Removed key attribute status" : "Set as key attribute"
      })
      await loadAttributes()
    } catch (error) {
      console.error('Error toggling key attribute:', error)
      toast({
        title: "Error",
        description: "Failed to update key attribute status",
        variant: "destructive"
      })
    }
  }

  const handleToggleFilterable = async (attribute: ProductAttribute) => {
    try {
      await fetchGraphQL(UPDATE_PRODUCT_ATTRIBUTE, { 
        id: parseInt(attribute.id), 
        values: { is_filterable: !attribute.is_filterable }
      })
      toast({
        title: "Success",
        description: attribute.is_filterable ? "Removed filterable status" : "Set as filterable"
      })
      await loadAttributes()
    } catch (error) {
      console.error('Error toggling filterable:', error)
      toast({
        title: "Error",
        description: "Failed to update filterable status",
        variant: "destructive"
      })
    }
  }

  const handleDuplicate = async (attribute: ProductAttribute) => {
    try {
      const duplicateData = {
        name: `${getLocalizedText(attribute.name)} (Copy)`,
        display_name: `${getLocalizedText(attribute.display_name)} (Copy)`,
        description: getLocalizedText(attribute.description),
        display_type: attribute.display_type,
        is_key_attribute: false,
        is_filterable: false,
        is_website_spec: false,
        display_in_car_info: false,
        category_type: attribute.category_type,
        create_variant: false,
        allow_multi_select: attribute.allow_multi_select,
  
        filter_priority: attribute.filter_priority,
        edit_widget: attribute.edit_widget,
        icon: attribute.icon,
        car_info_icon: attribute.car_info_icon
      }
      await fetchGraphQL(CREATE_PRODUCT_ATTRIBUTE, { values: duplicateData })
      toast({
        title: "Success",
        description: "Attribute duplicated successfully"
      })
      await loadAttributes()
    } catch (error) {
      console.error('Error duplicating attribute:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate attribute",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingAttribute(null)
    setFormData({
      name: { en_US: "", ar_001: "" },
      display_name: { en_US: "", ar_001: "" },
      description: { en_US: "", ar_001: "" },
      active: true,
      is_key_attribute: false,
      is_filterable: false,
      is_website_spec: false,
      display_type: 'radio',
      display_in_car_info: false,
      create_variant: false,
      allow_multi_select: false,
      filter_priority: 10,
      edit_widget: 'default',
      icon: '',
      car_info_icon: '',
      category_type: 'basic'
    })
  }

  // === VALUE MANAGEMENT FUNCTIONS ===
  
  const loadAttributeValues = async (attributeId: string) => {
    setIsValuesLoading(true)
    try {
      console.log('🔍 Loading values for attribute ID:', attributeId)
      
      // Use the working attribute-based query instead of direct domain filter
      const data = await fetchGraphQL(GET_ATTRIBUTE_VALUES_BY_ATTRIBUTE, {
        attribute_id: attributeId
      })
      
      console.log('📊 Raw GraphQL response:', data)
      console.log('📊 ProductAttribute array:', data?.ProductAttribute)
      console.log('📊 First attribute:', data?.ProductAttribute?.[0])
      console.log('📊 Value IDs:', data?.ProductAttribute?.[0]?.value_ids)
      
      const values = data?.ProductAttribute?.[0]?.value_ids || []
      console.log('✅ Setting attribute values:', values)
      setAttributeValues(values)
    } catch (error) {
      console.error('❌ Error loading attribute values:', error)
      toast({
        title: "Error",
        description: "Failed to load attribute values",
        variant: "destructive"
      })
    } finally {
      setIsValuesLoading(false)
    }
  }

  const handleAddValue = () => {
    setEditingValue(null)
    setValueFormData({
      name: '',
      display_name: '',
      sequence: (attributeValues.length + 1) * 10,
      active: true,
      color: '',
      html_color: '',
      image: '',
      is_custom: false,
      default_extra_price: 0
    })
    setIsValueFormOpen(true)
  }

  const handleEditValue = (value: ProductAttributeValue) => {
    setEditingValue(value)
    setValueFormData({
      name: getValueDisplayText(value) || '',
      display_name: getValueDisplayText(value) || '',
      sequence: value.sequence || 10,
      active: value.active,
      color: value.color || '',
      html_color: value.html_color || '',
      image: value.image || '',
      is_custom: value.is_custom,
      default_extra_price: value.default_extra_price || 0
    })
    setIsValueFormOpen(true)
  }

  const handleSubmitValue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAttribute) return

    setIsValuesLoading(true)
    try {
      const submitData: ProductAttributeValueInput = {
        name: valueFormData.name,
        active: valueFormData.active,
        sequence: valueFormData.sequence,
        color: valueFormData.color,
        html_color: valueFormData.html_color,
        image: valueFormData.image,
        is_custom: valueFormData.is_custom
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
        // Use the GraphQL mutation with proper values object
        const submitData = {
          name: valueFormData.name,
          attribute_id: editingAttribute.id,
          sequence: valueFormData.sequence || 10,
          active: valueFormData.active,
          html_color: valueFormData.html_color || undefined,
          image: valueFormData.image || undefined,
          is_custom: valueFormData.is_custom || false
        }
        
        await fetchGraphQL(CREATE_VALUE_FOR_ATTRIBUTE, {
          values: submitData
        })
        toast({
          title: "Success",
          description: "Value created successfully"
        })
      }

      await loadAttributeValues(editingAttribute.id)
      await loadAttributes() // Refresh to update value counts
      handleCloseValueForm()
    } catch (error) {
      console.error('Error saving value:', error)
      toast({
        title: "Error",
        description: editingValue ? "Failed to update value" : "Failed to create value",
        variant: "destructive"
      })
    } finally {
      setIsValuesLoading(false)
    }
  }

  const handleDeleteValue = async (value: ProductAttributeValue) => {
    if (!confirm('Are you sure you want to delete this value?')) return

    try {
      await fetchGraphQL(DELETE_PRODUCT_ATTRIBUTE_VALUE, { id: value.id })
      toast({
        title: "Success",
        description: "Value deleted successfully"
      })
      
      if (editingAttribute) {
        await loadAttributeValues(editingAttribute.id)
        await loadAttributes() // Refresh to update value counts
      }
    } catch (error) {
      console.error('Error deleting value:', error)
      toast({
        title: "Error",
        description: "Failed to delete value",
        variant: "destructive"
      })
    }
  }

  const handleCloseValueForm = () => {
    setIsValueFormOpen(false)
    setEditingValue(null)
    setValueFormData({
      name: '',
      display_name: '',
      sequence: 10,
      active: true,
      color: '',
      html_color: '',
      image: '',
      is_custom: false,
      default_extra_price: 0
    })
  }

  // Load values when editing an attribute
  useEffect(() => {
    if (editingAttribute && isFormOpen) {
      loadAttributeValues(editingAttribute.id)
    }
  }, [editingAttribute, isFormOpen])

  // Filter attributes based on search term and status
  const filteredAttributes = attributes.filter(attribute => {
    const searchLower = searchTerm.toLowerCase()
    const name = getLocalizedText(attribute.name)
    const displayName = getLocalizedText(attribute.display_name)
    const description = getLocalizedText(attribute.description)
    
    const matchesSearch = searchTerm ? (
      name.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      (attribute.display_type || '').toLowerCase().includes(searchLower) ||
      (attribute.category_type || '').toLowerCase().includes(searchLower)
    ) : true
    
    const matchesStatus = showInactive ? true : attribute.active !== false
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: attributes.length,
    keyAttributes: attributes.filter(attr => attr.is_key_attribute).length,
    filterable: attributes.filter(attr => attr.is_filterable).length,
    websiteSpecs: attributes.filter(attr => attr.is_website_spec).length,
    carInfo: attributes.filter(attr => attr.display_in_car_info).length,
    withValues: attributes.filter(attr => attr.value_ids && attr.value_ids.length > 0).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Attributes</h1>
          <p className="text-muted-foreground">
            Manage product attributes for car specifications and filtering
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Attribute
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAttribute ? 'Edit Attribute' : 'Create New Attribute'}
              </DialogTitle>
              <DialogDescription>
                {editingAttribute 
                  ? 'Update the product attribute details'
                  : 'Create a new product attribute for car specifications'
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
                  onChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    name: value,
                    display_name: prev.display_name.en_US || prev.display_name.ar_001 ? prev.display_name : value
                  }))}
                  placeholder={{ en_US: "Enter attribute name", ar_001: "أدخل اسم الخاصية" }}
                  required
                />

                <MultilingualInput
                  label="Display Name"
                  value={formData.display_name}
                  onChange={(value) => setFormData(prev => ({ ...prev, display_name: value }))}
                  placeholder={{ en_US: "Enter display name", ar_001: "أدخل اسم العرض" }}
                />

                <DisplayTypeSelector
                  value={formData.display_type || 'radio'}
                  onChange={(value) => setFormData(prev => ({ ...prev, display_type: value }))}
                  options={DEFAULT_DISPLAY_TYPE_OPTIONS}
                  label="Display Type"
                  helpText="How this attribute should be displayed in forms and frontend"
                />

                <div className="space-y-2">
                  <Label htmlFor="category_type">Category</Label>
                  <Select 
                    value={formData.category_type || 'basic'} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, category_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.AttributeCategories?.enumValues?.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          <div className="flex items-center gap-2">
                            <span>📋</span>
                            <span className="text-sm">{option.name}</span>
                          </div>
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                </div>

                <MultilingualInput
                  label="Description"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder={{ en_US: "Enter attribute description", ar_001: "أدخل وصف الخاصية" }}
                  multiline
                  rows={3}
                />
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_key_attribute"
                        checked={formData.is_key_attribute || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_key_attribute: checked }))}
                      />
                      <Label htmlFor="is_key_attribute">Key Attribute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_filterable"
                        checked={formData.is_filterable || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_filterable: checked }))}
                      />
                      <Label htmlFor="is_filterable">Filterable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_website_spec"
                        checked={formData.is_website_spec || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_website_spec: checked }))}
                      />
                      <Label htmlFor="is_website_spec">Website Spec</Label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="display_in_car_info"
                        checked={formData.display_in_car_info || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, display_in_car_info: checked }))}
                      />
                      <Label htmlFor="display_in_car_info">Display in Car Info</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="create_variant"
                        checked={formData.create_variant || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, create_variant: checked }))}
                      />
                      <Label htmlFor="create_variant">Create Variant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow_multi_select"
                        checked={formData.allow_multi_select || false}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_multi_select: checked }))}
                      />
                      <Label htmlFor="allow_multi_select">Allow Multi Select</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter_priority">Filter Priority</Label>
                  <Input
                    id="filter_priority"
                    type="number"
                    value={formData.filter_priority || 10}
                    onChange={(e) => setFormData(prev => ({ ...prev, filter_priority: parseInt(e.target.value) || 10 }))}
                    min="1"
                    max="999"
                  />
                </div>


              </div>

              {/* Values Management Section - Only for editing attributes */}
              {editingAttribute && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Attribute Values</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddValue}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Value
                    </Button>
                  </div>

                  {isValuesLoading ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground">Loading values...</div>
                    </div>
                  ) : attributeValues.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No values created yet</p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleAddValue}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Value
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                      {attributeValues.map((value) => (
                        <div key={value.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {/* Conditional display based on attribute type */}
                            {formData.display_type === 'color' && value.html_color && (
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: value.html_color }}
                              />
                            )}
                            {formData.display_type === 'image' && value.image && (
                              <Image className="h-6 w-6 text-muted-foreground" />
                            )}
                            {(!formData.display_type || formData.display_type === 'text' || formData.display_type === 'radio') && (
                              <Type className="h-4 w-4 text-muted-foreground" />
                            )}
                            
                            <div>
                              <div className="font-medium text-sm">
                                {getValueDisplayText(value)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Seq: {value.sequence} • ID: {value.id}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {value.is_custom && (
                              <Badge variant="secondary" className="text-xs">Custom</Badge>
                            )}
                            {!value.active && (
                              <Badge variant="outline" className="text-xs text-red-600">Inactive</Badge>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditValue(value)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteValue(value)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Value Form Dialog */}
              <Dialog open={isValueFormOpen} onOpenChange={setIsValueFormOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingValue ? 'Edit Value' : 'Create New Value'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingValue 
                        ? 'Update the attribute value details'
                        : `Create a new value for "${getLocalizedText(formData.display_name) || getLocalizedText(formData.name)}" attribute`
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmitValue} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value_name">Value Name</Label>
                        <Input
                          id="value_name"
                          value={valueFormData.name}
                          onChange={(e) => setValueFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter value name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="value_sequence">Sequence</Label>
                        <Input
                          id="value_sequence"
                          type="number"
                          value={valueFormData.sequence}
                          onChange={(e) => setValueFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 10 }))}
                          min="1"
                          max="9999"
                        />
                      </div>
                    </div>

                    {/* Conditional fields based on display type */}
                    {formData.display_type === 'color' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Color Selection</Label>
                          <div className="grid grid-cols-7 gap-2">
                            {PREDEFINED_COLORS.map((color) => (
                              <button
                                key={color.name}
                                type="button"
                                className={`w-8 h-8 rounded border-2 ${
                                  valueFormData.html_color === color.hex 
                                    ? 'border-primary' 
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => setValueFormData(prev => ({ 
                                  ...prev, 
                                  html_color: color.hex,
                                  color: color.name 
                                }))}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom_color">Custom Color</Label>
                            <Input
                              id="custom_color"
                              type="color"
                              value={valueFormData.html_color || '#000000'}
                              onChange={(e) => setValueFormData(prev => ({ 
                                ...prev, 
                                html_color: e.target.value,
                                color: e.target.value 
                              }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="color_name">Color Name</Label>
                            <Input
                              id="color_name"
                              value={valueFormData.color || ''}
                              onChange={(e) => setValueFormData(prev => ({ ...prev, color: e.target.value }))}
                              placeholder="e.g., Red, Blue"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.display_type === 'image' && (
                      <div className="space-y-2">
                        <Label htmlFor="value_image">Image URL</Label>
                        <Input
                          id="value_image"
                          value={valueFormData.image || ''}
                          onChange={(e) => setValueFormData(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          type="url"
                        />
                        {valueFormData.image && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Image className="h-4 w-4" />
                            <span>Image URL provided</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Common settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="value_active"
                          checked={valueFormData.active}
                          onCheckedChange={(checked) => setValueFormData(prev => ({ ...prev, active: checked }))}
                        />
                        <Label htmlFor="value_active">Active</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="value_custom"
                          checked={valueFormData.is_custom}
                          onCheckedChange={(checked) => setValueFormData(prev => ({ ...prev, is_custom: checked }))}
                        />
                        <Label htmlFor="value_custom">Custom Value</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseValueForm}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isValuesLoading}>
                        {isValuesLoading ? 'Saving...' : editingValue ? 'Update Value' : 'Create Value'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingAttribute ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attributes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">product attributes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Attributes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.keyAttributes}</div>
            <p className="text-xs text-muted-foreground">key attributes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filterable</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filterable}</div>
            <p className="text-xs text-muted-foreground">filterable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Specs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websiteSpecs}</div>
            <p className="text-xs text-muted-foreground">website specs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Car Info</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.carInfo}</div>
            <p className="text-xs text-muted-foreground">in car info</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Values</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withValues}</div>
            <p className="text-xs text-muted-foreground">have values</p>
          </CardContent>
        </Card>
      </div>

      {/* Attributes List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Attributes</CardTitle>
          <CardDescription>
            Manage attributes used for car specifications, filtering, and variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading attributes...</div>
            </div>
          ) : attributes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No attributes found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create attributes to define car specifications and enable filtering
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Attribute
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attribute Details</TableHead>
                    <TableHead>Display Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Values</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((attribute) => (
                    <TableRow key={attribute.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {getLocalizedText(attribute.display_name) || getLocalizedText(attribute.name)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {attribute.id}
                            </div>
                            {attribute.description && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                {getLocalizedText(attribute.description)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {attribute.display_type || 'text'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span className="text-sm">{attribute.category_type || 'basic'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {attribute.is_key_attribute && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Key
                            </Badge>
                          )}
                          {attribute.is_filterable && (
                            <Badge variant="secondary" className="text-xs">
                              <Filter className="h-3 w-3 mr-1" />
                              Filter
                            </Badge>
                          )}
                          {attribute.is_website_spec && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Website
                            </Badge>
                          )}
                          {attribute.display_in_car_info && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Car Info
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <Badge variant="outline" className="text-xs">
                            {attribute.value_ids?.length || 0} values
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(attribute)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(attribute)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleKey(attribute)}>
                              <Star className="h-4 w-4 mr-2" />
                              {attribute.is_key_attribute ? 'Remove Key Status' : 'Set as Key'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFilterable(attribute)}>
                              <Filter className="h-4 w-4 mr-2" />
                              {attribute.is_filterable ? 'Remove Filter' : 'Make Filterable'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(attribute)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
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
        </CardContent>
      </Card>
    </div>
  )
} 