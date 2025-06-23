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
    
    banner_image = fields.Binary(string='Banner Image', attachment=True)
    
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
                        'banner_image': offer.banner_image,
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
                'end_date': offer.end_date.strftime('%Y-%m-%d') if offer.end_date else ''
            })
        
        return {
            'top_offers': top_offers
        } 