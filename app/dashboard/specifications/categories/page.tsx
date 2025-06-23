'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Plus, Folder, Eye, Globe, Info, Edit, MoreHorizontal, Trash2, Upload, Settings, BarChart3, X, Image, Search } from 'lucide-react'
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  validateImageFile, 
  createImageUrl, 
  revokeImageUrl, 
  formatFileSize, 
  getImageDimensions,
  fileToBase64String,
  SUPPORTED_IMAGE_TYPES 
} from "@/lib/utils/image-utils"

// Import GraphQL queries and types
import {
  GET_PRODUCT_ATTRIBUTE_CATEGORIES,
  CREATE_PRODUCT_ATTRIBUTE_CATEGORY,
  UPDATE_PRODUCT_ATTRIBUTE_CATEGORY,
  DELETE_PRODUCT_ATTRIBUTE_CATEGORY,
  SET_CATEGORY_WEBSITE_VISIBLE,
  SET_CATEGORY_AS_INFORMATION,
  SET_CATEGORY_INLINE_EDITABLE,
  UPLOAD_CATEGORY_ICON,
  DUPLICATE_PRODUCT_ATTRIBUTE_CATEGORY,
  type ProductAttributeCategory,
  type ProductAttributeCategoryInput,
  CATEGORY_DISPLAY_TYPES,
  CATEGORY_ICON_DISPLAY_TYPES,
  WEBSITE_DISPLAY_STYLES,
  fetchGraphQL
} from '@/lib/api/queries/specification-categories'

