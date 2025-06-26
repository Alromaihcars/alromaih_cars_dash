// Query to get all specification template lines
export const GET_SPECIFICATION_TEMPLATE_LINES = `
  query GetSpecificationTemplateLines {
    AlromaihCarSpecificationTemplate {
      id
      name
      display_name
      specification_line_ids {
        category_sequence
        create_date
        display_name
        help_text
        is_filterable
        is_required
        is_visible
        id
        placeholder
        write_date
        sequence
        attribute_id {
          allow_multi_select
          car_info_icon
          category_type
          create_date
          create_variant
          default_expanded
          description
          display_in_car_info
          display_name
          display_type
          edit_widget
          filter_priority
          icon
          icon_display_type
          icon_image
          icon_image_visible
          id
          inline_editable
          is_filterable
          is_key_attribute
          is_website_spec
          name
          active
        }
      }
    }
  }
`;

// Query to get template lines by template ID
export const GET_TEMPLATE_LINES_BY_TEMPLATE = `
  query GetTemplateLinesByTemplate($template_id: String!) {
    AlromaihCarSpecificationTemplate(id: $template_id) {
      id
      name
      display_name
      specification_line_ids {
        category_sequence
        create_date
        display_name
        help_text
        is_filterable
        is_required
        is_visible
        id
        placeholder
        write_date
        sequence
        attribute_id {
          allow_multi_select
          car_info_icon
          category_type
          create_date
          create_variant
          default_expanded
          description
          display_in_car_info
          display_name
          display_type
          edit_widget
          filter_priority
          icon
          icon_display_type
          icon_image
          icon_image_visible
          id
          inline_editable
          is_filterable
          is_key_attribute
          is_website_spec
          name
          active
          attribute_line_ids {
            active
            create_date
            id
            sequence
            value_count
            write_date
            value_ids {
              active
              color
              create_date
              default_extra_price
              display_name
              display_type
              display_value
              default_extra_price_changed
              html_color
              id
              image
              is_used_on_products
              is_custom
              name
              unit
              sequence
              unit_id {
                id
              }
            }
          }
        }
      }
    }
  }
`;

// Query to get required template lines
export const GET_REQUIRED_TEMPLATE_LINES = `
  query GetRequiredTemplateLines {
    AlromaihCarSpecificationTemplate {
      id
      name
      display_name
      specification_line_ids(domain: "is_required=true") {
        id
        display_name
        help_text
        is_required
        is_visible
        is_filterable
        sequence
        placeholder
        attribute_id {
          id
          name
          display_name
          display_type
          is_key_attribute
        }
      }
    }
  }
`;

// Query to get filterable template lines
export const GET_FILTERABLE_TEMPLATE_LINES = `
  query GetFilterableTemplateLines {
    AlromaihCarSpecificationTemplate {
      id
      name
      display_name
      specification_line_ids(domain: "is_filterable=true") {
        id
        display_name
        help_text
        is_filterable
        is_visible
        sequence
        attribute_id {
          id
          name
          display_name
          display_type
          filter_priority
        }
      }
    }
  }
`;

// Query to get visible template lines
export const GET_VISIBLE_TEMPLATE_LINES = `
  query GetVisibleTemplateLines {
    AlromaihCarSpecificationTemplate {
      id
      name
      display_name
      specification_line_ids(domain: "is_visible=true") {
        id
        display_name
        help_text
        is_visible
        sequence
        placeholder
        attribute_id {
          id
          name
          display_name
          display_type
          display_in_car_info
        }
      }
    }
  }
`;

// Fixed mutation to create template line with proper input structure
export const CREATE_TEMPLATE_LINE = `
  mutation CreateTemplateLine($input: CreateAlromaihCarSpecificationTemplateLineInput!) {
    createAlromaihCarSpecificationTemplateLine(input: $input) {
      id
      template_id
      attribute_id {
        id
        name
      display_name
        display_type
      }
      sequence
      category_sequence
      is_required
      is_visible
      is_filterable
      default_value_id {
        id
        name
        display_name
      }
      help_text
      placeholder
      create_date
      write_date
    }
  }
`;

// Fixed mutation to update template line
export const UPDATE_TEMPLATE_LINE = `
  mutation UpdateTemplateLine($id: ID!, $input: UpdateAlromaihCarSpecificationTemplateLineInput!) {
    updateAlromaihCarSpecificationTemplateLine(id: $id, input: $input) {
      id
      template_id
      attribute_id {
        id
        name
      display_name
        display_type
      }
      sequence
      category_sequence
      is_required
      is_visible
      is_filterable
      default_value_id {
        id
        name
        display_name
      }
      help_text
      placeholder
      write_date
    }
  }
`;

