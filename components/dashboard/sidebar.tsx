"use client"

import type * as React from "react"
import {
  Car,
  BarChart3,
  Settings,
  Users,
  Tag,
  ImageIcon,
  FileText,
  Calendar,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Palette,
  Wrench,
  Clock,
  Percent,
  Package,
  Folder,
  Ruler,
  PenTool,
  BookOpen,
  Hash,
  MessageSquare,
  Globe,
  Mail,
  Share2,
  Layout,
  Eye,
  Archive,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarInput,
} from "@/components/ui/sidebar"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useI18n } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useActiveLanguages } from "@/lib/api/queries/languages"

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18n()
  const { currentLanguage, switchLanguage, isRTL } = useI18n()
  const { languages, loading, error, refetch } = useActiveLanguages()

  const getNavigationData = () => ({
    main: [
      {
        title: t('nav.dashboard'),
        url: "/dashboard",
        icon: BarChart3,
        badge: null,
      },
      {
        title: t('nav.cars'),
        icon: Car,
        items: [
          { title: t('nav.allCars'), url: "/dashboard/cars", badge: null },
          { title: t('nav.addCar'), url: "/dashboard/cars/new", badge: null },
          { title: t('nav.carVariants'), url: "/dashboard/variants", badge: null },
          { title: t('nav.specifications'), url: "/dashboard/cars/specifications", badge: null },
        ],
      },
      {
        title: t('nav.brandsModels'),
        icon: Tag,
        items: [
          { title: t('nav.brands'), url: "/dashboard/brands", badge: null },
          { title: t('nav.models'), url: "/dashboard/models", badge: null },
          { title: t('nav.trims'), url: "/dashboard/trims", badge: null },
          { title: t('nav.colors'), url: "/dashboard/colors", badge: null },
          { title: t('nav.years'), url: "/dashboard/years", badge: null },
        ],
      },
      {
        title: "Specifications",
        icon: Wrench,
        items: [
          { title: "Templates", url: "/dashboard/specifications/templates", badge: null },
          { title: "Attributes", url: "/dashboard/specifications/attributes", badge: null },
          { title: "Categories", url: "/dashboard/specifications/categories", badge: null },
          { title: "Units", url: "/dashboard/specifications/units", badge: null },
        ],
      },
      {
        title: t('nav.mediaManagement'),
        url: "/dashboard/media",
        icon: ImageIcon,
        badge: null,
      },
      {
        title: t('nav.offersPromotions'),
        icon: Percent,
        items: [
          { title: t('nav.allOffers'), url: "/dashboard/offers", badge: null },
          { title: t('nav.activeOffers'), url: "/dashboard/offers?status=active", badge: null },
          { title: t('nav.createOffer'), url: "/dashboard/offers/new", badge: null },
          { title: t('nav.expiredOffers'), url: "/dashboard/offers?status=expired", badge: null },
        ],
      },
      {
        title: t('nav.alromaiPosts'),
        icon: PenTool,
        items: [
          { title: t('nav.allPosts'), url: "/dashboard/posts", badge: null },
          { title: t('nav.createPost'), url: "/dashboard/posts/new", badge: null },
          { title: t('nav.draftPosts'), url: "/dashboard/posts/drafts", badge: null },
          { title: t('nav.categories'), url: "/dashboard/content/categories", badge: null },
          { title: t('nav.comments'), url: "/dashboard/content/comments", badge: null },
        ],
      },
    ],
    settings: [
      { title: t('nav.settings'), url: "/dashboard/settings", icon: Settings },
      { title: t('nav.apiSettings'), url: "/dashboard/settings/api", icon: Settings },
    ],
  })

  const navData = getNavigationData()

  return (
    <Sidebar variant="inset" {...props}
    dir={isRTL ? 'rtl' : 'ltr'}
    className={` fixed top-0 h-full z-50 transition-all duration-300 ${isRTL ? 'right-0' : 'left-0'}`}
      >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Car className="size-4" />
                </div>
                <div className={`grid flex-1 text-sm leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="truncate font-semibold">Alromaih Cars</span>
                  <span className="truncate text-xs">{t('common.dashboard')}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-2' : 'left-2'}`} />
          <SidebarInput placeholder={t('common.search') + '...'} className={isRTL ? 'pr-8' : 'pl-8'} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.dashboard')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronDown
                            className={`size-4 transition-transform group-data-[state=open]/collapsible:rotate-180 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                  {subItem.badge && (
                                    <Badge variant="secondary" className={isRTL ? 'mr-auto' : 'ml-auto'}>
                                      {subItem.badge}
                                    </Badge>
                                  )}
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url!}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className={isRTL ? 'mr-auto' : 'ml-auto'}>
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('common.settings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navData.settings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className={isRTL ? 'mr-auto' : 'ml-auto'}>
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('common.actions')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="h-8">
                <Plus className="size-3 mr-1" />
                {t('cars.addCar')}
              </Button>
              <Button size="sm" variant="outline" className="h-8">
                <ImageIcon className="size-3 mr-1" />
                {t('common.upload')}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <LanguageSwitcher variant="sidebar" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