export default function SpecificationCategoriesPage() {
  const [categories, setCategories] = useState<ProductAttributeCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductAttributeCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [formData, setFormData] = useState<ProductAttributeCategoryInput>({
    name: '',
    display_name: '',
    description: '',
    active: true,
    sequence: 10,
    website_sequence: 10,
    display_type: CATEGORY_DISPLAY_TYPES.LIST,
    icon_display_type: CATEGORY_ICON_DISPLAY_TYPES.ICON,
    is_information_category: false,
    is_inline_editable: false,
    is_website_visible: false,
    website_fold_by_default: false,
    website_display_style: WEBSITE_DISPLAY_STYLES.DEFAULT
  })
  const { toast } = useToast()

  // Helper function to get localized text (same pattern as cars and attributes pages)
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
    loadCategories()
  }, [showInactive])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const data = await fetchGraphQL(GET_PRODUCT_ATTRIBUTE_CATEGORIES)
      if (data?.ProductAttributeCategory) {
        const filteredCategories = data.ProductAttributeCategory.filter((category: ProductAttributeCategory) => 
          showInactive ? true : category.active
        )
        setCategories(filteredCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast({
        title: "Error",
        description: "Failed to load categories. Please check your GraphQL endpoint configuration.",
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
      // Ensure display_name is set if not provided
      const submitData = {
        ...formData,
        display_name: formData.display_name || formData.name
      }

      if (editingCategory) {
        await fetchGraphQL(UPDATE_PRODUCT_ATTRIBUTE_CATEGORY, {
          id: editingCategory.id,
          values: submitData
        })
        toast({
          title: "Success",
          description: "Category updated successfully"
        })
      } else {
        await fetchGraphQL(CREATE_PRODUCT_ATTRIBUTE_CATEGORY, {
          values: submitData
        })
        toast({
          title: "Success", 
          description: "Category created successfully"
        })
      }
      
      await loadCategories()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: editingCategory ? "Failed to update category" : "Failed to create category",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (category: ProductAttributeCategory) => {
    setEditingCategory(category)
    setFormData({
      name: getLocalizedText(category.name) || '',
      display_name: getLocalizedText(category.display_name) || '',
      description: getLocalizedText(category.description) || '',
      active: category.active,
      sequence: category.sequence,
      website_sequence: category.website_sequence,
      display_type: category.display_type,
      icon: category.icon,
      icon_display_type: category.icon_display_type,
      icon_image: category.icon_image,
      is_information_category: category.is_information_category,
      is_inline_editable: category.is_inline_editable,
      is_website_visible: category.is_website_visible,
      website_css_class: category.website_css_class,
      website_display_style: category.website_display_style,
      website_fold_by_default: category.website_fold_by_default,
      website_meta_title: getLocalizedText(category.website_meta_title) || '',
      website_meta_description: getLocalizedText(category.website_meta_description) || '',
      website_meta_keywords: getLocalizedText(category.website_meta_keywords) || '',
      website_short_description: getLocalizedText(category.website_short_description) || '',
      website_url_key: category.website_url_key
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (category: ProductAttributeCategory) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await fetchGraphQL(DELETE_PRODUCT_ATTRIBUTE_CATEGORY, { id: category.id })
      toast({
        title: "Success",
        description: "Category deleted successfully"
      })
      await loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
    }
  }

  const handleToggleWebsiteVisible = async (category: ProductAttributeCategory) => {
    try {
      await fetchGraphQL(SET_CATEGORY_WEBSITE_VISIBLE, { id: category.id })
      toast({
        title: "Success",
        description: "Category set as website visible"
      })
      await loadCategories()
    } catch (error) {
      console.error('Error setting website visible:', error)
      toast({
        title: "Error",
        description: "Failed to set as website visible",
        variant: "destructive"
      })
    }
  }

  const handleToggleInformation = async (category: ProductAttributeCategory) => {
    try {
      await fetchGraphQL(SET_CATEGORY_AS_INFORMATION, { id: category.id })
      toast({
        title: "Success",
        description: "Category set as information category"
      })
      await loadCategories()
    } catch (error) {
      console.error('Error setting information category:', error)
      toast({
        title: "Error",
        description: "Failed to set as information category",
        variant: "destructive"
      })
    }
  }

  const handleToggleInlineEditable = async (category: ProductAttributeCategory) => {
    try {
      await fetchGraphQL(SET_CATEGORY_INLINE_EDITABLE, { id: category.id })
      toast({
        title: "Success",
        description: "Category set as inline editable"
      })
      await loadCategories()
    } catch (error) {
      console.error('Error setting inline editable:', error)
      toast({
        title: "Error",
        description: "Failed to set as inline editable",
        variant: "destructive"
      })
    }
  }

  const handleUploadIcon = async (category: ProductAttributeCategory, file: File) => {
    try {
      // Convert file to base64 (simplified for demo)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        await fetchGraphQL(UPLOAD_CATEGORY_ICON, { 
          id: category.id,
          icon_image: base64.split(',')[1] // Remove data:image/type;base64, prefix
        })
        toast({
          title: "Success",
          description: "Category icon uploaded successfully"
        })
        await loadCategories()
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading icon:', error)
      toast({
        title: "Error",
        description: "Failed to upload icon",
        variant: "destructive"
      })
    }
  }

  const handleDuplicate = async (category: ProductAttributeCategory) => {
    try {
      await fetchGraphQL(DUPLICATE_PRODUCT_ATTRIBUTE_CATEGORY, { 
        id: category.id,
        new_name: `${getLocalizedText(category.name)} (Copy)`
      })
      toast({
        title: "Success",
        description: "Category duplicated successfully"
      })
      await loadCategories()
    } catch (error) {
      console.error('Error duplicating category:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate category",
        variant: "destructive"
      })
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      display_name: '',
      description: '',
      active: true,
      sequence: 10,
      website_sequence: 10,
      display_type: CATEGORY_DISPLAY_TYPES.LIST,
      icon_display_type: CATEGORY_ICON_DISPLAY_TYPES.ICON,
      is_information_category: false,
      is_inline_editable: false,
      is_website_visible: false,
      website_fold_by_default: false,
      website_display_style: WEBSITE_DISPLAY_STYLES.DEFAULT
    })
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase()
    const name = getLocalizedText(category.name)
    const description = getLocalizedText(category.description)
    
    return (
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower)
    )
  })

  // Calculate statistics
  const stats = {
    total: categories.length,
    websiteVisible: categories.filter(cat => cat.is_website_visible).length,
    informationCategories: categories.filter(cat => cat.is_information_category).length,
    totalAttributes: categories.reduce((sum, cat) => sum + (cat.attribute_count || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Attribute Categories</h1>
          <p className="text-muted-foreground">
            Organize product attributes into logical categories for better management
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the product attribute category details'
                  : 'Create a new category to organize product attributes'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
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
                      placeholder="Enter category name"
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="website_sequence">Website Sequence</Label>
                    <Input
                      id="website_sequence"
                      type="number"
                      value={formData.website_sequence || 10}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website_sequence: parseInt(e.target.value) || 10
                      }))}
                      min="1"
                      max="999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_type">Display Type</Label>
                    <Select 
                      value={formData.display_type || CATEGORY_DISPLAY_TYPES.LIST} 
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, display_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select display type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_DISPLAY_TYPES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Display & Behavior Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Display & Behavior</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          active: checked
                        }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_website_visible"
                        checked={formData.is_website_visible || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          is_website_visible: checked
                        }))}
                      />
                      <Label htmlFor="is_website_visible">Website Visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_information_category"
                        checked={formData.is_information_category || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          is_information_category: checked
                        }))}
                      />
                      <Label htmlFor="is_information_category">Information Category</Label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_inline_editable"
                        checked={formData.is_inline_editable || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          is_inline_editable: checked
                        }))}
                      />
                      <Label htmlFor="is_inline_editable">Inline Editable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="website_fold_by_default"
                        checked={formData.website_fold_by_default || false}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          website_fold_by_default: checked
                        }))}
                      />
                      <Label htmlFor="website_fold_by_default">Website Fold by Default</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Website Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Website Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_display_style">Website Display Style</Label>
                    <Select 
                      value={formData.website_display_style || WEBSITE_DISPLAY_STYLES.DEFAULT} 
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, website_display_style: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select display style" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WEBSITE_DISPLAY_STYLES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url_key">Website URL Key</Label>
                    <Input
                      id="website_url_key"
                      value={formData.website_url_key || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website_url_key: e.target.value
                      }))}
                      placeholder="Enter URL key"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_short_description">Website Short Description</Label>
                  <Textarea
                    id="website_short_description"
                    value={formData.website_short_description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      website_short_description: e.target.value
                    }))}
                    placeholder="Enter short description for website"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_meta_title">Meta Title</Label>
                    <Input
                      id="website_meta_title"
                      value={formData.website_meta_title || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website_meta_title: e.target.value
                      }))}
                      placeholder="Enter meta title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_meta_description">Meta Description</Label>
                    <Input
                      id="website_meta_description"
                      value={formData.website_meta_description || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website_meta_description: e.target.value
                      }))}
                      placeholder="Enter meta description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_meta_keywords">Meta Keywords</Label>
                    <Input
                      id="website_meta_keywords"
                      value={formData.website_meta_keywords || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        website_meta_keywords: e.target.value
                      }))}
                      placeholder="Enter meta keywords"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Visible</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.websiteVisible}</div>
            <p className="text-xs text-muted-foreground">website visible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Information</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.informationCategories}</div>
            <p className="text-xs text-muted-foreground">information categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attributes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttributes}</div>
            <p className="text-xs text-muted-foreground">attributes</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Attribute Categories</CardTitle>
          <CardDescription>
            Manage categories to organize product attributes logically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search categories..."
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
                <div className="text-sm text-muted-foreground">Loading categories...</div>
              </div>
            ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                Create categories to organize your product attributes and improve management
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </div>
                        ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Attributes</TableHead>
                        <TableHead>Features</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {category.icon_image ? (
                            <img
                              src={category.icon_image}
                              alt={category.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Folder className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{getLocalizedText(category.display_name) || getLocalizedText(category.name)}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {category.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.description && (
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {getLocalizedText(category.description)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{category.attribute_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {category.is_website_visible && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Website
                            </Badge>
                          )}
                          {category.is_information_category && (
                            <Badge variant="secondary" className="text-xs">
                              <Info className="h-3 w-3 mr-1" />
                              Info
                            </Badge>
                          )}
                          {category.is_inline_editable && (
                            <Badge variant="secondary" className="text-xs">
                              <Edit className="h-3 w-3 mr-1" />
                              Editable
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={category.active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {category.active ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {!category.is_website_visible && (
                              <DropdownMenuItem onClick={() => handleToggleWebsiteVisible(category)}>
                                <Globe className="h-4 w-4 mr-2" />
                                Make Website Visible
                              </DropdownMenuItem>
                            )}
                            {!category.is_information_category && (
                              <DropdownMenuItem onClick={() => handleToggleInformation(category)}>
                                <Info className="h-4 w-4 mr-2" />
                                Set as Information
                              </DropdownMenuItem>
                            )}
                            {!category.is_inline_editable && (
                              <DropdownMenuItem onClick={() => handleToggleInlineEditable(category)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Make Inline Editable
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(category)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category)}
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
      </div>
    )
  }  