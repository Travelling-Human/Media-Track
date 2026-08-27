from django.contrib import admin
from .models import MediaItem
# Register your models here.



@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ("title", "media_type", "status", "user", "rating", "updated_at")
    list_filter = ("media_type", "status")
    search_fields = ("title",)