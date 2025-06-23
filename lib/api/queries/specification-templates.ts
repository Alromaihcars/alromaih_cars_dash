// Query to get all specification templates with full relational data
export const GET_SPECIFICATION_TEMPLATES = `
  query GetSpecificationTemplates {
    AlromaihCarSpecificationTemplate {
      name
      sequence
      website_description
      website_visible
      write_date
      active
      activity_date_deadline
      activity_exception_decoration
      activity_exception_icon
      activity_state
      activity_summary
      activity_type_icon
      category_count
      create_date
      display_name
      display_style
      has_message
      id
      is_default
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
          active
          value_ids {
            id
          }
          template_value_ids {
            id
          }
        }
      }
      apply_to_model_ids {
        id
      }
      apply_to_brand_ids {
        id
      }
      category_ids {
        id
      }
    }
  }
`;

// Query to get specification template by ID with full relational data
export const GET_SPECIFICATION_TEMPLATE_BY_ID = `
  query GetSpecificationTemplateById($id: String!) {
    AlromaihCarSpecificationTemplate(id: $id) {
      name
      sequence
      website_description
      website_visible
      write_date
      active
      activity_date_deadline
      activity_exception_decoration
      activity_exception_icon
      activity_state
      activity_summary
      activity_type_icon
      category_count
      create_date
      display_name
      display_style
      has_message
      id
      is_default
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
          active
          value_ids {
            id
          }
          template_value_ids {
            id
          }
        }
      }
      apply_to_model_ids {
        id
      }
      apply_to_brand_ids {
        id
      }
      category_ids {
        id
      }
    }
  }
`;

// Query to get default templates
export const GET_DEFAULT_TEMPLATES = `
  query GetDefaultTemplates {
    AlromaihCarSpecificationTemplate(domain: "is_default=true") {
      id
      name
      display_name
      display_style
      is_default
      sequence
      category_count
      website_visible
      website_description
      specification_line_ids {
        id
        display_name
        sequence
        is_required
        is_visible
        is_filterable
        attribute_id {
          id
          name
          display_name
          display_type
        }
      }
    }
  }
`;

// Query to get website visible templates
export const GET_WEBSITE_TEMPLATES = `
  query GetWebsiteTemplates {
    AlromaihCarSpecificationTemplate(domain: "website_visible=true") {
      id
      name
      display_name
      display_style
      sequence
      category_count
      website_visible
      website_description
      specification_line_ids {
        id
        display_name
        sequence
        is_visible
        attribute_id {
          id
          name
          display_name
          is_website_spec
        }
      }
    }
  }
`;

// Query to get templates by display style
export const GET_TEMPLATES_BY_DISPLAY_STYLE = `
  query GetTemplatesByDisplayStyle($display_style: String!) {
    AlromaihCarSpecificationTemplate(domain: "display_style=$display_style") {
      id
      name
      display_name
      display_style
      sequence
      category_count
      website_visible
      is_default
      specification_line_ids {
        id
        display_name
        sequence
        attribute_id {
          id
          name
          display_name
        }
      }
    }
  }
`;

// Fixed mutation to create specification template with proper input structure
export const CREATE_SPECIFICATION_TEMPLATE = `
  mutation CreateSpecificationTemplate($input: CreateAlromaihCarSpecificationTemplateInput!) {
    createAlromaihCarSpecificationTemplate(input: $input) {
      id
      name
      display_name
      description
      sequence
      active
      is_default
      display_style
      website_visible
      website_description
      category_count
      create_date
      write_date
      specification_line_ids {
        id
        sequence
        is_required
        is_visible
        is_filterable
        help_text
        placeholder
        attribute_id {
          id
          name
          display_name
          display_type
        }
      }
      apply_to_brand_ids {
        id
      }
      apply_to_model_ids {
        id
      }
    }
  }
`;

// Comprehensive mutation to create template with specification lines
export const CREATE_TEMPLATE_WITH_LINES = `
  mutation CreateTemplateWithLines($templateInput: CreateAlromaihCarSpecificationTemplateInput!, $linesInput: [CreateAlromaihCarSpecificationTemplateLineInput!]!) {
    createTemplate: createAlromaihCarSpecificationTemplate(input: $templateInput) {
      id
      name
      display_name
      description
      sequence
      active
      is_default
      display_style
      website_visible
      website_description
    }
    createLines: createAlromaihCarSpecificationTemplateLines(input: $linesInput) {
      id
      template_id
      attribute_id {
        id
        name
        display_name
      }
      sequence
      is_required
      is_visible
      is_filterable
      help_text
      placeholder
    }
  }
`;

// Updated mutation to update specification template with better error handling
export const UPDATE_SPECIFICATION_TEMPLATE = `
  mutation UpdateSpecificationTemplate($id: ID!, $input: UpdateAlromaihCarSpecificationTemplateInput!) {
    updateAlromaihCarSpecificationTemplate(id: $id, input: $input) {
      id
      name
      display_name
      description
      sequence
      active
      is_default
      display_style
      website_visible
      website_description
      category_count
      write_date
      specification_line_ids {
        id
        sequence
        is_required
        is_visible
        is_filterable
        help_text
        placeholder
        attribute_id {
          id
          name
          display_name
          display_type
        }
      }
    }
  }
`;

