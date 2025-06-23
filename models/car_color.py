from odoo import models, fields, api
from odoo.tools.translate import _
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

class CarColor(models.Model):
    _name = 'car.color'
    _description = 'Car Color'
    
    name = fields.Char(string='Color Name', required=True, translate=True)
    description = fields.Text(string='Color Description', translate=True)
    code = fields.Char(string='Color Code')
    color_picker = fields.Char(string='Color', help='Color picker')
    active = fields.Boolean(default=True)

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            cars = self.env['car.car'].search([('color_id', '=', record.id)])
            if cars:
                raise ValidationError(_('Cannot delete color that is being used by cars. Please remove the color from cars first.'))
        return super().unlink()