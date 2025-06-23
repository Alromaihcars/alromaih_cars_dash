// GraphQL queries as template strings (no external dependencies needed)

// Types for System Settings
export interface SystemSettings {
  id?: number;
  // Website Basic Info
  website_name?: string;
  website_logo?: string;
  website_favicon?: string;
  
  // Contact Information
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  
  // Social Media
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  
  // SEO Settings
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  
  // Analytics
  google_analytics_id?: string;
  tiktok_pixel_id?: string;
  meta_pixel_id?: string;
  snapchat_pixel_id?: string;
  linkedin_pixel_id?: string;
  x_pixel_id?: string;
  
  // Colors and Theme
  primary_color?: string;
  secondary_color?: string;
  
  // Footer Settings
  footer_text?: string;
  
  // Mobile App Settings - App Branding
  app_name?: string;
  app_logo?: string;
  app_splash_screen?: string;
  
  // App Theme
  app_primary_color?: string;
  app_secondary_color?: string;
  
  // App Version Control
  android_app_version?: string;
  android_min_version?: string;
  ios_app_version?: string;
  ios_min_version?: string;
  force_update?: boolean;
  
  // App Feature Toggles
  enable_app_notifications?: boolean;
  enable_in_app_chat?: boolean;
  enable_car_comparison?: boolean;
  enable_app_booking?: boolean;
  enable_app_reviews?: boolean;
  
  // App API Keys
  clerk_api_key?: string;
  push_notification_key?: string;
  
  // App Analytics
  app_analytics_enabled?: boolean;
  firebase_analytics_id?: string;
  
  // App Content Settings
  cars_per_page?: number;
}

// Query to get system settings - Updated with MCP confirmed fields
export const GET_SYSTEM_SETTINGS = `
  query GetSystemSettings {
    AlromaihSystemSettings(limit: 10) {
      id
      active
      display_name
      
      # Website Fields
      website_name
      website_logo
      website_favicon
      meta_title
      meta_description
      meta_keywords
      primary_color
      secondary_color
      footer_text
      cars_per_page
      enable_car_comparison
      
      # Company Fields
      company_phone
      company_email
      company_address
      
      # Social Media Fields
      facebook_url
      twitter_url
      instagram_url
      youtube_url
      
      # Analytics Fields
      google_analytics_id
      meta_pixel_id
      linkedin_pixel_id
      snapchat_pixel_id
      tiktok_pixel_id
      x_pixel_id
      
      # Mobile App Fields
      app_name
      app_logo
      app_splash_screen
      app_primary_color
      app_secondary_color
      android_app_version
      android_min_version
      ios_app_version
      ios_min_version
      force_update
      enable_app_notifications
      enable_in_app_chat
      enable_app_booking
      enable_app_reviews
      app_analytics_enabled
      firebase_analytics_id
      
      # Authentication Fields
      clerk_api_key
      push_notification_key
      
      # System Fields
      create_date
      write_date
    }
  }
`;

// Query to get system settings by ID
export const GET_SYSTEM_SETTINGS_BY_ID = `
  query GetSystemSettingsById($id: String!) {
    AlromaihSystemSettings(id: $id, domain: "") {
      id
      active
      android_app_version
      android_min_version
      app_analytics_enabled
      app_logo
      app_name @multiLang
      app_secondary_color
      app_primary_color
      app_splash_screen
      cars_per_page
      clerk_api_key
      company_address @multiLang
      company_email
      create_date
      company_phone
      display_name @multiLang
      enable_app_booking
      enable_app_notifications
      enable_app_reviews
      enable_car_comparison
      enable_in_app_chat
      facebook_url
      firebase_analytics_id
      footer_text @multiLang
      force_update
      google_analytics_id
      instagram_url
      ios_min_version
      ios_app_version
      linkedin_pixel_id
      meta_description @multiLang
      meta_keywords @multiLang
      meta_pixel_id
      meta_title @multiLang
      primary_color
      push_notification_key
      secondary_color
      snapchat_pixel_id
      tiktok_pixel_id
      twitter_url
      website_favicon
      website_logo
      website_name @multiLang
      write_date
      x_pixel_id
      youtube_url
    }
  }
`;

