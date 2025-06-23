from odoo import models, fields, api, _
import logging

_logger = logging.getLogger(__name__)

class CarModel(models.Model):
    _name = 'car.model'
    _description = _('Car Model')
    
    name = fields.Char(string='Model Name', required=True, translate=True)
    description = fields.Text(string='Model Description', translate=True)
    brand_id = fields.Many2one('car.brand', string='Brand', required=True)
    active = fields.Boolean(default=True)
    trim_ids = fields.One2many('car.trim', 'model_id', string='Trims') 