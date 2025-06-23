from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class CarSpecificationTemplate(models.Model):
    _name = 'alromaih.car.specification.template'
    _description = _('Car Specification Template')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, name'
    
    name = fields.Char(string='Template Name', required=True, tracking=True, translate=True)
    description = fields.Text(string='Description', translate=True)
    
    # Template organization
    sequence = fields.Integer(string='Sequence', default=10)
    active = fields.Boolean(default=True)
    is_default = fields.Boolean(string='Default Template', default=False, tracking=True,
                              help="Use this template as default for new cars")
    # Template scope
    apply_to_brand_ids = fields.Many2many('car.brand', string='Applicable Brands',
                                        help="Leave empty to apply to all brands")
    apply_to_model_ids = fields.Many2many('car.model', string='Applicable Models',
                                        help="Leave empty to apply to all models")
    
    # Specification lines
    specification_line_ids = fields.One2many('alromaih.car.specification.template.line', 
                                           'template_id', string='Specification Lines')
    
    # Category organization
    category_ids = fields.Many2many('product.attribute.category', 
                                  relation='car_spec_template_category_rel',
                                  compute='_compute_category_ids', store=True,
                                  string='Categories Used')
    category_count = fields.Integer(string='Number of Categories', 
                                  compute='_compute_category_count')
    
    # Display settings
    display_style = fields.Selection([
        ('tabs', 'Tabs per Category'),
        ('accordion', 'Accordion per Category'), 
        ('grouped_list', 'Grouped List'),
        ('single_table', 'Single Table')
    ], string='Display Style', default='tabs', required=True,
        help="How to display specifications on website/forms")
    
    # Website settings
    website_visible = fields.Boolean(string='Show on Website', default=True)
    website_description = fields.Html(string='Website Description', translate=True)
    
    @api.depends('specification_line_ids.attribute_id.spec_category_id')
    def _compute_category_ids(self):
        for template in self:
            categories = template.specification_line_ids.mapped('attribute_id.spec_category_id')
            template.category_ids = [(6, 0, categories.ids)]
    
    @api.depends('category_ids')
    def _compute_category_count(self):
        for template in self:
            template.category_count = len(template.category_ids)
    
    @api.constrains('is_default')
    def _check_single_default(self):
        """Ensure only one default template exists"""
        if self.filtered('is_default'):
            if self.search_count([('is_default', '=', True), ('id', 'not in', self.ids)]) > 0:
                raise ValidationError(_("Only one template can be set as default. Please uncheck other default templates first."))
    
    def action_set_as_default(self):
        """Set this template as the default one"""
        self.ensure_one()
        
        # Unset other defaults
        other_defaults = self.search([('is_default', '=', True), ('id', '!=', self.id)])
        other_defaults.write({'is_default': False})
        
        # Set this as default
        self.is_default = True
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('Template has been set as default.'),
                'type': 'success',
            }
        }
    
    def action_view_specifications(self):
        """View specification lines for this template"""
        self.ensure_one()
        return {
            'name': _('Specification Lines'),
            'type': 'ir.actions.act_window',
            'res_model': 'alromaih.car.specification.template.line',
            'view_mode': 'list,form',
            'domain': [('template_id', '=', self.id)],
            'context': {'default_template_id': self.id},
        }
    
    def action_view_categories(self):
        """View categories used in this template"""
        self.ensure_one()
        return {
            'name': _('Categories'),
            'type': 'ir.actions.act_window',
            'res_model': 'product.attribute.category',
            'view_mode': 'list,form',
            'domain': [('id', 'in', self.category_ids.ids)],
            'context': {'create': False},
        }
    
    def get_specifications_by_category(self):
        """Get specifications organized by category"""
        self.ensure_one()
        
        result = {}
        for line in self.specification_line_ids.sorted(lambda l: (l.category_sequence, l.sequence)):
            category = line.attribute_id.spec_category_id
            if not category:
                continue
                
            category_key = category.id
            if category_key not in result:
                result[category_key] = {
                    'category': category,
                    'specifications': []
                }
            
            result[category_key]['specifications'].append(line)
        
        return result
    
    @api.model
    def get_default_template(self):
        """Get the default template"""
        default_template = self.search([('is_default', '=', True)], limit=1)
        if not default_template:
            # If no default template, return the first active one
            default_template = self.search([('active', '=', True)], limit=1)
        return default_template
    
    def duplicate_template(self, new_name):
        """Create a copy of this template with a new name"""
        self.ensure_one()
        
        new_template = self.copy({
            'name': new_name,
            'is_default': False
        })
        
        return new_template

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            # Check if there are cars using this template
            cars_using_template = self.env['alromaih.car'].search([('specification_template_id', '=', record.id)])
            if cars_using_template:
                raise ValidationError(_('Cannot delete template "%s" that is being used by %d car(s). Please change the template for those cars first.') % (record.name, len(cars_using_template)))
            
            # Check if this is the default template
            if record.is_default:
                other_templates = self.search([('id', '!=', record.id), ('active', '=', True)])
                if other_templates:
                    raise ValidationError(_('Cannot delete the default template. Please set another template as default first.'))
                else:
                    raise ValidationError(_('Cannot delete the only active template in the system.'))
        
        return super().unlink()


