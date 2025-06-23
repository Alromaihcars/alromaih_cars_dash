from odoo import api, fields, models, _
from datetime import datetime, timedelta
import logging
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class AlromaiNews(models.Model):
    _name = 'alromaih.news'
    _description = _('Alromaih News')
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata', 'website.published.mixin']
    _rec_name = 'title'
    _order = 'publish_date desc, create_date desc'
    
    # Basic Information
    title = fields.Char(string='News Title', required=True, translate=True, tracking=True)
    subtitle = fields.Char(string='Subtitle', translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    
    # Content
    summary = fields.Text(string='Summary', translate=True, required=True,
                         help="Brief summary for news listing (max 300 characters)")
    content = fields.Html(string='Content', translate=True, sanitize_attributes=False,
                         help="Full news article content")
    
    # Media
    featured_image = fields.Binary(string='Featured Image', help="Main image for the news article")
    featured_image_alt = fields.Char(string='Image Alt Text', translate=True)
    image_caption = fields.Char(string='Image Caption', translate=True)
    
    # Classification
    news_type = fields.Selection([
        ('breaking', 'Breaking News'),
        ('announcement', 'Company Announcement'),
        ('press_release', 'Press Release'),
        ('product_launch', 'Product Launch'),
        ('event', 'Event News'),
        ('industry', 'Industry News'),
        ('award', 'Awards & Recognition'),
        ('partnership', 'Partnership'),
        ('general', 'General News')
    ], string='News Type', required=True, default='general', tracking=True)
    
    priority = fields.Selection([
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], string='Priority', default='normal', tracking=True)
    
    # Categorization
    category_id = fields.Many2one('alromaih.news.category', string='Category', required=True)
    tag_ids = fields.Many2many('alromaih.news.tag', string='Tags')
    
    # Publishing
    status = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ], string='Status', default='draft', required=True, tracking=True)
    
    publish_date = fields.Datetime(string='Publish Date', tracking=True)
    expiry_date = fields.Datetime(string='Expiry Date', help="When this news should be archived")
    
    # Author and Source
    author_id = fields.Many2one('res.users', string='Author', required=True,
                               default=lambda self: self.env.user, tracking=True)
    author_name = fields.Char(string='Author Display Name', translate=True)
    source = fields.Char(string='News Source', help="Original source if external news")
    source_url = fields.Char(string='Source URL')
    
    # Features
    is_featured = fields.Boolean(string='Featured News', default=False, tracking=True)
    is_breaking = fields.Boolean(string='Breaking News', default=False, tracking=True)
    is_sticky = fields.Boolean(string='Sticky', default=False, help="Keep at top of listings")
    
    # SEO Fields
    seo_title = fields.Char(string='SEO Title', translate=True, size=60)
    seo_description = fields.Text(string='SEO Description', translate=True, size=160)
    seo_keywords = fields.Char(string='SEO Keywords', translate=True)
    
    # Statistics
    view_count = fields.Integer(string='Views', default=0, readonly=True)
    share_count = fields.Integer(string='Shares', default=0, readonly=True)
    
    # Relations
    related_news_ids = fields.Many2many('alromaih.news', 'news_related_rel', 
                                       'news_id', 'related_news_id', string='Related News')
    related_car_ids = fields.Many2many('alromaih.car', string='Related Cars')
    
    # Technical
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    
    @api.model
    def create(self, vals):
        """Enhanced create with slug generation"""
        if not vals.get('slug') and vals.get('title'):
            vals['slug'] = self._generate_slug(vals['title'])
        
        if vals.get('status') == 'published' and not vals.get('publish_date'):
            vals['publish_date'] = fields.Datetime.now()
        
        # Auto-generate SEO fields
        if not vals.get('seo_title') and vals.get('title'):
            vals['seo_title'] = vals['title'][:60]
        
        if not vals.get('seo_description') and vals.get('summary'):
            vals['seo_description'] = vals['summary'][:160]
        
        return super().create(vals)
    
    def write(self, vals):
        """Enhanced write with slug and status handling"""
        if 'title' in vals and not vals.get('slug'):
            vals['slug'] = self._generate_slug(vals['title'])
        
        if vals.get('status') == 'published' and not self.publish_date:
            vals['publish_date'] = fields.Datetime.now()
        
        return super().write(vals)
    
    def _generate_slug(self, title):
        """Generate URL-friendly slug"""
        import re
        if not title:
            return ''
        
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        
        # Ensure uniqueness
        original_slug = slug
        counter = 1
        while self.search([('slug', '=', slug), ('id', '!=', self.id)]):
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug
    
    def action_publish(self):
        """Publish the news"""
        for news in self:
            if news.status in ['draft', 'review', 'scheduled']:
                news.write({
                    'status': 'published',
                    'publish_date': fields.Datetime.now(),
                    'is_published': True
                })
                news.message_post(body=_('News published successfully'))
    
    def action_archive(self):
        """Archive the news"""
        for news in self:
            news.write({
                'status': 'archived',
                'is_published': False
            })
            news.message_post(body=_('News archived'))
    
    def increment_view_count(self):
        """Increment view count"""
        self.sudo().write({'view_count': self.view_count + 1})
    
    @api.model
    def get_breaking_news(self, limit=5):
        """Get breaking news for display"""
        return self.search([
            ('status', '=', 'published'),
            ('is_breaking', '=', True),
            ('publish_date', '<=', fields.Datetime.now())
        ], limit=limit, order='publish_date desc')
    
    @api.model
    def get_featured_news(self, limit=10):
        """Get featured news"""
        return self.search([
            ('status', '=', 'published'),
            ('is_featured', '=', True),
            ('publish_date', '<=', fields.Datetime.now())
        ], limit=limit, order='publish_date desc')


