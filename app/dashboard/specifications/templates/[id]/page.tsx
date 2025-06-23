'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  GET_SPECIFICATION_TEMPLATE_BY_ID,
  UPDATE_SPECIFICATION_TEMPLATE,
  type AlromaihCarSpecificationTemplate,
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

// Extended input interface for template editing with full relational data
interface ExtendedTemplateInput extends AlromaihCarSpecificationTemplateInput {
  specification_line_ids?: SpecificationLineInput[];
  apply_to_model_ids?: string[];
  apply_to_brand_ids?: string[];
  category_ids?: string[];
}

interface SpecificationLineInput {
  id?: string;
  attribute_id: string;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_filterable?: boolean;
  help_text?: string;
  placeholder?: string;
  category_sequence?: number;
}

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<AlromaihCarSpecificationTemplate | null>(null)
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
    if (templateId) {
      loadData()
    }
  }, [templateId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [templateResponse, categoriesResponse, attributesResponse] = await Promise.all([
        graphqlClient.request(GET_SPECIFICATION_TEMPLATE_BY_ID, { id: templateId }),
        graphqlClient.request(GET_PRODUCT_ATTRIBUTE_CATEGORIES),
        graphqlClient.request(GET_PRODUCT_ATTRIBUTES)
      ])
      
      const templateData = (templateResponse as any).data || templateResponse
      const categoriesData = (categoriesResponse as any).data || categoriesResponse
      const attributesData = (attributesResponse as any).data || attributesResponse
      
      const templateResult = templateData?.AlromaihCarSpecificationTemplate?.[0]
      if (!templateResult) {
        toast({
          title: "Error",
          description: "Template not found",
          variant: "destructive"
        })
        router.push('/dashboard/specifications/templates')
        return
      }

      setTemplate(templateResult)
      setCategories(categoriesData?.ProductAttributeCategory || [])
      setAttributes(attributesData?.ProductAttribute || [])

      // Populate form data
      setFormData({
        name: getLocalizedText(templateResult.name) || '',
        display_name: getLocalizedText(templateResult.display_name) || '',
        display_style: templateResult.display_style || 'list',
        sequence: templateResult.sequence || 10,
        is_default: templateResult.is_default || false,
        website_visible: templateResult.website_visible || false,
        website_description: getLocalizedText(templateResult.website_description) || '',
        specification_line_ids: [],
        apply_to_model_ids: templateResult.apply_to_model_ids?.map(m => m.id) || [],
        apply_to_brand_ids: templateResult.apply_to_brand_ids?.map(b => b.id) || [],
        category_ids: templateResult.category_ids?.map(c => c.id) || []
      })

      // Load existing specification lines
      setSpecificationLines(templateResult.specification_line_ids?.map(line => ({
        id: line.id,
        attribute_id: line.attribute_id.id,
        sequence: line.sequence || 10,
        is_required: line.is_required || false,
        is_visible: line.is_visible !== false,
        is_filterable: line.is_filterable || false,
        help_text: getLocalizedText(line.help_text) || '',
        placeholder: getLocalizedText(line.placeholder) || '',
        category_sequence: line.category_sequence || 0
      })) || [])

    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load template data",
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

      await graphqlClient.request(UPDATE_SPECIFICATION_TEMPLATE, {
        id: templateId,
        values: templateData
      })
      
      toast({
        title: "Success", 
        description: "Template updated successfully"
      })
      
      // Navigate back to templates list
      router.push('/dashboard/specifications/templates')
    } catch (error) {
      console.error('Error updating template:', error)
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Specification line management functions
  const addSpecificationLine = () => {
    const newLine: SpecificationLineInput = {
      attribute_id: '',
      sequence: (specificationLines.length + 1) * 10,
      is_required: false,
      is_visible: true,
      is_filterable: false,
      help_text: '',
      placeholder: '',
      category_sequence: 0
    }
    setSpecificationLines([...specificationLines, newLine])
  }

  const updateSpecificationLine = (index: number, updates: Partial<SpecificationLineInput>) => {
    const updatedLines = [...specificationLines]
    updatedLines[index] = { ...updatedLines[index], ...updates }
    setSpecificationLines(updatedLines)
  }

  const removeSpecificationLine = (index: number) => {
    setSpecificationLines(lines => lines.filter((_, i) => i !== index))
    setExpandedLines(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
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

  // Get attribute by ID
  const getAttributeById = (id: string) => {
    return attributes.find(attr => attr.id === id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading template...</span>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Template not found</h3>
          <p className="text-muted-foreground mb-4">The template you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/specifications/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/specifications/templates')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
            <p className="text-muted-foreground">
              Edit "{getLocalizedText(template.display_name) || getLocalizedText(template.name)}" template
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Updating...' : 'Update Template'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Template Configuration</CardTitle>
              <CardDescription>
                Edit your template with basic information, specification lines, and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Spec Lines ({specificationLines.length})
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Categories ({formData.category_ids?.length || 0})
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
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            name: e.target.value,
                            display_name: prev.display_name || e.target.value
                          }))}
                          placeholder="Enter template name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={formData.display_name || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            display_name: e.target.value
                          }))}
                          placeholder="Enter display name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="display_style">Display Style</Label>
                        <Select 
                          value={formData.display_style || 'list'} 
                          onValueChange={(value) => 
                            setFormData(prev => ({ ...prev, display_style: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select display style" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TEMPLATE_DISPLAY_STYLES).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                <div>
                                  <div className="font-medium">{value.label}</div>
                                  <div className="text-xs text-muted-foreground">{value.description}</div>
                                </div>
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
                          value={formData.sequence || 10}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            sequence: parseInt(e.target.value) || 10
                          }))}
                          min="1"
                          max="999"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_description">Website Description</Label>
                      <Textarea
                        id="website_description"
                        value={formData.website_description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          website_description: e.target.value
                        }))}
                        placeholder="Enter description for website display"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-6">
                  {/* Specification Lines */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Specification Lines</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage attributes and their configuration for this template
                        </p>
                      </div>
                      <Button type="button" onClick={addSpecificationLine} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Line
                      </Button>
                    </div>
                    
                    {specificationLines.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                        <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h4 className="text-lg font-semibold mb-2">No specification lines</h4>
                        <p className="text-muted-foreground mb-4">Add specification lines to define the attributes for this template</p>
                        <Button type="button" onClick={addSpecificationLine}>
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
                            <Card key={index} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <Badge variant="outline">{index + 1}</Badge>
                                    {line.id && (
                                      <Badge variant="secondary" className="text-xs">
                                        Existing
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 max-w-xs">
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
                                            <div className="flex items-center gap-2">
                                              <span>{getLocalizedText(attr.display_name) || getLocalizedText(attr.name)}</span>
                                              <Badge variant="secondary" className="text-xs">
                                                {getDisplayTypeLabel(attr.display_type || 'text')}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {attribute && (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {getDisplayTypeLabel(attribute.display_type || 'text')}
                                      </Badge>
                                      {line.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                      {line.is_filterable && <Badge variant="secondary" className="text-xs">Filterable</Badge>}
                                      {!line.is_visible && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleLineExpansion(index)}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSpecificationLine(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <Collapsible open={isExpanded}>
                                <CollapsibleContent className="pt-4 border-t mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Sequence</Label>
                                      <Input
                                        type="number"
                                        value={line.sequence || (index + 1) * 10}
                                        onChange={(e) => updateSpecificationLine(index, { 
                                          sequence: parseInt(e.target.value) || (index + 1) * 10 
                                        })}
                                        min="1"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Category Sequence</Label>
                                      <Input
                                        type="number"
                                        value={line.category_sequence || 0}
                                        onChange={(e) => updateSpecificationLine(index, { 
                                          category_sequence: parseInt(e.target.value) || 0 
                                        })}
                                        min="0"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={line.is_required || false}
                                        onCheckedChange={(checked) => updateSpecificationLine(index, { is_required: checked })}
                                      />
                                      <Label>Required</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={line.is_visible !== false}
                                        onCheckedChange={(checked) => updateSpecificationLine(index, { is_visible: checked })}
                                      />
                                      <Label>Visible</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={line.is_filterable || false}
                                        onCheckedChange={(checked) => updateSpecificationLine(index, { is_filterable: checked })}
                                      />
                                      <Label>Filterable</Label>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                      <Label>Help Text</Label>
                                      <Input
                                        value={line.help_text || ''}
                                        onChange={(e) => updateSpecificationLine(index, { help_text: e.target.value })}
                                        placeholder="Enter help text"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Placeholder</Label>
                                      <Input
                                        value={line.placeholder || ''}
                                        onChange={(e) => updateSpecificationLine(index, { placeholder: e.target.value })}
                                        placeholder="Enter placeholder text"
                                      />
                                    </div>
                                  </div>

                                  {attribute && (
                                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                      <h5 className="font-medium mb-2">Attribute Details</h5>
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
                <div className="text-xs text-muted-foreground mt-1">
                  {specificationLines.filter(l => l.id).length} existing, {specificationLines.filter(l => !l.id).length} new
                </div>
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
                <Label className="text-sm font-medium">Template ID</Label>
                <p className="text-xs text-muted-foreground font-mono">
                  {templateId}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 