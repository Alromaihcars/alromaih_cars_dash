from odoo import api, fields, models, _


class IframeDashboard(models.Model):
    _name = 'alromaih.iframe.dashboard'
    _description = _('Next.js Dashboard Interface')
    _rec_name = 'name'
    
    name = fields.Char(string='Dashboard Name', default='Next.js Dashboard', readonly=True)
    url = fields.Char(string='Dashboard URL', default='http://92.112.192.192:3002', readonly=True)
    description = fields.Text(string='Description', default='Embedded Next.js Dashboard for Alromaih Cars Management', readonly=True)
    active = fields.Boolean(default=True)
    
    @api.model
    def get_dashboard_url(self):
        """Get the dashboard URL for iframe embedding"""
        return 'http://92.112.192.192:3002'
    
    @api.model
    def create_default_dashboard(self):
        """Create default dashboard record if it doesn't exist"""
        if not self.search([]):
            self.create({
                'name': 'Next.js Dashboard',
                'url': 'http://92.112.192.192:3002',
                'description': 'Embedded Next.js Dashboard for Alromaih Cars Management'
            })
        return True 