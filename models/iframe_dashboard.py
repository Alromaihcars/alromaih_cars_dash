from odoo import api, fields, models, _
from odoo.exceptions import UserError


class IframeDashboard(models.Model):
    _name = 'alromaih.iframe.dashboard'
    _description = _('Next.js Dashboard Interface')
    _rec_name = 'name'
    
    name = fields.Char(string='Dashboard Name', default='AlRomaih Cars Dashboard', readonly=True)
    url = fields.Char(string='Dashboard URL', help='The Coolify-deployed dashboard URL')
    fallback_url = fields.Char(string='Fallback URL', default='http://92.112.192.192:3002', 
                              help='Local development URL as fallback')
    description = fields.Text(string='Description', 
                             default='Embedded Next.js Dashboard for Alromaih Cars Management', 
                             readonly=True)
    active = fields.Boolean(default=True)
    environment = fields.Selection([
        ('development', 'Development'),
        ('staging', 'Staging'), 
        ('production', 'Production')
    ], string='Environment', default='development')
    
    # Security settings
    iframe_allowed_origins = fields.Text(string='Allowed Origins', 
                                       help='Comma-separated list of allowed iframe origins')
    api_key = fields.Char(string='API Key', help='API key for dashboard authentication')
    
    @api.model
    def get_dashboard_url(self):
        """Get the dashboard URL for iframe embedding"""
        dashboard = self.search([], limit=1)
        if dashboard and dashboard.url:
            return dashboard.url
        # Fallback to system parameter or default
        return self.env['ir.config_parameter'].sudo().get_param(
            'alromaih_cars_dash.dashboard_url', 
            'http://92.112.192.192:3002'
        )
    
    @api.model
    def set_production_url(self, coolify_url):
        """Set the production URL from Coolify deployment"""
        dashboard = self.search([], limit=1)
        if not dashboard:
            dashboard = self.create_default_dashboard()
        
        dashboard.write({
            'url': coolify_url,
            'environment': 'production'
        })
        
        # Also set as system parameter
        self.env['ir.config_parameter'].sudo().set_param(
            'alromaih_cars_dash.dashboard_url', 
            coolify_url
        )
        
        return True
    
    @api.model
    def create_default_dashboard(self):
        """Create default dashboard record if it doesn't exist"""
        existing = self.search([])
        if not existing:
            dashboard = self.create({
                'name': 'AlRomaih Cars Dashboard',
                'url': self.env['ir.config_parameter'].sudo().get_param(
                    'alromaih_cars_dash.dashboard_url', 
                    'http://92.112.192.192:3002'
                ),
                'description': 'Embedded Next.js Dashboard for Alromaih Cars Management',
                'environment': 'development'
            })
            return dashboard
        return existing[0]
    
    @api.model
    def get_iframe_config(self):
        """Get iframe configuration for the view"""
        dashboard = self.search([], limit=1)
        if not dashboard:
            dashboard = self.create_default_dashboard()
            
        config = {
            'url': dashboard.get_dashboard_url(),
            'allowed_origins': dashboard.iframe_allowed_origins or '',
            'environment': dashboard.environment,
            'sandbox_attrs': 'allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-downloads',
        }
        
        # Add API key to URL if available
        if dashboard.api_key:
            separator = '&' if '?' in config['url'] else '?'
            config['url'] += f"{separator}api_key={dashboard.api_key}"
            
        return config
    
    def test_connection(self):
        """Test if the dashboard URL is accessible"""
        try:
            import requests
            response = requests.get(self.url, timeout=10)
            if response.status_code == 200:
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': _('Connection Test'),
                        'message': _('Dashboard is accessible!'),
                        'type': 'success',
                    }
                }
            else:
                raise UserError(_('Dashboard returned status code: %s') % response.status_code)
        except Exception as e:
            raise UserError(_('Failed to connect to dashboard: %s') % str(e))
    
    @api.model
    def get_deployment_instructions(self):
        """Get deployment instructions for Coolify"""
        return {
            'coolify_env_vars': {
                'NEXT_PUBLIC_GRAPHQL_ENDPOINT': 'https://portal.alromaihcars.com/graphql',
                'API_KEY': 'your-secure-api-key',
                'NODE_ENV': 'production',
                'NEXT_TELEMETRY_DISABLED': '1',
                'NEXT_PUBLIC_IFRAME_ALLOWED_ORIGINS': 'https://portal.alromaihcars.com',
                'NEXT_PUBLIC_RESTRICT_TO_IFRAME': 'true',
                'NEXT_PUBLIC_ALLOWED_REFERRERS': 'https://portal.alromaihcars.com',
            },
            'instructions': [
                '1. Deploy to Coolify with the provided environment variables',
                '2. Get the deployed URL (e.g., https://dashboard.alromaih.com)',
                '3. Update the dashboard URL in Odoo using set_production_url()',
                '4. Test the connection using the Test Connection button',
                '5. Access dashboard through Odoo menu: Cars > Dashboard'
            ]
        } 