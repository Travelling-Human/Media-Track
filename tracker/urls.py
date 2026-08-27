from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MediaItemViewSet, export_json, export_txt

router = DefaultRouter()
router.register('items', MediaItemViewSet, basename='mediaitem')

urlpatterns = router.urls + [
    path('export/json/', export_json, name='export-json'),
    path('export/txt/', export_txt, name='export-txt'),
]