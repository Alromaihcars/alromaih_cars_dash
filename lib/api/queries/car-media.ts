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
  if (media.content_type === 'image' && media.image) {
    return `/web/image/alromaih.car.media/${media.id}/image/300x200`;
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