// GraphQL queries for AlromaihSystemSettings with full localization support

// Types for System Settings - Exact match to alromaih.system.settings schema
export interface SystemSettings {
  id?: number;
  
  // Website Basic Info
  website_name?: string;
  website_name_translations?: any; // Translations object
  logo_arabic?: string; // Binary field - base64 encoded
  logo_english?: string; // Binary field - base64 encoded  
  website_favicon?: string; // Binary field - base64 encoded
  
  // Contact Information
  company_phone?: string;
  company_phone_translations?: any;
  company_email?: string;
  company_email_translations?: any;
  company_address?: string;
  company_address_translations?: any;
  whatsapp_business_number?: string;
  customer_support_email?: string;
  
  // Business Information
  business_registration_number?: string;
  vat_number?: string;
  copyright_text?: string;
  copyright_text_translations?: any;
  
  // Business Hours
  business_hours_open?: string;
  business_hours_close?: string;
  business_days?: string;
  business_days_translations?: any;
  
  // Social Media
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;
  linkedin_url?: string;
  x_url?: string;
  
  // SEO Settings
  meta_title?: string;
  meta_title_translations?: any;
  meta_description?: string;
  meta_description_translations?: any;
  meta_keywords?: string;
  meta_keywords_translations?: any;
  
  // Analytics
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  tiktok_pixel_id?: string;
  meta_pixel_id?: string;
  snapchat_pixel_id?: string;
  linkedin_pixel_id?: string;
  x_pixel_id?: string;
  
  // Colors and Theme
  primary_color?: string;
  secondary_color?: string;
  
  // Mobile App Settings
  app_name?: string;
  app_name_translations?: any;
  app_logo?: string; // Binary field - base64 encoded
  app_splash_screen?: string; // Binary field - base64 encoded
  
  // App Store Links
  app_store_url?: string;
  play_store_url?: string;
  
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
  bunny_cdn_api_key?: string;
  hasura_api_key?: string;
  hasura_url?: string;
  hasura_admin_secret?: string;
  
  // App Content Settings
  cars_per_page?: number;
  featured_cars_limit?: number;
  
  // System Settings
  maintenance_mode?: boolean;
  
  // Performance Settings
  cache_duration?: number;
  
  // Security Settings
  session_timeout?: number;
  max_login_attempts?: number;
  ip_blocking_enabled?: boolean;
  
  // Bunny CDN Paths
  logo_arabic_bunny_path?: string;
  logo_english_bunny_path?: string;
  website_favicon_bunny_path?: string;
  app_logo_bunny_path?: string;
  app_splash_screen_bunny_path?: string;
  
  // CDN URL fields (computed/read-only)
  logo_arabic_cdn_url?: string;
  logo_english_cdn_url?: string;
  website_favicon_cdn_url?: string;
  app_logo_cdn_url?: string;
  app_splash_screen_cdn_url?: string;
  
  // System fields
  active?: boolean;
  display_name?: string;
  create_uid?: any;
  create_date?: string;
  write_uid?: any;
  write_date?: string;
}

// Branding Asset Management Types
export interface BrandingAssetStatus {
  exists: boolean;
  name: string;
  id?: number;
  url?: string;
  file_size?: number;
  upload_date?: string;
}

export interface BrandingAssetsSummary {
  total_required: number;
  total_uploaded: number;
  missing_count: number;
  completion_percentage: number;
}

export interface BrandingAssetsStatus {
  website_branding: Record<string, BrandingAssetStatus>;
  mobile_app: Record<string, BrandingAssetStatus>;
  summary: BrandingAssetsSummary;
}

export interface SocialMediaMetaTags {
  og_image?: string;
  twitter_image?: string;
  linkedin_image?: string;
  whatsapp_image?: string;
  favicon?: string;
  apple_touch_icon?: string;
  android_chrome_icon?: string;
  google_business_logo?: string;
}

// Binary file upload interface for handling image uploads
export interface BinaryFileUpload {
  field_name: string;
  file_data: string; // base64 encoded file data
  filename?: string;
  content_type?: string;
}

// Input interface for updates - matching AlromaihSystemSettingsValues
export interface SystemSettingsInput {
  // Website Basic Info with translations
  website_name?: string;
  website_name_translations?: any;
  logo_arabic?: string;
  logo_english?: string;
  website_favicon?: string;
  
  // Contact Information with translations
  company_phone?: string;
  company_phone_translations?: any;
  company_email?: string;
  company_email_translations?: any;
  company_address?: string;
  company_address_translations?: any;
  whatsapp_business_number?: string;
  customer_support_email?: string;
  
