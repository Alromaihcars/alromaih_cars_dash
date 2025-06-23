from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError
import logging

_logger = logging.getLogger(__name__)


class AlromaihSystemSettings(models.Model):
    _name = 'alromaih.system.settings'
    _description = 'Alromaih Cars System Settings'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'display_name'
    _order = 'id desc'
    
    # Basic Info
    display_name = fields.Char(string='Display Name', default='System Settings', required=True, tracking=True)
    active = fields.Boolean(string='Active', default=True, tracking=True)
    
    # Website Basic Info
    website_name = fields.Char(string='Website Name', translate=True, tracking=True)
    website_logo = fields.Image(string='Website Logo', max_width=1920, max_height=1080)
    website_favicon = fields.Image(string='Website Favicon', max_width=64, max_height=64)
    
    # Contact Information
    company_phone = fields.Char(string='Phone Number')
    company_email = fields.Char(string='Email Address')
    company_address = fields.Text(string='Address', translate=True)
    
    # Social Media
    facebook_url = fields.Char(string='Facebook URL')
    twitter_url = fields.Char(string='Twitter URL') 
    instagram_url = fields.Char(string='Instagram URL')
    youtube_url = fields.Char(string='YouTube URL')
    
    # SEO Settings
    meta_title = fields.Char(string='Meta Title', translate=True)
    meta_description = fields.Text(string='Meta Description', translate=True)
    meta_keywords = fields.Char(string='Meta Keywords', translate=True)
    
    # Analytics
    google_analytics_id = fields.Char(string='Google Analytics ID')
    tiktok_pixel_id = fields.Char(string='TikTok Pixel ID')
    meta_pixel_id = fields.Char(string='Meta Pixel ID')
    snapchat_pixel_id = fields.Char(string='Snapchat Pixel ID')
    linkedin_pixel_id = fields.Char(string='LinkedIn Pixel ID')
    x_pixel_id = fields.Char(string='X Pixel ID')
    
    # Colors and Theme
    primary_color = fields.Char(string='Primary Color', default="#0056b3", tracking=True)
    secondary_color = fields.Char(string='Secondary Color', default="#6c757d", tracking=True)
    
    # Footer Settings
    footer_text = fields.Text(string='Footer Text', translate=True)
    
    # Mobile App Settings - App Branding
    app_name = fields.Char(string='App Name', translate=True, tracking=True)
    app_logo = fields.Image(string='App Logo', max_width=512, max_height=512)
    app_splash_screen = fields.Image(string='App Splash Screen', max_width=1080, max_height=1920)
    
    # App Theme
    app_primary_color = fields.Char(string='App Primary Color', default="#0056b3", tracking=True)
    app_secondary_color = fields.Char(string='App Secondary Color', default="#6c757d", tracking=True)
    
    # App Version Control
    android_app_version = fields.Char(string='Android App Version')
    android_min_version = fields.Char(string='Android Minimum Required Version')
    ios_app_version = fields.Char(string='iOS App Version')
    ios_min_version = fields.Char(string='iOS Minimum Required Version')
    force_update = fields.Boolean(string='Force Update', default=False)
    
    # App Feature Toggles
    enable_app_notifications = fields.Boolean(string='Enable App Notifications', default=True)
    enable_in_app_chat = fields.Boolean(string='Enable In-App Chat', default=True)
    enable_car_comparison = fields.Boolean(string='Enable Car Comparison Feature', default=True)
    enable_app_booking = fields.Boolean(string='Enable Car Booking in App', default=True)
    enable_app_reviews = fields.Boolean(string='Enable Car Reviews in App', default=True)
    
    # App API Keys
    clerk_api_key = fields.Char(string='Clerk API Key')
    push_notification_key = fields.Char(string='Push Notification Key')
    
    # App Analytics
    app_analytics_enabled = fields.Boolean(string='Enable App Analytics', default=True)
    firebase_analytics_id = fields.Char(string='Firebase Analytics ID')
    
    # App Content Settings
    cars_per_page = fields.Integer(string='Cars Per Page in App', default=10)

    @api.model
    def get_settings(self):
        """Get the singleton settings record or create if it doesn't exist"""
        settings = self.search([('active', '=', True)], limit=1)
        if not settings:
            # Create default settings
            settings = self.create({
                'display_name': 'AlRomaih Cars Settings',
                'website_name': 'AlRomaih Cars',
                'app_name': 'AlRomaih Cars',
                'active': True
            })
        return settings
    
    @api.model
    def create(self, vals):
        """Ensure only one active record exists (singleton pattern)"""
        # Set default display_name if not provided
        if not vals.get('display_name'):
            vals['display_name'] = 'AlRomaih Cars Settings'
            
        # Deactivate other active records before creating new one
        active_records = self.search([('active', '=', True)])
        if active_records:
            active_records.write({'active': False})
            _logger.info(f'Deactivated {len(active_records)} existing settings records')
        
        res = super().create(vals)
        _logger.info(f'Created new system settings record: {res.id}')
        return res
    
    def write(self, vals):
        """Override write to maintain singleton pattern"""
        # If activating this record, deactivate others
        if vals.get('active', False):
            other_active = self.search([('id', '!=', self.id), ('active', '=', True)])
            if other_active:
                other_active.write({'active': False})
                _logger.info(f'Deactivated {len(other_active)} other settings records')
        
        return super().write(vals)

    @api.constrains('active')
    def _check_single_active(self):
        """Ensure only one active record exists"""
        for record in self:
            if record.active:
                active_count = self.search_count([('active', '=', True), ('id', '!=', record.id)])
                if active_count > 0:
                    raise ValidationError(_('Only one active system settings record is allowed.'))

    def copy(self, default=None):
        """Prevent copying of system settings"""
        raise UserError(_('System settings cannot be duplicated. Only one active record is allowed.'))

    def unlink(self):
        """Add warning when deleting system settings"""
        for record in self:
            if record.active:
                raise UserError(_('Cannot delete the active system settings record. Please create a new one first.'))
        return super().unlink()

    @api.model
    def get_settings_for_website(self):
        """Get settings formatted for website use"""
        settings = self.get_settings()
        return {
            'website_name': settings.website_name or '',
            'primary_color': settings.primary_color or '#0056b3',
            'secondary_color': settings.secondary_color or '#6c757d',
            'meta_title': settings.meta_title or '',
            'meta_description': settings.meta_description or '',
            'meta_keywords': settings.meta_keywords or '',
            'google_analytics_id': settings.google_analytics_id or '',
            'company_phone': settings.company_phone or '',
            'company_email': settings.company_email or '',
            'company_address': settings.company_address or '',
            'social_media': {
                'facebook': settings.facebook_url or '',
                'twitter': settings.twitter_url or '',
                'instagram': settings.instagram_url or '',
                'youtube': settings.youtube_url or '',
            }
        }

    @api.model
    def get_settings_for_mobile(self):
        """Get settings formatted for mobile app use"""
        settings = self.get_settings()
        return {
            'app_name': settings.app_name or '',
            'app_primary_color': settings.app_primary_color or '#0056b3',
            'app_secondary_color': settings.app_secondary_color or '#6c757d',
            'android_app_version': settings.android_app_version or '',
            'android_min_version': settings.android_min_version or '',
            'ios_app_version': settings.ios_app_version or '',
            'ios_min_version': settings.ios_min_version or '',
            'force_update': settings.force_update,
            'features': {
                'notifications': settings.enable_app_notifications,
                'chat': settings.enable_in_app_chat,
                'comparison': settings.enable_car_comparison,
                'booking': settings.enable_app_booking,
                'reviews': settings.enable_app_reviews,
            },
            'analytics': {
                'enabled': settings.app_analytics_enabled,
                'firebase_id': settings.firebase_analytics_id or '',
            },
            'cars_per_page': settings.cars_per_page or 10,
        }

    def name_get(self):
        """Custom name_get for better display"""
        result = []
        for record in self:
            name = record.display_name or record.website_name or 'System Settings'
            if record.active:
                name = f"🟢 {name}"
            else:
                name = f"⚪ {name}"
            result.append((record.id, name))
        return result

    @api.model
    def search_read(self, domain=None, fields=None, offset=0, limit=None, order=None):
        """Custom search_read for better data handling"""
        if not domain:
            domain = []
        
        # For API calls, always return the active settings
        if not any('active' in str(clause) for clause in domain):
            domain.append(('active', '=', True))
            
        return super().search_read(domain, fields, offset, limit, order)

    # Image helper methods for GraphQL/API
    def get_website_logo_url(self):
        """Get website logo URL"""
        if self.website_logo:
            return f'/web/image/alromaih.system.settings/{self.id}/website_logo'
        return False

    def get_website_favicon_url(self):
        """Get website favicon URL"""
        if self.website_favicon:
            return f'/web/image/alromaih.system.settings/{self.id}/website_favicon'
        return False

    def get_app_logo_url(self):
        """Get app logo URL"""
        if self.app_logo:
            return f'/web/image/alromaih.system.settings/{self.id}/app_logo'
        return False

    def get_app_splash_screen_url(self):
        """Get app splash screen URL"""
        if self.app_splash_screen:
            return f'/web/image/alromaih.system.settings/{self.id}/app_splash_screen'
        return False

    def get_settings(self):
        """Action method for the settings button"""
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }