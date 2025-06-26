// Query to get all car media with full details
export const GET_CAR_MEDIA = `
  query GetCarMedia($domain: [String], $limit: Int, $offset: Int, $order: String) {
    AlromaihCarMedia(domain: $domain, limit: $limit, offset: $offset, order: $order) {
      id
      name
      car_id {
        id
        name
        display_name
        model_id {
          id
          name
        }
        brand_id {
          id
          name
        }
      }
      car_variant_id {
        id
        name
        display_name
        color_id {
          id
          name
          display_name
        }
      }
      media_type
      content_type
      image
      video_file
      document_file
      video_url
      iframe_code
      external_link
      sequence
      description
      alt_text
      is_primary
      is_featured
      is_public
      active
      file_size
      mime_type
      dimensions
      website_visible
      external_url
      bunny_image_path
      bunny_video_path
      bunny_document_path
      seo_title
      seo_description
      create_date
      write_date
    }
  }
`;

// Query to get car media by ID
export const GET_CAR_MEDIA_BY_ID = `
  query GetCarMediaById($id: String!) {
    AlromaihCarMedia(id: $id) {
      id
      name
      car_id {
        id
        name
        display_name
        model_id {
          id
          name
        }
        brand_id {
          id
          name
        }
      }
      car_variant_id {
        id
        name
        display_name
        color_id {
          id
          name
          display_name
        }
      }
      media_type
      content_type
      image
      video_file
      document_file
      video_url
      iframe_code
      external_link
      sequence
      description
      alt_text
      is_primary
      is_featured
      is_public
      active
      file_size
      mime_type
      dimensions
      website_visible
      external_url
      bunny_image_path
      bunny_video_path
      bunny_document_path
      seo_title
      seo_description
      create_date
      write_date
    }
  }
`;

// Query to get media by car
export const GET_MEDIA_BY_CAR = `
  query GetMediaByCar($car_id: String!) {
    AlromaihCarMedia(domain: "car_id=$car_id") {
      id
      name
      car_variant_id {
        id
        name
        display_name
        color_id {
          id
          name
          display_name
        }
      }
      media_type
      content_type
      image
      video_url
      external_url
      sequence
      description
      is_primary
      is_featured
      is_public
      active
      file_size
      mime_type
      dimensions
      website_visible
      create_date
      write_date
    }
  }
`;

// Query to get media by media type
export const GET_MEDIA_BY_TYPE = `
  query GetMediaByType($media_type: String!) {
    AlromaihCarMedia(domain: "media_type=$media_type") {
      id
      name
      car_id {
        id
        name
        display_name
      }
      car_variant_id {
        id
        name
        display_name
      }
      content_type
      image
      video_url
      external_url
      sequence
      is_primary
      is_featured
      is_public
      active
      file_size
      create_date
      write_date
    }
  }
`;

// Query to get public media
export const GET_PUBLIC_MEDIA = `
  query GetPublicMedia {
    AlromaihCarMedia(domain: "is_public=true AND active=true") {
      id
      name
      car_id {
        id
        name
        display_name
      }
      car_variant_id {
        id
        name
        display_name
      }
      media_type
      content_type
      image
      video_url
      external_url
      sequence
      is_primary
      is_featured
      website_visible
      seo_title
      seo_description
      create_date
    }
  }
`;

// Query to get featured media
export const GET_FEATURED_MEDIA = `
  query GetFeaturedMedia {
    AlromaihCarMedia(domain: "is_featured=true AND active=true") {
      id
      name
      car_id {
        id
        name
        display_name
      }
      car_variant_id {
        id
        name
        display_name
      }
      media_type
      content_type
      image
      video_url
      external_url
      sequence
      is_primary
      is_featured
      website_visible
      create_date
    }
  }
`;