class CarSpecificationTemplateLine(models.Model):
    _name = 'alromaih.car.specification.template.line'
    _description = _('Car Specification Template Line')
    _order = 'category_sequence, sequence, attribute_id'
    
    template_id = fields.Many2one('alromaih.car.specification.template', 
                                string='Template', required=True, ondelete='cascade')
    attribute_id = fields.Many2one('product.attribute', string='Attribute', 
                                 required=True, ondelete='cascade')
    
    # Organization within template
    sequence = fields.Integer(string='Sequence', default=10,
                            help="Order within the category")
    category_sequence = fields.Integer(string='Category Sequence', 
                                     related='attribute_id.spec_category_id.sequence',
                                     store=True, readonly=True)
    
    # Display settings
    is_required = fields.Boolean(string='Required', default=False,
                               help="Must be filled for cars using this template")
    is_visible = fields.Boolean(string='Visible', default=True,
                              help="Show in forms and website")
    is_filterable = fields.Boolean(string='Filterable', 
                                 related='attribute_id.is_filterable',
                                 readonly=True)
    
    # Default value
    default_value_id = fields.Many2one('product.attribute.value', 
                                     string='Default Value',
                                     domain="[('attribute_id', '=', attribute_id)]")
    
    # Help and description
    help_text = fields.Text(string='Help Text', translate=True,
                          help="Additional help text for this specification")
    placeholder = fields.Char(string='Placeholder', translate=True,
                            help="Placeholder text for input fields")
    
    @api.onchange('attribute_id')
    def _onchange_attribute_id(self):
        """Reset default value when attribute changes"""
        self.default_value_id = False
    
    @api.constrains('template_id', 'attribute_id')
    def _check_unique_attribute(self):
        """Ensure each attribute appears only once per template"""
        for line in self:
            if self.search_count([
                ('template_id', '=', line.template_id.id),
                ('attribute_id', '=', line.attribute_id.id),
                ('id', '!=', line.id)
            ]) > 0:
                raise ValidationError(_(
                    "Attribute '%s' is already present in this template."
                ) % line.attribute_id.name)


