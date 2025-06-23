'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, ChevronDown, ChevronRight, X, GripVertical, Tag, Layers, ArrowLeft,
  Save, FileText, Settings, Users, List as ListIcon, Loader2
} from 'lucide-react'
import { graphqlClient } from '@/lib/api/graphql-client'

// Import GraphQL queries and types
import {
  CREATE_SPECIFICATION_TEMPLATE,
  type AlromaihCarSpecificationTemplateInput,
  TEMPLATE_DISPLAY_STYLES,
} from '@/lib/api/queries/specification-templates'

import {
  GET_PRODUCT_ATTRIBUTE_CATEGORIES,
  type ProductAttributeCategory,
} from '@/lib/api/queries/specification-categories'

import {
  GET_PRODUCT_ATTRIBUTES,
  type ProductAttribute,
} from '@/lib/api/queries/specification-attributes'

import { DEFAULT_DISPLAY_TYPE_OPTIONS } from '@/components/ui/display-type-selector'

// Extended input interface for template creation with full relational data
interface ExtendedTemplateInput extends AlromaihCarSpecificationTemplateInput {
  specification_line_ids?: SpecificationLineInput[];
  apply_to_model_ids?: string[];
  apply_to_brand_ids?: string[];
  category_ids?: string[];
}

interface SpecificationLineInput {
  attribute_id: string;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_filterable?: boolean;
  help_text?: string;
  placeholder?: string;
  category_sequence?: number;
}

