from odoo import api, fields, models, _
import re
import logging
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class AlromaihBlogCategory(models.Model):
    _name = 'alromaih.blog.category'
    _description = _('Blog Category')
    _inherit = ['mail.thread', 'mail.activity.mixin', 'website.seo.metadata']
    _rec_name = 'name'
    _order = 'parent_path, sequence, name'
    _parent_name = 'parent_id'
    _parent_store = True
    
    # Basic Information
    name = fields.Char(string='Category Name', required=True, translate=True, tracking=True)
    description = fields.Text(string='Description', translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True,
                      help="URL-friendly version of the category name")
    
    # Hierarchy
    parent_id = fields.Many2one('alromaih.blog.category', string='Parent Category', 
                               index=True, ondelete='cascade')
    parent_path = fields.Char(index=True)
    child_ids = fields.One2many('alromaih.blog.category', 'parent_id', string='Child Categories')
    
    # Visual
    color = fields.Char(string='Color', help="Hex color code for category display")
    icon = fields.Char(string='Icon', help="Font Awesome icon class")
    image = fields.Binary(string='Category Image')
    
    # SEO Fields
    seo_title = fields.Char(string='SEO Title', translate=True, size=60,
                           help="Title for search engines (max 60 characters)")
    seo_description = fields.Text(string='SEO Description', translate=True, size=160,
                                 help="Meta description for search engines (max 160 characters)")
    seo_keywords = fields.Char(string='SEO Keywords', translate=True,
                              help="Comma-separated keywords for SEO")
    
    # Statistics
    blog_count = fields.Integer(string='Blogs Count', compute='_compute_blog_count', store=True)
    
    # Settings
    active = fields.Boolean(default=True, tracking=True)
    sequence = fields.Integer(string='Sequence', default=10)
    featured = fields.Boolean(string='Featured Category', default=False,
                             help="Show in featured categories")
    
    # Relations
    blog_ids = fields.One2many('alromaih.blog', 'category_id', string='Blogs')
    
    @api.depends('blog_ids')
    def _compute_blog_count(self):
        """Count published blogs in this category"""
        for category in self:
            category.blog_count = len(category.blog_ids.filtered(lambda p: p.status == 'published'))
    
    @api.model
    def create(self, vals):
        """Enhanced create with slug generation"""
        if not vals.get('slug') and vals.get('name'):
            vals['slug'] = self._generate_slug(vals['name'])
        
        # Auto-generate SEO fields if not provided
        if not vals.get('seo_title') and vals.get('name'):
            vals['seo_title'] = vals['name'][:60]
        
        if not vals.get('seo_description') and vals.get('description'):
            vals['seo_description'] = vals['description'][:160]
        
        return super().create(vals)
    
    def write(self, vals):
        """Enhanced write with slug regeneration"""
        if 'name' in vals and not vals.get('slug'):
            vals['slug'] = self._generate_slug(vals['name'])
        
        return super().write(vals)
    
    def _generate_slug(self, name):
        """Generate URL-friendly slug from name"""
        if not name:
            return ''
        
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        
        # Ensure uniqueness
        original_slug = slug
        counter = 1
        while self.search([('slug', '=', slug), ('id', '!=', self.id)]):
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug
    
    @api.constrains('parent_id')
    def _check_parent_recursion(self):
        """Prevent recursive parent relationships"""
        if not self._check_recursion():
            raise ValidationError(_('You cannot create recursive categories.'))
    
    @api.constrains('slug')
    def _check_slug_unique(self):
        """Ensure slug is unique"""
        for category in self:
            if category.slug:
                duplicate = self.search([
                    ('slug', '=', category.slug),
                    ('id', '!=', category.id)
                ])
                if duplicate:
                    raise ValidationError(_('Slug "%s" already exists. Please choose a different slug.') % category.slug)
    
    def name_get(self):
        """Return category name with parent hierarchy"""
        result = []
        for category in self:
            name = category.name
            if category.parent_id:
                name = f"{category.parent_id.name} / {name}"
            result.append((category.id, name))
        return result
    
    @api.model
    def get_categories_tree(self):
        """Get categories in tree structure for frontend"""
        categories = self.search([('active', '=', True)], order='parent_path, sequence, name')
        
        def build_tree(parent_id=False):
            tree = []
            for cat in categories.filtered(lambda c: c.parent_id.id == parent_id):
                tree.append({
                    'id': cat.id,
                    'name': cat.name,
                    'slug': cat.slug,
                    'description': cat.description,
                    'blog_count': cat.blog_count,
                    'color': cat.color,
                    'icon': cat.icon,
                    'children': build_tree(cat.id)
                })
            return tree
        
        return build_tree()