class AlromaiNewsCategory(models.Model):
    _name = 'alromaih.news.category'
    _description = _('News Category')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'
    _order = 'sequence, name'
    
    # Basic Information
    name = fields.Char(string='Category Name', required=True, translate=True)
    description = fields.Text(string='Description', translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    
    # Visual
    color = fields.Char(string='Color', help="Hex color code")
    icon = fields.Char(string='Icon', help="Font Awesome icon class")
    image = fields.Binary(string='Category Image')
    
    # SEO
    seo_title = fields.Char(string='SEO Title', translate=True, size=60)
    seo_description = fields.Text(string='SEO Description', translate=True, size=160)
    
    # Statistics
    news_count = fields.Integer(string='News Count', compute='_compute_news_count', store=True)
    
    # Settings
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    is_featured = fields.Boolean(string='Featured Category', default=False)
    
    # Relations
    news_ids = fields.One2many('alromaih.news', 'category_id', string='News Articles')
    
    @api.depends('news_ids')
    def _compute_news_count(self):
        """Count published news in category"""
        for category in self:
            category.news_count = len(category.news_ids.filtered(lambda n: n.status == 'published'))
    
    @api.model
    def create(self, vals):
        """Enhanced create with slug generation"""
        if not vals.get('slug') and vals.get('name'):
            vals['slug'] = self._generate_slug(vals['name'])
        return super().create(vals)
    
    def _generate_slug(self, name):
        """Generate URL-friendly slug"""
        import re
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        
        original_slug = slug
        counter = 1
        while self.search([('slug', '=', slug), ('id', '!=', self.id)]):
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug


class AlromaiNewsTag(models.Model):
    _name = 'alromaih.news.tag'
    _description = _('News Tag')
    _rec_name = 'name'
    _order = 'name'
    
    # Basic Information
    name = fields.Char(string='Tag Name', required=True, translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    description = fields.Text(string='Description', translate=True)
    color = fields.Char(string='Color', help="Hex color code")
    
    # Statistics
    news_count = fields.Integer(string='News Count', compute='_compute_news_count', store=True)
    
    # Settings
    active = fields.Boolean(default=True)
    is_featured = fields.Boolean(string='Featured Tag', default=False)
    
    # Relations
    news_ids = fields.Many2many('alromaih.news', string='News Articles')
    
    @api.depends('news_ids')
    def _compute_news_count(self):
        """Count published news with this tag"""
        for tag in self:
            tag.news_count = len(tag.news_ids.filtered(lambda n: n.status == 'published'))
    
    @api.model
    def create(self, vals):
        """Enhanced create with slug generation"""
        if not vals.get('slug') and vals.get('name'):
            vals['slug'] = self._generate_slug(vals['name'])
        return super().create(vals)
    
    def _generate_slug(self, name):
        """Generate URL-friendly slug"""
        import re
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        
        original_slug = slug
        counter = 1
        while self.search([('slug', '=', slug), ('id', '!=', self.id)]):
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug


class AlromaiPressRelease(models.Model):
    _name = 'alromaih.press.release'
    _description = _('Press Release')
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata']
    _rec_name = 'title'
    _order = 'release_date desc'
    
    # Basic Information
    title = fields.Char(string='Press Release Title', required=True, translate=True, tracking=True)
    subtitle = fields.Char(string='Subtitle', translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    
    # Content
    summary = fields.Text(string='Executive Summary', translate=True, required=True)
    content = fields.Html(string='Full Content', translate=True, sanitize_attributes=False)
    
    # Press Release Specific
    dateline = fields.Char(string='Dateline', help="Location and date (e.g., RIYADH, Saudi Arabia - Jan 1, 2024)")
    boilerplate = fields.Text(string='Company Boilerplate', translate=True,
                             help="Standard company description for press releases")
    
    # Contact Information
    media_contact_name = fields.Char(string='Media Contact Name')
    media_contact_email = fields.Char(string='Media Contact Email')
    media_contact_phone = fields.Char(string='Media Contact Phone')
    
    # Release Information
    release_date = fields.Datetime(string='Release Date', required=True, tracking=True)
    embargo_date = fields.Datetime(string='Embargo Date', help="Do not publish before this date")
    
    # Status
    status = fields.Selection([
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('released', 'Released'),
        ('archived', 'Archived')
    ], string='Status', default='draft', required=True, tracking=True)
    
    # Distribution
    distribution_list = fields.Text(string='Distribution List', 
                                   help="List of media outlets and contacts")
    sent_to_media = fields.Boolean(string='Sent to Media', default=False)
    
    # Media Assets
    featured_image = fields.Binary(string='Featured Image')
    press_kit_ids = fields.One2many('alromaih.press.kit', 'press_release_id', string='Press Kit Assets')
    
    # SEO
    seo_title = fields.Char(string='SEO Title', translate=True, size=60)
    seo_description = fields.Text(string='SEO Description', translate=True, size=160)
    
    # Statistics
    download_count = fields.Integer(string='Downloads', default=0, readonly=True)
    view_count = fields.Integer(string='Views', default=0, readonly=True)
    
    # Relations
    related_news_ids = fields.Many2many('alromaih.news', string='Related News')
    related_car_ids = fields.Many2many('alromaih.car', string='Related Cars')
    
    # Technical
    active = fields.Boolean(default=True)
    
    def action_release(self):
        """Release the press release"""
        for release in self:
            if release.status == 'approved':
                release.write({
                    'status': 'released',
                    'release_date': fields.Datetime.now()
                })
                release.message_post(body=_('Press release published'))
    
    def action_send_to_media(self):
        """Mark as sent to media"""
        for release in self:
            release.write({'sent_to_media': True})
            release.message_post(body=_('Press release sent to media'))


class AlromaiPressKit(models.Model):
    _name = 'alromaih.press.kit'
    _description = _('Press Kit Asset')
    _rec_name = 'name'
    
    # Basic Information
    name = fields.Char(string='Asset Name', required=True)
    description = fields.Text(string='Description')
    asset_type = fields.Selection([
        ('image', 'High-Resolution Image'),
        ('logo', 'Company Logo'),
        ('document', 'Fact Sheet'),
        ('video', 'Video Asset'),
        ('audio', 'Audio Clip'),
        ('other', 'Other')
    ], string='Asset Type', required=True)
    
    # File
    file_data = fields.Binary(string='File', required=True, attachment=True)
    file_name = fields.Char(string='File Name')
    file_size = fields.Integer(string='File Size (bytes)')
    
    # Relations
    press_release_id = fields.Many2one('alromaih.press.release', string='Press Release', 
                                      ondelete='cascade')
    
    # Usage
    download_count = fields.Integer(string='Download Count', default=0, readonly=True)
    
    # Settings
    active = fields.Boolean(default=True)
    
    def increment_download_count(self):
        """Increment download count"""
        self.sudo().write({'download_count': self.download_count + 1}) 