// Query to get primary media by car and type
export const GET_PRIMARY_MEDIA = `
  query GetPrimaryMedia($car_id: String!, $media_type: String!) {
    AlromaihCarMedia(domain: "car_id=$car_id AND media_type=$media_type AND is_primary=true") {
      id
      name
      content_type
      image
      video_url
      external_url
      iframe_code
      external_link
      description
      alt_text
      dimensions
      create_date
    }
  }
`;

// Mutation to create car media
export const CREATE_CAR_MEDIA = `
  mutation CreateCarMedia($values: AlromaihCarMediaInput!) {
    createAlromaihCarMedia(values: $values) {
      id
      name
      car_id {
        id
        name
      }
      car_variant_id {
        id
        name
      }
      media_type
      content_type
      sequence
      is_primary
      is_featured
      is_public
      active
      website_visible
      create_date
      write_date
    }
  }
`;

// Mutation to update car media
export const UPDATE_CAR_MEDIA = `
  mutation UpdateCarMedia($id: ID!, $values: AlromaihCarMediaInput!) {
    updateAlromaihCarMedia(id: $id, values: $values) {
      id
      name
      car_id {
        id
        name
      }
      car_variant_id {
        id
        name
      }
      media_type
      content_type
      sequence
      is_primary
      is_featured
      is_public
      active
      website_visible
      create_date
      write_date
    }
  }
`;

// Mutation to delete car media
export const DELETE_CAR_MEDIA = `
  mutation DeleteCarMedia($id: ID!) {
    deleteAlromaihCarMedia(id: $id) {
      id
      name
      active
    }
  }
`;

// Mutation to set media as primary
export const SET_MEDIA_AS_PRIMARY = `
  mutation SetMediaAsPrimary($id: ID!) {
    updateAlromaihCarMedia(id: $id, values: { is_primary: true }) {
      id
      name
      is_primary
      media_type
      car_id {
        id
        name
      }
    }
  }
`;

// Mutation to set media as featured
export const SET_MEDIA_AS_FEATURED = `
  mutation SetMediaAsFeatured($id: ID!, $is_featured: Boolean!) {
    updateAlromaihCarMedia(id: $id, values: { is_featured: $is_featured }) {
      id
      name
      is_featured
    }
  }
`;

// Mutation to toggle website visibility
export const TOGGLE_MEDIA_WEBSITE_VISIBILITY = `
  mutation ToggleMediaWebsiteVisibility($id: ID!, $website_visible: Boolean!) {
    updateAlromaihCarMedia(id: $id, values: { website_visible: $website_visible }) {
      id
      name
      website_visible
    }
  }
`;

// Mutation to bulk update media sequence
export const BULK_UPDATE_MEDIA_SEQUENCE = `
  mutation BulkUpdateMediaSequence($updates: [AlromaihCarMediaSequenceInput!]!) {
    bulkUpdateAlromaihCarMediaSequence(updates: $updates) {
      id
      sequence
    }
  }
`;

// TypeScript interfaces for car media
export interface AlromaihCarMedia {
  id: string;
  name: string | { [key: string]: string };
  car_id: {
    id: string;
    name: string | { [key: string]: string };
    display_name?: string | { [key: string]: string };
    model_id?: {
      id: string;
      name: string | { [key: string]: string };
    };
    brand_id?: {
      id: string;
      name: string | { [key: string]: string };
    };
  };
  car_variant_id?: {
    id: string;
    name: string | { [key: string]: string };
    display_name?: string | { [key: string]: string };
    color_id?: {
      id: string;
      name: string | { [key: string]: string };
      display_name?: string | { [key: string]: string };
    };
  };
  media_type: string;
  branding_subtype?: string;
  content_type: string;
  image?: string;
  video_file?: string;
  document_file?: string;
  video_url?: string;
  iframe_code?: string;
  external_link?: string;
  sequence: number;
  description?: string | { [key: string]: string };
  alt_text?: string | { [key: string]: string };
  is_primary: boolean;
  is_featured: boolean;
  is_public: boolean;
  active: boolean;
  file_size?: number;
  mime_type?: string;
  dimensions?: string;
  website_visible: boolean;
  external_url?: string;
  bunny_image_path?: string;
  bunny_video_path?: string;
  bunny_document_path?: string;
  seo_title?: string | { [key: string]: string };
  seo_description?: string | { [key: string]: string };
  create_date?: string;
  write_date?: string;
}

