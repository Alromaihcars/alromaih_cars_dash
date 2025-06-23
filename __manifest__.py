{
    'name': 'Alromaih Cars Dashboard',
    'version': '18.0.2.1.0',
    'summary': 'Alromaih Cars Management Dashboard',
    'description': """
        Alromaih Cars Dashboard Module
        ==============================
        
        Car Management System with standard Odoo views:
        
        Core Features:
        - Car Management with color-based variants
        - Special offers and discounts
        - Car specifications management
        - CRM integration for lead and customer management
        - Specification templates and categories
        - Media management for cars
        - Car dashboard with statistics
        - Standard Odoo form views and interfaces
        - Professional automotive inventory management
        
    """,
    'category': 'Automotive',
    'author': 'Alromaih Motors',
    'website': 'https://www.alromaih.com',
    'depends': [
        'base',
        'web',
        'mail',
        'product',
        'alromaih_cars_inventory',
        'crm',
    ],
    'data': [
        # Security
        'security/ir.model.access.csv',
        
        # Data
        'data/iframe_dashboard_data.xml',
        'data/system_settings_data.xml',
        
        # Views - Actions must be defined before menus that reference them
        'views/car_views.xml',
        'views/car_variant_views.xml',
        'views/car_media_views.xml',
        'views/car_specification_views.xml',
        'views/system_settings_views.xml',
        'views/car_offers_views.xml',
        'views/dashboard_views.xml',
        
        # Configuration Views (with actions)
        'views/car_brand_views.xml',
        'views/car_model_views.xml',
        'views/car_trim_views.xml',
        'views/car_year_views.xml',
        'views/car_color_views.xml',
        'views/car_specification_template_views.xml',
        
        # CMS Views
        'views/alromaih_news_views.xml',
        'views/alromaih_blog_views.xml',
        
        # Menu (must be loaded after all actions are defined)
        'views/menu_views.xml',
    ],
    
    'assets': {
    },
    
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