// Mutation to create system settings - Odoo EasyGraphQL format
export const CREATE_SYSTEM_SETTINGS = `
  mutation CreateSystemSettings($values: AlromaihSystemSettingsValues!) {
    AlromaihSystemSettings(AlromaihSystemSettingsValues: $values) {
      id
      display_name
      active
      website_name
      app_name
      create_date
      write_date
    }
  }
`;

// Mutation to update system settings - Odoo EasyGraphQL format
export const UPDATE_SYSTEM_SETTINGS = `
  mutation UpdateSystemSettings($id: String!, $values: AlromaihSystemSettingsValues!) {
    AlromaihSystemSettings(id: $id, AlromaihSystemSettingsValues: $values) {
      id
      display_name
      active
      website_name
      app_name
      write_date
    }
  }
`;

// Mutation to delete system settings
export const DELETE_SYSTEM_SETTINGS = `
  mutation DeleteSystemSettings($id: String!) {
    AlromaihSystemSettings(id: $id, AlromaihSystemSettingsValues: { active: false }) {
      id
      display_name @multiLang
      active
    }
  }
`;

// TypeScript interfaces for system settings - Updated to handle Odoo data structure
export interface AlromaihSystemSettings {
  id: string | number;
  active: boolean | string;
  display_name: string | false;
  
  // Website Fields
  website_name: string | false;
  website_logo: string | false;
  website_favicon: string | false;
  meta_title: string | false;
  meta_description: string | false;
  meta_keywords: string | false;
  primary_color: string | false;
  secondary_color: string | false;
  footer_text: string | false;
  cars_per_page: number | string | false;
  enable_car_comparison: boolean | string | false;
  
  // Company Fields
  company_phone: string | false;
  company_email: string | false;
  company_address: string | false;
  
  // Social Media Fields
  facebook_url: string | false;
  twitter_url: string | false;
  instagram_url: string | false;
  youtube_url: string | false;
  
  // Analytics Fields
  google_analytics_id: string | false;
  meta_pixel_id: string | false;
  linkedin_pixel_id: string | false;
  snapchat_pixel_id: string | false;
  tiktok_pixel_id: string | false;
  x_pixel_id: string | false;
  
  // Mobile App Fields
  app_name: string | false;
  app_logo: string | false;
  app_splash_screen: string | false;
  app_primary_color: string | false;
  app_secondary_color: string | false;
  android_app_version: string | false;
  android_min_version: string | false;
  ios_app_version: string | false;
  ios_min_version: string | false;
  force_update: boolean | string | false;
  enable_app_notifications: boolean | string | false;
  enable_in_app_chat: boolean | string | false;
  enable_app_booking: boolean | string | false;
  enable_app_reviews: boolean | string | false;
  app_analytics_enabled: boolean | string | false;
  firebase_analytics_id: string | false;
  
  // Authentication Fields
  clerk_api_key: string | false;
  push_notification_key: string | false;
  
  // System Fields
  create_date: string;
  write_date: string;
}

// Input interface for mutations - Clean data types for sending to Odoo
export interface AlromaihSystemSettingsInput {
  active?: boolean;
  display_name?: string;
  
  // Website Fields
  website_name?: string;
  website_logo?: string;
  website_favicon?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  primary_color?: string;
  secondary_color?: string;
  footer_text?: string;
  cars_per_page?: number;
  enable_car_comparison?: boolean;
  
  // Company Fields
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  
  // Social Media Fields
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  
  // Analytics Fields
  google_analytics_id?: string;
  meta_pixel_id?: string;
  linkedin_pixel_id?: string;
  snapchat_pixel_id?: string;
  tiktok_pixel_id?: string;
  x_pixel_id?: string;
  
