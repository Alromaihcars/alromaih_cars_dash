from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

class CarYear(models.Model):
    _name = 'car.year'
    _description = 'Car Year'
    
    name = fields.Char(string='Year', required=True, translate=True)
    description = fields.Text(string='Year Description', translate=True)
    active = fields.Boolean(default=True)

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            cars = self.env['car.car'].search([('year_id', '=', record.id)])
            if cars:
                raise ValidationError(_('Cannot delete year that is being used by cars. Please remove the year from cars first.'))
        return super().unlink()