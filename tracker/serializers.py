from rest_framework import serializers
from .models import MediaItem


class MediaItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    media_type_display = serializers.CharField(source='get_media_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MediaItem
        fields = [
            'id', 'title', 'media_type', 'media_type_display',
            'status', 'status_display', 'rating', 'notes',
            'cover_image_url', 'external_source', 'external_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']