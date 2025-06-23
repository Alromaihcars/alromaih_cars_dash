# Core car models
from . import car
from . import car_variant
from . import car_offers
from . import car_media
from . import car_specification_template
from . import system_settings
from . import car_brand
from . import car_model
from . import car_trim
from . import car_year
from . import car_color
# CMS models for Alromaih Blog
from . import alromaih_blog
from . import alromaih_blog_category
from . import alromaih_news
from . import iframe_dashboard

try:
    from odoo.addons.alromaih_cars_inventory.models.inventory_models import product_attribute_category
except ImportError:
    pass