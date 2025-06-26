from odoo import models, fields, api
from odoo.tools.translate import _
import re
from odoo.exceptions import ValidationError
import logging
import requests
import base64

_logger = logging.getLogger(__name__)

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
    
    # === SIMPLE BUNNY CDN INTEGRATION ===
    
    # Bunny Storage path for logo
    logo_bunny_path = fields.Char(string='Logo Bunny Path', 
                                 help="Path to logo in Bunny Storage")
    
    # CDN URL field (computed)
    logo_cdn_url = fields.Char(string='Logo CDN URL', compute='_compute_logo_cdn_url',
                              help="Fast CDN URL for brand logo")

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

    # === SIMPLE BUNNY CDN METHODS (like car_media.py) ===
    
    @api.depends('logo', 'logo_bunny_path')
    def _compute_logo_cdn_url(self):
        """Compute CDN URL for brand logo"""
        for record in self:
            record.logo_cdn_url = record._get_logo_cdn_url()
    
    def _get_bunny_config(self):
        """Get Bunny Storage configuration from system parameters"""
        params = self.env['ir.config_parameter'].sudo()
        return {
            'storage_zone_name': params.get_param('bunny.storage.zone_name', 'alromaih'),
            'access_key': params.get_param('bunny.storage.access_key', 'e78b1fc2-93d6-4fbe-9b3c3fa6ae1e-7718-434d'),
            'region': params.get_param('bunny.storage.region', 'ny'),
            'cdn_domain': params.get_param('bunny.cdn.domain', 'cdn.alromaihcars.com')
        }
    
    def _get_logo_cdn_url(self):
        """Generate CDN URL for brand logo"""
        self.ensure_one()
        
        try:
            config = self._get_bunny_config()
            cdn_domain = config['cdn_domain']
            
            # Check Bunny Storage path first
            if self.logo_bunny_path:
                return f"https://{cdn_domain}/{self.logo_bunny_path}"
            
            # Fallback to Odoo URL if no Bunny path
            if self.logo:
                return f'/web/image/car.brand/{self.id}/logo'
            
            return False
            
        except Exception as e:
            _logger.error(f"Error generating CDN URL for brand {self.id}: {e}")
            return False
    
    def _generate_seo_file_name(self):
        """Generate SEO-optimized file name for brand logo"""
        from datetime import datetime
        import uuid
        
        timestamp = datetime.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:6]
        
        # Build SEO-friendly name
        name_parts = []
        
        if self.name:
            brand_name = self._clean_for_filename(self.name)
            name_parts.append(brand_name)
        
        name_parts.extend(['brand', 'logo'])
        name_parts.append(timestamp)
        name_parts.append(unique_id)
        
        # Join parts and add extension
        seo_name = '-'.join(filter(None, name_parts))
        return f"{seo_name}.jpg"
    
    def _clean_for_filename(self, text):
        """Clean text for SEO-friendly filename"""
        import re
        if not text:
            return ''
        
        # Convert to lowercase
        clean_text = str(text).lower()
        
        # Replace Arabic/special characters
        replacements = {
            'سيارة': 'car',
            ' ': '-',
            '_': '-',
        }
        
        for arabic, english in replacements.items():
            clean_text = clean_text.replace(arabic, english)
        
        # Remove special characters except hyphens
        clean_text = re.sub(r'[^a-zA-Z0-9\-]', '', clean_text)
        
        # Replace multiple hyphens with single
        clean_text = re.sub(r'-+', '-', clean_text)
        
        # Remove leading/trailing hyphens
        clean_text = clean_text.strip('-')
        
        return clean_text[:20]
    
    def _upload_to_bunny_storage(self, file_data, file_name, retry_count=0):
        """Upload logo to Bunny Storage"""
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
            
            # Create file path: car-brands/YYYY/MM/filename
            from datetime import datetime
            now = datetime.now()
            file_path = f"car-brands/{now.year}/{now.month:02d}/{file_name}"
            
            # Bunny Storage API endpoint
            url = f"https://storage.bunnycdn.com/{config['storage_zone_name']}/{file_path}"
            
            # Upload file
            headers = {
                'AccessKey': config['access_key'],
                'Content-Type': 'application/octet-stream',
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
    
    def _upload_logo_to_bunny(self):
        """Upload brand logo to Bunny Storage if needed"""
        self.ensure_one()
        
        # Only upload if we have a logo and no Bunny path
        if self.logo and not self.logo_bunny_path:
            file_name = self._generate_seo_file_name()
            bunny_path = self._upload_to_bunny_storage(self.logo, file_name)
            if bunny_path:
                self.logo_bunny_path = bunny_path
                _logger.info(f"Logo uploaded to Bunny Storage: {bunny_path}")
    
    @api.model
    def create(self, vals):
        """Override create to upload logo to Bunny Storage"""
        record = super().create(vals)
        if record.logo:
            record._upload_logo_to_bunny()
        return record
    
    def write(self, vals):
        """Override write to handle logo updates"""
        # Store old Bunny path for cleanup
        old_bunny_paths = {}
        if 'logo' in vals:
            for record in self:
                old_bunny_paths[record.id] = record.logo_bunny_path
        
        result = super().write(vals)
        
        # Handle logo updates
        if 'logo' in vals:
            for record in self:
                old_path = old_bunny_paths.get(record.id)
                
                # Delete old file if updating
                if old_path:
                    record._delete_from_bunny_storage(old_path)
                    record.logo_bunny_path = False
                
                # Upload new logo
                if record.logo:
                    record._upload_logo_to_bunny()
        
        return result

    def unlink(self):
        """Override unlink method to add custom deletion logic"""
        for record in self:
            if record.model_ids:
                raise ValidationError(_('Cannot delete brand that has related car models. Please delete the models first.'))
            # Delete logo from Bunny Storage if exists
            if record.logo_bunny_path:
                record._delete_from_bunny_storage(record.logo_bunny_path)
        return super().unlink()
    
    # === PUBLIC METHODS ===
    
    def get_logo_url(self):
        """Get the best available logo URL"""
        self.ensure_one()
        return self.logo_cdn_url or (f'/web/image/car.brand/{self.id}/logo' if self.logo else False)
    
    def get_public_logo_url(self):
        """Get public logo URL for website/API use"""
        self.ensure_one()
        return self.get_logo_url()
    
    def action_upload_to_bunny(self):
        """Manual action to upload logo to Bunny Storage"""
        self.ensure_one()
        
        if not self.logo:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Logo'),
                    'message': _('Please upload a logo first.'),
                    'type': 'warning',
                }
            }
        
        # Force upload even if path exists
        self.logo_bunny_path = False
        self._upload_logo_to_bunny()
        
        if self.logo_bunny_path:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Upload Success'),
                    'message': _('Logo successfully uploaded to CDN.'),
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Upload Failed'),
                    'message': _('Failed to upload logo to CDN. Check configuration.'),
                    'type': 'danger',
                }
            }
    
    def action_delete_from_bunny(self):
        """Manual action to delete logo from Bunny Storage"""
        self.ensure_one()
        
        if not self.logo_bunny_path:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No CDN File'),
                    'message': _('No CDN file to delete.'),
                    'type': 'info',
                }
            }
        
        if self._delete_from_bunny_storage(self.logo_bunny_path):
            self.logo_bunny_path = False
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Delete Success'),
                    'message': _('Logo successfully deleted from CDN.'),
                    'type': 'success',
                }
            }
        else:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Delete Failed'),
                    'message': _('Failed to delete logo from CDN.'),
                    'type': 'danger',
                }
            }
    
    @api.model
    def bulk_upload_brand_logos(self):
        """Bulk upload all brand logos to Bunny Storage"""
        brands_with_logo = self.search([('logo', '!=', False)])
        
        success_count = 0
        error_count = 0
        
        for brand in brands_with_logo:
            try:
                if not brand.logo_bunny_path:
                    brand._upload_logo_to_bunny()
                    success_count += 1
            except Exception as e:
                error_count += 1
                _logger.error(f"Failed to upload logo for brand {brand.name}: {e}")
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Bulk Upload Complete'),
                'message': _('Uploaded %d brand logos. %d errors occurred.') % (success_count, error_count),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }
    
    @api.model
    def get_brand_logo_urls(self, brand_ids=None):
        """Get logo CDN URLs for multiple brands (useful for API)"""
        if brand_ids:
            brands = self.browse(brand_ids)
        else:
            brands = self.search([('active', '=', True)])
        
        result = {}
        for brand in brands:
            result[brand.id] = {
                'name': brand.name,
                'logo_url': brand.get_public_logo_url(),
                'slug': brand.slug,
            }
        
        return result