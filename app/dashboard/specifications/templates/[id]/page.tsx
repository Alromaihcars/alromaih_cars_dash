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
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, X, GripVertical, ArrowLeft, Save, FileText, Settings, 
  Layers, Tag, Loader2, Trash2, Edit, Copy
} from 'lucide-react'

// Import GraphQL queries and types
import {
  GET_SPECIFICATION_TEMPLATE_BY_ID,
  GET_SPECIFICATION_TEMPLATES,
  CREATE_SPECIFICATION_TEMPLATE,
  UPDATE_SPECIFICATION_TEMPLATE,
  DELETE_SPECIFICATION_TEMPLATE,
  DUPLICATE_SPECIFICATION_TEMPLATE,
  type AlromaihCarSpecificationTemplate,
  type AlromaihCarSpecificationTemplateValues,
  TEMPLATE_DISPLAY_STYLES,
  fetchGraphQL
} from '@/lib/api/queries/specification-templates'

import {
  GET_PRODUCT_ATTRIBUTES,
  type ProductAttribute,
} from '@/lib/api/queries/specification-attributes'

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

interface TemplateFormData {
  name: string;
  display_name?: string;
  description?: string;
  display_style?: string;
  sequence?: number;
  is_default?: boolean;
  website_visible?: boolean;
  website_description?: string;
  active?: boolean;
}

export default function TemplateFormPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  const isNew = templateId === 'new'
  
  const [template, setTemplate] = useState<AlromaihCarSpecificationTemplate | null>(null)
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    display_name: '',
    description: '',
    display_style: 'list',
    sequence: 10,
    is_default: false,
    website_visible: true,
    website_description: '',
    active: true
  })

  const [specificationLines, setSpecificationLines] = useState<SpecificationLineInput[]>([])
  
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted, templateId])

  const loadData = async () => {
    try {
      // Always load attributes
      const attributesResponse = await fetchGraphQL(GET_PRODUCT_ATTRIBUTES)
      setAttributes(attributesResponse?.ProductAttribute || [])

              // Load template data if editing
        if (!isNew) {
          setIsLoading(true)
          const response = await fetchGraphQL(GET_SPECIFICATION_TEMPLATE_BY_ID, { id: templateId })
          
          const result = response?.AlromaihCarSpecificationTemplate?.[0]
          if (!result) {
            toast({
              title: "Error",
              description: "Template not found",
              variant: "destructive"
            })
            router.push('/dashboard/specifications/templates')
            return
          }

          setTemplate(result)

          // Populate form data
          setFormData({
            name: getLocalizedText(result.name) || '',
            display_name: getLocalizedText(result.display_name) || '',
            description: getLocalizedText(result.website_description) || '',
            display_style: result.display_style || 'list',
            sequence: result.sequence || 10,
            is_default: result.is_default || false,
            website_visible: result.website_visible || false,
            website_description: getLocalizedText(result.website_description) || '',
            active: result.active !== false
          })

          // Load existing specification lines
          setSpecificationLines(result.specification_line_ids?.map((line: any) => ({
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
        }
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
      if (isNew) {
        // Create new template
        const values: AlromaihCarSpecificationTemplateValues = {
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description,
          sequence: formData.sequence,
          active: formData.active,
          is_default: formData.is_default,
          display_style: formData.display_style,
          website_visible: formData.website_visible,
          website_description: formData.website_description
        }

        await fetchGraphQL(CREATE_SPECIFICATION_TEMPLATE, {
          values: values
        })
        
        toast({
          title: "Success", 
          description: "Template created successfully"
        })
      } else {
        // Update existing template
        const values: AlromaihCarSpecificationTemplateValues = {
          name: formData.name,
          display_name: formData.display_name,
          description: formData.description,
          sequence: formData.sequence,
          active: formData.active,
          is_default: formData.is_default,
          display_style: formData.display_style,
          website_visible: formData.website_visible,
          website_description: formData.website_description
        }

        await fetchGraphQL(UPDATE_SPECIFICATION_TEMPLATE, {
          id: templateId,
          values: values
        })
        
        toast({
          title: "Success", 
          description: "Template updated successfully"
        })
      }
      
      // Navigate back to templates list
      router.push('/dashboard/specifications/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? 'create' : 'update'} template`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (isNew) return

    if (!confirm(`Are you sure you want to delete "${formData.name}"?`)) return
    
    try {
      await fetchGraphQL(DELETE_SPECIFICATION_TEMPLATE, { id: templateId })
      toast({
        title: "Success",
        description: "Template deleted successfully"
      })
      router.push('/dashboard/specifications/templates')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      })
    }
  }

  const handleDuplicate = async () => {
    if (isNew) return
    
    try {
      const duplicateData = {
        ...formData,
        name: `${formData.name} (Copy)`,
        is_default: false
      }

      await fetchGraphQL(DUPLICATE_SPECIFICATION_TEMPLATE, { 
        original_id: templateId,
        values: duplicateData
      })
      
      toast({
        title: "Success",
        description: "Template duplicated successfully"
      })
      router.push('/dashboard/specifications/templates')
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      })
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
  }

  // Get attribute by ID
  const getAttributeById = (id: string) => {
    return attributes.find(attr => attr.id === id)
  }

  if (!mounted) {
    return <div>Loading...</div>
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
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Create Template' : 'Edit Template'}
            </h1>
            <p className="text-muted-foreground">
              {isNew 
                ? 'Create a new specification template' 
                : `Edit "${formData.name}" template`
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
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
            {isSubmitting ? (isNew ? 'Creating...' : 'Updating...') : (isNew ? 'Create Template' : 'Update Template')}
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
                {isNew ? 'Configure your new template' : 'Edit template settings and specification lines'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Basic Info
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Spec Lines ({specificationLines.length})
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
                          value={formData.name}
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Enter template description"
                        rows={3}
                      />
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
                          
                          return (
                            <Card key={index} className="p-4">
                              <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <Badge variant="outline">{index + 1}</Badge>
                                    {line.id && (
                                      <Badge variant="secondary" className="text-xs">
                                        Existing
                                      </Badge>
                                    )}
                                  </div>
                                  
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
                                            <div className="flex items-center gap-2">
                                              <span>{getLocalizedText(attr.display_name) || getLocalizedText(attr.name)}</span>
                                              <Badge variant="secondary" className="text-xs">
                                                {attr.display_type || 'text'}
                                              </Badge>
                                            </div>
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
                                        sequence: parseInt(e.target.value) || (index + 1) * 10 
                                      })}
                                      min="1"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
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

                                <div className="grid grid-cols-2 gap-4">
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
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <h5 className="font-medium mb-2">Attribute Details</h5>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Type:</span> {attribute.display_type || 'text'}
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
                              </div>
                            </Card>
                          )
                        })}
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
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="active"
                            checked={formData.active !== false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              active: checked
                            }))}
                          />
                          <Label htmlFor="active">Active</Label>
                        </div>
                      </div>
                    </div>
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
                  {formData.active !== false && (
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  )}
                </div>
              </div>

              {!isNew && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Template ID</Label>
                    <p className="text-xs text-muted-foreground font-mono">
                      {templateId}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 