  // Mobile App Fields
  app_name?: string;
  app_logo?: string;
  app_splash_screen?: string;
  app_primary_color?: string;
  app_secondary_color?: string;
  android_app_version?: string;
  android_min_version?: string;
  ios_app_version?: string;
  ios_min_version?: string;
  force_update?: boolean;
  enable_app_notifications?: boolean;
  enable_in_app_chat?: boolean;
  enable_app_booking?: boolean;
  enable_app_reviews?: boolean;
  app_analytics_enabled?: boolean;
  firebase_analytics_id?: string;
  
  // Authentication Fields
  clerk_api_key?: string;
  push_notification_key?: string;
}

// Legacy alias for backward compatibility
export interface AlromaihSystemSettingsValues extends AlromaihSystemSettingsInput {}

// Helper function to get current language context
const getCurrentLanguageContext = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check document direction
    const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar'
    if (isRTL) return 'ar_001'
    
    // Check localStorage or other client-side language indicators
    const storedLang = localStorage.getItem('language') || localStorage.getItem('locale')
    if (storedLang === 'ar' || storedLang === 'ar_001') return 'ar_001'
    if (storedLang === 'en' || storedLang === 'en_US') return 'en_US'
  }
  
  // Default to Arabic as primary language
  return 'ar_001'
}

// Helper function to get localized text with Arabic priority
// Handles Odoo's return of `false` for empty fields
export const getLocalizedText = (field: any, languageCode?: string): string => {
  if (!field || field === false) return ""
  if (typeof field === "string") return field
  
  // Use provided language or detect current context
  const targetLang = languageCode || getCurrentLanguageContext()
  
  if (typeof field === "object" && field !== null) {
    const obj = field as { [key: string]: string }
    
    // Arabic-first logic: if Arabic is requested or detected, prioritize Arabic
    if (targetLang === 'ar_001' && obj.ar_001) {
      return obj.ar_001
    }
    
    // If English is specifically requested
    if (targetLang === 'en_US' && obj.en_US) {
      return obj.en_US
    }
    
    // Fallback priority: Arabic first, then English, then any available
    return obj.ar_001 || obj.en_US || Object.values(obj)[0] || ""
  }
  return String(field)
}

// Helper function to convert Odoo boolean values
export const getOdooBoolean = (field: any): boolean => {
  if (field === false || field === 'false' || field === '' || field === null || field === undefined) {
    return false
  }
  if (field === true || field === 'true') {
    return true
  }
  return Boolean(field)
}

// Helper function to convert Odoo number values
export const getOdooNumber = (field: any, defaultValue: number = 0): number => {
  if (field === false || field === null || field === undefined || field === '') {
    return defaultValue
  }
  const num = Number(field)
  return isNaN(num) ? defaultValue : num
}

// Website-specific settings groups
export const WEBSITE_SETTINGS_GROUPS = {
  general: {
    label: 'General Website Settings',
    icon: '🌐',
    fields: ['website_name', 'website_logo', 'website_favicon', 'meta_title', 'meta_description', 'meta_keywords']
  },
  appearance: {
    label: 'Website Appearance',
    icon: '🎨',
    fields: ['primary_color', 'secondary_color', 'footer_text']
  },
  company: {
    label: 'Company Information',
    icon: '🏢',
    fields: ['company_email', 'company_phone', 'company_address']
  },
  social: {
    label: 'Social Media Links',
    icon: '📱',
    fields: ['facebook_url', 'instagram_url', 'twitter_url', 'youtube_url']
  },
  analytics: {
    label: 'Analytics & Tracking',
    icon: '📊',
    fields: ['google_analytics_id', 'meta_pixel_id', 'linkedin_pixel_id', 'snapchat_pixel_id', 'tiktok_pixel_id', 'x_pixel_id']
  },
  features: {
    label: 'Website Features',
    icon: '⚙️',
    fields: ['enable_car_comparison', 'cars_per_page']
  }
}