// Mutation to delete specification template
export const DELETE_SPECIFICATION_TEMPLATE = `
  mutation DeleteSpecificationTemplate($id: ID!) {
    deleteAlromaihCarSpecificationTemplate(id: $id) {
      id
      name
      display_name
      active
    }
  }
`;

// Mutation to set template as default
export const SET_TEMPLATE_AS_DEFAULT = `
  mutation SetTemplateAsDefault($id: ID!) {
    updateAlromaihCarSpecificationTemplate(id: $id, values: { is_default: true }) {
      id
      name
      display_name
      is_default
    }
  }
`;

// Mutation to toggle website visibility
export const TOGGLE_WEBSITE_VISIBILITY = `
  mutation ToggleWebsiteVisibility($id: ID!, $website_visible: Boolean!) {
    updateAlromaihCarSpecificationTemplate(id: $id, values: { website_visible: $website_visible }) {
      id
      name
      display_name
      website_visible
    }
  }
`;

// Mutation to duplicate template
export const DUPLICATE_SPECIFICATION_TEMPLATE = `
  mutation DuplicateSpecificationTemplate($original_id: ID!, $values: AlromaihCarSpecificationTemplateInput!) {
    createAlromaihCarSpecificationTemplate(values: $values) {
      id
      name
      display_name
      display_style
      sequence
      is_default
      create_date
      write_date
    }
  }
`;

// Query to get templates statistics
export const GET_TEMPLATES_STATISTICS = `
  query GetTemplatesStatistics {
    AlromaihCarSpecificationTemplate {
      id
      is_default
      website_visible
      category_count
      specification_line_ids {
        id
        is_required
        is_visible
        is_filterable
      }
    }
  }
`;

// TypeScript interfaces for the relational structure
export interface AttributeValue {
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
}

export interface AttributeLine {
  active: boolean;
  create_date?: string;
  id: string;
  sequence?: number;
  value_count?: number;
  write_date?: string;
  value_ids: AttributeValue[];
}

export interface ProductAttribute {
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
  attribute_line_ids: AttributeLine[];
  active: boolean;
  value_ids: { id: string }[];
  template_value_ids: { id: string }[];
}

export interface SpecificationLine {
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
  attribute_id: ProductAttribute;
}

export interface AlromaihCarSpecificationTemplate {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  display_style?: string;
  sequence?: number;
  category_count?: number;
  is_default: boolean;
  website_visible: boolean;
  website_description?: string | { [key: string]: string };
  active?: boolean;
  activity_date_deadline?: string;
  activity_exception_decoration?: string;
  activity_exception_icon?: string;
  activity_state?: string;
  activity_summary?: string;
  activity_type_icon?: string;
  has_message?: boolean;
  create_date?: string;
  write_date?: string;
  specification_line_ids: SpecificationLine[];
  apply_to_model_ids: { id: string }[];
  apply_to_brand_ids: { id: string }[];
  category_ids: { id: string }[];
}

// Updated input interface for creating specification templates
export interface CreateAlromaihCarSpecificationTemplateInput {
  name: string;
  description?: string;
  sequence?: number;
  active?: boolean;
  is_default?: boolean;
  display_style?: 'tabs' | 'accordion' | 'grouped_list' | 'single_table';
  website_visible?: boolean;
  website_description?: string;
  apply_to_brand_ids?: number[];
  apply_to_model_ids?: number[];
}

// Updated input interface for updating specification templates
export interface UpdateAlromaihCarSpecificationTemplateInput {
  name?: string;
  description?: string;
  sequence?: number;
  active?: boolean;
  is_default?: boolean;
  display_style?: 'tabs' | 'accordion' | 'grouped_list' | 'single_table';
  website_visible?: boolean;
  website_description?: string;
  apply_to_brand_ids?: number[];
  apply_to_model_ids?: number[];
}

// Input interface for creating specification template lines
export interface CreateAlromaihCarSpecificationTemplateLineInput {
  template_id: number;
  attribute_id: number;
  sequence?: number;
  is_required?: boolean;
  is_visible?: boolean;
  help_text?: string;
  placeholder?: string;
  default_value_id?: number;
}

// Legacy interface - keeping for backward compatibility
export interface AlromaihCarSpecificationTemplateInput {
  name?: string;
  display_name?: string;
  display_style?: string;
  sequence?: number;
  is_default?: boolean;
  website_visible?: boolean;
  website_description?: string;
  active?: boolean;
  activity_date_deadline?: string;
  activity_summary?: string;
}

