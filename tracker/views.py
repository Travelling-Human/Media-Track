import json
from collections import defaultdict
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render
from .models import MediaItem
from .serializers import MediaItemSerializer
# Create your views here.


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_json(request):
    items = MediaItem.objects.filter(user=request.user)

    data = [
        {
            "title": item.title,
            "media_type": item.media_type,
            "status": item.status,
            "rating": item.rating,
            "notes": item.notes,
        }
        for item in items
    ]

    response = HttpResponse(
        json.dumps(data, indent=2),
        content_type="application/json",
    )
    response["Content-Disposition"] = 'attachment; filename="medialist_export.json"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_txt(request):
    items = MediaItem.objects.filter(user=request.user)

    lines = []
    for status_value, status_label in MediaItem.Status.choices:
        status_items = [i for i in items if i.status == status_value]
        if not status_items:
            continue
        lines.append(f"=== {status_label.upper()} ===")
        for item in status_items:
            rating_str = f" ({item.rating}/10)" if item.rating else ""
            lines.append(f"- [{item.get_media_type_display()}] {item.title}{rating_str}")
        lines.append("")

    content = "\n".join(lines)

    response = HttpResponse(content, content_type="text/plain")
    response["Content-Disposition"] = 'attachment; filename="medialist_export.txt"'
    return response

    
class MediaItemViewSet(viewsets.ModelViewSet):
    serializer_class = MediaItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MediaItem.objects.filter(user=self.request.user)

        media_type = self.request.query_params.get('media_type')
        if media_type:
            queryset = queryset.filter(media_type=media_type)

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def export(self, request):
        export_format = request.query_params.get('format', 'json')
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        if export_format == 'txt':
            return self._export_txt(data)
        return self._export_json(data)

    def _export_json(self, data):
        content = json.dumps(data, indent=2)
        response = HttpResponse(content, content_type='application/json')
        response['Content-Disposition'] = 'attachment; filename="medialist.json"'
        return response

    def _export_txt(self, data):
        grouped = defaultdict(list)
        for item in data:
            grouped[item['status_display']].append(item)

        lines = []
        for status_label in ['Ongoing', 'Completed', 'Planned', 'Dropped']:
            items = grouped.get(status_label)
            if not items:
                continue
            lines.append(f"=== {status_label.upper()} ===")
            for item in items:
                rating_str = f" — {item['rating']}/10" if item['rating'] else ""
                lines.append(f"- {item['title']} ({item['media_type_display']}){rating_str}")
            lines.append("")

        content = "\n".join(lines).strip()
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename="medialist.txt"'
        return response