  // Business Information
  business_registration_number?: string;
  vat_number?: string;
  copyright_text?: string;
  copyright_text_translations?: any;
  
  // Business Hours
  business_hours_open?: string;
  business_hours_close?: string;
  business_days?: string;
  business_days_translations?: any;
  
  // Social Media
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  snapchat_url?: string;
  tiktok_url?: string;
  linkedin_url?: string;
  x_url?: string;
  
  // SEO with translations
  meta_title?: string;
  meta_title_translations?: any;
  meta_description?: string;
  meta_description_translations?: any;
  meta_keywords?: string;
  meta_keywords_translations?: any;
  
  // Analytics
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  tiktok_pixel_id?: string;
  meta_pixel_id?: string;
  snapchat_pixel_id?: string;
  linkedin_pixel_id?: string;
  x_pixel_id?: string;
  
  // Colors
  primary_color?: string;
  secondary_color?: string;
  
  // Mobile App with translations
  app_name?: string;
  app_name_translations?: any;
  app_logo?: string;
  app_splash_screen?: string;
  
  // App Store Links
  app_store_url?: string;
  play_store_url?: string;
  
  // App Version Control
  android_app_version?: string;
  android_min_version?: string;
  ios_app_version?: string;
  ios_min_version?: string;
  force_update?: boolean;
  
  // App Features
  enable_app_notifications?: boolean;
  enable_in_app_chat?: boolean;
  enable_car_comparison?: boolean;
  enable_app_booking?: boolean;
  enable_app_reviews?: boolean;
  
  // API Keys
  clerk_api_key?: string;
  push_notification_key?: string;
  bunny_cdn_api_key?: string;
  hasura_api_key?: string;
  hasura_url?: string;
  hasura_admin_secret?: string;
  
  // Content Settings
  cars_per_page?: number;
  featured_cars_limit?: number;
  
  // System Settings
  maintenance_mode?: boolean;
  cache_duration?: number;
  session_timeout?: number;
  max_login_attempts?: number;
  ip_blocking_enabled?: boolean;
}

// Localization interfaces
export interface FieldTranslation {
  [languageCode: string]: string;
}

export interface LocalizedField {
  value: string;
  translations: FieldTranslation;
}

