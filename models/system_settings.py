from odoo import api, fields, models, _
from odoo.api import Environment
from odoo.exceptions import ValidationError
import logging
import requests
import base64
import re

_logger = logging.getLogger(__name__)


class AlromaihSystemSettings(models.Model):
    _name = 'alromaih.system.settings'
    _description = 'Alromaih Cars System Settings'
    _rec_name = 'website_name'
    
    # Website Basic Info
    website_name = fields.Char(string='Website Name', translate=True)
    logo_arabic = fields.Binary(string='Logo (Arabic)', help='Base64 encoded logo image for Arabic version')
    logo_english = fields.Binary(string='Logo (English)', help='Base64 encoded logo image for English version')
    website_favicon = fields.Binary(string='Website Favicon', 
                                           help='Website favicon image. Supports multiple formats: '
                                                'ICO (maximum compatibility), PNG (modern standard), '
                                                'SVG (scalable vector), JPG/JPEG, GIF, and WebP. '
                                                'Recommended: 32x32px ICO or PNG for best compatibility.')
    
    # Contact Information
    company_phone = fields.Char(string='Phone Number', translate=True)
    company_email = fields.Char(string='Email Address', translate=True)
    company_address = fields.Char(string='Address', translate=True)
    whatsapp_business_number = fields.Char(string='WhatsApp Business Number', help='WhatsApp number for customer communication')
    customer_support_email = fields.Char(string='Customer Support Email', help='Dedicated email for customer support')
    
    # Business Information
    business_registration_number = fields.Char(string='Business Registration Number', help='Official business registration number')
    vat_number = fields.Char(string='VAT Number', help='Value Added Tax registration number')
    copyright_text = fields.Char(string='Copyright Text', default='© 2025 Alromaih. All rights reserved', translate=True, help='Copyright notice displayed in footer and other areas')
    
    # Business Hours
    business_hours_open = fields.Char(string='Opening Time', help='Business opening time (e.g., 08:00)')
    business_hours_close = fields.Char(string='Closing Time', help='Business closing time (e.g., 18:00)')
    business_days = fields.Char(string='Operating Days', help='Days of operation (e.g., Sunday - Thursday)', translate=True)
    
    # Social Media
    facebook_url = fields.Char(string='Facebook URL')
    instagram_url = fields.Char(string='Instagram URL')
    youtube_url = fields.Char(string='YouTube URL')
    snapchat_url = fields.Char(string='Snapchat URL')
    tiktok_url = fields.Char(string='TikTok URL')
    linkedin_url = fields.Char(string='LinkedIn URL')
    x_url = fields.Char(string='X URL')
    
    # SEO Settings
    meta_title = fields.Char(string='Meta Title', translate=True)
    meta_description = fields.Char(string='Meta Description', translate=True)
    meta_keywords = fields.Char(string='Meta Keywords', translate=True)
    
    # Analytics
    google_analytics_id = fields.Char(string='Google Analytics ID')
    google_tag_manager_id = fields.Char(string='Google Tag Manager ID', help='GTM container ID (e.g., GTM-XXXXXXX)')
    tiktok_pixel_id = fields.Char(string='TikTok Pixel ID')
    meta_pixel_id = fields.Char(string='Meta Pixel ID')
    snapchat_pixel_id = fields.Char(string='Snapchat Pixel ID')
    linkedin_pixel_id = fields.Char(string='LinkedIn Pixel ID')
    x_pixel_id = fields.Char(string='X Pixel ID')

    # Colors and Theme
    primary_color = fields.Char(string='Primary Color', default="#46194F")
    secondary_color = fields.Char(string='Secondary Color', default="#000000")
    
    # Mobile App Settings
    # App Branding
    app_name = fields.Char(string='App Name', translate=True)
    app_logo = fields.Binary(string='App Logo', help='Base64 encoded app logo image')
    app_splash_screen = fields.Binary(string='App Splash Screen', help='Base64 encoded splash screen image')
    
    # App Store Links
    app_store_url = fields.Char(string='App Store URL', help='iOS App Store download link')
    play_store_url = fields.Char(string='Play Store URL', help='Google Play Store download link')
    
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
    bunny_cdn_api_key = fields.Char(string='Bunny CDN API Key')
    hasura_api_key = fields.Char(string='Hasura API Key')
    hasura_url = fields.Char(string='Hasura URL')
    hasura_admin_secret = fields.Char(string='Hasura Admin Secret')
    
    # App Content Settings
    cars_per_page = fields.Integer(string='Cars Per Page in App', default=10)
    featured_cars_limit = fields.Integer(string='Featured Cars Limit', default=6, help='Maximum number of featured cars to display')
    
    # System Settings
    maintenance_mode = fields.Boolean(string='Maintenance Mode', default=False, help='Enable to put the website in maintenance mode')
    
    # Performance Settings
    cache_duration = fields.Integer(string='Cache Duration (minutes)', default=60, help='How long to cache content in minutes')
    
    # Security Settings
    session_timeout = fields.Integer(string='Session Timeout (minutes)', default=30, help='User session timeout in minutes')
    max_login_attempts = fields.Integer(string='Max Login Attempts', default=5, help='Maximum failed login attempts before blocking')
    ip_blocking_enabled = fields.Boolean(string='IP Blocking', default=True, help='Enable automatic IP blocking for failed login attempts')
    
    # === BUNNY CDN INTEGRATION FIELDS ===
    
    # Bunny Storage paths for binary files
    logo_arabic_bunny_path = fields.Char(string='Logo Arabic Bunny Path', 
                                                 help="Path to Arabic logo in Bunny Storage")
    logo_english_bunny_path = fields.Char(string='Logo English Bunny Path', 
                                                  help="Path to English logo in Bunny Storage")
    website_favicon_bunny_path = fields.Char(string='Website Favicon Bunny Path',
                                           help="Path to website favicon in Bunny Storage")
    app_logo_bunny_path = fields.Char(string='App Logo Bunny Path',
                                     help="Path to app logo in Bunny Storage")
    app_splash_screen_bunny_path = fields.Char(string='App Splash Screen Bunny Path',
                                              help="Path to app splash screen in Bunny Storage")
    
    # CDN URL fields (computed)
    logo_arabic_cdn_url = fields.Char(string='Logo Arabic CDN URL', compute='_compute_cdn_urls',
                                              help="Fast CDN URL for Arabic logo")
    logo_english_cdn_url = fields.Char(string='Logo English CDN URL', compute='_compute_cdn_urls',
                                               help="Fast CDN URL for English logo")
    website_favicon_cdn_url = fields.Char(string='Website Favicon CDN URL', compute='_compute_cdn_urls',
                                         help="Fast CDN URL for website favicon")
    app_logo_cdn_url = fields.Char(string='App Logo CDN URL', compute='_compute_cdn_urls',
                                  help="Fast CDN URL for app logo")
    app_splash_screen_cdn_url = fields.Char(string='App Splash Screen CDN URL', compute='_compute_cdn_urls',
                                           help="Fast CDN URL for app splash screen")
    
    # Singleton constraint
    active = fields.Boolean(default=True)
    
    @api.constrains('active')
    def _check_singleton(self):
        """Ensure only one active record exists"""
        if self.active and self.search_count([('id', '!=', self.id), ('active', '=', True)]) > 0:
            raise ValidationError(_('Only one system settings record can be active at a time.'))
    
    @api.constrains('website_favicon')
    def _check_favicon_format(self):
        """Validate that favicon is in supported image format"""
        for record in self:
            if record.website_favicon:
                file_type = record._detect_file_type(record.website_favicon, 'website_favicon')
                supported_formats = ['ico', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff']
                if file_type not in supported_formats:
                    raise ValidationError(_(
                        'Website favicon must be in a supported image format. '
                        'Detected format: %s. '
                        'Supported formats: ICO, PNG, SVG, JPG, GIF, WebP, BMP, TIFF. '
                        'For maximum browser compatibility, use ICO or PNG format.'
                    ) % file_type.upper())
    
    @api.model
    def cleanup_duplicates(self):
        """Clean up duplicate system settings records"""
        try:
            # Get all active records
            active_records = self.search([('active', '=', True)])
            if len(active_records) > 1:
                # Keep the first one, deactivate the rest
                records_to_deactivate = active_records[1:]
                records_to_deactivate.write({'active': False})
                _logger.info(f'Deactivated {len(records_to_deactivate)} duplicate system settings records')
                
            # If no active records exist, activate the first available one
            if not active_records:
                first_record = self.search([], limit=1, order='id asc')
                if first_record:
                    first_record.write({'active': True})
                    _logger.info('Activated first available system settings record')
                    
            return True
        except Exception as e:
            _logger.warning(f'System settings cleanup failed: {e}')
            return False
    
    @api.model
    def get_settings(self):
        """Get the singleton settings record or create if it doesn't exist"""
        # Always try to get or create record with ID 1
        settings = self.browse(1)
        if settings.exists() and settings.active:
            return settings
        
        # Clean up any existing active records
        active_records = self.search([('active', '=', True)])
        if active_records:
            active_records.write({'active': False})
        
        # Create or reactivate record with ID 1
        if settings.exists():
            # Record exists but is inactive, reactivate it
            settings.write({'active': True})
        else:
            # Create new record with ID 1
            vals = {
                'website_name': 'Alromaih Cars',
                'active': True
            }
            # Try to create with specific ID
            try:
                # Use SQL to ensure we get ID 1
                self.env.cr.execute("""
                    INSERT INTO alromaih_system_settings 
                    (id, website_name, active, create_uid, write_uid, create_date, write_date) 
                    VALUES (1, %s, true, %s, %s, NOW(), NOW())
                """, (vals['website_name'], self.env.uid, self.env.uid))
                
                # Update sequence to ensure future records don't conflict
                self.env.cr.execute("""
                    SELECT setval('alromaih_system_settings_id_seq', 
                                  (SELECT MAX(id) FROM alromaih_system_settings))
                """)
                
                self.invalidate_model()
                settings = self.browse(1)
            except Exception as e:
                # Fallback to regular create if SQL fails
                _logger.warning(f"Could not create record with ID 1, using fallback: {e}")
                settings = super(AlromaihSystemSettings, self).create(vals)
        
        # Save default parameters
        self._save_params(settings)
        return settings
    
    @api.model
    def _force_create_with_id_1(self):
        """Deprecated - use get_settings() instead"""
        return self.get_settings()
    
    @api.model
    def get_param(self, param_name, default=False):
        """Get a parameter value from the system parameter store"""
        return self.env['ir.config_parameter'].sudo().get_param(
            f'alromaih_cars_dash.{param_name}', default)
            
    def set_param(self, param_name, value):
        """Set a parameter value in the system parameter store"""
        return self.env['ir.config_parameter'].sudo().set_param(
            f'alromaih_cars_dash.{param_name}', value)
    
    @api.model
    def create(self, vals):
        """Ensure only one record exists by preventing creation if one already exists"""
        # Check if an active record already exists
        existing = self.search([('active', '=', True)], limit=1)
        if existing:
            # Update the existing record instead of creating a new one
            existing.write(vals)
            return existing
            
        # Ensure this is the only active record
        vals['active'] = True
        res = super(AlromaihSystemSettings, self).create(vals)
        
        # Deactivate any other records that might exist
        self.search([('id', '!=', res.id), ('active', '=', True)]).write({'active': False})
        
        # Save all parameters to ir.config_parameter
        self._save_params(res)
        
        # Upload binary fields to Bunny Storage
        res._upload_all_to_bunny()
        
        return res
        
    def write(self, vals):
        """Update parameters when settings are updated"""
        # Store old Bunny paths for cleanup
        binary_fields = ['logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen']
        old_bunny_paths = {}
        
        for field_name in binary_fields:
            if field_name in vals:
                for record in self:
                    bunny_path_field = f"{field_name}_bunny_path"
                    old_bunny_paths[f"{record.id}_{field_name}"] = getattr(record, bunny_path_field, None)
        
        result = super(AlromaihSystemSettings, self).write(vals)
        
        # Save parameters that were updated
        self._save_params(self, vals.keys())
        
        # Handle binary field updates
        for field_name in binary_fields:
            if field_name in vals:
                for record in self:
                    old_path_key = f"{record.id}_{field_name}"
                    old_path = old_bunny_paths.get(old_path_key)
                    bunny_path_field = f"{field_name}_bunny_path"
                    
                    # Delete old file if updating
                    if old_path:
                        record._delete_from_bunny_storage(old_path)
                        # Clear the Bunny path to force re-upload
                        super(AlromaihSystemSettings, record).write({bunny_path_field: False})
                    
                    # Upload new file if present
                    binary_value = getattr(record, field_name, None)
                    if binary_value:
                        record._upload_binary_field_to_bunny(field_name)
        
        return result
    
    def _save_params(self, record, param_names=None):
        """Save settings to ir.config_parameter"""
        for field_name, field in record._fields.items():
            # Skip non-config fields
            if field_name in ['id', 'active', 'create_uid', 'create_date', 
                              'write_uid', 'write_date', '__last_update']:
                continue
                
            # If param_names is provided, only save those params
            if param_names and field_name not in param_names:
                continue
                
            # Get value and save it
            value = record[field_name]
            if value is not None:
                record.set_param(field_name, value)
    
    @api.model
    def load_from_params(self, record):
        """Load settings from ir.config_parameter"""
        for field_name, field in record._fields.items():
            # Skip non-config fields
            if field_name in ['id', 'active', 'create_uid', 'create_date', 
                              'write_uid', 'write_date', '__last_update']:
                continue
            
            # Get value from parameters
            param_value = record.get_param(field_name)
            if param_value:
                # Convert parameter value to appropriate field type
                if field.type == 'boolean':
                    param_value = param_value.lower() in ('true', '1', 'yes')
                elif field.type == 'integer':
                    try:
                        param_value = int(param_value)
                    except (ValueError, TypeError):
                        param_value = 0
                elif field.type == 'float':
                    try:
                        param_value = float(param_value)
                    except (ValueError, TypeError):
                        param_value = 0.0
                
                # Set the field value
                record[field_name] = param_value
        
    @api.model
    def cleanup_dashboard_references(self):
        """Clean up any old dashboard manager references"""
        try:
            # Clean up any actions that might have dashboard_id context
            actions = self.env['ir.actions.client'].search([
                ('tag', '=', 'alromaih_cars_dashboard')
            ])
            for action in actions:
                if action.context and 'dashboard_id' in str(action.context):
                    _logger.info(f'Cleaning dashboard_id from action: {action.name}')
                    # Remove dashboard_id from context
                    context = eval(action.context or '{}')
                    if 'dashboard_id' in context:
                        del context['dashboard_id']
                    action.context = str(context)
            
            _logger.info('Dashboard reference cleanup completed')
            return True
        except Exception as e:
            _logger.warning(f'Dashboard cleanup failed: {e}')
            return False

    @api.depends('logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen',
                 'logo_arabic_bunny_path', 'logo_english_bunny_path', 'website_favicon_bunny_path', 
                 'app_logo_bunny_path', 'app_splash_screen_bunny_path')
    def _compute_cdn_urls(self):
        """Compute CDN URLs for all binary files"""
        for record in self:
            record.logo_arabic_cdn_url = record._get_cdn_url('logo_arabic')
            record.logo_english_cdn_url = record._get_cdn_url('logo_english')
            record.website_favicon_cdn_url = record._get_cdn_url('website_favicon')
            record.app_logo_cdn_url = record._get_cdn_url('app_logo')
            record.app_splash_screen_cdn_url = record._get_cdn_url('app_splash_screen')
    
    def _get_bunny_config(self):
        """Get Bunny Storage configuration from system parameters"""
        params = self.env['ir.config_parameter'].sudo()
        return {
            'storage_zone_name': params.get_param('bunny.storage.zone_name', 'alromaih'),
            'access_key': params.get_param('bunny.storage.access_key', 'e78b1fc2-93d6-4fbe-9b3c3fa6ae1e-7718-434d'),
            'region': params.get_param('bunny.storage.region', 'ny'),
            'cdn_domain': params.get_param('bunny.cdn.domain', 'alromaih.b-cdn.net')
        }
    
    def _get_cdn_url(self, field_name):
        """Generate CDN URL for a specific binary field"""
        self.ensure_one()
        
        try:
            config = self._get_bunny_config()
            cdn_domain = config['cdn_domain']
            
            # Get Bunny path field name
            bunny_path_field = f"{field_name}_bunny_path"
            bunny_path = getattr(self, bunny_path_field, None)
            
            # Check Bunny Storage path first
            if bunny_path:
                return f"https://{cdn_domain}/{bunny_path}"
            
            # Fallback to Odoo URL if no Bunny path
            binary_value = getattr(self, field_name, None)
            if binary_value:
                return f'/web/image/alromaih.system.settings/{self.id}/{field_name}'
            
            return False
            
        except Exception as e:
            _logger.error(f"Error generating CDN URL for field {field_name}: {e}")
            return False
    
    def _detect_file_type(self, binary_data, field_name=''):
        """Detect file type from binary data using file signatures/magic numbers
        
        For favicon files, this method supports all common image formats:
        - ICO: Traditional favicon format, maximum browser compatibility
        - PNG: Modern standard format, excellent compression and transparency
        - SVG: Scalable vector format, perfect for high-DPI displays
        - JPG/JPEG: Common format, good for photos but no transparency
        - GIF: Legacy format, supports animation
        - WebP: Modern format with excellent compression
        """
        if not binary_data:
            return 'png'  # Default to PNG for better compatibility
            
        try:
            # Decode base64 to get actual file content
            file_content = base64.b64decode(binary_data)
            
            # Check file signatures/magic numbers with improved detection
            if file_content.startswith(b'\x89PNG\r\n\x1a\n'):
                return 'png'
            elif file_content.startswith(b'\xff\xd8\xff'):
                return 'jpg'
            elif file_content.startswith(b'GIF87a') or file_content.startswith(b'GIF89a'):
                return 'gif'
            elif file_content.startswith(b'RIFF') and b'WEBP' in file_content[:12]:
                return 'webp'
            # ICO format detection (Windows Icon format)
            elif file_content.startswith(b'\x00\x00\x01\x00') or file_content.startswith(b'\x00\x00\x02\x00'):
                return 'ico'
            # SVG format detection (XML-based vector graphics) - enhanced detection
            elif (file_content.startswith(b'<svg') or 
                  file_content.startswith(b'<?xml') and b'<svg' in file_content[:200] or
                  b'<svg' in file_content[:100]):
                return 'svg'
            # BMP format detection (less common but sometimes used)
            elif file_content.startswith(b'BM'):
                return 'bmp'
            # TIFF format detection
            elif file_content.startswith(b'II*\x00') or file_content.startswith(b'MM\x00*'):
                return 'tiff'
            else:
                # Enhanced fallback detection based on field name and content analysis
                if field_name == 'website_favicon':
                    # For favicon, prefer ICO or PNG
                    if len(file_content) < 1000:  # Small file, likely ICO
                        return 'ico'
                    else:
                        return 'png'  # Larger file, likely PNG
                return 'png'  # Default to PNG for better web compatibility
                
        except Exception as e:
            _logger.warning(f"Could not detect file type for {field_name}: {e}")
            # Return sensible defaults based on field name
            if field_name == 'website_favicon':
                return 'ico'  # Conservative choice for favicon
            return 'png'  # Safe default for other images

    def _generate_seo_file_name(self, field_name, file_type=None):
        """Generate SEO-optimized file name for system settings files"""
        from datetime import datetime
        import uuid
        
        timestamp = datetime.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:6]
        
        # Build SEO-friendly name based on field
        name_parts = ['alromaih-cars']
        
        if field_name == 'logo_arabic':
            name_parts.extend(['logo', 'arabic'])
        elif field_name == 'logo_english':
            name_parts.extend(['logo', 'english'])
        elif field_name == 'website_favicon':
            name_parts.extend(['favicon'])
        elif field_name == 'app_logo':
            name_parts.extend(['mobile', 'app', 'logo'])
        elif field_name == 'app_splash_screen':
            name_parts.extend(['mobile', 'app', 'splash', 'screen'])
        
        # Auto-detect file type if not provided
        if file_type is None:
            binary_value = getattr(self, field_name, None)
            file_type = self._detect_file_type(binary_value, field_name)
        
        name_parts.extend([timestamp, unique_id])
        
        # Join parts and add extension
        seo_name = '-'.join(filter(None, name_parts))
        return f"{seo_name}.{file_type}"
    
    def _get_content_type(self, file_name, file_data=None):
        """Get MIME content type based on file extension and content"""
        if not file_name:
            return 'application/octet-stream'
            
        # Get file extension
        ext = file_name.lower().split('.')[-1] if '.' in file_name else ''
        
        # Comprehensive MIME type mapping for all supported formats
        mime_types = {
            'ico': 'image/x-icon',
            'svg': 'image/svg+xml',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'tif': 'image/tiff'
        }
        
        # Additional validation for SVG files to ensure proper content type
        if ext == 'svg' and file_data:
            try:
                file_content = base64.b64decode(file_data)
                if b'<svg' in file_content or b'svg' in file_content:
                    return 'image/svg+xml'
            except Exception:
                pass
        
        # Additional validation for WebP files
        if ext == 'webp' and file_data:
            try:
                file_content = base64.b64decode(file_data)
                if file_content.startswith(b'RIFF') and b'WEBP' in file_content[:12]:
                    return 'image/webp'
            except Exception:
                pass
        
        return mime_types.get(ext, 'application/octet-stream')

    def _upload_to_bunny_storage(self, file_data, file_name, retry_count=0):
        """Upload file to Bunny Storage"""
        if not file_data:
            return False
            
        try:
            config = self._get_bunny_config()
            if not config['access_key']:
                _logger.warning("Bunny Storage access key not configured")
                return False
            
            # Decode base64 file data
            file_content = base64.b64decode(file_data)
            if len(file_content) == 0:
                _logger.error("Decoded file content is empty")
                return False
            
            # Create file path: system-settings/YYYY/MM/filename
            from datetime import datetime
            now = datetime.now()
            file_path = f"system-settings/{now.year}/{now.month:02d}/{file_name}"
            
            # Bunny Storage API endpoint
            url = f"https://storage.bunnycdn.com/{config['storage_zone_name']}/{file_path}"
            
            # Upload file with proper Content-Type
            content_type = self._get_content_type(file_name, file_data)
            headers = {
                'AccessKey': config['access_key'],
                'Content-Type': content_type,
                'Content-Length': str(len(file_content))
            }
            
            response = requests.put(url, data=file_content, headers=headers, timeout=60)
            
            if response.status_code == 201:
                _logger.info(f"Successfully uploaded {file_name} to Bunny Storage: {file_path}")
                return file_path
            elif response.status_code in [429, 500, 502, 503, 504] and retry_count < 2:
                import time
                time.sleep(2 ** retry_count)
                return self._upload_to_bunny_storage(file_data, file_name, retry_count + 1)
            else:
                _logger.error(f"Failed to upload to Bunny Storage: {response.status_code}")
                return False
                
        except Exception as e:
            if retry_count < 2:
                import time
                time.sleep(2 ** retry_count)
                return self._upload_to_bunny_storage(file_data, file_name, retry_count + 1)
            else:
                _logger.error(f"Error uploading to Bunny Storage: {e}")
                return False
    
    def _delete_from_bunny_storage(self, file_path):
        """Delete file from Bunny Storage"""
        if not file_path:
            return False
            
        try:
            config = self._get_bunny_config()
            url = f"https://storage.bunnycdn.com/{config['storage_zone_name']}/{file_path}"
            
            headers = {'AccessKey': config['access_key']}
            response = requests.delete(url, headers=headers, timeout=30)
            
            if response.status_code in [200, 404]:
                _logger.info(f"Deleted file from Bunny Storage: {file_path}")
                return True
            else:
                _logger.error(f"Failed to delete from Bunny Storage: {response.status_code}")
                return False
                
        except Exception as e:
            _logger.error(f"Error deleting from Bunny Storage: {e}")
            return False
    
    def _upload_binary_field_to_bunny(self, field_name):
        """Upload a specific binary field to Bunny Storage"""
        self.ensure_one()
        
        binary_value = getattr(self, field_name, None)
        bunny_path_field = f"{field_name}_bunny_path"
        current_bunny_path = getattr(self, bunny_path_field, None)
        
        # Only upload if we have binary data and no Bunny path
        if binary_value and not current_bunny_path:
            file_name = self._generate_seo_file_name(field_name)
            bunny_path = self._upload_to_bunny_storage(binary_value, file_name)
            if bunny_path:
                setattr(self, bunny_path_field, bunny_path)
                _logger.info(f"{field_name} uploaded to Bunny Storage: {bunny_path}")
    
    def _upload_all_to_bunny(self):
        """Upload all binary fields to Bunny Storage if needed"""
        self.ensure_one()
        
        binary_fields = ['logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen']
        for field_name in binary_fields:
            self._upload_binary_field_to_bunny(field_name)

    # === PUBLIC METHODS FOR URL ACCESS ===
    
    def get_logo_arabic_url(self):
        """Get the best available Arabic logo URL"""
        self.ensure_one()
        return self.logo_arabic_cdn_url or (f'/web/image/alromaih.system.settings/{self.id}/logo_arabic' if self.logo_arabic else False)
    
    def get_logo_english_url(self):
        """Get the best available English logo URL"""
        self.ensure_one()
        return self.logo_english_cdn_url or (f'/web/image/alromaih.system.settings/{self.id}/logo_english' if self.logo_english else False)
    
    def get_logo_url(self, language='arabic'):
        """Get the best available logo URL based on language"""
        self.ensure_one()
        if language.lower() in ['ar', 'arabic', 'ar_001']:
            return self.get_logo_arabic_url()
        else:
            return self.get_logo_english_url()
    
    def get_website_favicon_url(self):
        """Get the best available website favicon URL"""
        self.ensure_one()
        return self.website_favicon_cdn_url or (f'/web/image/alromaih.system.settings/{self.id}/website_favicon' if self.website_favicon else False)
    
    def get_favicon_html_tags(self):
        """Generate comprehensive HTML link tags for favicon based on the file format
        
        Returns:
            str: Complete HTML link tags for favicon, supporting all modern formats
                 and including multiple sizes for better browser compatibility
        """
        self.ensure_one()
        favicon_url = self.get_website_favicon_url()
        
        if not favicon_url:
            return ''
        
        # Detect favicon file type
        if self.website_favicon:
            file_type = self._detect_file_type(self.website_favicon, 'website_favicon')
            
            if file_type == 'svg':
                # SVG favicon - modern scalable format
                return f'<link rel="icon" type="image/svg+xml" href="{favicon_url}">'
                
            elif file_type == 'ico':
                # ICO favicon - traditional format with multiple sizes
                return (
                    f'<link rel="icon" type="image/x-icon" href="{favicon_url}">\n'
                    f'<link rel="shortcut icon" type="image/x-icon" href="{favicon_url}">'
                )
                
            elif file_type == 'png':
                # PNG favicon - modern standard with size variants
                return (
                    f'<link rel="icon" type="image/png" sizes="32x32" href="{favicon_url}">\n'
                    f'<link rel="icon" type="image/png" sizes="16x16" href="{favicon_url}">\n'
                    f'<link rel="apple-touch-icon" sizes="180x180" href="{favicon_url}">'
                )
                
            elif file_type in ['jpg', 'jpeg']:
                # JPEG favicon - less common but supported
                return f'<link rel="icon" type="image/jpeg" href="{favicon_url}">'
                
            elif file_type == 'gif':
                # GIF favicon - animated favicons support
                return f'<link rel="icon" type="image/gif" href="{favicon_url}">'
                
            elif file_type == 'webp':
                # WebP favicon - modern format with fallback
                return (
                    f'<link rel="icon" type="image/webp" href="{favicon_url}">\n'
                    f'<link rel="icon" type="image/png" href="{favicon_url}">'
                )
            else:
                # Generic fallback for any other format
                return f'<link rel="icon" href="{favicon_url}">'
        
        # Fallback when no file type can be detected
        return f'<link rel="icon" href="{favicon_url}">'
    
    def get_app_logo_url(self):
        """Get the best available app logo URL"""
        self.ensure_one()
        return self.app_logo_cdn_url or (f'/web/image/alromaih.system.settings/{self.id}/app_logo' if self.app_logo else False)
    
    def get_app_splash_screen_url(self):
        """Get the best available app splash screen URL"""
        self.ensure_one()
        return self.app_splash_screen_cdn_url or (f'/web/image/alromaih.system.settings/{self.id}/app_splash_screen' if self.app_splash_screen else False)
    
    def get_copyright_text(self):
        """Get the copyright text"""
        self.ensure_one()
        return self.copyright_text or '© 2025 Alromaih. All rights reserved'
    
    def get_app_store_url(self):
        """Get iOS App Store download URL"""
        self.ensure_one()
        return self.app_store_url or False
    
    def get_play_store_url(self):
        """Get Google Play Store download URL"""
        self.ensure_one()
        return self.play_store_url or False
    
    def get_app_download_url(self, platform='auto'):
        """Get app download URL based on platform
        
        Args:
            platform (str): 'ios', 'android', or 'auto' to return both URLs
            
        Returns:
            str or dict: URL string for specific platform, or dict with both URLs for 'auto'
        """
        self.ensure_one()
        
        if platform.lower() in ['ios', 'iphone', 'ipad', 'apple']:
            return self.get_app_store_url()
        elif platform.lower() in ['android', 'google', 'play']:
            return self.get_play_store_url()
        else:
            # Return both URLs
            return {
                'ios': self.get_app_store_url(),
                'android': self.get_play_store_url()
            }
    
    def get_all_cdn_urls(self):
        """Get all CDN URLs and app store links for API/website use"""
        self.ensure_one()
        return {
            'logo_arabic': self.get_logo_arabic_url(),
            'logo_english': self.get_logo_english_url(),
            'website_favicon': self.get_website_favicon_url(),
            'website_favicon_html': self.get_favicon_html_tags(),  # HTML link tag for favicon
            'app_logo': self.get_app_logo_url(),
            'app_splash_screen': self.get_app_splash_screen_url(),
            'app_store_url': self.get_app_store_url(),
            'play_store_url': self.get_play_store_url(),
            'copyright_text': self.get_copyright_text(),
        }
    
    # === MANUAL ACTIONS FOR BUNNY MANAGEMENT ===
    
    def action_upload_all_to_bunny(self):
        """Manual action to upload all binary files to Bunny Storage"""
        self.ensure_one()
        
        binary_fields = ['logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen']
        uploaded_count = 0
        error_count = 0
        
        for field_name in binary_fields:
            try:
                binary_value = getattr(self, field_name, None)
                if binary_value:
                    # Force upload even if path exists
                    bunny_path_field = f"{field_name}_bunny_path"
                    setattr(self, bunny_path_field, False)
                    self._upload_binary_field_to_bunny(field_name)
                    uploaded_count += 1
            except Exception as e:
                error_count += 1
                _logger.error(f"Failed to upload {field_name}: {e}")
        
        if error_count == 0:
            message = f'Successfully uploaded {uploaded_count} files to CDN.'
            msg_type = 'success'
        else:
            message = f'Uploaded {uploaded_count} files. {error_count} errors occurred.'
            msg_type = 'warning'
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('CDN Upload Complete'),
                'message': _(message),
                'type': msg_type,
            }
        }
    
    def action_delete_all_from_bunny(self):
        """Manual action to delete all files from Bunny Storage"""
        self.ensure_one()
        
        binary_fields = ['logo_arabic', 'logo_english', 'website_favicon', 'app_logo', 'app_splash_screen']
        deleted_count = 0
        
        for field_name in binary_fields:
            bunny_path_field = f"{field_name}_bunny_path"
            bunny_path = getattr(self, bunny_path_field, None)
            
            if bunny_path:
                if self._delete_from_bunny_storage(bunny_path):
                    setattr(self, bunny_path_field, False)
                    deleted_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('CDN Delete Complete'),
                'message': _('Deleted %d files from CDN.') % deleted_count,
                'type': 'success',
            }
        }
    
    @api.model
    def get_public_settings_urls(self):
        """Get public URLs for all settings files (useful for API/website)"""
        settings = self.get_settings()
        return settings.get_all_cdn_urls()

    # Legacy methods for backward compatibility
    def get_logo_arabic_url(self):
        """Get the best available Arabic logo URL (legacy method)"""
        return self.get_logo_arabic_url()
    
    def get_logo_english_url(self):
        """Get the best available English logo URL (legacy method)"""
        return self.get_logo_english_url()
    
    def get_logo_url(self, language='arabic'):
        """Get the best available logo URL based on language (legacy method)"""
        return self.get_logo_url(language)


def post_init_hook(env):
    """Post-install script"""
    env['alromaih.system.settings'].cleanup_dashboard_references()
    env['alromaih.system.settings'].cleanup_duplicates() 