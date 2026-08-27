from django.shortcuts import render
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from . import services
from django.core.cache import cache
# Create your views here.


SUPPORTED_TYPES = {
    "movie": services.search_movies,
    "tv": services.search_tv,
    "book": services.search_books,
    "game": services.search_games,
    "anime": services.search_anime,
    "manga": services.search_manga,
    "manhwa": services.search_manhwa,
    "manhua": services.search_manhua,
    "music": services.search_music,
}


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_catalog(request):
    media_type = request.query_params.get('media_type')
    query = request.query_params.get('q')
    try:
        page = max(int(request.query_params.get('page', 1)), 1)
    except ValueError:
        page = 1

    if not media_type or not query:
        return Response(
            {"detail": "media_type and q query params are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    search_fn = SUPPORTED_TYPES.get(media_type)
    if search_fn is None:
        return Response(
            {"detail": f"Search for media_type '{media_type}' isn't wired up yet."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    try:
        data = search_fn(query, page)
    except requests.RequestException as exc:
        print(f"Catalog search failed for media_type={media_type}, query={query!r}: {exc}")
        return Response(
            {"detail": "The external catalog service is unavailable right now."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({"results": data["results"], "total_pages": data["total_pages"], "page": page})



TRENDING_CACHE_KEY = "catalog:trending"
TRENDING_CACHE_TTL = 60 * 60  # 1 hour


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trending_catalog(request):
    cached = cache.get(TRENDING_CACHE_KEY)
    if cached is not None:
        return Response(cached)

    def safe_call(fn, default):
        try:
            return fn()
        except requests.RequestException:
            return default

    manga_family = safe_call(services.trending_manga_family, {"manga": [], "manhwa": [], "manhua": []})

    data = {
        "movie": safe_call(services.trending_movies, []),
        "tv": safe_call(services.trending_tv, []),
        "anime": safe_call(services.trending_anime, []),
        "game": safe_call(services.trending_games, []),
        "book": safe_call(services.trending_books, []),
        "manga": manga_family["manga"],
        "manhwa": manga_family["manhwa"],
        "manhua": manga_family["manhua"],
    }

    if data["movie"] and data["manga"]:
        cache.set(TRENDING_CACHE_KEY, data, TRENDING_CACHE_TTL)

    return Response(data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def catalog_availability(request):
    media_type = request.query_params.get('media_type')
    source = request.query_params.get('external_source')
    external_id = request.query_params.get('external_id')

    if not all([media_type, source, external_id]):
        return Response(
            {"detail": "media_type, external_source, and external_id are all required."},
            status=400,
        )

    try:
        if media_type == 'movie' and source == 'tmdb':
            data = services.availability_movie(external_id)
        elif media_type == 'tv' and source == 'tmdb':
            data = services.availability_tv(external_id)
        elif media_type == 'game' and source == 'rawg':
            data = services.availability_game(external_id)
        elif media_type in ('anime', 'manga', 'manhwa', 'manhua') and source == 'anilist':
            data = services.availability_anilist(external_id)
        elif media_type == 'book' and source == 'google_books':
            data = services.availability_book(external_id)
        else:
            data = {"providers": [], "note": "Availability isn't tracked for this media type yet."}
    except requests.RequestException:
        data = {"providers": [], "note": "Couldn't reach the availability service right now."}

    return Response(data)