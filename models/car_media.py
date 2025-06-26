from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
import logging
import requests
import base64
import hashlib

_logger = logging.getLogger(__name__)


class CarMedia(models.Model):
    _name = 'alromaih.car.media'
    _description = _('Car Media Management')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'media_type, sequence, id'
    
    name = fields.Char(string='Media Title', required=True, tracking=True, translate=True)
    car_id = fields.Many2one('alromaih.car', string='Car', ondelete='cascade')
    
    # Offer relation for banner media
    offer_id = fields.Many2one('alromaih.car.offer', string='Car Offer', ondelete='cascade',
                              help="Link media to specific car offer for banners and promotional content")
    car_variant_id = fields.Many2one('alromaih.car.variant', string='Car Variant', 
                                   domain="[('car_id', '=', car_id)]",
                                   help="Leave empty if media applies to all variants")
    
    # Media type and content
    media_type = fields.Selection([
        ('interior', 'Interior Images'),
        ('exterior', 'Exterior Images'),
        ('thumbs', 'Thumbnails'),
        ('engine', 'Engine Images'),
        ('trunk', 'Trunk Images'),
        ('dashboard', 'Dashboard Images'),
        ('360_view', '360° View'),
        ('video', 'Video Content'),
        ('brochure', 'Brochure/Documents'),
        ('specification', 'Specification'),
        ('offer_banner', 'Offer Banner'),
        ('promotional', 'Promotional Content'),
        ('other', 'Other Media')
    ], string='Media Type', required=True, default='exterior', tracking=True)
    
    # Override the content type to include more formats
    content_type = fields.Selection([
        ('image', 'Image File'),
        ('video_file', 'Video File'),
        ('video_url', 'Video URL'),
        ('iframe_360', '360° iFrame'),
        ('iframe_code', 'Custom iFrame Code'),
        ('document', 'Document/PDF'),
        ('external_link', 'External Link'),
        ('svg_icon', 'SVG Icon'),
        ('favicon_ico', 'Favicon ICO')
    ], string='Content Type', required=True, default='image', tracking=True)
    
    # File uploads
    image = fields.Binary(string='Image File', attachment=True)
    video_file = fields.Binary(string='Video File', attachment=True)
    document_file = fields.Binary(string='Document/PDF', attachment=True)
    
    # Bunny Storage paths
    bunny_image_path = fields.Char(string='Bunny Image Path', help="Path to image in Bunny Storage")
    bunny_video_path = fields.Char(string='Bunny Video Path', help="Path to video in Bunny Storage") 
    bunny_document_path = fields.Char(string='Bunny Document Path', help="Path to document in Bunny Storage")
    
    # External content
    video_url = fields.Char(string='Video URL', help="YouTube, Vimeo, or other video platform URL")
    iframe_code = fields.Text(string='iFrame Code', help="Complete iframe HTML code for 360° views or other embedded content")
    external_link = fields.Char(string='External Link', help="Link to external content")
    
    # Display and organization
    sequence = fields.Integer(string='Sequence', default=10, tracking=True,
                            help="Determines the display order of media items")
    description = fields.Text(string='Description', translate=True)
    alt_text = fields.Char(string='Alt Text', help="Alternative text for accessibility", translate=True)
    
    # Visibility and status
    is_primary = fields.Boolean(string='Primary Media', default=False, tracking=True,
                              help="Mark as primary media for this type")
    is_featured = fields.Boolean(string='Featured', default=False, tracking=True,
                                help="Show in featured/highlighted sections")
    is_public = fields.Boolean(string='Public', default=True, tracking=True,
                             help="Visible to public users on website")
    active = fields.Boolean(default=True)
    
    # Technical metadata
    file_size = fields.Float(string='File Size (MB)', compute='_compute_file_size', store=True)
    mime_type = fields.Char(string='MIME Type', compute='_compute_mime_type', store=True)
    dimensions = fields.Char(string='Dimensions', help="Image/Video dimensions (e.g., 1920x1080)")
    
    # Website specific
    website_visible = fields.Boolean(string='Show on Website', default=True)
    seo_title = fields.Char(string='SEO Title', help="Title for search engines", translate=True)
    seo_description = fields.Text(string='SEO Description', help="Description for search engines", translate=True)
    
    # CDN URL field for public media access
    external_url = fields.Char(
        string='CDN Media URL',
        compute='_compute_external_url',
        help="Permanent public URL via CDN for fast media delivery and SEO"
    )
    
    @api.depends('image', 'video_file', 'document_file')
    def _compute_file_size(self):
        for record in self:
            size = 0
            if record.image:
                size = len(record.image) / (1024 * 1024)  # Convert to MB
            elif record.video_file:
                size = len(record.video_file) / (1024 * 1024)
            elif record.document_file:
                size = len(record.document_file) / (1024 * 1024)
            record.file_size = round(size, 2)
    
    @api.depends('content_type', 'video_url')
    def _compute_mime_type(self):
        for record in self:
            mime_type = ''
            if record.content_type == 'image':
                mime_type = 'image/*'
            elif record.content_type in ['video_file', 'video_url']:
                mime_type = 'video/*'
            elif record.content_type == 'document':
                mime_type = 'application/pdf'
            record.mime_type = mime_type
    
    @api.onchange('car_id')
    def _onchange_car_id(self):
        """Reset variant when car changes"""
        self.car_variant_id = False
    
    @api.onchange('media_type')
    def _onchange_media_type(self):
        """Set appropriate content type based on media type"""
        if self.media_type == '360_view':
            self.content_type = 'iframe_360'
        elif self.media_type == 'video':
            self.content_type = 'video_url'
        elif self.media_type == 'brochure':
            self.content_type = 'document'
        else:
            self.content_type = 'image'
        
        # Auto-generate title when media type changes
        self._auto_generate_title()
    
    @api.onchange('car_id', 'car_variant_id', 'content_type')
    def _onchange_car_details(self):
        """Auto-generate title when car details change"""
        self._auto_generate_title()
    
    def _auto_generate_title(self):
        """Auto-generate media title based on car variant color, media type, or offer"""
        # Handle offer media differently
        if self.offer_id:
            title_parts = [str(self.offer_id.name)]
            
            # Add media type
            media_types = {
                'offer_banner': 'Banner',
                'promotional': 'Promotional',
                'exterior': 'Exterior',
                'interior': 'Interior',
                'other': 'Media'
            }
            
            media_type_name = media_types.get(self.media_type, 'Media')
            title_parts.append(media_type_name)
            
            self.name = ' - '.join(title_parts)
            return
        
        if not self.car_id:
            return
        
        title_parts = []
        
        # Car brand and model
        if self.car_id.brand_id:
            title_parts.append(str(self.car_id.brand_id.name))
        if self.car_id.model_id:
            title_parts.append(str(self.car_id.model_id.name))
        
        # Year if available
        if hasattr(self.car_id, 'year_id') and self.car_id.year_id:
            title_parts.append(str(self.car_id.year_id.name))
        
        # Variant color (this is the key part the user wanted)
        if self.car_variant_id and self.car_variant_id.color_id:
            title_parts.append(str(self.car_variant_id.color_id.name))
        
        # Media type
        media_types = {
            'exterior': 'Exterior',
            'interior': 'Interior', 
            'engine': 'Engine',
            'dashboard': 'Dashboard',
            'trunk': 'Trunk',
            '360_view': '360° View',
            'video': 'Video',
            'brochure': 'Brochure',
            'thumbs': 'Thumbnail',
            'other': 'Gallery'
        }
        
        media_type_name = media_types.get(self.media_type, 'Media')
        title_parts.append(media_type_name)
        
        # Content type addition
        if self.content_type == 'video_file' or self.content_type == 'video_url':
            if media_type_name != 'Video':
                title_parts.append('Video')
        elif self.content_type == 'document':
            if media_type_name != 'Brochure':
                title_parts.append('Document')
        elif self.content_type == 'image':
            title_parts.append('Photo')
        
        # Join with hyphens for clean look
        self.name = ' - '.join(title_parts)
    
    def action_regenerate_title(self):
        """Manual action to regenerate media title"""
        self.ensure_one()
        self._auto_generate_title()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Title Regenerated'),
                'message': _('Media title has been auto-generated based on car variant and media type.'),
                'type': 'success',
            }
        }
    
    @api.constrains('car_id', 'offer_id', 'media_type')
    def _check_car_or_offer_required(self):
        """Ensure either car_id or offer_id is provided"""
        for record in self:
            # For all media types, require either car or offer
            if not record.car_id and not record.offer_id:
                raise ValidationError(_("Either Car or Offer must be specified for media."))
    
    @api.constrains('is_primary', 'media_type', 'car_id', 'car_variant_id', 'offer_id')
    def _check_primary_media(self):
        """Ensure only one primary media per type per car/variant/offer"""
        for record in self.filtered('is_primary'):
            # Handle car/offer media
            domain = [
                ('is_primary', '=', True),
                ('media_type', '=', record.media_type),
                ('id', '!=', record.id)
            ]
            
            # Different logic for offer media vs car media
            if record.offer_id:
                domain.append(('offer_id', '=', record.offer_id.id))
            else:
                domain.append(('car_id', '=', record.car_id.id))
                domain.append(('offer_id', '=', False))
                
                if record.car_variant_id:
                    domain.append(('car_variant_id', '=', record.car_variant_id.id))
                else:
                    domain.append(('car_variant_id', '=', False))
            
            if self.search_count(domain) > 0:
                context_type = "offer" if record.offer_id else "car"
                raise ValidationError(_(
                    "Only one primary media is allowed per media type per %s. "
                    "Please uncheck other primary media of type '%s' first."
                ) % (context_type, dict(self._fields['media_type'].selection)[record.media_type]))
    
    @api.constrains('content_type', 'image', 'video_file', 'video_url', 'iframe_code', 'external_link', 'document_file')
    def _check_content_consistency(self):
        """Ensure content matches the selected content type"""
        for record in self:
            if record.content_type == 'image' and not record.image:
                raise ValidationError(_("Image file is required for image content type."))
            elif record.content_type == 'video_file' and not record.video_file:
                raise ValidationError(_("Video file is required for video file content type."))
            elif record.content_type == 'video_url' and not record.video_url:
                raise ValidationError(_("Video URL is required for video URL content type."))
            elif record.content_type in ['iframe_360', 'iframe_code'] and not record.iframe_code:
                raise ValidationError(_("iFrame code is required for iframe content types."))
            elif record.content_type == 'external_link' and not record.external_link:
                raise ValidationError(_("External link is required for external link content type."))
            elif record.content_type == 'document' and not record.document_file:
                raise ValidationError(_("Document file is required for document content type."))
    
    def action_set_as_primary(self):
        """Set this media as primary for its type"""
        self.ensure_one()
        
        # Unset other primary media of same type
        domain = [
            ('media_type', '=', self.media_type),
            ('car_id', '=', self.car_id.id),
            ('id', '!=', self.id)
        ]
        
        if self.car_variant_id:
            domain.append(('car_variant_id', '=', self.car_variant_id.id))
        else:
            domain.append(('car_variant_id', '=', False))
        
        other_primary = self.search(domain + [('is_primary', '=', True)])
        other_primary.write({'is_primary': False})
        
        # Set this as primary
        self.is_primary = True
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Success'),
                'message': _('Media has been set as primary.'),
                'type': 'success',
            }
        }
    
    def get_display_url(self):
        """Get the appropriate URL for displaying this media"""
        self.ensure_one()
        
        if self.content_type == 'image' and self.image:
            return f'/web/image/alromaih.car.media/{self.id}/image'
        elif self.content_type == 'video_url' and self.video_url:
            return self.video_url
        elif self.content_type == 'external_link' and self.external_link:
            return self.external_link
        elif self.content_type == 'document' and self.document_file:
            return f'/web/content/alromaih.car.media/{self.id}/document_file'
        
        return False
    
    def get_media_by_type(self, media_type, car_id, variant_id=None):
        """Get media filtered by type for a specific car/variant"""
        domain = [
            ('media_type', '=', media_type),
            ('car_id', '=', car_id),
            ('active', '=', True),
            ('is_public', '=', True)
        ]
        
        if variant_id:
            domain.extend(['|', ('car_variant_id', '=', variant_id), ('car_variant_id', '=', False)])
        else:
            domain.append(('car_variant_id', '=', False))
        
        return self.search(domain, order='sequence, id')
    
    @api.model
    def get_media_stats(self, car_id=None):
        """Get media statistics for dashboard"""
        domain = [('active', '=', True)]
        if car_id:
            domain.append(('car_id', '=', car_id))
        
        media_records = self.search(domain)
        
        stats = {
            'total_media': len(media_records),
            'by_type': {},
            'by_content_type': {},
            'total_size_mb': sum(media_records.mapped('file_size')),
            'primary_count': len(media_records.filtered('is_primary')),
            'featured_count': len(media_records.filtered('is_featured'))
        }
        
        # Group by media type
        for media_type, label in self._fields['media_type'].selection:
            count = len(media_records.filtered(lambda m: m.media_type == media_type))
            if count > 0:
                stats['by_type'][media_type] = {'label': label, 'count': count}
        
        # Group by content type
        for content_type, label in self._fields['content_type'].selection:
            count = len(media_records.filtered(lambda m: m.content_type == content_type))
            if count > 0:
                stats['by_content_type'][content_type] = {'label': label, 'count': count}
        
        return stats 
    
    @api.model
    def get_variant_media_stats(self, variant_id):
        """Get media statistics for a specific variant"""
        variant_media = self.search([
            ('car_variant_id', '=', variant_id),
            ('active', '=', True)
        ])
        
        stats = {
            'total_media': len(variant_media),
            'exterior_images': len(variant_media.filtered(lambda m: m.media_type == 'exterior' and m.content_type == 'image')),
            'interior_images': len(variant_media.filtered(lambda m: m.media_type == 'interior' and m.content_type == 'image')),
            'videos': len(variant_media.filtered(lambda m: m.media_type == 'video')),
            'has_360_view': bool(variant_media.filtered(lambda m: m.media_type == '360_view')),
            'has_brochures': bool(variant_media.filtered(lambda m: m.media_type == 'brochure')),
            'primary_media': variant_media.filtered('is_primary'),
            'featured_media': variant_media.filtered('is_featured'),
            'total_size_mb': sum(variant_media.mapped('file_size')),
        }
        
        return stats
    
    def action_set_as_variant_primary(self):
        """Set this media as primary for its variant and media type"""
        self.ensure_one()
        
        if not self.car_variant_id:
            raise ValidationError(_("This media is not associated with a specific variant."))
        
        # Use the variant's method to set primary media
        return self.car_variant_id.set_primary_media(self.id, self.media_type)
    
    def get_variant_siblings(self):
        """Get other media of the same type for the same variant"""
        self.ensure_one()
        
        if not self.car_variant_id:
            return self.env['alromaih.car.media']
        
        return self.search([
            ('car_variant_id', '=', self.car_variant_id.id),
            ('media_type', '=', self.media_type),
            ('id', '!=', self.id),
            ('active', '=', True)
        ])
    
    def get_car_siblings(self):
        """Get other media of the same type for the same car (all variants)"""
        self.ensure_one()
        
        return self.search([
            ('car_id', '=', self.car_id.id),
            ('media_type', '=', self.media_type),
            ('id', '!=', self.id),
            ('active', '=', True)
        ])
    
    @api.model
    def create_variant_media_set(self, variant_id, media_data_list):
        """Create multiple media records for a variant"""
        variant = self.env['alromaih.car.variant'].browse(variant_id)
        
        if not variant.exists():
            raise ValidationError(_("Variant not found."))
        
        created_media = self.env['alromaih.car.media']
        
        for media_data in media_data_list:
            media_data.update({
                'car_id': variant.car_id.id,
                'car_variant_id': variant.id,
            })
            
            # Auto-generate name if not provided
            if not media_data.get('name'):
                media_type_label = dict(self._fields['media_type'].selection)[media_data.get('media_type', 'other')]
                media_data['name'] = f"{variant.name} - {media_type_label}"
            
            media = self.create(media_data)
            created_media |= media
        
        return created_media
    
    def copy_to_variant(self, target_variant_id):
        """Copy this media to another variant"""
        self.ensure_one()
        
        target_variant = self.env['alromaih.car.variant'].browse(target_variant_id)
        
        if not target_variant.exists():
            raise ValidationError(_("Target variant not found."))
        
        if target_variant.car_id.id != self.car_id.id:
            raise ValidationError(_("Target variant must belong to the same car."))
        
        # Check if similar media already exists
        existing = self.search([
            ('car_variant_id', '=', target_variant_id),
            ('media_type', '=', self.media_type),
            ('name', '=', self.name.replace(self.car_variant_id.color_id.name, target_variant.color_id.name))
        ])
        
        if existing:
            raise ValidationError(_("Similar media already exists for the target variant."))
        
        # Copy the media
        copied_media = self.copy({
            'car_variant_id': target_variant_id,
            'name': self.name.replace(self.car_variant_id.color_id.name, target_variant.color_id.name),
            'is_primary': False,  # Don't copy primary status
        })
        
        return copied_media
    
    def copy_to_all_variants(self):
        """Copy this media to all other variants of the same car"""
        self.ensure_one()
        
        if not self.car_variant_id:
            raise ValidationError(_("This media is not associated with a specific variant."))
        
        # Get all other variants of the same car
        other_variants = self.car_id.variant_ids.filtered(lambda v: v.id != self.car_variant_id.id and v.active)
        
        if not other_variants:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Other Variants'),
                    'message': _('No other variants found for this car.'),
                    'type': 'info',
                }
            }
        
        copied_count = 0
        failed_variants = []
        
        for variant in other_variants:
            try:
                self.copy_to_variant(variant.id)
                copied_count += 1
            except ValidationError as e:
                failed_variants.append(f"{variant.name}: {str(e)}")
        
        message = f"Successfully copied media to {copied_count} variants."
        if failed_variants:
            message += f"\n\nFailed for {len(failed_variants)} variants:\n" + "\n".join(failed_variants[:3])
            if len(failed_variants) > 3:
                message += f"\n... and {len(failed_variants) - 3} more."
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Copy Complete'),
                'message': message,
                'type': 'success' if copied_count > 0 else 'warning',
            }
        }
    
    @api.depends('image', 'video_file', 'document_file', 'bunny_image_path', 'bunny_video_path', 'bunny_document_path')
    def _compute_external_url(self):
        """Compute Bunny CDN URLs for car media attachments (permanent for SEO)"""
        for record in self:
            record.external_url = self._get_bunny_cdn_url(record)
    
    def _get_bunny_config(self):
        """Get Bunny Storage configuration from system parameters with default testing credentials"""
        params = self.env['ir.config_parameter'].sudo()
        return {
            'storage_zone_name': params.get_param('bunny.storage.zone_name', 'alromaih'),  # Default: your zone name
            'access_key': params.get_param('bunny.storage.access_key', 'e78b1fc2-93d6-4fbe-9b3c3fa6ae1e-7718-434d'),  # Default: your access key
            'region': params.get_param('bunny.storage.region', 'ny'),  # ny, la, sg, syd
            'cdn_domain': params.get_param('bunny.cdn.domain', 'cdn.alromaihcars.com')  # Updated: use custom domain
        }
    
    def _upload_to_bunny_storage(self, file_data, file_name, folder='car-media', retry_count=0):
        """Upload file to Bunny Storage and return the file path"""
        if not file_data:
            _logger.warning("No file data provided for upload")
            return False
            
        try:
            config = self._get_bunny_config()
            if not config['access_key']:
                _logger.warning("Bunny Storage access key not configured")
                return False
            
            # Validate base64 data
            try:
                # Decode base64 file data
                file_content = base64.b64decode(file_data)
                if len(file_content) == 0:
                    _logger.error("Decoded file content is empty")
                    return False
                    
                _logger.info(f"File size to upload: {len(file_content)} bytes")
                
            except Exception as decode_error:
                _logger.error(f"Failed to decode base64 file data: {decode_error}")
                return False
            
            # Create file path: car-media/YYYY/MM/filename
            from datetime import datetime
            now = datetime.now()
            file_path = f"{folder}/{now.year}/{now.month:02d}/{file_name}"
            
            # Bunny Storage API endpoint
            url = f"https://storage.bunnycdn.com/{config['storage_zone_name']}/{file_path}"
            
            # Upload file with proper headers
            headers = {
                'AccessKey': config['access_key'],
                'Content-Type': 'application/octet-stream',
                'Content-Length': str(len(file_content))
            }
            
            _logger.info(f"Uploading to Bunny Storage: {url}")
            response = requests.put(url, data=file_content, headers=headers, timeout=60)  # Increased timeout
            
            if response.status_code == 201:
                _logger.info(f"Successfully uploaded {file_name} to Bunny Storage: {file_path}")
                return file_path
            elif response.status_code in [429, 500, 502, 503, 504] and retry_count < 2:
                # Retry on temporary errors (rate limit, server errors)
                import time
                time.sleep(2 ** retry_count)  # Exponential backoff
                _logger.warning(f"Retrying upload to Bunny Storage (attempt {retry_count + 1})")
                return self._upload_to_bunny_storage(file_data, file_name, folder, retry_count + 1)
            else:
                _logger.error(f"Failed to upload to Bunny Storage: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            if retry_count < 2:
                import time
                time.sleep(2 ** retry_count)
                _logger.warning(f"Retrying upload to Bunny Storage after error (attempt {retry_count + 1}): {e}")
                return self._upload_to_bunny_storage(file_data, file_name, folder, retry_count + 1)
            else:
                _logger.error(f"Error uploading to Bunny Storage after retries: {e}")
                return False
    
    def _get_bunny_cdn_url(self, record):
        """Generate Bunny CDN URL for car media (permanent, SEO-friendly)"""
        try:
            config = self._get_bunny_config()
            cdn_domain = config['cdn_domain']
            
            # Check Bunny Storage paths first (preferred)
            if record.bunny_image_path and record.content_type == 'image':
                return f"https://{cdn_domain}/{record.bunny_image_path}"
            elif record.bunny_video_path and record.content_type == 'video_file':
                return f"https://{cdn_domain}/{record.bunny_video_path}"
            elif record.bunny_document_path and record.content_type == 'document':
                return f"https://{cdn_domain}/{record.bunny_document_path}"
            
            # Fallback to old S3 method if no Bunny Storage paths
            return self._get_cdn_url(record)
            
        except Exception as e:
            _logger.error(f"Error generating Bunny CDN URL for media {record.id}: {e}")
            return False
    
    def _generate_seo_file_name(self, content_type=None):
        """Generate SEO-optimized file name based on car variant, media type, and availability"""
        from datetime import datetime
        import uuid
        import re
        
        timestamp = datetime.now().strftime('%Y%m%d')
        unique_id = str(uuid.uuid4())[:6]
        
        # Build SEO-friendly name components
        name_parts = []
        
        # Car brand and model
        if self.car_id:
            if self.car_id.brand_id:
                brand = self._clean_for_filename(self.car_id.brand_id.name)
                name_parts.append(brand)
            
            if self.car_id.model_id:
                model = self._clean_for_filename(self.car_id.model_id.name)
                name_parts.append(model)
            
            # Car year if available
            if hasattr(self.car_id, 'year_id') and self.car_id.year_id:
                year = str(self.car_id.year_id.name)
                name_parts.append(year)
        
        # Car variant (color)
        if self.car_variant_id:
            if self.car_variant_id.color_id:
                color = self._clean_for_filename(self.car_variant_id.color_id.name)
                name_parts.append(color)
            
            # Availability status
            if hasattr(self.car_variant_id, 'availability_status'):
                if self.car_variant_id.availability_status == 'available':
                    name_parts.append('available')
                elif self.car_variant_id.availability_status == 'coming_soon':
                    name_parts.append('coming-soon')
        
        # Media type for SEO
        media_type_map = {
            'exterior': 'exterior',
            'interior': 'interior', 
            'engine': 'engine',
            'dashboard': 'dashboard',
            'trunk': 'trunk',
            '360_view': '360-view',
            'video': 'video',
            'brochure': 'brochure',
            'thumbs': 'thumbnail',
            'other': 'gallery'
        }
        
        media_seo = media_type_map.get(self.media_type, 'image')
        name_parts.append(media_seo)
        
        # Content type suffix for clarity
        content_suffix_map = {
            'image': 'photo',
            'video_file': 'video',
            'document': 'brochure'
        }
        
        if content_type in content_suffix_map:
            name_parts.append(content_suffix_map[content_type])
        
        # Join parts with hyphens for SEO
        seo_name = '-'.join(filter(None, name_parts))
        
        # Limit length and add unique identifier
        seo_name = seo_name[:50] + f'-{timestamp}-{unique_id}'
        
        # Determine file extension based on content type
        ext_map = {
            'image': '.jpg',
            'video_file': '.mp4',
            'document': '.pdf'
        }
        
        extension = ext_map.get(content_type, '.bin')
        
        return f"{seo_name}{extension}"
    
    def _clean_for_filename(self, text):
        """Clean text for SEO-friendly filename"""
        import re
        if not text:
            return ''
        
        # Convert to string and lowercase
        clean_text = str(text).lower()
        
        # Replace common Arabic/English terms for SEO
        replacements = {
            'سيارة': 'car',
            'جديد': 'new',
            'مستعمل': 'used',
            'متوفر': 'available',
            'قريبا': 'coming-soon',
            ' ': '-',
            '_': '-',
            'أ': 'a',
            'إ': 'e',
            'آ': 'a'
        }
        
        for arabic, english in replacements.items():
            clean_text = clean_text.replace(arabic, english)
        
        # Remove special characters except hyphens
        clean_text = re.sub(r'[^a-zA-Z0-9\-]', '', clean_text)
        
        # Replace multiple hyphens with single hyphen
        clean_text = re.sub(r'-+', '-', clean_text)
        
        # Remove leading/trailing hyphens
        clean_text = clean_text.strip('-')
        
        return clean_text[:20]  # Limit length
    
    def _generate_seo_alt_text(self):
        """Generate SEO-optimized alt text for the media"""
        self.ensure_one()
        
        alt_parts = []
        
        # Start with car brand and model (only if car exists)
        if self.car_id:
            if self.car_id.brand_id:
                brand = str(self.car_id.brand_id.name)
                alt_parts.append(brand)
            
            if self.car_id.model_id:
                model = str(self.car_id.model_id.name)
                alt_parts.append(model)
            
            # Add year if available
            if hasattr(self.car_id, 'year_id') and self.car_id.year_id:
                year = str(self.car_id.year_id.name)
                alt_parts.append(year)
        
        # Add color if variant exists
        if self.car_variant_id and self.car_variant_id.color_id:
            color = str(self.car_variant_id.color_id.name)
            alt_parts.append(color)
        
        # Add media type description
        media_descriptions = {
            'exterior': 'exterior view',
            'interior': 'interior cabin',
            'engine': 'engine bay',
            'dashboard': 'dashboard controls',
            'trunk': 'trunk space',
            '360_view': '360 degree view',
            'video': 'video showcase',
            'brochure': 'specifications brochure',
            'thumbs': 'thumbnail image',
            'other': 'gallery image'
        }
        
        media_desc = media_descriptions.get(self.media_type, 'image')
        alt_parts.append(media_desc)
        
        # Add availability status for SEO
        if self.car_variant_id and hasattr(self.car_variant_id, 'availability_status'):
            if self.car_variant_id.availability_status == 'available':
                alt_parts.append('available now')
            elif self.car_variant_id.availability_status == 'coming_soon':
                alt_parts.append('coming soon')
        
        # Content type specific additions
        content_additions = {
            'image': 'photo',
            'video_file': 'video',
            'document': 'brochure'
        }
        
        if self.content_type in content_additions:
            alt_parts.append(content_additions[self.content_type])
        
        # Join with proper spacing
        alt_text = ' '.join(filter(None, alt_parts))
        
        # Add location context for SEO (Alromaih)
        alt_text += ' - Alromaih Cars'
        
        # Ensure proper capitalization
        alt_text = alt_text.title()
        
        return alt_text[:150]  # Keep within SEO alt text limits
    
    def _auto_generate_seo_fields(self):
        """Auto-generate SEO fields (alt text, SEO title) if not provided"""
        self.ensure_one()
        
        # Auto-generate alt text if empty and it's an image
        if self.content_type == 'image' and not self.alt_text:
            self.alt_text = self._generate_seo_alt_text()
        
        # Auto-generate SEO title if empty
        if not self.seo_title:
            self.seo_title = self._generate_seo_alt_text()
        
        # Auto-generate SEO description if empty
        if not self.seo_description:
            desc_parts = []
            
            if self.car_id:
                desc_parts.append(f"View {self.car_id.brand_id.name if self.car_id.brand_id else 'car'}")
                desc_parts.append(f"{self.car_id.model_id.name if self.car_id.model_id else 'model'}")
            
            if self.car_variant_id and self.car_variant_id.color_id:
                desc_parts.append(f"in {self.car_variant_id.color_id.name}")
            
            media_descriptions = {
                'exterior': 'Explore the stunning exterior design',
                'interior': 'Discover the luxurious interior features',
                'engine': 'See the powerful engine specifications',
                'dashboard': 'Check out the advanced dashboard technology',
                'trunk': 'View the spacious trunk capacity',
                '360_view': 'Experience the complete 360-degree view',
                'video': 'Watch the detailed video presentation',
                'brochure': 'Download the complete specifications',
            }
            
            desc_intro = media_descriptions.get(self.media_type, 'View detailed images')
            if desc_parts:  # Only add intro if we have car data
                desc_parts.insert(0, desc_intro)
            else:
                desc_parts.append(desc_intro)
            
            desc_parts.append('Available at Alromaih Cars - Premium automotive experience in Saudi Arabia.')
            
            self.seo_description = ' '.join(desc_parts)[:300]  # Meta description limit
    
    @api.model
    def create(self, vals):
        """Override create to upload files to Bunny Storage and generate title/SEO fields"""
        record = super().create(vals)
        # Auto-generate title based on car variant color and media type
        record._auto_generate_title()
        # Auto-generate SEO fields if not provided
        record._auto_generate_seo_fields()
        # Upload to Bunny Storage
        record._upload_media_to_bunny()
        return record
    
    def write(self, vals):
        """Override write to handle Bunny Storage updates and deletions"""
        # Store old Bunny paths before update for potential cleanup
        old_bunny_paths = {}
        if any(field in vals for field in ['image', 'video_file', 'document_file']):
            for record in self:
                old_bunny_paths[record.id] = {
                    'bunny_image_path': record.bunny_image_path,
                    'bunny_video_path': record.bunny_video_path,
                    'bunny_document_path': record.bunny_document_path
                }
        
        result = super().write(vals)
        
        # Handle file updates
        binary_fields = ['image', 'video_file', 'document_file']
        if any(field in vals for field in binary_fields):
            for record in self:
                old_paths = old_bunny_paths.get(record.id, {})
                
                # Handle file deletions and replacements
                if 'image' in vals:
                    old_bunny_path = old_paths.get('bunny_image_path')
                    
                    # If there's an old Bunny file and we're updating the image field
                    if old_bunny_path:
                        # Delete old file from Bunny Storage
                        record._delete_from_bunny_storage(old_bunny_path)
                        # Always reset path when image field is updated
                        record.bunny_image_path = False
                        _logger.info(f"Deleted old image from Bunny Storage: {old_bunny_path}")
                
                if 'video_file' in vals:
                    old_bunny_path = old_paths.get('bunny_video_path')
                    
                    # If there's an old Bunny file and we're updating the video field
                    if old_bunny_path:
                        # Delete old file from Bunny Storage
                        record._delete_from_bunny_storage(old_bunny_path)
                        # Always reset path when video field is updated
                        record.bunny_video_path = False
                        _logger.info(f"Deleted old video from Bunny Storage: {old_bunny_path}")
                
                if 'document_file' in vals:
                    old_bunny_path = old_paths.get('bunny_document_path')
                    
                    # If there's an old Bunny file and we're updating the document field
                    if old_bunny_path:
                        # Delete old file from Bunny Storage
                        record._delete_from_bunny_storage(old_bunny_path)
                        # Always reset path when document field is updated
                        record.bunny_document_path = False
                        _logger.info(f"Deleted old document from Bunny Storage: {old_bunny_path}")
                
                # Upload new files to Bunny Storage
                record._upload_media_to_bunny()
                
                # Clean up orphaned Bunny paths after the update
                record._cleanup_orphaned_bunny_files()
        
        # Regenerate title and SEO fields if car, variant, or media type changed
        title_trigger_fields = ['car_id', 'car_variant_id', 'media_type', 'content_type']
        if any(field in vals for field in title_trigger_fields):
            for record in self:
                record._auto_generate_title()
                record._auto_generate_seo_fields()
        elif any(field in vals for field in ['image', 'video_file', 'document_file']):
            for record in self:
                record._auto_generate_seo_fields()
        
        # Add small delay after file updates to prevent corruption
        if any(field in vals for field in ['image', 'video_file', 'document_file']):
            import time
            time.sleep(0.1)  # 100ms delay to ensure file is properly processed
        
        return result
    
    def unlink(self):
        """Override unlink to delete files from Bunny Storage when records are deleted"""
        # Delete files from Bunny Storage before deleting records
        for record in self:
            if record.bunny_image_path:
                record._delete_from_bunny_storage(record.bunny_image_path)
            if record.bunny_video_path:
                record._delete_from_bunny_storage(record.bunny_video_path)
            if record.bunny_document_path:
                record._delete_from_bunny_storage(record.bunny_document_path)
        
        return super().unlink()
    
    def _delete_from_bunny_storage(self, file_path):
        """Delete a file from Bunny Storage"""
        if not file_path:
            return False
            
        try:
            config = self._get_bunny_config()
            if not config['access_key']:
                _logger.warning("Bunny Storage access key not configured")
                return False
            
            # Bunny Storage API endpoint for deletion
            url = f"https://storage.bunnycdn.com/{config['storage_zone_name']}/{file_path}"
            
            # Delete file
            headers = {
                'AccessKey': config['access_key']
            }
            
            response = requests.delete(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                _logger.info(f"Successfully deleted {file_path} from Bunny Storage")
                return True
            elif response.status_code == 404:
                _logger.warning(f"File {file_path} not found in Bunny Storage (already deleted)")
                return True  # Consider it successful if file doesn't exist
            else:
                _logger.error(f"Failed to delete from Bunny Storage: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            _logger.error(f"Error deleting from Bunny Storage: {e}")
            return False
    
    def _upload_media_to_bunny(self):
        """Upload media files to Bunny Storage with SEO-optimized file names"""
        self.ensure_one()
        
        try:
            # Upload image
            if self.image and not self.bunny_image_path:
                file_name = self._generate_seo_file_name('image')
                bunny_path = self._upload_to_bunny_storage(self.image, file_name)
                if bunny_path:
                    self.bunny_image_path = bunny_path
                    _logger.info(f"Image uploaded to Bunny Storage: {bunny_path}")
            
            # Upload video
            if self.video_file and not self.bunny_video_path:
                file_name = self._generate_seo_file_name('video_file')
                bunny_path = self._upload_to_bunny_storage(self.video_file, file_name)
                if bunny_path:
                    self.bunny_video_path = bunny_path
                    _logger.info(f"Video uploaded to Bunny Storage: {bunny_path}")
            
            # Upload document
            if self.document_file and not self.bunny_document_path:
                file_name = self._generate_seo_file_name('document')
                bunny_path = self._upload_to_bunny_storage(self.document_file, file_name)
                if bunny_path:
                    self.bunny_document_path = bunny_path
                    _logger.info(f"Document uploaded to Bunny Storage: {bunny_path}")
                    
        except Exception as e:
            _logger.error(f"Error uploading media to Bunny Storage for record {self.id}: {e}")
    
    def _cleanup_orphaned_bunny_files(self):
        """Clean up Bunny Storage paths that no longer have corresponding files in Odoo"""
        self.ensure_one()
        
        try:
            # Check for orphaned image path
            if self.bunny_image_path and not self.image:
                _logger.info(f"Cleaning up orphaned image path: {self.bunny_image_path}")
                self._delete_from_bunny_storage(self.bunny_image_path)
                self.bunny_image_path = False
            
            # Check for orphaned video path
            if self.bunny_video_path and not self.video_file:
                _logger.info(f"Cleaning up orphaned video path: {self.bunny_video_path}")
                self._delete_from_bunny_storage(self.bunny_video_path)
                self.bunny_video_path = False
            
            # Check for orphaned document path
            if self.bunny_document_path and not self.document_file:
                _logger.info(f"Cleaning up orphaned document path: {self.bunny_document_path}")
                self._delete_from_bunny_storage(self.bunny_document_path)
                self.bunny_document_path = False
                
        except Exception as e:
            _logger.error(f"Error cleaning up orphaned Bunny files for record {self.id}: {e}")
    
    @api.model
    def action_cleanup_all_orphaned_files(self):
        """Clean up all orphaned Bunny Storage files across all records"""
        orphaned_records = self.search([
            '|', '|',
            '&', ('bunny_image_path', '!=', False), ('image', '=', False),
            '&', ('bunny_video_path', '!=', False), ('video_file', '=', False),
            '&', ('bunny_document_path', '!=', False), ('document_file', '=', False)
        ])
        
        if not orphaned_records:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Orphaned Files'),
                    'message': _('No orphaned Bunny Storage files found.'),
                    'type': 'info',
                }
            }
        
        cleaned_count = 0
        error_count = 0
        
        for record in orphaned_records:
            try:
                record._cleanup_orphaned_bunny_files()
                cleaned_count += 1
            except Exception as e:
                _logger.error(f"Error cleaning up orphaned files for record {record.id}: {e}")
                error_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Cleanup Complete'),
                'message': _('Cleaned up %d orphaned files. %d errors occurred.') % (cleaned_count, error_count),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }
    
    def action_preview_seo_fields(self):
        """Preview what SEO fields would look like"""
        self.ensure_one()
        
        preview_alt = self._generate_seo_alt_text()
        preview_filename = self._generate_seo_file_name(self.content_type)
        
        # Generate preview SEO description
        desc_parts = []
        if self.car_id:
            desc_parts.append(f"View {self.car_id.brand_id.name if self.car_id.brand_id else 'car'}")
            desc_parts.append(f"{self.car_id.model_id.name if self.car_id.model_id else 'model'}")
        
        if self.car_variant_id and self.car_variant_id.color_id:
            desc_parts.append(f"in {self.car_variant_id.color_id.name}")
        
        desc_parts.append('Available at Alromaih Cars - Premium automotive experience in Saudi Arabia.')
        preview_desc = ' '.join(desc_parts)[:300]
        
        message = f"""
        <h4>SEO Preview</h4>
        <p><strong>File Name:</strong> {preview_filename}</p>
        <p><strong>Alt Text:</strong> {preview_alt}</p>
        <p><strong>SEO Title:</strong> {preview_alt}</p>
        <p><strong>Meta Description:</strong> {preview_desc}</p>
        """
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('SEO Preview'),
                'message': message,
                'type': 'info',
                'sticky': True,
            }
        }
    
    def action_regenerate_seo_fields(self):
        """Manual action to regenerate SEO fields"""
        self.ensure_one()
        
        # Clear existing auto-generated fields to force regeneration
        self.alt_text = False
        self.seo_title = False
        self.seo_description = False
        
        # Regenerate SEO fields
        self._auto_generate_seo_fields()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('SEO Fields Regenerated'),
                'message': _('Alt text, SEO title, and description have been automatically generated.'),
                'type': 'success',
            }
        }
    
    @api.model
    def action_bulk_regenerate_seo_fields(self):
        """Bulk action to regenerate SEO fields for all records"""
        all_media = self.search([])
        
        regenerated_count = 0
        error_count = 0
        
        for record in all_media:
            try:
                # Clear existing fields
                record.alt_text = False
                record.seo_title = False
                record.seo_description = False
                
                # Regenerate
                record._auto_generate_seo_fields()
                regenerated_count += 1
                
            except Exception as e:
                _logger.error(f"Error regenerating SEO fields for record {record.id}: {e}")
                error_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Bulk SEO Regeneration Complete'),
                'message': _('Successfully regenerated SEO fields for %d records. %d errors occurred.') % (regenerated_count, error_count),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }

    @api.model
    def action_bulk_upload_to_bunny(self):
        """Bulk action to upload missing media files to Bunny Storage"""
        # Find records with files but missing Bunny paths
        media_records = self.search([
            '|', '|',
            '&', ('image', '!=', False), ('bunny_image_path', '=', False),
            '&', ('video_file', '!=', False), ('bunny_video_path', '=', False),
            '&', ('document_file', '!=', False), ('bunny_document_path', '=', False)
        ])
        
        if not media_records:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('No Missing Files'),
                    'message': _('All media files are already uploaded to Bunny Storage.'),
                    'type': 'info',
                }
            }
        
        success_count = 0
        error_count = 0
        
        for record in media_records:
            try:
                # Upload missing files only
                record._upload_media_to_bunny()
                success_count += 1
                
            except Exception as e:
                _logger.error(f"Error uploading media {record.id} to Bunny Storage: {e}")
                error_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Missing Files Upload Complete'),
                'message': _('Successfully uploaded %d missing files to Bunny Storage. %d errors occurred.') % (success_count, error_count),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }
    
    @api.model
    def action_bulk_delete_from_bunny(self):
        """Bulk action to delete all Bunny Storage files and reset paths"""
        media_records = self.search([
            '|', '|',
            ('bunny_image_path', '!=', False),
            ('bunny_video_path', '!=', False),
            ('bunny_document_path', '!=', False)
        ])
        
        success_count = 0
        error_count = 0
        
        for record in media_records:
            try:
                # Delete from Bunny Storage
                if record.bunny_image_path:
                    record._delete_from_bunny_storage(record.bunny_image_path)
                    record.bunny_image_path = False
                    
                if record.bunny_video_path:
                    record._delete_from_bunny_storage(record.bunny_video_path)
                    record.bunny_video_path = False
                    
                if record.bunny_document_path:
                    record._delete_from_bunny_storage(record.bunny_document_path)
                    record.bunny_document_path = False
                    
                success_count += 1
                
            except Exception as e:
                _logger.error(f"Error deleting media {record.id} from Bunny Storage: {e}")
                error_count += 1
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Bulk Delete Complete'),
                'message': _('Successfully deleted %d files from Bunny Storage. %d errors occurred.') % (success_count, error_count),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }
    
    def action_delete_from_bunny(self):
        """Manual action to delete files from Bunny Storage"""
        self.ensure_one()
        
        deleted_files = []
        
        # Delete from Bunny Storage
        if self.bunny_image_path:
            if self._delete_from_bunny_storage(self.bunny_image_path):
                deleted_files.append('image')
            self.bunny_image_path = False
            
        if self.bunny_video_path:
            if self._delete_from_bunny_storage(self.bunny_video_path):
                deleted_files.append('video')
            self.bunny_video_path = False
            
        if self.bunny_document_path:
            if self._delete_from_bunny_storage(self.bunny_document_path):
                deleted_files.append('document')
            self.bunny_document_path = False
        
        message = f"Deleted {len(deleted_files)} files from Bunny Storage" if deleted_files else "No files to delete"
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Delete Complete'),
                'message': _(message),
                'type': 'success' if deleted_files else 'info',
            }
        }
    
    @api.model
    def action_sync_bunny_storage(self):
        """Sync Bunny Storage - upload missing files and clean up orphaned ones"""
        all_media = self.search([])
        
        upload_count = 0
        cleanup_count = 0
        error_count = 0
        
        for record in all_media:
            try:
                # Upload missing files
                old_paths = {
                    'image': record.bunny_image_path,
                    'video': record.bunny_video_path,
                    'document': record.bunny_document_path
                }
                
                record._upload_media_to_bunny()
                
                # Count uploads
                if record.image and not old_paths['image'] and record.bunny_image_path:
                    upload_count += 1
                if record.video_file and not old_paths['video'] and record.bunny_video_path:
                    upload_count += 1
                if record.document_file and not old_paths['document'] and record.bunny_document_path:
                    upload_count += 1
                
                # Clean up paths for deleted files
                if not record.image and record.bunny_image_path:
                    record._delete_from_bunny_storage(record.bunny_image_path)
                    record.bunny_image_path = False
                    cleanup_count += 1
                    
                if not record.video_file and record.bunny_video_path:
                    record._delete_from_bunny_storage(record.bunny_video_path)
                    record.bunny_video_path = False
                    cleanup_count += 1
                    
                if not record.document_file and record.bunny_document_path:
                    record._delete_from_bunny_storage(record.bunny_document_path)
                    record.bunny_document_path = False
                    cleanup_count += 1
                    
            except Exception as e:
                _logger.error(f"Error syncing media {record.id} with Bunny Storage: {e}")
                error_count += 1
        
        message = f"Sync complete: {upload_count} uploads, {cleanup_count} cleanups"
        if error_count > 0:
            message += f", {error_count} errors"
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Bunny Storage Sync Complete'),
                'message': _(message),
                'type': 'success' if error_count == 0 else 'warning',
            }
        }
    
    def _get_cdn_url(self, record):
        """Generate CDN URL for car media (permanent, SEO-friendly)"""
        try:
            # Get CDN domain from system parameters with updated domain
            params = self.env['ir.config_parameter'].sudo()
            cdn_domain = params.get_param('bunny.cdn.domain', 'cdn.alromaihcars.com')
            
            # Find the attachment for this record
            attachment = self._find_media_attachment(record)
            if not attachment or not attachment.store_fname:
                return False
            
            # Build CDN URL: https://cdn/alromaih-odoo/filestore/<dbname>/<store_fname>
            dbname = self.env.cr.dbname
            
            # Use direct S3 if CDN domain matches the fallback (means CDN not working)
            if cdn_domain == 'alromaih-cdn.b-cdn.net':
                # Fallback to Odoo URLs until CDN is fixed
                return f"/web/image/alromaih.car.media/{record.id}/image"
            
            cdn_url = f"https://{cdn_domain}/alromaih-odoo/filestore/{dbname}/{attachment.store_fname}"
            
            return cdn_url
            
        except Exception as e:
            _logger.error(f"Error generating CDN URL for media {record.id}: {e}")
            return False
    
    def _find_media_attachment(self, record):
        """Find the ir.attachment record for this media record"""
        # Check which binary field has content and find corresponding attachment
        binary_fields = ['image', 'video_file', 'document_file']
        
        for field_name in binary_fields:
            if getattr(record, field_name):
                # Search for attachment with this field
                attachment = self.env['ir.attachment'].sudo().search([
                    ('res_model', '=', 'alromaih.car.media'),
                    ('res_id', '=', record.id),
                    ('res_field', '=', field_name)
                ], limit=1)
                
                if attachment:
                    return attachment
        
        return False
    
    def refresh_external_url(self):
        """Action to manually refresh the CDN URL"""
        self.ensure_one()
        # Force recompute of the external_url field
        self._compute_external_url()
        
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('CDN URL Refreshed'),
                'message': _('CDN media URL has been refreshed successfully.'),
                'type': 'success',
            }
        }
    