// Mobile app-specific settings groups
export const MOBILE_SETTINGS_GROUPS = {
  general: {
    label: 'General App Settings',
    icon: '📱',
    fields: ['app_name', 'app_logo', 'app_splash_screen']
  },
  appearance: {
    label: 'App Appearance',
    icon: '🎨',
    fields: ['app_primary_color', 'app_secondary_color']
  },
  versions: {
    label: 'App Versions',
    icon: '📋',
    fields: ['android_app_version', 'android_min_version', 'ios_app_version', 'ios_min_version', 'force_update']
  },
  features: {
    label: 'App Features',
    icon: '⚡',
    fields: ['enable_app_booking', 'enable_app_notifications', 'enable_app_reviews', 'enable_in_app_chat']
  },
  analytics: {
    label: 'App Analytics',
    icon: '📈',
    fields: ['app_analytics_enabled', 'firebase_analytics_id']
  },
  notifications: {
    label: 'Push Notifications',
    icon: '🔔',
    fields: ['push_notification_key']
  },
  authentication: {
    label: 'Authentication',
    icon: '🔐',
    fields: ['clerk_api_key']
  }
}

// Field configurations with validation and display info
export const FIELD_CONFIGS: Record<string, {
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'color' | 'boolean' | 'file';
  placeholder?: string;
  description?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}> = {
  // Website Fields
  website_name: {
    label: 'Website Name',
    type: 'text',
    placeholder: 'Enter website name',
    description: 'The name of your website displayed in browser titles'
  },
  website_logo: {
    label: 'Website Logo',
    type: 'file',
    description: 'Upload your website logo (recommended: PNG, 200x50px)'
  },
  website_favicon: {
    label: 'Website Favicon',
    type: 'file',
    description: 'Upload your favicon (recommended: ICO or PNG, 32x32px)'
  },
  meta_title: {
    label: 'Meta Title',
    type: 'text',
    placeholder: 'Enter meta title for SEO',
    description: 'Title tag for search engines (50-60 characters)'
  },
  meta_description: {
    label: 'Meta Description',
    type: 'textarea',
    placeholder: 'Enter meta description for SEO',
    description: 'Description for search engines (150-160 characters)'
  },
  meta_keywords: {
    label: 'Meta Keywords',
    type: 'text',
    placeholder: 'Enter keywords separated by commas',
    description: 'Keywords for search engines (comma-separated)'
  },
  primary_color: {
    label: 'Primary Color',
    type: 'color',
    description: 'Main brand color for your website'
  },
  secondary_color: {
    label: 'Secondary Color',
    type: 'color',
    description: 'Secondary brand color for accents'
  },
  footer_text: {
    label: 'Footer Text',
    type: 'textarea',
    placeholder: 'Enter footer text',
    description: 'Text displayed in the website footer'
  },
  
  // Company Fields
  company_email: {
    label: 'Company Email',
    type: 'email',
    placeholder: 'contact@example.com',
    description: 'Main contact email address'
  },
  company_phone: {
    label: 'Company Phone',
    type: 'text',
    placeholder: '+1 (555) 123-4567',
    description: 'Main contact phone number'
  },
  company_address: {
    label: 'Company Address',
    type: 'textarea',
    placeholder: 'Enter company address',
    description: 'Full company address'
  },
  
  // Social Media
  facebook_url: {
    label: 'Facebook URL',
    type: 'url',
    placeholder: 'https://facebook.com/yourpage',
    description: 'Link to your Facebook page'
  },
  instagram_url: {
    label: 'Instagram URL',
    type: 'url',
    placeholder: 'https://instagram.com/yourpage',
    description: 'Link to your Instagram page'
  },
  twitter_url: {
    label: 'Twitter URL',
    type: 'url',
    placeholder: 'https://twitter.com/yourpage',
    description: 'Link to your Twitter page'
  },
  youtube_url: {
    label: 'YouTube URL',
    type: 'url',
    placeholder: 'https://youtube.com/yourchannel',
    description: 'Link to your YouTube channel'
  },
  
  // Analytics
  google_analytics_id: {
    label: 'Google Analytics ID',
    type: 'text',
    placeholder: 'GA-XXXXXXXXX-X',
    description: 'Google Analytics tracking ID'
  },
  meta_pixel_id: {
    label: 'Meta Pixel ID',
    type: 'text',
    placeholder: 'Enter Meta (Facebook) Pixel ID',
    description: 'Meta Pixel for Facebook advertising'
  },
  linkedin_pixel_id: {
    label: 'LinkedIn Pixel ID',
    type: 'text',
    placeholder: 'Enter LinkedIn Pixel ID',
    description: 'LinkedIn Insight Tag ID'
  },
  snapchat_pixel_id: {
    label: 'Snapchat Pixel ID',
    type: 'text',
    placeholder: 'Enter Snapchat Pixel ID',
    description: 'Snapchat Pixel for advertising'
  },
  tiktok_pixel_id: {
    label: 'TikTok Pixel ID',
    type: 'text',
    placeholder: 'Enter TikTok Pixel ID',
    description: 'TikTok Pixel for advertising'
  },
  x_pixel_id: {
    label: 'X (Twitter) Pixel ID',
    type: 'text',
    placeholder: 'Enter X Pixel ID',
    description: 'X (formerly Twitter) Pixel ID'
  },
  
  // Website Features
  enable_car_comparison: {
    label: 'Enable Car Comparison',
    type: 'boolean',
    description: 'Allow users to compare cars on the website'
  },
  cars_per_page: {
    label: 'Cars Per Page',
    type: 'number',
    placeholder: '12',
    description: 'Number of cars to display per page',
    validation: { min: 1, max: 100 }
  },
  
  // Mobile App Fields
  app_name: {
    label: 'App Name',
    type: 'text',
    placeholder: 'Enter mobile app name',
    description: 'Name of your mobile application'
  },
  app_logo: {
    label: 'App Logo',
    type: 'file',
    description: 'Upload your app logo (recommended: PNG, 1024x1024px)'
  },
  app_splash_screen: {
    label: 'App Splash Screen',
    type: 'file',
    description: 'Upload splash screen image (recommended: PNG, 1080x1920px)'
  },
  app_primary_color: {
    label: 'App Primary Color',
    type: 'color',
    description: 'Main brand color for your mobile app'
  },
  app_secondary_color: {
    label: 'App Secondary Color',
    type: 'color',
    description: 'Secondary brand color for app accents'
  },
  
  // App Versions
  android_app_version: {
    label: 'Android App Version',
    type: 'text',
    placeholder: '1.0.0',
    description: 'Current Android app version'
  },
  android_min_version: {
    label: 'Android Minimum Version',
    type: 'text',
    placeholder: '1.0.0',
    description: 'Minimum Android app version required'
  },
  ios_app_version: {
    label: 'iOS App Version',
    type: 'text',
    placeholder: '1.0.0',
    description: 'Current iOS app version'
  },
  ios_min_version: {
    label: 'iOS Minimum Version',
    type: 'text',
    placeholder: '1.0.0',
    description: 'Minimum iOS app version required'
  },
  force_update: {
    label: 'Force Update',
    type: 'boolean',
    description: 'Require users to update to the latest version'
  },
  
  // App Features
  enable_app_booking: {
    label: 'Enable App Booking',
    type: 'boolean',
    description: 'Allow users to book appointments through the app'
  },
  enable_app_notifications: {
    label: 'Enable App Notifications',
    type: 'boolean',
    description: 'Enable push notifications in the app'
  },
  enable_app_reviews: {
    label: 'Enable App Reviews',
    type: 'boolean',
    description: 'Allow users to leave reviews in the app'
  },
  enable_in_app_chat: {
    label: 'Enable In-App Chat',
    type: 'boolean',
    description: 'Enable chat functionality in the app'
  },
  
  // App Analytics
  app_analytics_enabled: {
    label: 'Enable App Analytics',
    type: 'boolean',
    description: 'Enable analytics tracking in the mobile app'
  },
  firebase_analytics_id: {
    label: 'Firebase Analytics ID',
    type: 'text',
    placeholder: 'Enter Firebase Analytics ID',
    description: 'Firebase Analytics project ID'
  },
  
  // Notifications
  push_notification_key: {
    label: 'Push Notification Key',
    type: 'text',
    placeholder: 'Enter push notification key',
    description: 'Server key for push notifications'
  },
  
  // Authentication
  clerk_api_key: {
    label: 'Clerk API Key',
    type: 'text',
    placeholder: 'Enter Clerk API key',
    description: 'Clerk authentication API key'
  },
  
  // General
  active: {
    label: 'Active',
    type: 'boolean',
    description: 'Enable or disable these settings'
  },
  display_name: {
    label: 'Display Name',
    type: 'text',
    placeholder: 'Enter display name',
    description: 'Display name for these settings'
  }
}

