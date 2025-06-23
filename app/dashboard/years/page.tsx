"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Calendar, Eye, EyeOff } from "lucide-react"
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
  GET_CAR_YEARS,
  CREATE_CAR_YEAR, 
  UPDATE_CAR_YEAR, 
  DELETE_CAR_YEAR,
  createCarYearValues,
  getDisplayName,
  getYearValue
} from "@/lib/api/queries/car-years"

interface Translation {
  en_US: string
  ar_001: string
}

interface CarYear {
  id: number
  name: Translation | string
  description?: Translation | string
  display_name?: string
  active: boolean
  create_date: string
  write_date: string
}

export default function YearsPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { addNotification, NotificationContainer } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [years, setYears] = useState<CarYear[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<CarYear | null>(null)
  const [formData, setFormData] = useState({
    name: { en_US: "", ar_001: "" },
    description: { en_US: "", ar_001: "" },
    active: true
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchYears()
    }
  }, [mounted, showInactive])

  const fetchYears = async () => {
    try {
      setLoading(true)
      const data = await gql(GET_CAR_YEARS)

      if (data?.CarYear) {
        const filteredYears = data.CarYear.filter((year: CarYear) => 
          showInactive ? true : year.active
        )
        
        // Sort years by numeric value extracted from name (descending)
        const sortedYears = filteredYears.sort((a: CarYear, b: CarYear) => {
          const aValue = getYearValue(a as any)
          const bValue = getYearValue(b as any)
          return bValue - aValue
        })
        
        setYears(sortedYears)
      }
    } catch (error) {
      console.error("Error fetching years:", error)
      toast({
        title: t('common.error'),
        description: "Failed to fetch car years",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.en_US) {
      toast({
        title: t('common.error'),
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Validate year format (should be a 4-digit number)
    const yearName = formData.name.en_US.trim()
    if (!/^\d{4}$/.test(yearName)) {
      toast({
        title: t('common.error'),
        description: "Year must be a 4-digit number (e.g., 2024)",
        variant: "destructive"
      })
      return
    }

    const yearValue = parseInt(yearName)
    if (yearValue < 1900 || yearValue > 2100) {
      toast({
        title: t('common.error'),
        description: "Year must be between 1900 and 2100",
        variant: "destructive"
      })
      return
    }

    try {
      const values = createCarYearValues(
        formData.name,
        formData.description,
        formData.active
      )

      if (editingYear) {
        await gqlMutate(UPDATE_CAR_YEAR, {
          id: String(editingYear.id),
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Year updated successfully"
        })
      } else {
        await gqlMutate(CREATE_CAR_YEAR, {
          values
        })
        
        toast({
          title: t('common.success'),
          description: "Year created successfully"
        })
      }

      // Reset form and refresh data
      setFormData({ 
        name: { en_US: "", ar_001: "" },
        description: { en_US: "", ar_001: "" },
        active: true 
      })
      setEditingYear(null)
      setIsDialogOpen(false)
      await fetchYears()
    } catch (error) {
      console.error('Error submitting year:', error)
      toast({
        title: t('common.error'),
        description: editingYear ? "Failed to update year" : "Failed to create year",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (year: CarYear) => {
    setEditingYear(year)
    
    // Convert the year data to form format
    let nameData = { en_US: '', ar_001: '' }
    let descriptionData = { en_US: '', ar_001: '' }
    
    if (typeof year.name === 'object' && year.name !== null) {
      nameData = {
        en_US: (year.name as any).en_US || '',
        ar_001: (year.name as any).ar_001 || ''
      }
    } else if (typeof year.name === 'string') {
      nameData = {
        en_US: year.name,
        ar_001: ''
      }
    }

    if (typeof year.description === 'object' && year.description !== null) {
      descriptionData = {
        en_US: (year.description as any).en_US || '',
        ar_001: (year.description as any).ar_001 || ''
      }
    } else if (typeof year.description === 'string') {
      descriptionData = {
        en_US: year.description,
        ar_001: ''
      }
    }
    
    setFormData({
      name: nameData,
      description: descriptionData,
      active: year.active
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (year: CarYear) => {
    const displayName = getDisplayName(year as any) || 'this year'
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return
    }

    try {
      await gqlMutate(DELETE_CAR_YEAR, {
        id: String(year.id)
      })
      
      toast({
        title: t('common.success'),
        description: "Year deleted successfully"
      })
      
      await fetchYears()
    } catch (error) {
      console.error('Error deleting year:', error)
      toast({
        title: t('common.error'),
        description: "Failed to delete year. It may be used by existing cars.",
        variant: "destructive"
      })
    }
  }

  const handleNewYear = () => {
    setEditingYear(null)
    const currentYear = new Date().getFullYear()
    setFormData({ 
      name: { en_US: currentYear.toString(), ar_001: "" },
      description: { en_US: "", ar_001: "" },
      active: true 
    })
    setIsDialogOpen(true)
  }

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 10
    const endYear = currentYear + 2
    const yearRange = []
    
    for (let year = endYear; year >= startYear; year--) {
      yearRange.push(year)
    }
    return yearRange
  }

  const quickAddCommonYears = async () => {
    const currentYear = new Date().getFullYear()
    const yearsToAdd = [currentYear + 1, currentYear, currentYear - 1]
    
    try {
      for (const year of yearsToAdd) {
        const yearExists = years.some(y => {
          const yearName = typeof y.name === 'object' ? y.name.en_US : y.name
          return yearName === year.toString()
        })
        
        if (!yearExists) {
          const values = createCarYearValues(
            { en_US: year.toString(), ar_001: year.toString() },
            undefined,
            true
          )
          
          await gqlMutate(CREATE_CAR_YEAR, { values })
        }
      }
      
      toast({
        title: t('common.success'),
        description: "Common years added successfully"
      })
      await fetchYears()
    } catch (error) {
      console.error('Error creating years:', error)
      toast({
        title: t('common.error'),
        description: "Failed to add some years",
        variant: "destructive"
      })
    }
  }

  const filteredYears = years.filter(year => {
    const searchLower = searchTerm.toLowerCase()
    
    let enName = ''
    let arName = ''
    
    if (typeof year.name === 'object' && year.name !== null) {
      enName = (year.name as any).en_US || ''
      arName = (year.name as any).ar_001 || ''
    } else if (typeof year.name === 'string') {
      enName = year.name
    }
    
    return (
      enName.toLowerCase().includes(searchLower) ||
      arName.toLowerCase().includes(searchLower)
    )
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
            <CardTitle>Car Years</CardTitle>
            <CardDescription>Manage available car model years</CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={quickAddCommonYears}>
              <Calendar className="mr-2 h-4 w-4" />
              Quick Add Years
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchYears()}>
              Refresh
            </Button>
            <Button onClick={handleNewYear}>
              <Plus className="mr-2 h-4 w-4" />
              Add Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search years..."
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
                  <p className="mt-2 text-sm text-muted-foreground">Loading years...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredYears.map((year) => {
                    const displayName = getDisplayName(year as any)
                    const enName = typeof year.name === 'object' ? year.name.en_US : year.name
                    const arName = typeof year.name === 'object' ? year.name.ar_001 : ''
                    const enDesc = typeof year.description === 'object' ? year.description.en_US : year.description
                    const arDesc = typeof year.description === 'object' ? year.description.ar_001 : ''
                    const yearValue = getYearValue(year as any)
                    
                    return (
                      <TableRow key={year.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{enName}</div>
                              {arName && arName !== enName && (
                                <div className="text-sm text-muted-foreground" dir="rtl">
                                  {arName}
                                </div>
                              )}
                              {yearValue > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Year: {yearValue}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {enDesc && <div className="text-sm">{enDesc}</div>}
                            {arDesc && arDesc !== enDesc && (
                              <div className="text-sm text-muted-foreground" dir="rtl">
                                {arDesc}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={year.active ? "default" : "secondary"}>
                            {year.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(year.create_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(year)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(year)}
                              disabled={!year.active}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingYear ? "Edit Year" : "Add Year"}
            </DialogTitle>
            <DialogDescription>
              {editingYear 
                ? "Edit the year details below." 
                : "Fill in the year details below."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
              id="yearName"
              label="Year Name"
              placeholder="Enter year (e.g., 2024)"
              value={formData.name}
              onChange={(value) => {
                setFormData({ ...formData, name: value })
              }}
              required
            />

            <div className="space-y-2">
              <Label>Quick Year Selection</Label>
              <div className="flex flex-wrap gap-1">
                {generateYearRange().map((year) => (
                  <Button
                    key={year}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setFormData({ 
                      ...formData, 
                      name: { 
                        en_US: year.toString(), 
                        ar_001: formData.name.ar_001 || year.toString() 
                      }
                    })}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            <MultilingualInput
              id="yearDescription"
              label="Year Description"
              placeholder="Enter year description..."
              value={formData.description}
              onChange={(value) => {
                setFormData({ ...formData, description: value })
              }}
            />
            
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
                {editingYear ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <NotificationContainer />
    </div>
  )
} 