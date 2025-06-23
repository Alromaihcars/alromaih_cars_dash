from odoo import models, fields, api
from odoo.tools.translate import _
import re
from odoo.exceptions import ValidationError

class CarBrand(models.Model):
    _name = 'car.brand'
    _description = _('Car Brand')
    _order = 'name'

    name = fields.Char(string='Brand Name', required=True, translate=True)
    description = fields.Text(string='Brand Description', translate=True)
    slug = fields.Char(string='Brand Slug', compute='_compute_slug', store=True)
    logo = fields.Binary(string='Brand Logo', attachment=True)
    active = fields.Boolean(default=True)
    model_ids = fields.One2many('car.model', 'brand_id', string='Models')

    @api.depends('name')
    def _compute_slug(self):
        """Generate simple slug from name"""
        for record in self:
            if record.name:
                # Simple slug: lowercase and replace spaces with hyphens
                slug = record.name.lower().replace(' ', '-')
                # Remove special characters
                slug = re.sub(r'[^a-z0-9\-]', '', slug)
                record.slug = slug
            else:
                record.slug = False

    def name_get(self):
        """Return display name for brand"""
        result = []
        for record in self:
            result.append((record.id, record.name or _('New Brand')))
        return result

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            if record.model_ids:
                raise ValidationError(_('Cannot delete brand that has related car models. Please delete the models first.'))
        return super().unlink()