// Language support
export const SUPPORTED_LANGUAGES = [
  { code: 'en_US', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ar_SA', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// ====================================
// GRAPHQL QUERIES
// ====================================

// Check if system settings exist (lightweight query)
export const CHECK_SYSTEM_SETTINGS_EXIST = `
  query CheckSystemSettingsExist {
    AlromaihSystemSettings(limit: 1) {
      id
      active
      display_name
    }
  }
`;

// Get all system settings including translations
export const GET_SYSTEM_SETTINGS_FULL = `
  query GetSystemSettingsFull($lang: String) {
    AlromaihSystemSettings(
      limit: 1
      context: { lang: $lang }
    ) {
      id
      display_name
      
      # Website Basic Info
      website_name
      website_name_translations
      meta_title
      meta_title_translations
      meta_description
      meta_description_translations
      meta_keywords
      meta_keywords_translations
      primary_color
      secondary_color
      
      # Contact Information
      company_phone
      company_phone_translations
      company_email
      company_email_translations
      company_address
      company_address_translations
      whatsapp_business_number
      customer_support_email
      
      # Business Information
      business_registration_number
      vat_number
      copyright_text
      copyright_text_translations
      
      # Business Hours
      business_hours_open
      business_hours_close
      business_days
      business_days_translations
      
      # Social Media
      facebook_url
      instagram_url
      youtube_url
      snapchat_url
      tiktok_url
      linkedin_url
      x_url
      
      # Analytics
      google_analytics_id
      google_tag_manager_id
      tiktok_pixel_id
      meta_pixel_id
      snapchat_pixel_id
      linkedin_pixel_id
      x_pixel_id
      
      # Mobile App Settings
      app_name
      app_name_translations
      app_store_url
      play_store_url
      android_app_version
      android_min_version
      ios_app_version
      ios_min_version
      force_update
      
      # App Features
      enable_app_notifications
      enable_in_app_chat
      enable_car_comparison
      enable_app_booking
      enable_app_reviews
      
      # API Keys
      clerk_api_key
      push_notification_key
      bunny_cdn_api_key
      hasura_api_key
      hasura_url
      hasura_admin_secret
      
      # Content Settings
      cars_per_page
      featured_cars_limit
      
      # System Settings
      maintenance_mode
      cache_duration
      session_timeout
      max_login_attempts
      ip_blocking_enabled
      
      # Bunny CDN Paths
      logo_arabic_bunny_path
      logo_english_bunny_path
      website_favicon_bunny_path
      app_logo_bunny_path
      app_splash_screen_bunny_path
      
      # CDN URLs (computed)
      logo_arabic_cdn_url
      logo_english_cdn_url
      website_favicon_cdn_url
      app_logo_cdn_url
      app_splash_screen_cdn_url
      
      # System fields
      active
      create_uid
      create_date
      write_uid
      write_date
    }
  }
`;

// Get system settings with binary data (separate query for performance)
export const GET_SYSTEM_SETTINGS_WITH_BINARY = `
  query GetSystemSettingsWithBinary {
    AlromaihSystemSettings(limit: 1) {
      id
      
      # Binary fields only
      logo_arabic
      logo_english
      website_favicon
      app_logo
      app_splash_screen
      
      # Include CDN URLs for fallback
      logo_arabic_cdn_url
      logo_english_cdn_url
      website_favicon_cdn_url
      app_logo_cdn_url
      app_splash_screen_cdn_url
      
      write_date
    }
  }
`;

// Get basic system settings (no binary, no translations for fast loading)
export const GET_SYSTEM_SETTINGS_BASIC = `
  query GetSystemSettingsBasic {
    AlromaihSystemSettings(limit: 1) {
      id
      display_name
      
      # Basic Info
      website_name
      primary_color
      secondary_color
      
      # Contact
      company_phone
      company_email
      company_address
      
      # Business
      business_registration_number
      vat_number
      
      # System
      active
      maintenance_mode
      
      write_date
    }
  }
`;

// ====================================
// UPDATE MUTATION
// ====================================

// Universal update mutation for all system settings
export const UPDATE_SYSTEM_SETTINGS = `
  mutation UpdateSystemSettings($id: Int!, $values: AlromaihSystemSettingsValues!) {
    updateAlromaihSystemSettings(id: $id, values: $values) {
      id
      display_name
      
      # Website Basic Info
      website_name
      website_name_translations
      logo_arabic
      logo_english
      website_favicon
      meta_title
      meta_title_translations
      meta_description
      meta_description_translations
      meta_keywords
      meta_keywords_translations
      primary_color
      secondary_color
      
      # Contact Information
      company_phone
      company_phone_translations
      company_email
      company_email_translations
      company_address
      company_address_translations
      whatsapp_business_number
      customer_support_email
      
      # Business Information
      business_registration_number
      vat_number
      copyright_text
      copyright_text_translations
      
      # Business Hours
      business_hours_open
      business_hours_close
      business_days
      business_days_translations
      
      # Social Media
      facebook_url
      instagram_url
      youtube_url
      snapchat_url
      tiktok_url
      linkedin_url
      x_url
      
      # Analytics
      google_analytics_id
      google_tag_manager_id
      tiktok_pixel_id
      meta_pixel_id
      snapchat_pixel_id
      linkedin_pixel_id
      x_pixel_id
      
      # Mobile App Settings
      app_name
      app_name_translations
      app_logo
      app_splash_screen
      app_store_url
      play_store_url
      android_app_version
      android_min_version
      ios_app_version
      ios_min_version
      force_update
      
      # App Features
      enable_app_notifications
      enable_in_app_chat
      enable_car_comparison
      enable_app_booking
      enable_app_reviews
      
      # API Keys
      clerk_api_key
      push_notification_key
      bunny_cdn_api_key
      hasura_api_key
      hasura_url
      hasura_admin_secret
      
      # Content Settings
      cars_per_page
      featured_cars_limit
      
      # System Settings
      maintenance_mode
      cache_duration
      session_timeout
      max_login_attempts
      ip_blocking_enabled
      
      # Bunny CDN Paths
      logo_arabic_bunny_path
      logo_english_bunny_path
      website_favicon_bunny_path
      app_logo_bunny_path
      app_splash_screen_bunny_path
      
      # CDN URLs (computed)
      logo_arabic_cdn_url
      logo_english_cdn_url
      website_favicon_cdn_url
      app_logo_cdn_url
      app_splash_screen_cdn_url
      
      # System fields
      active
      write_date
    }
  }
`;

// ====================================
// UTILITY FUNCTIONS
// ====================================

// Binary data utilities for handling base64 images
export const binaryDataUtils = {
  // Convert base64 to data URL for display
  toDataURL: (base64: string, mimeType: string = 'image/png'): string => {
    if (!base64) return '';

    // If it's already a data URL, return as-is
    if (base64.startsWith('data:')) {
      return base64;
    }

    // Add data URL prefix
    return `data:${mimeType};base64,${base64}`;
  },

  // Check if base64 data is valid
  isValidBase64: (base64: string): boolean => {
    if (!base64) return false;
    
    try {
      // Remove data URL prefix if present
      const cleanBase64 = base64.replace(/^data:.*,/, '');
      
      // Check if valid base64
      return btoa(atob(cleanBase64)) === cleanBase64;
    } catch {
      return false;
    }
  },

  // Get preview info for binary data
  getPreviewInfo: (base64: string, fieldName?: string) => {
    const hasData = Boolean(base64);
    const isValid = hasData ? binaryDataUtils.isValidBase64(base64) : false;
    
    return {
      hasData,
      isValid,
      dataURL: isValid ? binaryDataUtils.toDataURL(base64) : undefined,
      size: hasData ? Math.round((base64.length * 0.75) / 1024) : 0, // Approximate KB
      fieldName
    };
  }
};

// Logo reader utilities for handling logo URLs and display
export const logoReaderUtils = {
  // Get logo URL for display from settings data
  getLogoUrl: (settings: SystemSettings, field: 'logo_arabic' | 'logo_english' | 'website_favicon' | 'app_logo' | 'app_splash_screen'): string | undefined => {
    if (!settings) return undefined;
    
    // Check if there's a CDN URL first
    const cdnField = `${field}_cdn_url` as keyof SystemSettings;
    const cdnUrl = settings[cdnField] as string;
    if (cdnUrl) {
      return cdnUrl;
    }
    
    // Fallback to base64 data URL
    const binaryData = settings[field] as string;
    if (binaryData) {
      return binaryDataUtils.toDataURL(binaryData);
    }
    
    return undefined;
  },

  // Get all logo URLs from settings
  getAllLogoUrls: (settings: SystemSettings) => {
    const fields: Array<'logo_arabic' | 'logo_english' | 'website_favicon' | 'app_logo' | 'app_splash_screen'> = [
      'logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen'
    ];
    
    const urls: Record<string, string | undefined> = {};
    fields.forEach(field => {
      urls[field] = logoReaderUtils.getLogoUrl(settings, field);
    });
    
    return urls;
  },

  // Check if logo is available
  hasLogo: (settings: SystemSettings, field: 'logo_arabic' | 'logo_english' | 'website_favicon' | 'app_logo' | 'app_splash_screen'): boolean => {
    return Boolean(logoReaderUtils.getLogoUrl(settings, field));
  }
};

// Localization utilities
export const localizationUtils = {
  // Get localized value with fallback
  getLocalizedValue: (
    baseValue: string, 
    translations: any, 
    language: LanguageCode = 'en_US'
  ): string => {
    if (!translations || typeof translations !== 'object') {
      return baseValue || '';
    }
    
    // Try requested language first
    if (translations[language]) {
      return translations[language];
    }
    
    // Fallback to base value
    return baseValue || '';
  },

  // Set translation for a field
  setTranslation: (
    existingTranslations: any, 
    language: LanguageCode, 
    value: string
  ): any => {
    const translations = existingTranslations || {};
    return {
      ...translations,
      [language]: value
    };
  },

  // Get all available translations for a field
  getAllTranslations: (baseValue: string, translations: any): FieldTranslation => {
    const result: FieldTranslation = {};
    
    // Add base value as English if not in translations
    if (baseValue) {
      result['en_US'] = baseValue;
    }
    
    // Add all existing translations
    if (translations && typeof translations === 'object') {
      Object.assign(result, translations);
    }
    
    return result;
  },

  // Check if translations exist for any language
  hasTranslations: (translations: any): boolean => {
    return translations && 
           typeof translations === 'object' && 
           Object.keys(translations).length > 0;
  }
};

// File upload utilities
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 data
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
        });
      };

// Default settings factory - returns empty object (no static data)
export const getDefaultSettings = (): SystemSettings => ({
  // All data should come from the server
});

// Error handling helper
export const handleGraphQLResponse = <T>(response: any, queryName: string): T | null => {
  if (response.errors) {
    console.error(`GraphQL Error in ${queryName}:`, response.errors);
    throw new Error(`${queryName} failed: ${response.errors[0]?.message}`);
      }
      
  if (!response.data) {
    console.error(`No data returned from ${queryName}`);
    return null;
    }
    
  return response.data;
}; 