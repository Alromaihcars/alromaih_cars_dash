from odoo import api, fields, models, _
from odoo.exceptions import UserError, ValidationError


class CarVariant(models.Model):
    _name = 'alromaih.car.variant'
    _description = _('Car Variant')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'sequence, id'
    
    name = fields.Char(string='Name', compute='_compute_name', store=True, translate=True)
    description = fields.Html(string='Variant Description', translate=True,
                             help="Rich text description for SEO and marketing purposes")
    
    # === SEO FIELDS FOR VARIANTS ===
    meta_title = fields.Char(string='Meta Title', translate=True, size=60,
                            help="SEO meta title for this variant (recommended: 50-60 characters)")
    meta_description = fields.Text(string='Meta Description', translate=True,
                                  help="SEO meta description for this variant (recommended: 150-160 characters)")
    meta_keywords = fields.Char(string='Meta Keywords', translate=True,
                               help="SEO keywords for this variant, separated by commas")
    seo_url_slug = fields.Char(string='SEO URL Slug', 
                              help="URL-friendly slug for this variant")
    
    # Auto-generated SEO fields (now editable and multilingual)
    auto_meta_title = fields.Char(string='Auto Meta Title', translate=True, size=60,
                                 help="Auto-generated meta title based on variant details - editable and multilingual")
    auto_meta_description = fields.Text(string='Auto Meta Description', translate=True,
                                       help="Auto-generated meta description for this variant - editable and multilingual")
    auto_seo_keywords = fields.Char(string='Auto SEO Keywords', translate=True,
                                   help="Auto-generated SEO keywords for this variant - editable and multilingual")
    car_id = fields.Many2one('alromaih.car', string='Car', required=True, ondelete='cascade')
    color_id = fields.Many2one('car.color', string='Color', required=True)
    
    # Product Variant Relation for Inventory Management
    product_variant_id = fields.Many2one(
        'product.product', 
        string='Product Variant',
        help='Link to product variant for inventory management',
        tracking=True
    )
    product_template_id = fields.Many2one(
        'product.template',
        string='Product Template',
        related='product_variant_id.product_tmpl_id',
        store=True,
        readonly=True
    )
    
    # Inventory Fields (computed from product variant)
    qty_available = fields.Float(
        string='Quantity On Hand',
        compute='_compute_inventory_quantities',
        store=True,
        help='Current quantity of products in stock'
    )
    qty_forecasted = fields.Float(
        string='Forecasted Quantity',
        compute='_compute_inventory_quantities',
        store=True,
        help='Quantity available for sale (on hand - reserved)'
    )
    virtual_available = fields.Float(
        string='Virtual Available',
        compute='_compute_inventory_quantities',
        store=True,
        help='Quantity available for sale considering incoming and outgoing moves'
    )
    incoming_qty = fields.Float(
        string='Incoming Quantity',
        compute='_compute_inventory_quantities',
        store=True,
        help='Quantity of incoming products'
    )
    outgoing_qty = fields.Float(
        string='Outgoing Quantity',
        compute='_compute_inventory_quantities',
        store=True,
        help='Quantity of outgoing products'
    )
    
    # Stock Status
    stock_status = fields.Selection([
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('no_product', 'No Product Linked')
    ], string='Stock Status', compute='_compute_stock_status', store=True)
    
    # Indicate if this is the primary variant
    is_primary = fields.Boolean(string='Primary Variant', default=False, tracking=True)
    
    # Main image
    image = fields.Binary(string='Thumbnail Image', attachment=True)
    
    # Media Relations
    media_ids = fields.One2many('alromaih.car.media', 'car_variant_id', string='Variant Media')
    media_count = fields.Integer(string='Media Count', compute='_compute_media_count', store=True)
    
    # Primary media for different types
    primary_exterior_image_id = fields.Many2one('alromaih.car.media', string='Primary Exterior Image',
                                               domain="[('car_variant_id', '=', id), ('media_type', '=', 'exterior'), ('content_type', '=', 'image')]")
    primary_interior_image_id = fields.Many2one('alromaih.car.media', string='Primary Interior Image',
                                               domain="[('car_variant_id', '=', id), ('media_type', '=', 'interior'), ('content_type', '=', 'image')]")
    primary_video_id = fields.Many2one('alromaih.car.media', string='Primary Video',
                                      domain="[('car_variant_id', '=', id), ('media_type', '=', 'video')]")
    
    # Media availability flags
    has_exterior_images = fields.Boolean(string='Has Exterior Images', compute='_compute_media_availability', store=True)
    has_interior_images = fields.Boolean(string='Has Interior Images', compute='_compute_media_availability', store=True)
    has_videos = fields.Boolean(string='Has Videos', compute='_compute_media_availability', store=True)
    has_360_view = fields.Boolean(string='Has 360° View', compute='_compute_media_availability', store=True)
    has_brochures = fields.Boolean(string='Has Brochures', compute='_compute_media_availability', store=True)
    
    # Pricing
    price = fields.Float(string='Price', digits=(16, 2), tracking=True)
    
    # Offers related to this variant
    offer_ids = fields.One2many('alromaih.car.offer', 'car_variant_id', string='Offers')
    active_offer_id = fields.Many2one('alromaih.car.offer', string='Active Offer', 
                                    compute='_compute_active_offer', store=True)
    has_offer = fields.Boolean(string='Has Offer', compute='_compute_active_offer', store=True)
    offer_price = fields.Float(string='Offer Price', compute='_compute_active_offer', store=True)
    
    # Status fields
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    
    @api.depends('car_id.name', 'color_id.name')
    def _compute_name(self):
        for rec in self:
            if rec.car_id.name and rec.color_id.name:
                rec.name = f"{rec.car_id.name} - {rec.color_id.name}"
            elif rec.car_id.name:
                rec.name = rec.car_id.name
            else:
                rec.name = rec.color_id.name if rec.color_id.name else _("New Variant")
    
    def _generate_auto_seo_fields(self):
        """Generate auto-SEO fields based on variant details - returns dict with field values"""
        self.ensure_one()
        
        # Auto Meta Title
        parts = []
        if self.car_id.name:
            parts.append(self.car_id.name)
        if self.color_id.name:
            parts.append(f"in {self.color_id.name}")
        if self.car_id.year_id:
            parts.append(self.car_id.year_id.name)
        
        auto_meta_title = ' '.join(parts)[:60] if parts else ''
        
        # Auto Meta Description
        desc_parts = []
        if self.name:
            desc_parts.append(f"Explore the {self.name}")
        
        if self.description:
            # Strip HTML tags for meta description
            import re
            clean_desc = re.sub('<.*?>', '', self.description)
            desc_parts.append(clean_desc[:80])
        else:
            if self.car_id.brand_id and self.car_id.model_id:
                desc_parts.append(f"featuring {self.car_id.brand_id.name} {self.car_id.model_id.name} quality")
            if self.color_id:
                desc_parts.append(f"in stunning {self.color_id.name} color")
            desc_parts.append("Available for purchase with financing options.")
        
        auto_meta_description = ' '.join(desc_parts)[:160]
        
        # Auto SEO Keywords
        keywords = []
        if self.car_id.brand_id:
            keywords.append(self.car_id.brand_id.name.lower())
        if self.car_id.model_id:
            keywords.append(self.car_id.model_id.name.lower())
        if self.car_id.trim_id:
            keywords.append(self.car_id.trim_id.name.lower())
        if self.car_id.year_id:
            keywords.append(self.car_id.year_id.name)
        if self.color_id:
            keywords.append(f"{self.color_id.name.lower()} color")
        keywords.extend(['car variant', 'automotive', 'vehicle color', 'saudi arabia'])
        
        auto_seo_keywords = ', '.join(keywords)
        
        return {
            'auto_meta_title': auto_meta_title,
            'auto_meta_description': auto_meta_description,
            'auto_seo_keywords': auto_seo_keywords
        }
    
    @api.onchange('car_id', 'color_id')
    def _onchange_variant_attributes(self):
        """Auto-populate SEO fields when variant attributes change"""
        # Generate auto-SEO fields if they're empty or if user wants auto-update
        seo_values = self._generate_auto_seo_fields()
        
        # Only auto-populate if fields are empty (don't overwrite user edits)
        if not self.auto_meta_title:
            self.auto_meta_title = seo_values['auto_meta_title']
        if not self.auto_meta_description:
            self.auto_meta_description = seo_values['auto_meta_description']
        if not self.auto_seo_keywords:
            self.auto_seo_keywords = seo_values['auto_seo_keywords']
    
    def action_generate_auto_seo_fields(self):
        """Generate and populate all auto-SEO fields for this variant"""
        self.ensure_one()
        seo_values = self._generate_auto_seo_fields()
        
        # Update the fields
        self.write(seo_values)
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Auto-SEO Fields Generated'),
                'message': _('Auto-generated SEO fields have been updated for this variant in all languages.'),
                'type': 'success',
            }
        }
    
    @api.depends('product_variant_id.qty_available', 'product_variant_id.virtual_available', 
                 'product_variant_id.incoming_qty', 'product_variant_id.outgoing_qty')
    def _compute_inventory_quantities(self):
        """Compute inventory quantities from linked product variant"""
        for rec in self:
            if rec.product_variant_id:
                rec.qty_available = rec.product_variant_id.qty_available
                rec.virtual_available = rec.product_variant_id.virtual_available
                rec.incoming_qty = rec.product_variant_id.incoming_qty
                rec.outgoing_qty = rec.product_variant_id.outgoing_qty
                rec.qty_forecasted = rec.product_variant_id.free_qty
            else:
                rec.qty_available = 0.0
                rec.virtual_available = 0.0
                rec.incoming_qty = 0.0
                rec.outgoing_qty = 0.0
                rec.qty_forecasted = 0.0

    @api.depends('qty_available', 'product_variant_id')
    def _compute_stock_status(self):
        """Compute stock status based on quantity available"""
        for rec in self:
            if not rec.product_variant_id:
                rec.stock_status = 'no_product'
            elif rec.qty_available <= 0:
                rec.stock_status = 'out_of_stock'
            elif rec.qty_available <= 5:  # Low stock threshold
                rec.stock_status = 'low_stock'
            else:
                rec.stock_status = 'in_stock'
    
    @api.depends('media_ids')
    def _compute_media_count(self):
        """Compute total media count for this variant"""
        for rec in self:
            rec.media_count = len(rec.media_ids.filtered('active'))
    
    @api.depends('media_ids.media_type', 'media_ids.active')
    def _compute_media_availability(self):
        """Compute media availability flags based on media types"""
        for rec in self:
            active_media = rec.media_ids.filtered('active')
            rec.has_exterior_images = bool(active_media.filtered(lambda m: m.media_type == 'exterior'))
            rec.has_interior_images = bool(active_media.filtered(lambda m: m.media_type == 'interior'))
            rec.has_videos = bool(active_media.filtered(lambda m: m.media_type == 'video'))
            rec.has_360_view = bool(active_media.filtered(lambda m: m.media_type == '360_view'))
            rec.has_brochures = bool(active_media.filtered(lambda m: m.media_type == 'brochure'))
    
    @api.depends('offer_ids.is_active')
    def _compute_active_offer(self):
        for rec in self:
            active_offers = rec.offer_ids.filtered(lambda o: o.is_active)
            rec.has_offer = bool(active_offers)
            if active_offers:
                # Get the best offer (lowest final price)
                best_offer = min(active_offers, key=lambda o: o.final_price)
                rec.active_offer_id = best_offer
                rec.offer_price = best_offer.final_price
            else:
                rec.active_offer_id = False
                rec.offer_price = 0.0
    
    @api.model_create_multi
    def create(self, vals_list):
        """Enhanced create with SEO slug generation and primary variant handling"""
        # Generate SEO slugs and set defaults
        for vals in vals_list:
            # Generate SEO slug from name if not provided
            if vals.get('name') and not vals.get('seo_url_slug'):
                import re
                slug = re.sub(r'[^a-zA-Z0-9\s]', '', vals['name'])
                slug = re.sub(r'\s+', '-', slug.strip()).lower()
                vals['seo_url_slug'] = slug
        
        variants = super().create(vals_list)
        
        for variant in variants:
            # Auto-populate auto-SEO fields if not provided during creation
            auto_fields_to_update = {}
            
            # Generate auto-SEO fields if not provided
            seo_values = variant._generate_auto_seo_fields()
            if seo_values.get('auto_meta_title'):
                auto_fields_to_update['auto_meta_title'] = seo_values['auto_meta_title']
            if seo_values.get('auto_meta_description'):
                auto_fields_to_update['auto_meta_description'] = seo_values['auto_meta_description']
            if seo_values.get('auto_seo_keywords'):
                auto_fields_to_update['auto_seo_keywords'] = seo_values['auto_seo_keywords']
            
            # Update auto-generated fields if any were generated
            if auto_fields_to_update:
                variant.write(auto_fields_to_update)
            
            # Handle primary variant logic based on color relationship
            if variant.car_id:
                # If this variant's color is the car's primary color, set it as primary
                if (variant.car_id.primary_color_id and 
                    variant.color_id.id == variant.car_id.primary_color_id.id):
                    # Clear other primary variants for this car
                    other_variants = variant.car_id.variant_ids.filtered(
                        lambda v: v.id != variant.id and v.is_primary
                    )
                    other_variants.write({'is_primary': False})
                    
                    # Set this as primary
                    variant.write({'is_primary': True})
                    variant.car_id.write({'primary_variant_id': variant.id})
                
                # If no primary variant exists and this is the first variant, set as primary
                elif not variant.car_id.primary_variant_id:
                    variant.write({'is_primary': True})
                    variant.car_id.write({
                        'primary_variant_id': variant.id,
                        'primary_color_id': variant.color_id.id
                    })
            
            # Auto-map to existing product if not already linked
            if not variant.product_variant_id:
                variant._auto_map_to_product()
                
        return variants
    
    def write(self, vals):
        """Handle primary variant changes and auto-mapping when attributes change"""
        if 'is_primary' in vals and vals['is_primary']:
            # If setting this variant as primary, unset others
            for variant in self.filtered(lambda v: v.car_id):
                car = variant.car_id
                # Unset other variants for this car
                car.variant_ids.filtered(lambda v: v.id != variant.id).write({'is_primary': False})
                # Update car's primary variant
                car.primary_variant_id = variant.id
        
        result = super().write(vals)
        
        # Check if any attributes that affect product mapping have changed
        mapping_fields = ['car_id', 'color_id']
        if any(field in vals for field in mapping_fields):
            for variant in self:
                # Only auto-map if no product is currently linked
                if not variant.product_variant_id:
                    variant._auto_map_to_product()
        
        return result
    
    def action_set_as_primary(self):
        """Set this variant as the primary one"""
        self.ensure_one()
        self.is_primary = True
        self.car_id.primary_variant_id = self.id
        return True

    def _auto_map_to_product(self):
        """Auto-map car variant to existing product with matching car attributes"""
        self.ensure_one()
        
        if self.product_variant_id:
            return  # Already mapped
        
        # First, try to find products with exact car attribute matches
        best_match = self._find_exact_attribute_match()
        if best_match:
            return best_match
        
        # If no exact match, try fuzzy matching based on names
        return self._find_fuzzy_name_match()
    
    def _find_exact_attribute_match(self):
        """Find products with exact matching car attributes"""
        # Search for car products (all stockable products)
        car_products = self.env['product.product'].search([
            ('type', '=', 'product'),  # Only stockable products
            ('active', '=', True)
        ])
        
        best_match = None
        best_score = 0
        
        for product in car_products:
            template = product.product_tmpl_id
            score = 0
            matched_attributes = 0
            total_attributes = 0
            
            # Check brand match
            if self.car_id.brand_id:
                total_attributes += 1
                if template.brand_id and template.brand_id.id == self.car_id.brand_id.id:
                    score += 25  # High weight for brand match
                    matched_attributes += 1
            
            # Check model match
            if self.car_id.model_id:
                total_attributes += 1
                if template.model_id and template.model_id.id == self.car_id.model_id.id:
                    score += 25  # High weight for model match
                    matched_attributes += 1
            
            # Check year match
            if self.car_id.year_id:
                total_attributes += 1
                if template.year_ids and self.car_id.year_id in template.year_ids:
                    score += 15  # Medium weight for year match
                    matched_attributes += 1
            
            # Check trim match
            if self.car_id.trim_id:
                total_attributes += 1
                if template.trim_ids and self.car_id.trim_id in template.trim_ids:
                    score += 15  # Medium weight for trim match
                    matched_attributes += 1
            
            # Check color match (for product variants)
            if self.color_id:
                total_attributes += 1
                if template.color_ids and self.color_id in template.color_ids:
                    score += 10  # Lower weight for color match
                    matched_attributes += 1
            
            # Calculate match percentage
            if total_attributes > 0:
                match_percentage = matched_attributes / total_attributes
                
                # Require at least 80% attribute match for exact matching
                if match_percentage >= 0.8:
                    # Bonus for perfect match
                    if match_percentage == 1.0:
                        score += 20
                    
                    # Bonus for having more matched attributes
                    score += matched_attributes * 5
                    
                    if score > best_score:
                        best_score = score
                        best_match = product
        
        # If we found a good exact match, link it
        if best_match and best_score >= 60:  # Minimum score threshold
            self.product_variant_id = best_match.id
            
            # Log the auto-mapping for audit purposes
            self.message_post(
                body=f"Auto-mapped to product with matching attributes: {best_match.name} (Score: {best_score})",
                message_type='notification'
            )
            
            return best_match
        
        return None
    
    def _find_fuzzy_name_match(self):
        """Fallback: Find products using fuzzy name matching"""
        # Build search criteria based on car variant attributes
        search_terms = []
        
        # Add brand name if available
        if self.car_id.brand_id and self.car_id.brand_id.name:
            search_terms.append(self.car_id.brand_id.name.lower())
        
        # Add model name if available
        if self.car_id.model_id and self.car_id.model_id.name:
            search_terms.append(self.car_id.model_id.name.lower())
        
        # Add year if available
        if self.car_id.year_id and self.car_id.year_id.name:
            search_terms.append(str(self.car_id.year_id.name).lower())
        
        # Add trim if available
        if self.car_id.trim_id and self.car_id.trim_id.name:
            search_terms.append(self.car_id.trim_id.name.lower())
        
        # Add color if available
        if self.color_id and self.color_id.name:
            search_terms.append(self.color_id.name.lower())
        
        if not search_terms:
            return None  # No attributes to match
        
        # Search for all stockable products
        products = self.env['product.product'].search([
            ('type', '=', 'product'),  # Only stockable products
            ('active', '=', True)
        ])
        
        best_match = None
        best_score = 0
        
        for product in products:
            # Check if product name contains search terms
            product_text = (product.name or '').lower()
            if product.description:
                product_text += ' ' + product.description.lower()
            
            # Calculate match score
            score = 0
            matched_terms = 0
            
            for term in search_terms:
                if term in product_text:
                    matched_terms += 1
                    score += len(term)  # Longer matches get higher scores
            
            # Only consider products that match at least 60% of terms
            if matched_terms >= len(search_terms) * 0.6:
                # Bonus for exact name match
                if product.name and product.name.lower() == self.name.lower():
                    score += 100
                
                # Bonus for matching more terms
                score += matched_terms * 10
                
                # No penalty for product type - treat all products equally
                
                if score > best_score:
                    best_score = score
                    best_match = product
        
        # If we found a reasonable fuzzy match, link it
        if best_match and best_score > 30:  # Lower threshold for fuzzy matching
            self.product_variant_id = best_match.id
            
            # Log the auto-mapping for audit purposes
            self.message_post(
                body=f"Auto-mapped to product using fuzzy matching: {best_match.name} (Score: {best_score})",
                message_type='notification'
            )
            
            return best_match
        
        return None

    def action_auto_map_product(self):
        """Manual action to trigger auto-mapping"""
        self.ensure_one()
        
        if self.product_variant_id:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Already Mapped'),
                    'message': _('This variant is already linked to a product.'),
                    'type': 'warning',
                }
            }
        
        mapped_product = self._auto_map_to_product()
        
        if mapped_product:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Auto-Mapping Successful'),
                    'message': _('Successfully mapped to product: %s') % mapped_product.name,
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Match Found'),
                    'message': _('No matching product found for auto-mapping.'),
                    'type': 'info',
                }
            }

    @api.model
    def action_bulk_auto_map_products(self):
        """Bulk auto-mapping action for multiple variants"""
        # Get all variants without product mapping
        unmapped_variants = self.search([('product_variant_id', '=', False)])
        
        if not unmapped_variants:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Unmapped Variants'),
                    'message': _('All variants are already mapped to products.'),
                    'type': 'info',
                }
            }
        
        # Perform auto-mapping for each variant
        mapped_count = 0
        failed_variants = []
        
        for variant in unmapped_variants:
            try:
                mapped_product = variant._auto_map_to_product()
                if mapped_product:
                    mapped_count += 1
                else:
                    failed_variants.append(variant.name)
            except Exception as e:
                failed_variants.append(f"{variant.name} (Error: {str(e)})")
        
        # Prepare result message
        if mapped_count > 0:
            message = f"Successfully auto-mapped {mapped_count} variants to existing products."
            if failed_variants:
                message += f"\n\nFailed to map {len(failed_variants)} variants:\n" + "\n".join(failed_variants[:5])
                if len(failed_variants) > 5:
                    message += f"\n... and {len(failed_variants) - 5} more."
            
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Bulk Auto-Mapping Complete'),
                    'message': message,
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Mappings Found'),
                    'message': _('No matching products found for any unmapped variants.'),
                    'type': 'warning',
                }
            }

    def action_create_product_variant(self):
        """Create a product variant for this car variant"""
        self.ensure_one()
        if self.product_variant_id:
            return {
                'type': 'ir.actions.act_window',
                'name': 'Product Variant',
                'res_model': 'product.product',
                'res_id': self.product_variant_id.id,
                'view_mode': 'form',
                'target': 'current',
            }
        
        # Create new product template with car attributes
        template_vals = {
            'name': self.name,
            'detailed_type': 'product',  # Changed from 'car' to 'product'
            'categ_id': self.env.ref('alromaih_cars_dash.product_category_cars', raise_if_not_found=False).id or self.env.ref('product.product_category_all').id,
            'list_price': self.price,
            'standard_price': self.price * 0.8,  # Cost price (80% of selling price)
            'tracking': 'serial',  # Track by serial numbers for cars
            'description': f"Car variant for {self.car_id.name} in {self.color_id.name}",
        }
        
        template = self.env['product.template'].create(template_vals)
        
        # Get the created product variant (should be auto-created)
        product = template.product_variant_ids[0] if template.product_variant_ids else None
        
        if product:
            self.product_variant_id = product.id
            
            # Log the creation
            self.message_post(
                body=f"Created new product template with car attributes: {template.name}",
                message_type='notification'
            )
            
            return {
                'type': 'ir.actions.act_window',
                'name': 'Product Template Created',
                'res_model': 'product.template',
                'res_id': template.id,
                'view_mode': 'form',
                'target': 'current',
            }
        else:
            raise UserError(_("Failed to create product variant. Please try again."))

    def action_create_product_template_with_attributes(self):
        """Create a product template with proper car attributes and variants"""
        self.ensure_one()
        
        # Check if we should create a template for the whole car or just this variant
        car_variants = self.car_id.variant_ids
        
        if len(car_variants) > 1:
            # Multiple variants exist - create template for all colors
            template_vals = {
                'name': self.car_id.name,  # Use car name without color
                'detailed_type': 'product',  # Changed from 'car' to 'product'
                'categ_id': self.env.ref('alromaih_cars_dash.product_category_cars', raise_if_not_found=False).id or self.env.ref('product.product_category_all').id,
                'list_price': self.price,
                'standard_price': self.price * 0.8,
                'tracking': 'serial',
                'description': f"Car template for {self.car_id.name}",
                # Note: Car-specific fields (brand_id, model_id, etc.) are not part of product.template
                # These will be managed through the car_variant relation instead
            }
            
            template = self.env['product.template'].create(template_vals)
            
            # Link all variants to appropriate product variants
            for variant in car_variants:
                if variant.color_id and not variant.product_variant_id:
                    # Find the product variant with matching color
                    matching_product = template.product_variant_ids.filtered(
                        lambda p: variant.color_id.name.lower() in (p.name or '').lower()
                    )
                    if matching_product:
                        variant.product_variant_id = matching_product[0].id
            
            return {
                'type': 'ir.actions.act_window',
                'name': 'Product Template with Variants Created',
                'res_model': 'product.template',
                'res_id': template.id,
                'view_mode': 'form',
                'target': 'current',
            }
        else:
            # Single variant - use the simpler method
            return self.action_create_product_variant()

    def action_view_stock_moves(self):
        """View stock moves for this variant"""
        self.ensure_one()
        if not self.product_variant_id:
            raise UserError(_("No product variant linked to view stock moves."))
        
        return {
            'type': 'ir.actions.act_window',
            'name': f'Stock Moves - {self.name}',
            'res_model': 'stock.move',
            'view_mode': 'list,form',
            'domain': [('product_id', '=', self.product_variant_id.id)],
            'context': {'default_product_id': self.product_variant_id.id},
            'target': 'current',
        }

    def action_view_quants(self):
        """View stock quants for this variant"""
        self.ensure_one()
        if not self.product_variant_id:
            raise UserError(_("No product variant linked to view stock quants."))
        
        return {
            'type': 'ir.actions.act_window',
            'name': f'Stock Quants - {self.name}',
            'res_model': 'stock.quant',
            'view_mode': 'list,form',
            'domain': [('product_id', '=', self.product_variant_id.id)],
            'context': {'default_product_id': self.product_variant_id.id},
            'target': 'current',
        }

    def action_update_stock(self):
        """Open inventory adjustment wizard"""
        self.ensure_one()
        if not self.product_variant_id:
            raise UserError(_("No product variant linked to update stock."))
        
        return {
            'type': 'ir.actions.act_window',
            'name': f'Update Stock - {self.name}',
            'res_model': 'stock.change.product.qty',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_product_id': self.product_variant_id.id,
                'default_product_tmpl_id': self.product_variant_id.product_tmpl_id.id,
            },
        }

    # ===== MEDIA MANAGEMENT METHODS =====
    
    def action_view_media(self):
        """View all media for this variant"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Media - {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'kanban,list,form',
            'domain': [('car_variant_id', '=', self.id)],
            'context': {
                'default_car_id': self.car_id.id,
                'default_car_variant_id': self.id,
                'default_name': f'{self.name} Media',
            },
            'target': 'current',
        }
    
    def action_add_media(self):
        """Add new media for this variant"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Add Media - {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'default_car_id': self.car_id.id,
                'default_car_variant_id': self.id,
                'default_name': f'{self.name} Media',
                'default_media_type': 'exterior',
                'default_content_type': 'image',
            },
        }
    
    def action_manage_exterior_images(self):
        """Manage exterior images for this variant"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Exterior Images - {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'kanban,list,form',
            'domain': [
                ('car_variant_id', '=', self.id),
                ('media_type', '=', 'exterior'),
                ('content_type', '=', 'image')
            ],
            'context': {
                'default_car_id': self.car_id.id,
                'default_car_variant_id': self.id,
                'default_media_type': 'exterior',
                'default_content_type': 'image',
                'default_name': f'{self.name} Exterior',
            },
            'target': 'current',
        }
    
    def action_manage_interior_images(self):
        """Manage interior images for this variant"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Interior Images - {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'kanban,list,form',
            'domain': [
                ('car_variant_id', '=', self.id),
                ('media_type', '=', 'interior'),
                ('content_type', '=', 'image')
            ],
            'context': {
                'default_car_id': self.car_id.id,
                'default_car_variant_id': self.id,
                'default_media_type': 'interior',
                'default_content_type': 'image',
                'default_name': f'{self.name} Interior',
            },
            'target': 'current',
        }
    
    def action_manage_videos(self):
        """Manage videos for this variant"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Videos - {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'kanban,list,form',
            'domain': [
                ('car_variant_id', '=', self.id),
                ('media_type', '=', 'video')
            ],
            'context': {
                'default_car_id': self.car_id.id,
                'default_car_variant_id': self.id,
                'default_media_type': 'video',
                'default_content_type': 'video_url',
                'default_name': f'{self.name} Video',
            },
            'target': 'current',
        }
    
    def get_media_by_type(self, media_type):
        """Get media of specific type for this variant"""
        self.ensure_one()
        return self.media_ids.filtered(lambda m: m.media_type == media_type and m.active)
    
    def get_primary_media(self, media_type):
        """Get primary media of specific type for this variant"""
        self.ensure_one()
        media = self.get_media_by_type(media_type)
        primary = media.filtered('is_primary')
        return primary[0] if primary else (media[0] if media else self.env['alromaih.car.media'])
    
    def get_exterior_images(self):
        """Get all exterior images for this variant"""
        return self.get_media_by_type('exterior').filtered(lambda m: m.content_type == 'image')
    
    def get_interior_images(self):
        """Get all interior images for this variant"""
        return self.get_media_by_type('interior').filtered(lambda m: m.content_type == 'image')
    
    def get_videos(self):
        """Get all videos for this variant"""
        return self.get_media_by_type('video')
    
    def get_primary_exterior_image(self):
        """Get primary exterior image for this variant"""
        return self.get_primary_media('exterior')
    
    def get_primary_interior_image(self):
        """Get primary interior image for this variant"""
        return self.get_primary_media('interior')
    
    def get_primary_video(self):
        """Get primary video for this variant"""
        return self.get_primary_media('video')
    
    def set_primary_media(self, media_id, media_type):
        """Set a media as primary for this variant and media type"""
        self.ensure_one()
        media = self.env['alromaih.car.media'].browse(media_id)
        
        if media.car_variant_id.id != self.id:
            raise UserError(_("Media does not belong to this variant."))
        
        if media.media_type != media_type:
            raise UserError(_("Media type mismatch."))
        
        # Unset other primary media of same type
        other_primary = self.media_ids.filtered(
            lambda m: m.media_type == media_type and m.is_primary and m.id != media_id
        )
        other_primary.write({'is_primary': False})
        
        # Set this media as primary
        media.write({'is_primary': True})
        
        # Update primary media fields
        if media_type == 'exterior' and media.content_type == 'image':
            self.primary_exterior_image_id = media.id
        elif media_type == 'interior' and media.content_type == 'image':
            self.primary_interior_image_id = media.id
        elif media_type == 'video':
            self.primary_video_id = media.id
        
        return True
    
    def copy_media_from_car(self):
        """Copy general car media to this variant"""
        self.ensure_one()
        
        # Get car media that is not variant-specific
        car_media = self.car_id.media_ids.filtered(lambda m: not m.car_variant_id and m.active)
        
        if not car_media:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Media to Copy'),
                    'message': _('No general car media found to copy to this variant.'),
                    'type': 'info',
                }
            }
        
        # Copy media to this variant
        copied_count = 0
        for media in car_media:
            # Check if similar media already exists for this variant
            existing = self.media_ids.filtered(
                lambda m: m.media_type == media.media_type and m.name == media.name
            )
            
            if not existing:
                media.copy({
                    'car_variant_id': self.id,
                    'name': f"{media.name} - {self.color_id.name}",
                    'is_primary': False,  # Don't copy primary status
                })
                copied_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Media Copied'),
                'message': _('Copied %d media items to this variant.') % copied_count,
                'type': 'success',
            }
        }
    
    def get_media_summary(self):
        """Get media summary for this variant"""
        self.ensure_one()
        
        summary = {
            'total_media': self.media_count,
            'exterior_images': len(self.get_exterior_images()),
            'interior_images': len(self.get_interior_images()),
            'videos': len(self.get_videos()),
            'has_360_view': self.has_360_view,
            'has_brochures': self.has_brochures,
            'primary_exterior': self.get_primary_exterior_image(),
            'primary_interior': self.get_primary_interior_image(),
            'primary_video': self.get_primary_video(),
        }
        
        return summary

    @api.model
    def get_inventory_dashboard_data(self):
        """Get inventory data for dashboard"""
        # Get all variants with their stock levels
        variants = self.search([('active', '=', True)])
        
        # Stock levels
        low_stock_variants = []
        out_of_stock_variants = []
        total_stock = 0
        
        for variant in variants:
            # Get stock from related product variant
            stock_qty = variant.qty_available
            total_stock += stock_qty
            
            if stock_qty <= 0:
                out_of_stock_variants.append({
                    'id': variant.id,
                    'name': variant.name,
                    'stock_qty': stock_qty,
                    'car_name': variant.car_id.name,
                    'color': variant.color_id.name,
                    'stock_status': variant.stock_status
                })
            elif stock_qty <= 5:  # Low stock threshold
                low_stock_variants.append({
                    'id': variant.id,
                    'name': variant.name,
                    'stock_qty': stock_qty,
                    'car_name': variant.car_id.name,
                    'color': variant.color_id.name,
                    'stock_status': variant.stock_status
                })
        
        # Top selling variants (simplified - based on offers)
        top_variants = []
        variants_with_offers = variants.filtered(lambda v: v.has_offer)
        for variant in variants_with_offers[:5]:
            top_variants.append({
                'id': variant.id,
                'name': variant.name,
                'car_name': variant.car_id.name,
                'color': variant.color_id.name,
                'offer_price': f"{variant.offer_price:,.0f} SAR" if variant.offer_price else "N/A",
                'original_price': f"{variant.price:,.0f} SAR" if variant.price else "N/A",
                'stock_qty': variant.qty_available,
                'stock_status': variant.stock_status
            })
        
        return {
            'total_variants': len(variants),
            'total_stock': total_stock,
            'out_of_stock_count': len(out_of_stock_variants),
            'low_stock_count': len(low_stock_variants),
            'out_of_stock_variants': out_of_stock_variants[:5],  # Top 5
            'low_stock_variants': low_stock_variants[:5],  # Top 5
            'top_variants': top_variants
        }

    def unlink(self):
        """Prevent deletion if there are related offers or media records"""
        if self.offer_ids or self.media_ids:
            raise UserError(_("Cannot delete this variant as it is linked to offers or media records."))
        super().unlink()