// Mutation to delete template line
export const DELETE_TEMPLATE_LINE = `
  mutation DeleteTemplateLine($id: ID!) {
    deleteAlromaihCarSpecificationTemplateLine(id: $id) {
      id
      display_name
    }
  }
`;

// Mutation to reorder template lines
export const REORDER_TEMPLATE_LINES = `
  mutation ReorderTemplateLines($template_id: ID!, $line_orders: [SpecificationTemplateLineInput!]!) {
    updateAlromaihCarSpecificationTemplate(id: $template_id, values: { 
      specification_line_ids: $line_orders 
    }) {
      id
      specification_line_ids {
        id
        sequence
        display_name
      }
    }
  }
`;

// TypeScript interfaces for template lines
export interface SpecificationTemplateLine {
  category_sequence?: number;
  create_date?: string;
  display_name?: string | { [key: string]: string };
  help_text?: string | { [key: string]: string };
  is_filterable?: boolean;
  is_required?: boolean;
  is_visible?: boolean;
  id: string;
  placeholder?: string | { [key: string]: string };
  write_date?: string;
  sequence?: number;
  attribute_id: {
    allow_multi_select?: boolean;
    car_info_icon?: string;
    category_type?: string;
    create_date?: string;
    create_variant?: boolean;
    default_expanded?: boolean;
    description?: string | { [key: string]: string };
    display_in_car_info?: boolean;
    display_name?: string | { [key: string]: string };
    display_type?: string;
    edit_widget?: string;
    filter_priority?: number;
    icon?: string;
    icon_display_type?: string;
    icon_image?: string;
    icon_image_visible?: boolean;
    id: string;
    inline_editable?: boolean;
    is_filterable?: boolean;
    is_key_attribute?: boolean;
    is_website_spec?: boolean;
    name: string | { [key: string]: string };
    active: boolean;
    attribute_line_ids?: Array<{
      active: boolean;
      create_date?: string;
      id: string;
      sequence?: number;
      value_count?: number;
      write_date?: string;
      value_ids: Array<{
        active: boolean;
        color?: string;
        create_date?: string;
        default_extra_price?: number;
        display_name: string;
        display_type?: string;
        display_value?: string;
        default_extra_price_changed?: boolean;
        html_color?: string;
        id: string;
        image?: string;
        is_used_on_products?: boolean;
        is_custom?: boolean;
        name: string | { [key: string]: string };
        unit?: string;
        sequence?: number;
        unit_id?: {
          id: string;
        };
      }>;
    }>;
  };
}

// Updated input interface for creating template lines
export interface CreateAlromaihCarSpecificationTemplateLineInput {
  template_id: number;
  attribute_id: number;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_filterable?: boolean;
  default_value_id?: number;
  help_text?: string;
  placeholder?: string;
}

// Updated input interface for updating template lines
export interface UpdateAlromaihCarSpecificationTemplateLineInput {
  template_id?: number;
  attribute_id?: number;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
  is_filterable?: boolean;
  default_value_id?: number;
  help_text?: string;
  placeholder?: string;
}

// Legacy interface - keeping for backward compatibility  
export interface SpecificationTemplateLineInput {
  display_name?: string;
  help_text?: string;
  is_filterable?: boolean;
  is_required?: boolean;
  is_visible?: boolean;
  sequence?: number;
  placeholder?: string;
  category_sequence?: number;
  attribute_id?: string;
  template_id?: string;
}

export interface TemplateWithLines {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  specification_line_ids: SpecificationTemplateLine[];
}

// Template line display types
export const TEMPLATE_LINE_DISPLAY_TYPES: Record<string, { label: string, description: string }> = {
  text: { label: 'Text Input', description: 'Single line text input' },
  textarea: { label: 'Text Area', description: 'Multi-line text input' },
  select: { label: 'Select', description: 'Dropdown selection' },
  radio: { label: 'Radio Buttons', description: 'Single choice selection' },
  checkbox: { label: 'Checkboxes', description: 'Multiple choice selection' },
  number: { label: 'Number', description: 'Numeric input' },
  date: { label: 'Date', description: 'Date picker' },
  color: { label: 'Color', description: 'Color picker' },
  image: { label: 'Image', description: 'Image upload' },
  file: { label: 'File', description: 'File upload' }
};

// Template line categories
export const TEMPLATE_LINE_CATEGORIES: Record<string, { label: string, icon: string }> = {
  basic: { label: 'Basic Information', icon: '📝' },
  technical: { label: 'Technical Specs', icon: '🔧' },
  performance: { label: 'Performance', icon: '⚡' },
  design: { label: 'Design & Style', icon: '🎨' },
  safety: { label: 'Safety Features', icon: '🛡️' },
  comfort: { label: 'Comfort & Convenience', icon: '🪑' },
  technology: { label: 'Technology', icon: '📱' },
  other: { label: 'Other', icon: '📊' }
}; 