export interface AlromaihCarMediaInput {
  name?: string;
  car_id?: string;
  car_variant_id?: string;
  media_type?: string;
  branding_subtype?: string;
  content_type?: string;
  image?: string;
  video_file?: string;
  document_file?: string;
  video_url?: string;
  iframe_code?: string;
  external_link?: string;
  sequence?: number;
  description?: string;
  alt_text?: string;
  is_primary?: boolean;
  is_featured?: boolean;
  is_public?: boolean;
  active?: boolean;
  dimensions?: string;
  website_visible?: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface AlromaihCarMediaSequenceInput {
  id: string;
  sequence: number;
}

// Media types with their labels and icons
export const MEDIA_TYPES: Record<string, { label: string, icon: string, color: string, description: string }> = {
  interior: { 
    label: 'Interior Images', 
    icon: '🏠', 
    color: 'blue', 
    description: 'Interior photos, dashboard, seats, features' 
  },
  exterior: { 
    label: 'Exterior Images', 
    icon: '🚗', 
    color: 'green', 
    description: 'Exterior photos, body, wheels, details' 
  },
  engine: { 
    label: 'Engine Images', 
    icon: '⚙️', 
    color: 'orange', 
    description: 'Engine bay, components, specifications' 
  },
  trunk: { 
    label: 'Trunk Images', 
    icon: '📦', 
    color: 'purple', 
    description: 'Trunk space, cargo area, storage' 
  },
  dashboard: { 
    label: 'Dashboard Images', 
    icon: '📊', 
    color: 'indigo', 
    description: 'Dashboard, instruments, controls' 
  },
  '360_view': { 
    label: '360° View', 
    icon: '🔄', 
    color: 'cyan', 
    description: '360-degree interactive views' 
  },
  video: { 
    label: 'Video Content', 
    icon: '🎥', 
    color: 'red', 
    description: 'Videos, animations, demonstrations' 
  },
  brochure: { 
    label: 'Brochure/Documents', 
    icon: '📄', 
    color: 'yellow', 
    description: 'Brochures, manuals, specifications' 
  },
  other: { 
    label: 'Other Media', 
    icon: '📁', 
    color: 'gray', 
    description: 'Other media types and content' 
  }
};

// Content types with their labels and supported file types
export const CONTENT_TYPES: Record<string, { 
  label: string, 
  icon: string, 
  acceptedTypes: string[], 
  description: string,
  maxSize?: number // in MB
}> = {
  image: { 
    label: 'Image File', 
    icon: '🖼️', 
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    description: 'Upload image files (JPEG, PNG, WebP, GIF)',
    maxSize: 10
  },
  video_file: { 
    label: 'Video File', 
    icon: '🎬', 
    acceptedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    description: 'Upload video files (MP4, WebM, OGG)',
    maxSize: 100
  },
  video_url: { 
    label: 'Video URL', 
    icon: '🔗', 
    acceptedTypes: [],
    description: 'YouTube, Vimeo, or other video platform URL'
  },
  iframe_360: { 
    label: '360° iFrame', 
    icon: '🌐', 
    acceptedTypes: [],
    description: 'Embed 360-degree view iframe code'
  },
  iframe_code: { 
    label: 'Custom iFrame Code', 
    icon: '💻', 
    acceptedTypes: [],
    description: 'Custom iframe HTML for embedded content'
  },
  document: { 
    label: 'Document/PDF', 
    icon: '📋', 
    acceptedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    description: 'Upload documents (PDF, DOC, DOCX)',
    maxSize: 25
  },
  external_link: { 
    label: 'External Link', 
    icon: '🌍', 
    acceptedTypes: [],
    description: 'Link to external content or website'
  }
};

// Media statistics interface
export interface MediaStats {
  total_media: number;
  by_type: Record<string, { label: string; count: number }>;
  by_content_type: Record<string, { label: string; count: number }>;
  total_size_mb: number;
  primary_count: number;
  featured_count: number;
  public_count: number;
  website_visible_count: number;
}

// Helper function to get media display URL
export const getMediaDisplayUrl = (media: AlromaihCarMedia): string => {
  // Prioritize Bunny Storage URLs if available
  if (media.content_type === 'image' && media.bunny_image_path) {
    return `https://alromaih-cdn.b-cdn.net/${media.bunny_image_path}`;
  } else if (media.content_type === 'video_file' && media.bunny_video_path) {
    return `https://alromaih-cdn.b-cdn.net/${media.bunny_video_path}`;
  } else if (media.content_type === 'document' && media.bunny_document_path) {
    return `https://alromaih-cdn.b-cdn.net/${media.bunny_document_path}`;
  }
  
  // Fallback to CDN URL if available
  if (media.external_url) {
    return media.external_url;
  }
  
  // Fallback to traditional URLs
  if (media.content_type === 'image' && media.image) {
    return `/web/image/alromaih.car.media/${media.id}/image`;
  } else if (media.content_type === 'video_url' && media.video_url) {
    return media.video_url;
  } else if (media.content_type === 'external_link' && media.external_link) {
    return media.external_link;
  } else if (media.content_type === 'document' && media.document_file) {
    return `/web/content/alromaih.car.media/${media.id}/document_file`;
  }
  return '';
};

// Helper function to get media thumbnail URL
export const getMediaThumbnailUrl = (media: AlromaihCarMedia): string => {
  // For images, prioritize Bunny Storage URL first
  if (media.content_type === 'image') {
    if (media.bunny_image_path) {
      return `https://alromaih-cdn.b-cdn.net/${media.bunny_image_path}`;
    } else if (media.external_url) {
      return media.external_url; // CDN URL for better performance
    } else if (media.image) {
      return `/web/image/alromaih.car.media/${media.id}/image/300x200`;
    }
  } else if (media.content_type === 'video_url' && media.video_url) {
    // Extract video ID and create thumbnail URL for popular platforms
    if (media.video_url.includes('youtube.com') || media.video_url.includes('youtu.be')) {
      const videoId = extractYouTubeVideoId(media.video_url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
    } else if (media.video_url.includes('vimeo.com')) {
      // For Vimeo, we'd need to make an API call to get thumbnail
      return '';
    }
  }
  return '';
};

// Helper function to extract YouTube video ID
const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Helper function to format file size
export const formatFileSize = (sizeInMB: number): string => {
  if (sizeInMB < 1) {
    return `${(sizeInMB * 1024).toFixed(0)} KB`;
  } else if (sizeInMB < 1024) {
    return `${sizeInMB.toFixed(1)} MB`;
  } else {
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  }
};

// Helper function to validate file type
export const validateFileType = (file: File, contentType: string): boolean => {
  const allowedTypes = CONTENT_TYPES[contentType]?.acceptedTypes || [];
  return allowedTypes.length === 0 || allowedTypes.includes(file.type);
};

// Helper function to validate file size
export const validateFileSize = (file: File, contentType: string): boolean => {
  const maxSize = CONTENT_TYPES[contentType]?.maxSize;
  if (!maxSize) return true;
  
  const fileSizeInMB = file.size / (1024 * 1024);
  return fileSizeInMB <= maxSize;
};

// Query to get media statistics
export const GET_MEDIA_STATISTICS = `
  query GetMediaStatistics($car_id: String) {
    AlromaihCarMediaStats(car_id: $car_id) {
      total_media
      by_type
      by_content_type
      total_size_mb
      primary_count
      featured_count
      public_count
      website_visible_count
    }
  }
`; 

// ===== BRANDING ASSET QUERIES =====

// Query to get all branding assets
export const GET_BRANDING_ASSETS = `
  query GetBrandingAssets {
    AlromaihCarMedia(domain: "media_type in ['website_branding', 'mobile_app'] AND active=true") {
      id
      name
      media_type
      branding_subtype
      content_type
      image
      external_url
      bunny_image_path
      alt_text
      seo_title
      seo_description
      is_primary
      is_public
      website_visible
      file_size
      mime_type
      dimensions
      create_date
      write_date
    }
  }
`;

// Query to get website logo
export const GET_WEBSITE_LOGO = `
  query GetWebsiteLogo {
    AlromaihCarMedia(domain: "media_type='website_branding' AND branding_subtype='website_logo' AND is_primary=true AND active=true", limit: 1) {
      id
      name
      external_url
      bunny_image_path
      alt_text
      seo_title
      dimensions
      file_size
      mime_type
    }
  }
`;

// Query to get app logo
export const GET_APP_LOGO = `
  query GetAppLogo {
    AlromaihCarMedia(domain: "media_type='mobile_app' AND branding_subtype='app_logo' AND is_primary=true AND active=true", limit: 1) {
      id
      name
      external_url
      bunny_image_path
      alt_text
      seo_title
      dimensions
      file_size
      mime_type
    }
  }
`;

// Query to get favicon
export const GET_FAVICON = `
  query GetFavicon {
    AlromaihCarMedia(domain: "media_type='website_branding' AND branding_subtype='website_favicon' AND is_primary=true AND active=true", limit: 1) {
      id
      name
      external_url
      bunny_image_path
      alt_text
      dimensions
      file_size
      mime_type
    }
  }
`;

// Query to get social media assets
export const GET_SOCIAL_MEDIA_ASSETS = `
  query GetSocialMediaAssets {
    AlromaihCarMedia(domain: "branding_subtype in ['opengraph_image', 'twitter_card_image', 'linkedin_image', 'whatsapp_preview_image'] AND is_primary=true AND active=true") {
      id
      name
      branding_subtype
      external_url
      bunny_image_path
      alt_text
      seo_title
      seo_description
      dimensions
      file_size
      mime_type
    }
  }
`;

// Query to get specific branding asset by type
export const GET_BRANDING_ASSET_BY_TYPE = `
  query GetBrandingAssetByType($branding_type: String!) {
    AlromaihCarMedia(domain: "branding_subtype=$branding_type AND is_primary=true AND active=true", limit: 1) {
      id
      name
      external_url
      bunny_image_path
      alt_text
      seo_title
      seo_description
      dimensions
      file_size
      mime_type
      create_date
    }
  }
`;

// Query to get all branding assets with comprehensive details
export const GET_ALL_BRANDING_ASSETS_DETAILED = `
  query GetAllBrandingAssetsDetailed {
    AlromaihCarMedia(domain: "media_type in ['website_branding', 'mobile_app'] AND is_primary=true AND active=true") {
      id
      name
      media_type
      branding_subtype
      external_url
      bunny_image_path
      alt_text
      seo_title
      seo_description
      dimensions
      file_size
      mime_type
      is_public
      website_visible
      create_date
      write_date
    }
  }
`;

// Mutation to create branding asset
export const CREATE_BRANDING_ASSET = `
  mutation CreateBrandingAsset($values: AlromaihCarMediaInput!) {
    createAlromaihCarMedia(values: $values) {
      id
      name
      media_type
      branding_subtype
      content_type
      external_url
      bunny_image_path
      is_primary
      is_public
      website_visible
      create_date
    }
  }
`;

// Mutation to update branding asset
export const UPDATE_BRANDING_ASSET = `
  mutation UpdateBrandingAsset($id: ID!, $values: AlromaihCarMediaInput!) {
    updateAlromaihCarMedia(id: $id, values: $values) {
      id
      name
      external_url
      bunny_image_path
      alt_text
      seo_title
      is_primary
      is_public
      website_visible
      write_date
    }
  }
`;

// Branding asset types with descriptions
export const BRANDING_ASSET_TYPES: Record<string, { 
  label: string, 
  icon: string, 
  color: string, 
  description: string,
  media_type: 'website_branding' | 'mobile_app',
  recommended_size: string,
  file_formats: string[]
}> = {
  website_logo: { 
    label: 'Website Logo', 
    icon: '🏢', 
    color: 'blue', 
    description: 'Main logo for website header and branding',
    media_type: 'website_branding',
    recommended_size: '200x60px or 300x90px',
    file_formats: ['PNG', 'SVG', 'JPG']
  },
  website_favicon: { 
    label: 'Website Favicon', 
    icon: '🔖', 
    color: 'purple', 
    description: 'Small icon for browser tabs and bookmarks',
    media_type: 'website_branding',
    recommended_size: '16x16px, 32x32px, 48x48px',
    file_formats: ['ICO', 'PNG']
  },
  app_logo: { 
    label: 'Mobile App Logo', 
    icon: '📱', 
    color: 'green', 
    description: 'Logo for mobile application',
    media_type: 'mobile_app',
    recommended_size: '512x512px',
    file_formats: ['PNG', 'SVG']
  },
  app_icon: { 
    label: 'App Icon', 
    icon: '📲', 
    color: 'orange', 
    description: 'Application icon for app stores',
    media_type: 'mobile_app',
    recommended_size: '1024x1024px',
    file_formats: ['PNG']
  },
  opengraph_image: { 
    label: 'Open Graph Image', 
    icon: '🌐', 
    color: 'cyan', 
    description: 'Social media sharing image for Facebook, LinkedIn',
    media_type: 'website_branding',
    recommended_size: '1200x630px',
    file_formats: ['PNG', 'JPG']
  },
  twitter_card_image: { 
    label: 'Twitter Card Image', 
    icon: '🐦', 
    color: 'sky', 
    description: 'Twitter card image for tweet sharing',
    media_type: 'website_branding',
    recommended_size: '1200x675px',
    file_formats: ['PNG', 'JPG']
  },
  linkedin_image: { 
    label: 'LinkedIn Image', 
    icon: '💼', 
    color: 'indigo', 
    description: 'LinkedIn business profile sharing image',
    media_type: 'website_branding',
    recommended_size: '1200x627px',
    file_formats: ['PNG', 'JPG']
  },
  whatsapp_preview_image: { 
    label: 'WhatsApp Preview', 
    icon: '💬', 
    color: 'emerald', 
    description: 'WhatsApp link preview image',
    media_type: 'website_branding',
    recommended_size: '400x400px',
    file_formats: ['PNG', 'JPG']
  },
  google_business_logo: { 
    label: 'Google Business Logo', 
    icon: '🏪', 
    color: 'red', 
    description: 'Google My Business profile logo',
    media_type: 'website_branding',
    recommended_size: '250x250px',
    file_formats: ['PNG', 'JPG']
  },
  apple_touch_icon: { 
    label: 'Apple Touch Icon', 
    icon: '🍎', 
    color: 'gray', 
    description: 'iOS Safari bookmark and home screen icon',
    media_type: 'mobile_app',
    recommended_size: '180x180px',
    file_formats: ['PNG']
  },
  android_chrome_icon: { 
    label: 'Android Chrome Icon', 
    icon: '🤖', 
    color: 'lime', 
    description: 'Android Chrome shortcut icon',
    media_type: 'mobile_app',
    recommended_size: '192x192px',
    file_formats: ['PNG']
  }
};

// Interface for branding asset
export interface BrandingAsset {
  id: string;
  name: string | { [key: string]: string };
  type: string;
  url: string;
  bunny_path?: string;
  alt_text?: string | { [key: string]: string };
  seo_title?: string | { [key: string]: string };
  dimensions?: string;
  file_size?: number;
  mime_type?: string;
  upload_date?: string;
}

// Helper function to get branding asset URL
export const getBrandingAssetUrl = (asset: AlromaihCarMedia): string => {
  // Prioritize Bunny Storage URL
  if (asset.bunny_image_path) {
    return `https://alromaih-cdn.b-cdn.net/${asset.bunny_image_path}`;
  }
  
  // Fallback to external URL
  if (asset.external_url) {
    return asset.external_url;
  }
  
  // Fallback to Odoo image URL
  if (asset.image) {
    return `/web/image/alromaih.car.media/${asset.id}/image`;
  }
  
  return '';
};

// Helper function to parse branding assets from GraphQL response
export const parseBrandingAssets = (mediaList: AlromaihCarMedia[]): Record<string, BrandingAsset> => {
  const assets: Record<string, BrandingAsset> = {};
  
  mediaList.forEach(media => {
    if (media.branding_subtype) {
      assets[media.branding_subtype] = {
        id: media.id,
        name: media.name,
        type: media.branding_subtype,
        url: getBrandingAssetUrl(media),
        bunny_path: media.bunny_image_path,
        alt_text: media.alt_text,
        seo_title: media.seo_title,
        dimensions: media.dimensions,
        file_size: media.file_size,
        mime_type: media.mime_type,
        upload_date: media.create_date,
      };
    }
  });
  
  return assets;
};

// Helper function to get logo URL (shortcut)
export const getLogoUrl = (assets: Record<string, BrandingAsset>): string => {
  return assets.website_logo?.url || assets.app_logo?.url || '';
};

// Helper function to get favicon URL (shortcut)
export const getFaviconUrl = (assets: Record<string, BrandingAsset>): string => {
  return assets.website_favicon?.url || '';
};

// Helper function to get social media meta tags
export const getSocialMediaMetaTags = (assets: Record<string, BrandingAsset>) => {
  const tags: Record<string, string> = {};
  
  // Open Graph
  if (assets.opengraph_image) {
    tags['og:image'] = assets.opengraph_image.url;
    tags['og:image:alt'] = typeof assets.opengraph_image.alt_text === 'string' 
      ? assets.opengraph_image.alt_text 
      : assets.opengraph_image.alt_text?.en || '';
  }
  
  // Twitter Card
  if (assets.twitter_card_image) {
    tags['twitter:image'] = assets.twitter_card_image.url;
    tags['twitter:image:alt'] = typeof assets.twitter_card_image.alt_text === 'string'
      ? assets.twitter_card_image.alt_text
      : assets.twitter_card_image.alt_text?.en || '';
  }
  
  // LinkedIn
  if (assets.linkedin_image) {
    tags['linkedin:image'] = assets.linkedin_image.url;
  }
  
  return tags;
};

// Helper function to validate branding asset type
export const validateBrandingAssetType = (type: string): boolean => {
  return type in BRANDING_ASSET_TYPES;
};

// Helper function to create branding asset input
export const createBrandingAssetInput = (
  brandingType: string,
  imageData: string,
  customName?: string,
  customAltText?: string
): AlromaihCarMediaInput => {
  const assetConfig = BRANDING_ASSET_TYPES[brandingType];
  
  if (!assetConfig) {
    throw new Error(`Invalid branding asset type: ${brandingType}`);
  }
  
  return {
    name: customName || `AlRomaih ${assetConfig.label}`,
    media_type: assetConfig.media_type,
    branding_subtype: brandingType,
    content_type: brandingType === 'website_favicon' ? 'favicon_ico' : 'image',
    image: imageData,
    alt_text: customAltText || `AlRomaih Cars ${assetConfig.label} - Premium Automotive Dealership`,
    is_primary: true,
    is_public: true,
    is_featured: true,
    website_visible: true,
  };
}; 