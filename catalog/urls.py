from django.urls import path
from .views import search_catalog, trending_catalog, catalog_availability

urlpatterns = [
    path('search/', search_catalog, name='catalog-search'),
    path('trending/', trending_catalog, name='catalog-trending'),
    path('availability/', catalog_availability, name='catalog-availability'),
]
