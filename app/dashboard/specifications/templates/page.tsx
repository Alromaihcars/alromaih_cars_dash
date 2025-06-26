'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { 
  Plus, Copy, Eye, Edit, MoreHorizontal, Star, Trash2, FileText, Globe, List, Search, Loader2
} from 'lucide-react'

// Import GraphQL queries and types
import {
  GET_SPECIFICATION_TEMPLATES,
  DELETE_SPECIFICATION_TEMPLATE,
  SET_TEMPLATE_AS_DEFAULT,
  TOGGLE_WEBSITE_VISIBILITY,
  DUPLICATE_SPECIFICATION_TEMPLATE,
  type AlromaihCarSpecificationTemplate,
  TEMPLATE_DISPLAY_STYLES,
  fetchGraphQL
} from '@/lib/api/queries/specification-templates'

export default function SpecificationTemplatesPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [templates, setTemplates] = useState<AlromaihCarSpecificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)

  // Helper function to get localized text (same pattern as cars, units, and categories pages)
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
      loadData()
    }
  }, [mounted, showInactive])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const templatesData = await fetchGraphQL(GET_SPECIFICATION_TEMPLATES)
      setTemplates(templatesData?.AlromaihCarSpecificationTemplate || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data. Please check your GraphQL endpoint configuration.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: AlromaihCarSpecificationTemplate) => {
    router.push(`/dashboard/specifications/templates/${template.id}`)
  }

  const handleCreate = () => {
    router.push('/dashboard/specifications/templates/new')
  }

  const handleDelete = async (template: AlromaihCarSpecificationTemplate) => {
    if (!confirm(`Are you sure you want to delete "${getLocalizedText(template.name)}"?`)) return
    
    try {
      await fetchGraphQL(DELETE_SPECIFICATION_TEMPLATE, { id: template.id })
      toast({
        title: "Success",
        description: "Template deleted successfully"
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      })
    }
  }

  const handleSetDefault = async (template: AlromaihCarSpecificationTemplate) => {
    try {
      await fetchGraphQL(SET_TEMPLATE_AS_DEFAULT, { id: template.id })
      toast({
        title: "Success",
        description: "Template set as default successfully"
      })
      await loadData()
    } catch (error) {
      console.error('Error setting default template:', error)
      toast({
        title: "Error",
        description: "Failed to set as default template",
        variant: "destructive"
      })
    }
  }

  const handleToggleWebsiteVisibility = async (template: AlromaihCarSpecificationTemplate) => {
    try {
      await fetchGraphQL(TOGGLE_WEBSITE_VISIBILITY, { 
        id: template.id,
        website_visible: !template.website_visible
      })
      toast({
        title: "Success",
        description: `Template ${template.website_visible ? 'hidden from' : 'made visible on'} website`
      })
      await loadData()
    } catch (error) {
      console.error('Error toggling website visibility:', error)
      toast({
        title: "Error",
        description: "Failed to toggle website visibility",
        variant: "destructive"
      })
    }
  }

  const handleDuplicate = async (template: AlromaihCarSpecificationTemplate) => {
    try {
      const duplicateData = {
        name: `${getLocalizedText(template.name)} (Copy)`,
        display_name: getLocalizedText(template.display_name),
        display_style: template.display_style,
        sequence: template.sequence,
        is_default: false,
        website_visible: template.website_visible,
        website_description: getLocalizedText(template.website_description),
        active: template.active
      }

      await fetchGraphQL(DUPLICATE_SPECIFICATION_TEMPLATE, { 
        original_id: template.id,
        values: duplicateData
      })
      toast({
        title: "Success",
        description: "Template duplicated successfully"
      })
      await loadData()
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive"
      })
    }
  }

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => {
    const searchLower = searchTerm.toLowerCase()
    const name = getLocalizedText(template.name)
    const displayName = getLocalizedText(template.display_name)
    const description = getLocalizedText(template.website_description)
    
    const matchesSearch = searchTerm ? (
      name.toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    ) : true
    
    const matchesStatus = showInactive ? true : template.active !== false
    
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: templates.length,
    active: templates.filter(t => t.active !== false).length,
    defaults: templates.filter(t => t.is_default).length,
    websiteVisible: templates.filter(t => t.website_visible).length,
    totalLines: templates.reduce((sum, t) => sum + (t.specification_line_ids?.length || 0), 0)
  }

  if (!mounted) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Specification Templates</CardTitle>
            <CardDescription>Manage templates for organizing car specifications</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
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

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">specification templates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-xs text-muted-foreground">active templates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Default Templates</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.defaults}</div>
                  <p className="text-xs text-muted-foreground">default templates</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Website Visible</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.websiteVisible}</div>
                  <p className="text-xs text-muted-foreground">visible on website</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLines}</div>
                  <p className="text-xs text-muted-foreground">specification lines</p>
                </CardContent>
              </Card>
            </div>

            {/* Templates Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading templates...</span>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  {searchTerm ? 'No templates match your search criteria' : 'Create templates to organize your car specifications and improve user experience'}
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Details</TableHead>
                      <TableHead>Lines & Attributes</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Display Style</TableHead>
                      <TableHead>Sequence</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {getLocalizedText(template.display_name) || getLocalizedText(template.name)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {template.id}
                              </div>
                              {template.website_description && (
                                <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                  {getLocalizedText(template.website_description)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <List className="h-3 w-3 mr-1" />
                                {template.specification_line_ids?.length || 0} Lines
                              </Badge>
                            </div>
                            {template.specification_line_ids && template.specification_line_ids.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <div className="space-y-0.5">
                                  {template.specification_line_ids.slice(0, 2).map((line, index) => (
                                    <div key={line.id} className="flex items-center gap-1">
                                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                                      <span className="truncate max-w-32">
                                        {getLocalizedText(line.display_name) || getLocalizedText(line.attribute_id?.display_name) || getLocalizedText(line.attribute_id?.name)}
                                      </span>
                                      {line.is_required && <Star className="h-2 w-2 text-red-500" />}
                                    </div>
                                  ))}
                                  {template.specification_line_ids.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{template.specification_line_ids.length - 2} more...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {template.is_default && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {template.website_visible && (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </Badge>
                            )}
                            {template.active === false && (
                              <Badge variant="outline" className="text-xs text-red-600">
                                Inactive
                              </Badge>
                            )}
                            {template.category_count && template.category_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.category_count} Categories
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                template.display_style === 'tabs' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                template.display_style === 'cards' ? 'border-green-200 text-green-700 bg-green-50' :
                                template.display_style === 'grid' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                                template.display_style === 'table' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                                template.display_style === 'accordion' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                                'border-gray-200 text-gray-700 bg-gray-50'
                              }`}
                            >
                              {TEMPLATE_DISPLAY_STYLES[template.display_style || 'list']?.label || template.display_style || 'List'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono">
                            {template.sequence || 10}
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
                              <DropdownMenuItem onClick={() => handleEdit(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                                <Star className="h-4 w-4 mr-2" />
                                {template.is_default ? 'Remove Default' : 'Set as Default'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleWebsiteVisibility(template)}>
                                <Globe className="h-4 w-4 mr-2" />
                                {template.website_visible ? 'Hide from Website' : 'Show on Website'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(template)}
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
          </div>
        </CardContent>
      </Card>
      <NotificationContainer />
    </div>
  )
} 