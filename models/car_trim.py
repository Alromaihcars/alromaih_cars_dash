from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
import logging

_logger = logging.getLogger(__name__)

class CarTrim(models.Model):
    _name = 'car.trim'
    _description = _('Car Trim')
    
    name = fields.Char(string='Trim Name', required=True, translate=True)
    description = fields.Text(string='Trim Description', translate=True)
    model_id = fields.Many2one('car.model', string='Model', required=True)
    code = fields.Char(string='Trim Code')
    active = fields.Boolean(default=True)

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            cars = self.env['car.car'].search([('trim_id', '=', record.id)])
            if cars:
                raise ValidationError(_('Cannot delete trim that is being used by cars. Please remove the trim from cars first.'))
        return super().unlink()