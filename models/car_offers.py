from odoo import api, fields, models, _
from datetime import datetime, timedelta


class CarOffers(models.Model):
    _name = 'alromaih.car.offer'
    _description = _('Car Offers')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'start_date desc, end_date'
    
    name = fields.Char(string='Offer Title', required=True, translate=True)
    
    # Car/Variant relations - can be linked to either a car (all variants) or specific variant
    car_id = fields.Many2one('alromaih.car', string='Car')
    car_variant_id = fields.Many2one('alromaih.car.variant', string='Car Variant', 
                                   domain="[('car_id', '=', car_id)]")
    apply_to_all_variants = fields.Boolean(string='Apply to All Variants', default=False,
                                        help="If checked, offer will apply to all variants of this car")
    
    description = fields.Text(string='Offer Description', translate=True)
    
    start_date = fields.Date(string='Start Date', required=True, default=fields.Date.today)
    end_date = fields.Date(string='End Date', required=True, default=lambda self: fields.Date.today() + timedelta(days=30))
    
    discount_type = fields.Selection([
        ('fixed', 'Fixed Amount'),
        ('percentage', 'Percentage')
    ], string='Discount Type', default='fixed', required=True)
    
    discount_value = fields.Float(string='Discount Value', required=True)
    original_price = fields.Float(string='Original Price', compute='_compute_original_price', store=True)
    
    final_price = fields.Float(string='Final Price', compute='_compute_final_price', store=True)
    
    is_active = fields.Boolean(string='Active', compute='_compute_is_active', store=True)
    
    offer_tag = fields.Selection([
        ('hot_deal', 'Hot Deal'),
        ('clearance', 'Clearance'),
        ('limited', 'Limited Time'),
        ('special', 'Special Offer')
    ], string='Offer Tag', default='special')
    
    # Car Media System Integration for offer banners
    banner_media_ids = fields.One2many('alromaih.car.media', 'offer_id', string='Banner Media')
    primary_banner_id = fields.Many2one('alromaih.car.media', string='Primary Banner', 
                                       domain="[('id', 'in', banner_media_ids)]")
    banner_url = fields.Char(string='Banner CDN URL', compute='_compute_banner_url', store=True)
    
    @api.depends('car_id', 'car_variant_id')
    def _compute_original_price(self):
        for rec in self:
            if rec.car_variant_id:
                rec.original_price = rec.car_variant_id.price
            elif rec.car_id:
                rec.original_price = rec.car_id.cash_price_with_vat
            else:
                rec.original_price = 0.0
    
    @api.depends('original_price', 'discount_type', 'discount_value')
    def _compute_final_price(self):
        for rec in self:
            if rec.discount_type == 'fixed':
                rec.final_price = max(0, rec.original_price - rec.discount_value)
            elif rec.discount_type == 'percentage':
                rec.final_price = rec.original_price * (1 - (rec.discount_value / 100))
            else:
                rec.final_price = rec.original_price
    
    @api.depends('start_date', 'end_date')
    def _compute_is_active(self):
        today = fields.Date.today()
        for rec in self:
            rec.is_active = (rec.start_date <= today <= rec.end_date) if rec.start_date and rec.end_date else False
    
    @api.depends('primary_banner_id', 'banner_media_ids')
    def _compute_banner_url(self):
        """Compute banner CDN URL from car media system"""
        for rec in self:
            if rec.primary_banner_id and rec.primary_banner_id.external_url:
                rec.banner_url = rec.primary_banner_id.external_url
            elif rec.banner_media_ids:
                # Get first active media as fallback
                first_banner = rec.banner_media_ids.filtered(lambda m: m.active and m.external_url)[:1]
                rec.banner_url = first_banner.external_url if first_banner else False
            else:
                rec.banner_url = False
    
    @api.onchange('car_id')
    def _onchange_car_id(self):
        """Reset variant when car changes"""
        self.car_variant_id = False
    
    @api.onchange('car_variant_id')
    def _onchange_car_variant_id(self):
        """If variant is selected, set car accordingly"""
        if self.car_variant_id and not self.car_id:
            self.car_id = self.car_variant_id.car_id
    
    @api.onchange('apply_to_all_variants')
    def _onchange_apply_to_all_variants(self):
        """If applying to all variants, clear the specific variant"""
        if self.apply_to_all_variants:
            self.car_variant_id = False
    
    def _create_variant_offers(self):
        """Create offers for all variants if apply_to_all_variants is True"""
        for offer in self.filtered(lambda o: o.apply_to_all_variants and o.car_id):
            car = offer.car_id
            # For each variant, create an identical offer
            for variant in car.variant_ids:
                # Skip if an offer already exists for this variant with the same dates
                existing = self.search([
                    ('car_variant_id', '=', variant.id),
                    ('start_date', '=', offer.start_date),
                    ('end_date', '=', offer.end_date),
                    ('discount_type', '=', offer.discount_type),
                    ('discount_value', '=', offer.discount_value)
                ])
                if not existing:
                    self.create({
                        'name': offer.name,
                        'car_id': car.id,
                        'car_variant_id': variant.id,
                        'apply_to_all_variants': False,  # Individual variant offer
                        'description': offer.description,
                        'start_date': offer.start_date,
                        'end_date': offer.end_date,
                        'discount_type': offer.discount_type,
                        'discount_value': offer.discount_value,
                        'offer_tag': offer.offer_tag,
                        # Note: Banner media will be linked separately if needed
                    })
    
    @api.model
    def create(self, vals):
        offer = super(CarOffers, self).create(vals)
        if offer.apply_to_all_variants:
            offer._create_variant_offers()
        return offer
    
    def write(self, vals):
        result = super(CarOffers, self).write(vals)
        # If updating relevant fields and apply_to_all_variants is True
        if any(field in vals for field in ['discount_type', 'discount_value', 'start_date', 'end_date', 'apply_to_all_variants']):
            for offer in self.filtered(lambda o: o.apply_to_all_variants):
                offer._create_variant_offers()
        return result
    
    # ============================================================================
    # CAR MEDIA SYSTEM INTEGRATION METHODS
    # ============================================================================
    
    def action_create_banner_media(self):
        """Create new banner media for this offer"""
        self.ensure_one()
        
        return {
            'type': 'ir.actions.act_window',
            'name': f'Upload Banner for {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'form',
            'context': {
                'default_offer_id': self.id,
                'default_car_id': self.car_id.id if self.car_id else False,
                'default_car_variant_id': self.car_variant_id.id if self.car_variant_id else False,
                'default_media_type': 'offer_banner',
                'default_content_type': 'image',
                'default_name': f'{self.name} - Banner',
                'default_is_public': True,
                'default_is_primary': True,
                'default_is_featured': True,
                'default_website_visible': True,
                'default_alt_text': f'{self.name} - Special Offer Banner at AlRomaih Cars',
            },
            'target': 'new',
        }
    
    def action_manage_banner_media(self):
        """Open banner media manager for this offer"""
        self.ensure_one()
        
        return {
            'type': 'ir.actions.act_window',
            'name': f'Banner Media for {self.name}',
            'res_model': 'alromaih.car.media',
            'view_mode': 'kanban,list,form',
            'domain': [('offer_id', '=', self.id)],
            'context': {
                'default_offer_id': self.id,
                'default_car_id': self.car_id.id if self.car_id else False,
                'default_media_type': 'offer_banner',
                'default_content_type': 'image',
                'default_is_public': True,
                'default_website_visible': True,
            },
            'help': '''<p class="o_view_nocontent_smiling_face">
                Upload your first offer banner!
            </p>
            <p>
                Create professional offer banners with automatic CDN delivery and SEO optimization.
                All banners are optimized for web and mobile display.
            </p>'''
        }
    
    def get_banner_urls(self):
        """Get all banner URLs for this offer"""
        self.ensure_one()
        
        banners = []
        for media in self.banner_media_ids.filtered(lambda m: m.active and m.external_url):
            banners.append({
                'id': media.id,
                'name': media.name,
                'url': media.external_url,
                'alt_text': media.alt_text,
                'is_primary': media.is_primary,
                'dimensions': media.dimensions,
                'file_size': media.file_size,
            })
        
        return banners

    @api.model
    def get_offers_dashboard_data(self):
        """Get offers data for dashboard"""
        # Get top active offers
        active_offers = self.search([
            ('is_active', '=', True)
        ], order='discount_value desc', limit=5)
        
        top_offers = []
        for offer in active_offers:
            car_name = offer.car_variant_id.name if offer.car_variant_id else offer.car_id.name
            
            # Format discount text
            if offer.discount_type == 'percentage':
                discount_text = f"-{offer.discount_value:.0f}%"
            else:
                discount_text = f"-{offer.discount_value:,.0f} SAR"
            
            top_offers.append({
                'id': offer.id,
                'car_name': car_name,
                'discount_text': discount_text,
                'final_price': f"{offer.final_price:,.0f} SAR",
                'offer_tag': offer.offer_tag,
                'start_date': offer.start_date.strftime('%Y-%m-%d') if offer.start_date else '',
                'end_date': offer.end_date.strftime('%Y-%m-%d') if offer.end_date else '',
                'banner_url': offer.banner_url,
                'banner_count': len(offer.banner_media_ids),
            })
        
        return {
            'top_offers': top_offers
        } 