// Display styles for templates
export const TEMPLATE_DISPLAY_STYLES: Record<string, { label: string, description: string }> = {
  list: { label: 'List', description: 'Display as a simple list' },
  grid: { label: 'Grid', description: 'Display in a grid layout' },
  table: { label: 'Table', description: 'Display as a table' },
  cards: { label: 'Cards', description: 'Display as cards' },
  accordion: { label: 'Accordion', description: 'Display as collapsible sections' },
  tabs: { label: 'Tabs', description: 'Display in tabbed interface' }
};

// Activity states
export const ACTIVITY_STATES: Record<string, { label: string, color: string }> = {
  overdue: { label: 'Overdue', color: 'destructive' },
  today: { label: 'Today', color: 'warning' },
  planned: { label: 'Planned', color: 'default' },
  done: { label: 'Done', color: 'success' }
};

// === HELPER FUNCTIONS ===

// Import the unified GraphQL client
import { gql, gqlMutate } from '@/lib/api'
import { CREATE_TEMPLATE_LINE } from './specification-template-lines';

// GraphQL wrapper using the unified client
export const fetchGraphQL = async (query: string, variables: any = {}) => {
  // Determine if it's a mutation or query
  const queryLowerCase = query.toLowerCase().trim()
  const isMutation = queryLowerCase.startsWith('mutation')
  
  // Use the appropriate unified client method
  return isMutation 
    ? await gqlMutate(query, variables)
    : await gql(query, variables)
}

// Helper function to create a complete template with lines
export const createTemplateWithLines = async (
  templateData: CreateAlromaihCarSpecificationTemplateInput,
  linesData: CreateAlromaihCarSpecificationTemplateLineInput[]
) => {
  try {
    // Step 1: Create the template
    const templateResult = await gql(CREATE_SPECIFICATION_TEMPLATE, {
      input: templateData
    });

    if (!templateResult?.id) {
      throw new Error('Failed to create template');
    }

    const templateId = templateResult.id;

    // Step 2: Create template lines
    const lineResults = [];
    for (const lineData of linesData) {
      const lineDataWithTemplate = {
        ...lineData,
        template_id: templateId
      };

      const lineResult = await gql(CREATE_TEMPLATE_LINE, {
        input: lineDataWithTemplate
      });

      if (lineResult?.id) {
        lineResults.push(lineResult);
      }
    }

    // Step 3: Fetch the complete template with lines
    const completeTemplate = await gql(GET_SPECIFICATION_TEMPLATE_BY_ID, {
      id: templateId.toString()
    });

    return {
      success: true,
      template: completeTemplate,
      lines: lineResults,
      templateId
    };

  } catch (error) {
    console.error('Error creating template with lines:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      template: null,
      lines: [],
      templateId: null
    };
  }
};

// Helper function to verify template creation
export const verifyTemplateCreation = async (templateId: string) => {
  try {
    const template = await gql(`
      query VerifyTemplate($id: String!) {
        AlromaihCarSpecificationTemplate(id: $id) {
          id
          name
          display_name
          description
          active
          is_default
          display_style
          website_visible
          website_description
          category_count
          specification_line_ids {
            id
            sequence
            is_required
            is_visible
            is_filterable
            help_text
            placeholder
            attribute_id {
              id
              name
              display_name
              display_type
            }
          }
        }
      }
    `, { id: templateId });

    return {
      success: true,
      template: template?.AlromaihCarSpecificationTemplate?.[0] || null
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      template: null
    };
  }
};

// Helper function to get all available attributes for template creation
export const getAvailableAttributes = async () => {
  try {
    const attributes = await gql(`
      query GetAvailableAttributes {
        ProductAttribute(domain: "active=true") {
          id
          name
          display_name
          display_type
          is_filterable
          is_key_attribute
          is_website_spec
          description
          spec_category_id {
            id
            name
            display_name
            sequence
          }
          value_ids {
            id
            name
            display_name
            display_value
            active
          }
        }
      }
    `);

    return {
      success: true,
      attributes: attributes?.ProductAttribute || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      attributes: []
    };
  }
};

// Helper function to create a basic car template
export const createBasicCarTemplate = async () => {
  const templateData: CreateAlromaihCarSpecificationTemplateInput = {
    name: 'Standard Car Template',
    description: 'A comprehensive template for car specifications',
    sequence: 10,
    active: true,
    is_default: false,
    display_style: 'tabs',
    website_visible: true,
    website_description: 'Complete car specifications organized by category'
  };

  // Get available attributes first
  const attributesResult = await getAvailableAttributes();
  if (!attributesResult.success || attributesResult.attributes.length === 0) {
    return {
      success: false,
      error: 'No attributes available for template creation',
      template: null
    };
  }

  // Create template lines for available attributes
  const linesData: CreateAlromaihCarSpecificationTemplateLineInput[] = attributesResult.attributes.map((attr: any, index: number) => ({
    attribute_id: parseInt(attr.id),
    sequence: (index + 1) * 10,
    is_required: attr.is_key_attribute || false,
    is_visible: true,
    help_text: `Specify the ${attr.name.toLowerCase()} for this vehicle`,
    placeholder: `Enter ${attr.name.toLowerCase()}`
  }));

  return await createTemplateWithLines(templateData, linesData);
}; 