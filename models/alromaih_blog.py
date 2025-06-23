from odoo import api, fields, models, _
from datetime import datetime, timedelta
import re
import logging
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class AlromaihBlog(models.Model):
    _name = 'alromaih.blog'
    _description = _('Alromaih Blog')
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata', 'website.published.mixin']
    _rec_name = 'title'
    _order = 'publish_date desc, create_date desc'
    
    # Basic Information
    title = fields.Char(string='Blog Title', required=True, translate=True, tracking=True)
    subtitle = fields.Char(string='Subtitle', translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True)
    
    # Content
    excerpt = fields.Text(string='Excerpt', translate=True, required=True,
                         help="Brief summary for blog listing (max 300 characters)")
    content = fields.Html(string='Content', translate=True, sanitize_attributes=False,
                         help="Full blog post content")
    
    # Media
    featured_image = fields.Binary(string='Featured Image', help="Main image for the blog post")
    featured_image_alt = fields.Char(string='Image Alt Text', translate=True)
    image_caption = fields.Char(string='Image Caption', translate=True)
    
    # Classification
    blog_type = fields.Selection([
        ('article', 'Article'),
        ('review', 'Car Review'),
        ('guide', 'Buying Guide'),
        ('news', 'Industry News'),
        ('announcement', 'Company Announcement'),
        ('tutorial', 'How-To Guide'),
        ('comparison', 'Car Comparison'),
        ('spotlight', 'Car Spotlight'),
        ('general', 'General Blog')
    ], string='Blog Type', required=True, default='general', tracking=True)
    
    priority = fields.Selection([
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], string='Priority', default='normal', tracking=True)
    
    # Categorization
    category_id = fields.Many2one('alromaih.blog.category', string='Primary Category',
                                required=True, tracking=True)
    tag_ids = fields.Many2many('alromaih.blog.tag', string='Tags')
    
    # Publishing
    status = fields.Selection([
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('scheduled', 'Scheduled'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ], string='Status', default='draft', required=True, tracking=True)
    
    publish_date = fields.Datetime(string='Publish Date', tracking=True)
    expiry_date = fields.Datetime(string='Expiry Date', help="When this blog should be archived")
    
    # Author and Attribution
    author_id = fields.Many2one('res.users', string='Author', required=True,
                               default=lambda self: self.env.user, tracking=True)
    author_name = fields.Char(string='Author Display Name', translate=True)
    author_bio = fields.Text(string='Author Bio', translate=True)
    
    # Features
    featured = fields.Boolean(string='Featured Blog', default=False, tracking=True)
    sticky = fields.Boolean(string='Sticky', default=False, help="Keep at top of listings")
    allow_comments = fields.Boolean(string='Allow Comments', default=True)
    
    # SEO Fields
    seo_title = fields.Char(string='SEO Title', translate=True, size=60)
    seo_description = fields.Text(string='SEO Description', translate=True, size=160)
    seo_keywords = fields.Char(string='SEO Keywords', translate=True)
    
    # Statistics
    view_count = fields.Integer(string='Views', default=0, readonly=True)
    share_count = fields.Integer(string='Shares', default=0, readonly=True)
    comment_count = fields.Integer(string='Comments', compute='_compute_comment_count', store=True)
    
    # Relations
    comment_ids = fields.One2many('alromaih.blog.comment', 'blog_id', string='Comments')
    related_blog_ids = fields.Many2many('alromaih.blog', 'blog_related_rel', 
                                       'blog_id', 'related_blog_id', string='Related Blogs')
    related_car_ids = fields.Many2many('alromaih.car', string='Related Cars')
    
    # Multi-language support
    translation_blog_ids = fields.One2many('alromaih.blog', 'original_blog_id',
                                          string='Translations')
    original_blog_id = fields.Many2one('alromaih.blog', string='Original Blog',
                                      help="Reference to the original blog if this is a translation")
    language = fields.Char(string='Language', default='ar_001')
    
    # Technical
    active = fields.Boolean(default=True)
    sequence = fields.Integer(default=10)
    
    # Computed fields
    reading_time = fields.Integer(string='Reading Time (minutes)', compute='_compute_reading_time', store=True)
    
    @api.depends('content')
    def _compute_reading_time(self):
        """Calculate estimated reading time based on content length"""
        for blog in self:
            if blog.content:
                # Strip HTML tags and count words
                import html
                clean_content = re.sub('<[^<]+?>', '', html.unescape(blog.content or ''))
                word_count = len(clean_content.split())
                # Average reading speed: 200 words per minute
                blog.reading_time = max(1, round(word_count / 200))
            else:
                blog.reading_time = 1
    
    @api.depends('comment_ids')
    def _compute_comment_count(self):
        """Count approved comments"""
        for blog in self:
            blog.comment_count = len(blog.comment_ids.filtered(lambda c: c.status == 'approved'))
    
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
        
        if not vals.get('seo_description') and vals.get('excerpt'):
            vals['seo_description'] = vals['excerpt'][:160]
        
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
        """Publish the blog"""
        for blog in self:
            if blog.status in ['draft', 'review', 'scheduled']:
                blog.write({
                    'status': 'published',
                    'publish_date': fields.Datetime.now(),
                    'is_published': True
                })
                blog.message_post(body=_('Blog published successfully'))
    
    def action_archive(self):
        """Archive the blog"""
        for blog in self:
            blog.write({
                'status': 'archived',
                'is_published': False
            })
            blog.message_post(body=_('Blog archived'))
    
    def increment_view_count(self):
        """Increment view count"""
        self.sudo().write({'view_count': self.view_count + 1})
    
    @api.model
    def get_featured_blogs(self, limit=10):
        """Get featured blogs for display"""
        return self.search([
            ('status', '=', 'published'),
            ('featured', '=', True),
            ('publish_date', '<=', fields.Datetime.now())
        ], limit=limit, order='publish_date desc')
    
    @api.model
    def get_recent_blogs(self, limit=10):
        """Get recent published blogs"""
        return self.search([
            ('status', '=', 'published'),
            ('publish_date', '<=', fields.Datetime.now())
        ], limit=limit, order='publish_date desc')
    
    def action_duplicate_blog(self):
        """Duplicate blog as draft"""
        self.ensure_one()
        
        new_blog = self.copy({
            'title': f"{self.title} (Copy)",
            'slug': '',  # Will be auto-generated
            'status': 'draft',
            'publish_date': False,
            'is_published': False,
            'view_count': 0,
            'share_count': 0,
        })
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'alromaih.blog',
            'res_id': new_blog.id,
            'view_mode': 'form',
            'target': 'current',
        }


class AlromaihBlogImage(models.Model):
    _name = 'alromaih.blog.image'
    _description = _('Blog Image Gallery')
    
    blog_id = fields.Many2one('alromaih.blog', string='Blog', required=True, ondelete='cascade')
    name = fields.Char(string='Image Name', required=True)
    image = fields.Binary(string='Image', required=True, attachment=True)
    alt_text = fields.Char(string='Alt Text', help="Alternative text for accessibility")
    caption = fields.Text(string='Caption')
    sequence = fields.Integer(string='Sequence', default=10)
    active = fields.Boolean(default=True) 