class AlromaihBlogTag(models.Model):
    _name = 'alromaih.blog.tag'
    _description = _('Blog Tag')
    _rec_name = 'name'
    _order = 'name'
    
    # Basic Information
    name = fields.Char(string='Tag Name', required=True, translate=True)
    slug = fields.Char(string='URL Slug', required=True, index=True,
                      help="URL-friendly version of the tag name")
    description = fields.Text(string='Description', translate=True)
    
    # Visual
    color = fields.Char(string='Color', help="Hex color code for tag display")
    
    # SEO Fields
    seo_title = fields.Char(string='SEO Title', translate=True, size=60)
    seo_description = fields.Text(string='SEO Description', translate=True, size=160)
    seo_keywords = fields.Char(string='SEO Keywords', translate=True)
    
    # Statistics
    blog_count = fields.Integer(string='Blogs Count', compute='_compute_blog_count', store=True)
    
    # Settings
    active = fields.Boolean(default=True)
    featured = fields.Boolean(string='Featured Tag', default=False)
    
    # Relations
    blog_ids = fields.Many2many('alromaih.blog', string='Blogs')
    
    @api.depends('blog_ids')
    def _compute_blog_count(self):
        """Count published blogs with this tag"""
        for tag in self:
            tag.blog_count = len(tag.blog_ids.filtered(lambda p: p.status == 'published'))
    
    @api.model
    def create(self, vals):
        """Enhanced create with slug generation"""
        if not vals.get('slug') and vals.get('name'):
            vals['slug'] = self._generate_slug(vals['name'])
        
        return super().create(vals)
    
    def write(self, vals):
        """Enhanced write with slug regeneration"""
        if 'name' in vals and not vals.get('slug'):
            vals['slug'] = self._generate_slug(vals['name'])
        
        return super().write(vals)
    
    def _generate_slug(self, name):
        """Generate URL-friendly slug from name"""
        if not name:
            return ''
        
        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')
        
        # Ensure uniqueness
        original_slug = slug
        counter = 1
        while self.search([('slug', '=', slug), ('id', '!=', self.id)]):
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        return slug
    
    @api.constrains('slug')
    def _check_slug_unique(self):
        """Ensure slug is unique"""
        for tag in self:
            if tag.slug:
                duplicate = self.search([
                    ('slug', '=', tag.slug),
                    ('id', '!=', tag.id)
                ])
                if duplicate:
                    raise ValidationError(_('Slug "%s" already exists. Please choose a different slug.') % tag.slug)
    
    @api.model
    def get_popular_tags(self, limit=20):
        """Get most popular tags by blog count"""
        return self.search([
            ('active', '=', True),
            ('blog_count', '>', 0)
        ], limit=limit, order='blog_count desc')


class AlromaihBlogComment(models.Model):
    _name = 'alromaih.blog.comment'
    _description = _('Blog Comment')
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'title'
    _order = 'create_date desc'
    
    # Basic Information
    blog_id = fields.Many2one('alromaih.blog', string='Blog', required=True, 
                             ondelete='cascade', tracking=True)
    title = fields.Char(string='Comment Title', compute='_compute_title', store=True)
    content = fields.Text(string='Comment', required=True)
    
    # Author Information
    author_name = fields.Char(string='Author Name', required=True)
    author_email = fields.Char(string='Author Email', required=True)
    author_website = fields.Char(string='Author Website')
    author_ip = fields.Char(string='IP Address')
    user_id = fields.Many2one('res.users', string='Registered User')
    
    # Comment Hierarchy
    parent_id = fields.Many2one('alromaih.blog.comment', string='Parent Comment',
                               ondelete='cascade', help="For reply threads")
    child_ids = fields.One2many('alromaih.blog.comment', 'parent_id', string='Replies')
    
    # Status and Moderation
    status = fields.Selection([
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('spam', 'Spam'),
        ('trash', 'Trash')
    ], string='Status', default='pending', required=True, tracking=True)
    
    # Flags and Ratings
    is_flagged = fields.Boolean(string='Flagged', default=False)
    flag_count = fields.Integer(string='Flag Count', default=0)
    like_count = fields.Integer(string='Likes', default=0)
    
    # Technical Fields
    active = fields.Boolean(default=True)
    
    @api.depends('author_name', 'content')
    def _compute_title(self):
        """Generate title from author and content preview"""
        for comment in self:
            content = comment.content or ''
            content_preview = (content[:50] + '...') if len(content) > 50 else content
            author_name = comment.author_name or 'Anonymous'
            comment.title = f"{author_name}: {content_preview}"
    
    def action_approve(self):
        """Approve the comment"""
        for comment in self:
            comment.write({'status': 'approved'})
            comment.message_post(body=_('Comment approved'))
    
    def action_reject(self):
        """Reject the comment"""
        for comment in self:
            comment.write({'status': 'trash'})
            comment.message_post(body=_('Comment rejected'))
    
    def action_mark_spam(self):
        """Mark as spam"""
        for comment in self:
            comment.write({'status': 'spam'})
            comment.message_post(body=_('Comment marked as spam'))
    
    def action_flag(self):
        """Flag comment for review"""
        for comment in self:
            comment.write({
                'is_flagged': True,
                'flag_count': comment.flag_count + 1
            })
    
    @api.model
    def get_pending_comments(self):
        """Get comments pending approval"""
        return self.search([
            ('status', '=', 'pending'),
            ('active', '=', True)
        ], order='create_date desc') 