// Validation helper functions
export const validateField = (fieldName: string, value: any): string | null => {
  const config = FIELD_CONFIGS[fieldName]
  if (!config) return null
  
  const validation = config.validation
  if (!validation) return null
  
  if (validation.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${config.label} is required`
  }
  
  if (config.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Invalid email format'
  }
  
  if (config.type === 'url' && value && !/^https?:\/\/.+/.test(value)) {
    return 'Invalid URL format (must start with http:// or https://)'
  }
  
  if (config.type === 'number' && value !== undefined && value !== null) {
    const num = Number(value)
    if (isNaN(num)) {
      return 'Must be a valid number'
    }
    if (validation.min !== undefined && num < validation.min) {
      return `Must be at least ${validation.min}`
    }
    if (validation.max !== undefined && num > validation.max) {
      return `Must be at most ${validation.max}`
    }
  }
  
  if (validation.pattern && value && !new RegExp(validation.pattern).test(value)) {
    return 'Invalid format'
  }
  
  return null
}

// Form validation helper
export const validateForm = (data: AlromaihSystemSettingsValues, fields: string[]): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  fields.forEach(fieldName => {
    const error = validateField(fieldName, data[fieldName as keyof AlromaihSystemSettingsValues])
    if (error) {
      errors[fieldName] = error
    }
  })
  
  return errors
}

// Helper function to get default settings
export const getDefaultSettings = (): SystemSettings => ({
  website_name: "Alromaih Cars",
  company_phone: "+966 11 123 4567",
  company_email: "info@alromaihcars.com",
  company_address: "Riyadh, Saudi Arabia",
  meta_title: "Alromaih Cars - Premium Automotive Dealership",
  meta_description: "Discover premium cars at Alromaih Cars, your trusted automotive partner in Saudi Arabia",
  primary_color: "#0056b3",
  secondary_color: "#6c757d",
  footer_text: "© 2024 Alromaih Cars. All rights reserved.",
  app_name: "Alromaih Cars",
  app_primary_color: "#0056b3",
  app_secondary_color: "#6c757d",
  android_app_version: "1.0.0",
  android_min_version: "1.0.0",
  ios_app_version: "1.0.0",
  ios_min_version: "1.0.0",
  force_update: false,
  enable_app_notifications: true,
  enable_in_app_chat: true,
  enable_car_comparison: true,
  enable_app_booking: true,
  enable_app_reviews: true,
  app_analytics_enabled: true,
  cars_per_page: 10,
}); 