"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Palette, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n/context"
import { useNotifications } from "@/components/ui/notification"
import { MultilingualInput } from "@/components/ui/multilingual-input"
import { gql, gqlMutate } from "@/lib/api"
import { 
  GET_CAR_COLORS, 
  CREATE_CAR_COLOR, 
  UPDATE_CAR_COLOR, 
  DELETE_CAR_COLOR,
  type CarColor as CarColorType,
  type CarColorValues,
  getDisplayName,
  getDisplayDescription,
  createCarColorValues,
  validateHexColor,
  generateColorCode
} from "@/lib/api/queries/car-colors"

export default function ColorsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [colors, setColors] = useState<CarColorType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<CarColorType | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    code: "",
    color_picker: "#000000",
    active: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchColors()
    }
  }, [mounted])

  const fetchColors = async () => {
    try {
      setLoading(true)
      const response = await gql(GET_CAR_COLORS)

      if (response?.CarColor) {
        setColors(response.CarColor.filter((color: CarColorType) => 
          showInactive ? true : color.active
        ))
      }
    } catch (error) {
      console.error("Error fetching colors:", error)
      toast({
        title: t('common.error'),
        description: "Failed to fetch car colors",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.en_US && !formData.name.ar_001) {
      toast({
        title: t('common.error'),
        description: "Please fill in color name in at least one language",
        variant: "destructive"
      })
      return
    }

    // Validate hex color if provided
    if (formData.color_picker && !validateHexColor(formData.color_picker)) {
      toast({
        title: t('common.error'),
        description: "Please enter a valid hex color (e.g., #FF0000)",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Auto-generate code if not provided
      let colorCode = formData.code
      if (!colorCode) {
        const primaryName = formData.name.en_US || formData.name.ar_001
        colorCode = generateColorCode(primaryName)
      }

      const values = createCarColorValues(
        formData.name,
        formData.description,
        colorCode,
        formData.color_picker,
        formData.active
      )

      if (editingColor) {
        await gqlMutate(UPDATE_CAR_COLOR, {
          id: editingColor.id,
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Color updated successfully"
        })
      } else {
        await gqlMutate(CREATE_CAR_COLOR, {
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Color created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ 
        name: { en_US: "", ar_001: "" },
        description: { en_US: "", ar_001: "" },
        code: "",
        color_picker: "#000000",
        active: true 
      })
      setEditingColor(null)
      setIsDialogOpen(false)
      await fetchColors()
    } catch (error) {
      console.error('Error submitting color:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.errorOccurred'),
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (color: CarColorType) => {
    setEditingColor(color)
    
    // Convert the color data to form format
    let nameData = { en_US: '', ar_001: '' }
    let descriptionData = { en_US: '', ar_001: '' }
    
    if (typeof color.name === 'object' && color.name !== null) {
      nameData = {
        en_US: (color.name as any).en_US || (color.name as any)['en_US'] || '',
        ar_001: (color.name as any).ar_001 || (color.name as any).ar || (color.name as any).ar_SA || (color.name as any).arabic || ''
      }
    } else if (typeof color.name === 'string') {
      nameData = {
        en_US: color.name,
        ar_001: ''
      }
    }

    if (color.description && typeof color.description === 'object' && color.description !== null) {
      descriptionData = {
        en_US: (color.description as any).en_US || (color.description as any)['en_US'] || '',
        ar_001: (color.description as any).ar_001 || (color.description as any).ar || (color.description as any).ar_SA || (color.description as any).arabic || ''
      }
    } else if (typeof color.description === 'string') {
      descriptionData = {
        en_US: color.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      description: descriptionData,
      code: color.code || '',
      color_picker: color.color_picker || '#000000',
      active: color.active
    })
    
    setIsDialogOpen(true)
  }

  const handleDelete = async (color: CarColorType) => {
    const colorName = getDisplayName(color, 'en_US') || getDisplayName(color, 'ar_001') || 'this color'
    if (!confirm(`Are you sure you want to delete "${colorName}"?`)) {
      return
    }

    try {
      await gqlMutate(DELETE_CAR_COLOR, {
        id: color.id
      })
      
      toast({
        title: "Success",
        description: "Color deleted successfully"
      })
      
      await fetchColors()
    } catch (error) {
      console.error('Error deleting color:', error)
      toast({
        title: "Error",
        description: "Failed to delete color. It may be used by existing cars.",
        variant: "destructive"
      })
    }
  }

  const handleNewColor = () => {
    setEditingColor(null)
    setFormData({ 
      name: { en_US: "", ar_001: "" },
      description: { en_US: "", ar_001: "" },
      code: "",
      color_picker: "#000000",
      active: true 
    })
    setIsDialogOpen(true)
  }

  const filteredColors = colors.filter(color => {
    if (!showInactive && !color.active) return false
    
    const searchLower = searchTerm.toLowerCase()
    
    // Safely get color name values with fallbacks
    let enName = ''
    let arName = ''
    
    if (typeof color.name === 'object' && color.name !== null) {
      enName = (color.name as any).en_US || (color.name as any)['en_US'] || ''
      arName = (color.name as any).ar_001 || (color.name as any)['ar_001'] || ''
    } else if (typeof color.name === 'string') {
      enName = color.name
      arName = ''
    }

    const matchesSearch = 
      enName.toLowerCase().includes(searchLower) ||
      arName.toLowerCase().includes(searchLower) ||
      (color.code && color.code.toLowerCase().includes(searchLower)) ||
      (color.color_picker && color.color_picker.toLowerCase().includes(searchLower))
    
    return matchesSearch
  })

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Car Colors</CardTitle>
            <CardDescription>Manage car colors and color options</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchColors()}>
              Refresh
            </Button>
            <Button onClick={handleNewColor}>
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search colors, codes, and hex values..."
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

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading colors...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Hex Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                            style={{ backgroundColor: color.color_picker || '#000000' }}
                            title={`Color: ${color.color_picker || '#000000'}`}
                          />
                          <Palette className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getDisplayName(color, 'en_US')}</div>
                          <div className="text-sm text-muted-foreground" dir="rtl">
                            {getDisplayName(color, 'ar_001')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {color.code && (
                          <Badge variant="outline">
                            {color.code}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded text-sm">
                            {color.color_picker || '#000000'}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={color.active ? "default" : "secondary"}>
                          {color.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(color)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(color)}
                            disabled={!color.active}
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

            {!loading && filteredColors.length === 0 && (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No colors found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Get started by adding your first car color"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleNewColor}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Color
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingColor ? 'Edit Color' : 'Add Color'}</DialogTitle>
            <DialogDescription>
              {editingColor 
                ? 'Edit the color details below.' 
                : 'Fill in the color details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
              id="colorName"
              label="Color Name"
              placeholder="Enter color name..."
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />

             <MultilingualInput
               id="colorDescription"
               label="Description"
               placeholder="Enter color description..."
               value={formData.description}
               onChange={(value) => {
                 setFormData({ ...formData, description: value })
               }}
             />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Color Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., red, blue, metallic_silver"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to auto-generate from name
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color_picker">Color Value</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    id="color_picker"
                    value={formData.color_picker}
                    onChange={(e) => setFormData({ ...formData, color_picker: e.target.value })}
                    className="w-16 h-10 p-1 rounded border"
                  />
                  <Input
                    type="text"
                    value={formData.color_picker}
                    onChange={(e) => setFormData({ ...formData, color_picker: e.target.value })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a hex color value (e.g., #FF0000 for red)
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">{t('common.active')}</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {editingColor ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 