export default function CreateTemplatePage() {
  const router = useRouter()
  
  const [categories, setCategories] = useState<ProductAttributeCategory[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const [formData, setFormData] = useState<ExtendedTemplateInput>({
    name: '',
    display_name: '',
    display_style: 'list',
    sequence: 10,
    is_default: false,
    website_visible: true,
    website_description: '',
    specification_line_ids: [],
    apply_to_model_ids: [],
    apply_to_brand_ids: [],
    category_ids: []
  })

  const [specificationLines, setSpecificationLines] = useState<SpecificationLineInput[]>([])
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())
  
  const { toast } = useToast()

  // Helper function to get localized text
  const getLocalizedText = (field: any): string => {
    if (!field) return ""
    if (typeof field === "string") return field
    if (typeof field === "object") {
      return field.en_US || field.ar_001 || Object.values(field)[0] || ""
    }
    return String(field)
  }
  // Helper function to get display type label
  const getDisplayTypeLabel = (displayType: string): string => {
    const option = DEFAULT_DISPLAY_TYPE_OPTIONS.find(opt => opt.value === displayType)
    return option?.label || displayType
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [categoriesResponse, attributesResponse] = await Promise.all([
        graphqlClient.request(GET_PRODUCT_ATTRIBUTE_CATEGORIES),
        graphqlClient.request(GET_PRODUCT_ATTRIBUTES)
      ])
      
      const categoriesData = (categoriesResponse as any).data || categoriesResponse
      const attributesData = (attributesResponse as any).data || attributesResponse
      
      setCategories(categoriesData?.ProductAttributeCategory || [])
      setAttributes(attributesData?.ProductAttribute || [])

    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare the template data with specification lines
      const templateData = {
        ...formData,
        display_name: formData.display_name || formData.name,
        specification_line_ids: specificationLines.map((line, index) => ({
          ...line,
          sequence: line.sequence || (index + 1) * 10
        }))
      }

      await graphqlClient.request(CREATE_SPECIFICATION_TEMPLATE, {
        values: templateData
      })
      
      toast({
        title: "Success", 
        description: "Template created successfully"
      })
      
      // Navigate back to templates list
      router.push('/dashboard/specifications/templates')
      
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSpecificationLine = () => {
    setSpecificationLines(prev => [...prev, {
      attribute_id: '',
      sequence: (prev.length + 1) * 10,
      is_required: false,
      is_visible: true,
      is_filterable: false,
      help_text: '',
      placeholder: '',
      category_sequence: 0
    }])
    // Auto-expand the new line
    setExpandedLines(prev => new Set([...prev, specificationLines.length]))
  }

  const updateSpecificationLine = (index: number, updates: Partial<SpecificationLineInput>) => {
    setSpecificationLines(prev => prev.map((line, i) => 
      i === index ? { ...line, ...updates } : line
    ))
  }

  const removeSpecificationLine = (index: number) => {
    setSpecificationLines(prev => prev.filter((_, i) => i !== index))
    // Remove from expanded set
    setExpandedLines(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      // Adjust indices for remaining items
      const adjustedSet = new Set()
      newSet.forEach(i => {
        if (i > index) adjustedSet.add(i - 1)
        else if (i < index) adjustedSet.add(i)
      })
      return adjustedSet
    })
  }

  const toggleLineExpansion = (index: number) => {
    setExpandedLines(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const getAttributeById = (id: string) => {
    return attributes.find(attr => attr.id === id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading template creation form...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
            <p className="text-muted-foreground">
              Create a new specification template for organizing car specifications
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/specifications/templates')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="lines" className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    Specification Lines
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter template name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={formData.display_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                          placeholder="Display name (optional)"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_style">Display Style</Label>
                        <Select
                          value={formData.display_style}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, display_style: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select display style" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TEMPLATE_DISPLAY_STYLES).map(([key, style]) => (
                              <SelectItem key={key} value={key}>
                                {style.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sequence">Sequence</Label>
                        <Input
                          id="sequence"
                          type="number"
                          value={formData.sequence}
                          onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 10 }))}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website_description">Website Description</Label>
                      <Textarea
                        id="website_description"
                        value={formData.website_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_description: e.target.value }))}
                        placeholder="Description for website display..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lines" className="space-y-6">
                  {/* Specification Lines */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Specification Lines</h3>
                      <Button
                        onClick={addSpecificationLine}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Line
                      </Button>
                    </div>
                    
                    {specificationLines.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                          <ListIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No specification lines</h3>
                        <p className="text-muted-foreground mb-4">
                          Add specification lines to define which attributes this template will include
                        </p>
                        <Button onClick={addSpecificationLine} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Line
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {specificationLines.map((line, index) => {
                          const attribute = getAttributeById(line.attribute_id)
                          const isExpanded = expandedLines.has(index)
                          
                          return (
                            <Card key={index} className="border-l-4 border-l-primary">
                              <Collapsible open={isExpanded} onOpenChange={() => toggleLineExpansion(index)}>
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                          <CardTitle className="text-base">
                                            {attribute ? (
                                              getLocalizedText(attribute.display_name) || getLocalizedText(attribute.name)
                                            ) : (
                                              line.attribute_id ? `Attribute ID: ${line.attribute_id}` : 'Select Attribute'
                                            )}
                                          </CardTitle>
                                          <CardDescription>
                                            Sequence: {line.sequence || (index + 1) * 10}
                                            {line.is_required && " • Required"}
                                            {line.is_filterable && " • Filterable"}
                                          </CardDescription>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={line.is_visible ? "default" : "secondary"}>
                                          {line.is_visible ? "Visible" : "Hidden"}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            removeSpecificationLine(index)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Attribute *</Label>
                                        <Select
                                          value={line.attribute_id}
                                          onValueChange={(value) => updateSpecificationLine(index, { attribute_id: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select attribute" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {attributes.map((attr) => (
                                              <SelectItem key={attr.id} value={attr.id}>
                                                {getLocalizedText(attr.display_name) || getLocalizedText(attr.name)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Sequence</Label>
                                        <Input
                                          type="number"
                                          value={line.sequence || (index + 1) * 10}
                                          onChange={(e) => updateSpecificationLine(index, { 
                                            sequence: parseInt(e.target.value) || 10 
                                          })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Help Text</Label>
                                        <Input
                                          value={line.help_text || ''}
                                          onChange={(e) => updateSpecificationLine(index, { help_text: e.target.value })}
                                          placeholder="Help text for users"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Placeholder</Label>
                                        <Input
                                          value={line.placeholder || ''}
                                          onChange={(e) => updateSpecificationLine(index, { placeholder: e.target.value })}
                                          placeholder="Input placeholder"
                                        />
                                      </div>
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`required-${index}`}
                                          checked={line.is_required || false}
                                          onCheckedChange={(checked) => updateSpecificationLine(index, { is_required: checked })}
                                        />
                                        <Label htmlFor={`required-${index}`}>Required</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`visible-${index}`}
                                          checked={line.is_visible !== false}
                                          onCheckedChange={(checked) => updateSpecificationLine(index, { is_visible: checked })}
                                        />
                                        <Label htmlFor={`visible-${index}`}>Visible</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id={`filterable-${index}`}
                                          checked={line.is_filterable || false}
                                          onCheckedChange={(checked) => updateSpecificationLine(index, { is_filterable: checked })}
                                        />
                                        <Label htmlFor={`filterable-${index}`}>Filterable</Label>
                                      </div>
                                    </div>

                                    {attribute && (
                                      <div className="mt-4 p-3 bg-muted rounded-lg">
                                        <h4 className="font-medium mb-2">Attribute Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium">Type:</span> {getDisplayTypeLabel(attribute.display_type || 'text')}
                                          </div>
                                          <div>
                                            <span className="font-medium">Values:</span> {attribute.value_ids?.length || 0}
                                          </div>
                                          {attribute.description && (
                                            <div className="col-span-2">
                                              <span className="font-medium">Description:</span> {getLocalizedText(attribute.description)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="space-y-6">
                  {/* Categories Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {categories.map((category) => (
                        <Card 
                          key={category.id} 
                          className={`cursor-pointer transition-colors ${
                            formData.category_ids?.includes(category.id) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-muted-foreground/50'
                          }`}
                          onClick={() => {
                            const currentIds = formData.category_ids || []
                            const newIds = currentIds.includes(category.id)
                              ? currentIds.filter(id => id !== category.id)
                              : [...currentIds, category.id]
                            setFormData(prev => ({ ...prev, category_ids: newIds }))
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                                <Tag className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {getLocalizedText(category.display_name) || getLocalizedText(category.name)}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {category.attribute_count} attributes
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {formData.category_ids && formData.category_ids.length > 0 && (
                      <div className="mt-4">
                        <Label>Selected Categories ({formData.category_ids.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.category_ids.map((categoryId) => {
                            const category = categories.find(c => c.id === categoryId)
                            return category ? (
                              <Badge key={categoryId} variant="secondary" className="gap-1">
                                {getLocalizedText(category.display_name) || getLocalizedText(category.name)}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFormData(prev => ({
                                      ...prev,
                                      category_ids: prev.category_ids?.filter(id => id !== categoryId) || []
                                    }))
                                  }}
                                />
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  {/* Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Template Settings</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_default"
                            checked={formData.is_default || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              is_default: checked
                            }))}
                          />
                          <Label htmlFor="is_default">Set as Default Template</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="website_visible"
                            checked={formData.website_visible || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              website_visible: checked
                            }))}
                          />
                          <Label htmlFor="website_visible">Website Visible</Label>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Template Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.name || 'Untitled Template'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Display Style</Label>
                <p className="text-sm text-muted-foreground">
                  {TEMPLATE_DISPLAY_STYLES[formData.display_style || 'list']?.label || 'List'}
                </p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Specification Lines</Label>
                <p className="text-sm text-muted-foreground">
                  {specificationLines.length} lines configured
                </p>
                {specificationLines.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {specificationLines.filter(l => l.is_required).length} required, {specificationLines.filter(l => l.is_filterable).length} filterable
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Categories</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.category_ids?.length || 0} categories selected
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Settings</Label>
                <div className="space-y-1">
                  {formData.is_default && (
                    <Badge variant="default" className="text-xs">Default Template</Badge>
                  )}
                  {formData.website_visible && (
                    <Badge variant="secondary" className="text-xs">Website Visible</Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Progress</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.name ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs">Basic info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${specificationLines.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs">Specification lines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.category_ids?.length ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs">Categories</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 