class CarSpecification(models.Model):
    _name = 'alromaih.car.specification'
    _description = _('Car Specification')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'car_id, sequence'
    
    car_id = fields.Many2one('alromaih.car', string='Car', required=True, 
                           ondelete='cascade', tracking=True)
    car_variant_id = fields.Many2one('alromaih.car.variant', string='Car Variant',
                                   domain="[('car_id', '=', car_id)]",
                                   help="Leave empty if specification applies to all variants")
    
    attribute_id = fields.Many2one('product.attribute', string='Attribute', 
                                 required=True, tracking=True)
    
    # Single value (for radio, pills, select, color display types)
    attribute_value_id = fields.Many2one('product.attribute.value', 
                                       string='Value',
                                       domain="[('attribute_id', '=', attribute_id)]",
                                       tracking=True)
    
    # Multiple values (for multi-checkbox display type)
    attribute_value_ids = fields.Many2many('product.attribute.value',
                                          string='Values',
                                       domain="[('attribute_id', '=', attribute_id)]",
                                       tracking=True)
    
    # Custom value for non-standard values
    custom_value = fields.Char(string='Custom Value',
                             help="Use when the value is not in the standard list")
    
    # Organization
    sequence = fields.Integer(string='Sequence', default=10)
    category_id = fields.Many2one('product.attribute.category', 
                                related='attribute_id.spec_category_id',
                                store=True, readonly=True)
    
    # Display type from attribute
    display_type = fields.Selection(related='attribute_id.display_type', 
                                store=True, readonly=True)
    
    # Display
    is_highlighted = fields.Boolean(string='Highlighted', default=False,
                                  help="Show prominently on website")
    is_public = fields.Boolean(string='Public', default=True,
                             help="Visible to public users")
    active = fields.Boolean(default=True)
    
    # Website SEO
    seo_value = fields.Char(string='SEO Value', 
                          help="Search-friendly version of the value")
    
    @api.onchange('car_id')
    def _onchange_car_id(self):
        """Reset variant when car changes"""
        self.car_variant_id = False
    
    @api.onchange('attribute_id')
    def _onchange_attribute_id(self):
        """Reset values when attribute changes"""
        self.attribute_value_id = False
        self.attribute_value_ids = False
        self.custom_value = False
    
    @api.constrains('attribute_id', 'attribute_value_id', 'attribute_value_ids', 'custom_value')
    def _check_value_required(self):
        """Ensure proper values are set based on display type"""
        for spec in self:
            if not spec.attribute_id:
                continue
                
            display_type = spec.attribute_id.display_type
            
            # Multi-checkbox should use attribute_value_ids
            if display_type == 'multi':
                if not spec.attribute_value_ids and not spec.custom_value:
                    raise ValidationError(_(
                        "Multi-checkbox specification '%s' must have at least one selected value or a custom value."
                    ) % spec.attribute_id.name)
                # Clear single value for multi-checkbox
                if spec.attribute_value_id:
                    spec.attribute_value_id = False
            else:
                # Single value types (radio, pills, select, color)
                if not spec.attribute_value_id and not spec.custom_value:
                    raise ValidationError(_(
                        "Specification '%s' must have either a selected value or a custom value."
                    ) % spec.attribute_id.name)
                # Clear multiple values for single-value types
                if spec.attribute_value_ids:
                    spec.attribute_value_ids = False

    @api.depends('attribute_value_id', 'attribute_value_ids', 'custom_value', 'display_type')
    def _compute_display_value(self):
        for spec in self:
            if spec.custom_value:
                spec.display_value = spec.custom_value
            elif spec.display_type == 'multi' and spec.attribute_value_ids:
                # For multi-checkbox, join all selected values
                values = [val.display_value or val.name for val in spec.attribute_value_ids]
                spec.display_value = ', '.join(values)
            elif spec.attribute_value_id:
                spec.display_value = spec.attribute_value_id.display_value or spec.attribute_value_id.name
            else:
                spec.display_value = ''
    
    display_value = fields.Char(string='Display Value', 
                              compute='_compute_display_value', store=True)
    
    @api.model
    def create_from_template(self, car_id, template_id, variant_id=None):
        """Create specifications for a car based on a template"""
        template = self.env['alromaih.car.specification.template'].browse(template_id)
        if not template.exists():
            return False
        
        specifications = []
        for line in template.specification_line_ids:
            vals = {
                'car_id': car_id,
                'car_variant_id': variant_id,
                'attribute_id': line.attribute_id.id,
                'sequence': line.sequence,
                'is_public': line.is_visible,
            }
            
            # Set default value based on display type
            if line.default_value_id:
                if line.attribute_id.display_type == 'multi':
                    vals['attribute_value_ids'] = [(6, 0, [line.default_value_id.id])]
                else:
                    vals['attribute_value_id'] = line.default_value_id.id
            else:
                # Find first available value for this attribute or set as custom
                available_values = self.env['product.attribute.value'].search([
                    ('attribute_id', '=', line.attribute_id.id)
                ], limit=1)
                
                if available_values:
                    if line.attribute_id.display_type == 'multi':
                        vals['attribute_value_ids'] = [(6, 0, [available_values.id])]
                    else:
                        vals['attribute_value_id'] = available_values.id
                else:
                    # No predefined values available, set meaningful default custom value
                    vals['custom_value'] = 'Not specified'
            
            specifications.append(vals)
        
        return self.create(specifications)
    
    def get_selected_value_ids(self):
        """Get all selected value IDs regardless of display type"""
        self.ensure_one()
        if self.display_type == 'multi':
            return self.attribute_value_ids.ids
        elif self.attribute_value_id:
            return [self.attribute_value_id.id]
        else:
            return []
    
    def set_values_from_ids(self, value_ids):
        """Set values from a list of IDs based on display type"""
        self.ensure_one()
        if not value_ids:
            self.attribute_value_id = False
            self.attribute_value_ids = False
            return
            
        if self.display_type == 'multi':
            self.attribute_value_ids = [(6, 0, value_ids)]
            self.attribute_value_id = False
        else:
            # For single-value types, take the first ID
            self.attribute_value_id = value_ids[0] if value_ids else False
            self.attribute_value_ids = False
    
    @api.model
    def get_specifications_by_category(self, car_id, variant_id=None):
        """Get specifications organized by category for a car"""
        domain = [
            ('car_id', '=', car_id),
            ('active', '=', True),
            ('is_public', '=', True)
        ]
        
        if variant_id:
            domain.extend(['|', ('car_variant_id', '=', variant_id), ('car_variant_id', '=', False)])
        else:
            domain.append(('car_variant_id', '=', False))
        
        specifications = self.search(domain, order='sequence')
        
        result = {}
        for spec in specifications:
            category = spec.category_id
            if not category:
                continue
                
            category_key = category.id
            if category_key not in result:
                result[category_key] = {
                    'category': category,
                    'specifications': []
                }
            
            result[category_key]['specifications'].append(spec)
        
        return result 