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
import { Plus, List, Filter, Eye, EyeOff, Edit, MoreHorizontal, Trash2, Settings, ArrowUpDown, FileText, Star, Globe, Search } from 'lucide-react'

// Import GraphQL queries and types
import {
  GET_SPECIFICATION_TEMPLATE_LINES,
  GET_TEMPLATE_LINES_BY_TEMPLATE,
  CREATE_TEMPLATE_LINE,
  UPDATE_TEMPLATE_LINE,
  DELETE_TEMPLATE_LINE,
  REORDER_TEMPLATE_LINES,
  type SpecificationTemplateLine,
  type SpecificationTemplateLineInput,
  type TemplateWithLines,
  TEMPLATE_LINE_DISPLAY_TYPES,
  TEMPLATE_LINE_CATEGORIES
} from '@/lib/api/queries/specification-template-lines'

import {
  GET_SPECIFICATION_TEMPLATES
} from '@/lib/api/queries/specification-templates'

import {
  GET_PRODUCT_ATTRIBUTES
} from '@/lib/api/queries/specification-attributes'

// Import the new unified GraphQL client
import { gql, gqlMutate } from '@/lib/api'

export default function SpecificationTemplateLinesPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [templatesWithLines, setTemplatesWithLines] = useState<TemplateWithLines[]>([])
  const [allTemplateLines, setAllTemplateLines] = useState<SpecificationTemplateLine[]>([])
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLine, setEditingLine] = useState<SpecificationTemplateLine | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState<SpecificationTemplateLineInput>({
    display_name: '',
    help_text: '',
    is_filterable: false,
    is_required: false,
    is_visible: true,
    sequence: 10,
    placeholder: '',
    category_sequence: 10,
    attribute_id: '',
    template_id: ''
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
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load templates with their lines, available templates, and attributes in parallel
      const [templatesData, availableTemplatesData, attributesData] = await Promise.all([
        gql(GET_SPECIFICATION_TEMPLATE_LINES),
        gql(GET_SPECIFICATION_TEMPLATES),
        gql(GET_PRODUCT_ATTRIBUTES)
      ])

      const templates = templatesData?.AlromaihCarSpecificationTemplate || []
      setTemplatesWithLines(templates)
      
      // Flatten all template lines for easier management
      const allLines = templates.flatMap((template: any) => 
        template.specification_line_ids.map((line: any) => ({
          ...line,
          template_name: getLocalizedText(template.name),
          template_id: template.id
        }))
      )
      setAllTemplateLines(allLines)
      
      setAvailableTemplates(availableTemplatesData?.AlromaihCarSpecificationTemplate || [])
      setAvailableAttributes(attributesData?.ProductAttribute || [])
    } catch (error) {
      console.error('Error loading template lines:', error)
      toast({
        title: "Error",
        description: "Failed to load template lines. Please check your GraphQL endpoint configuration.",
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
      if (editingLine) {
        await gqlMutate(UPDATE_TEMPLATE_LINE, {
          id: editingLine.id,
          values: formData
        })
        toast({
          title: "Success",
          description: "Template line updated successfully"
        })
      } else {
        await gqlMutate(CREATE_TEMPLATE_LINE, {
          values: formData
        })
        toast({
          title: "Success", 
          description: "Template line created successfully"
        })
      }
      
      await loadData()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving template line:', error)
      toast({
        title: "Error",
        description: editingLine ? "Failed to update template line" : "Failed to create template line",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (line: SpecificationTemplateLine) => {
    setEditingLine(line)
    setFormData({
      display_name: getLocalizedText(line.display_name) || '',
      help_text: getLocalizedText(line.help_text) || '',
      is_filterable: line.is_filterable || false,
      is_required: line.is_required || false,
      is_visible: line.is_visible || true,
      sequence: line.sequence || 10,
      placeholder: getLocalizedText(line.placeholder) || '',
      category_sequence: line.category_sequence || 10,
      attribute_id: line.attribute_id.id,
      template_id: (line as any).template_id || ''
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (line: SpecificationTemplateLine) => {
    if (!confirm('Are you sure you want to delete this template line?')) return
    
    try {
      await gqlMutate(DELETE_TEMPLATE_LINE, { id: line.id })
      toast({
        title: "Success",
        description: "Template line deleted successfully"
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting template line:', error)
      toast({
        title: "Error",
        description: "Failed to delete template line",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingLine(null)
    setFormData({
      display_name: '',
      help_text: '',
      is_filterable: false,
      is_required: false,
      is_visible: true,
      sequence: 10,
      placeholder: '',
      category_sequence: 10,
      attribute_id: '',
      template_id: ''
    })
  }

  // Filter template lines by selected template and search term
  const filteredLines = allTemplateLines.filter(line => {
    const matchesTemplate = selectedTemplate ? (line as any).template_id === selectedTemplate : true
    const matchesSearch = searchTerm ? (
      getLocalizedText(line.display_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocalizedText(line.attribute_id?.display_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocalizedText(line.attribute_id?.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (line as any).template_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true
    return matchesTemplate && matchesSearch
  })

  // Calculate statistics
  const stats = {
    total: allTemplateLines.length,
    required: allTemplateLines.filter(line => line.is_required).length,
    visible: allTemplateLines.filter(line => line.is_visible).length,
    filterable: allTemplateLines.filter(line => line.is_filterable).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Lines</h1>
          <p className="text-muted-foreground">
            Manage individual specification lines within templates
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search template lines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Template Filter */}
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Templates</SelectItem>
              {availableTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {getLocalizedText(template.display_name) || getLocalizedText(template.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Line
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLine ? 'Edit Template Line' : 'Create New Template Line'}
                </DialogTitle>
                <DialogDescription>
                  {editingLine 
                    ? 'Update the template line details'
                    : 'Create a new line to add to a specification template'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template_id">Template</Label>
                      <Select 
                        value={formData.template_id || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {getLocalizedText(template.display_name) || getLocalizedText(template.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attribute_id">Attribute</Label>
                      <Select 
                        value={formData.attribute_id || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, attribute_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAttributes.map((attribute) => (
                            <SelectItem key={attribute.id} value={attribute.id}>
                              {getLocalizedText(attribute.display_name) || getLocalizedText(attribute.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter display name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="help_text">Help Text</Label>
                    <Textarea
                      id="help_text"
                      value={formData.help_text || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, help_text: e.target.value }))}
                      placeholder="Enter help text for users"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placeholder">Placeholder</Label>
                    <Input
                      id="placeholder"
                      value={formData.placeholder || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                      placeholder="Enter placeholder text"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Settings</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_visible"
                          checked={formData.is_visible || false}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                        />
                        <Label htmlFor="is_visible">Visible in UI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_required"
                          checked={formData.is_required || false}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
                        />
                        <Label htmlFor="is_required">Required Field</Label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_filterable"
                          checked={formData.is_filterable || false}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_filterable: checked }))}
                        />
                        <Label htmlFor="is_filterable">Filterable</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sequence">Sequence</Label>
                      <Input
                        id="sequence"
                        type="number"
                        value={formData.sequence || 10}
                        onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 10 }))}
                        min="1"
                        max="999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_sequence">Category Sequence</Label>
                      <Input
                        id="category_sequence"
                        type="number"
                        value={formData.category_sequence || 10}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_sequence: parseInt(e.target.value) || 10 }))}
                        min="1"
                        max="999"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingLine ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">specification lines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Required Fields</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.required}</div>
            <p className="text-xs text-muted-foreground">required lines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visible Lines</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visible}</div>
            <p className="text-xs text-muted-foreground">visible in UI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filterable</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filterable}</div>
            <p className="text-xs text-muted-foreground">filterable lines</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Lines List */}
      <Card>
        <CardHeader>
          <CardTitle>Template Lines</CardTitle>
          <CardDescription>
            Individual lines that make up specification templates, each linked to an attribute
            {selectedTemplate && (
              <span className="ml-2 text-primary">
                • Filtered by: {availableTemplates.find(t => t.id === selectedTemplate) ? 
                  getLocalizedText(availableTemplates.find(t => t.id === selectedTemplate)?.display_name) ||
                  getLocalizedText(availableTemplates.find(t => t.id === selectedTemplate)?.name) : 'Unknown Template'}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading template lines...</div>
            </div>
          ) : filteredLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <List className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No template lines found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {selectedTemplate 
                  ? 'This template has no lines yet. Create lines to define specification fields.'
                  : 'Create template lines to define individual specification fields within templates'
                }
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Line
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line Details</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {getLocalizedText(line.display_name) || 'Unnamed Line'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {line.id}
                            </div>
                            {line.help_text && (
                              <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                {getLocalizedText(line.help_text)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(line as any).template_name || 'Unknown Template'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {getLocalizedText(line.attribute_id.display_name) || getLocalizedText(line.attribute_id.name)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Type: {line.attribute_id.display_type || 'text'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {line.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Required
                            </Badge>
                          )}
                          {line.is_visible && (
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="h-3 w-3 mr-1" />
                              Visible
                            </Badge>
                          )}
                          {line.is_filterable && (
                            <Badge variant="secondary" className="text-xs">
                              <Filter className="h-3 w-3 mr-1" />
                              Filterable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Line: {line.sequence}</div>
                          <div className="text-xs text-muted-foreground">
                            Category: {line.category_sequence}
                          </div>
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
                            <DropdownMenuItem onClick={() => handleEdit(line)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(line)}
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
      <NotificationContainer />
    </div>
  )
} 