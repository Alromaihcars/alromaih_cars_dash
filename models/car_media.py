from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class CarMedia(models.Model):
    _name = 'alromaih.car.media'
    _description = _('Car Media Management')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'media_type, sequence, id'
    
    name = fields.Char(string='Media Title', required=True, tracking=True, translate=True)
    car_id = fields.Many2one('alromaih.car', string='Car', required=True, ondelete='cascade')
    car_variant_id = fields.Many2one('alromaih.car.variant', string='Car Variant', 
                                   domain="[('car_id', '=', car_id)]",
                                   help="Leave empty if media applies to all variants")
    
    # Media type and content
    media_type = fields.Selection([
        ('interior', 'Interior Images'),
        ('exterior', 'Exterior Images'),
        ('engine', 'Engine Images'),
        ('trunk', 'Trunk Images'),
        ('dashboard', 'Dashboard Images'),
        ('360_view', '360° View'),
        ('video', 'Video Content'),
        ('brochure', 'Brochure/Documents'),
        ('other', 'Other Media')
    ], string='Media Type', required=True, default='exterior', tracking=True)
    
    content_type = fields.Selection([
        ('image', 'Image File'),
        ('video_file', 'Video File'),
        ('video_url', 'Video URL'),
        ('iframe_360', '360° iFrame'),
        ('iframe_code', 'Custom iFrame Code'),
        ('document', 'Document/PDF'),
        ('external_link', 'External Link')
    ], string='Content Type', required=True, default='image', tracking=True)
    
    # File uploads
    image = fields.Binary(string='Image File', attachment=True)
    video_file = fields.Binary(string='Video File', attachment=True)
    document_file = fields.Binary(string='Document/PDF', attachment=True)
    
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
    
    @api.constrains('is_primary', 'media_type', 'car_id', 'car_variant_id')
    def _check_primary_media(self):
        """Ensure only one primary media per type per car/variant"""
        for record in self.filtered('is_primary'):
            domain = [
                ('is_primary', '=', True),
                ('media_type', '=', record.media_type),
                ('car_id', '=', record.car_id.id),
                ('id', '!=', record.id)
            ]
            
            if record.car_variant_id:
                domain.append(('car_variant_id', '=', record.car_variant_id.id))
            else:
                domain.append(('car_variant_id', '=', False))
            
            if self.search_count(domain) > 0:
                raise ValidationError(_(
                    "Only one primary media is allowed per media type. "
                    "Please uncheck other primary media of type '%s' first."
                ) % dict(self._fields['media_type'].selection)[record.media_type])
    
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