from datetime import date, timedelta
from decouple import config
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def _build_session():
    """Shared session for every outbound catalog call. Automatically retries on
    connection-level failures (like a dropped TLS handshake), and on 429/502/503/504
    responses, with increasing delays between attempts (roughly 0.5s, 1s, 2s) —
    instead of every provider needing its own hand-rolled retry logic."""
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


_session = _build_session()


# ---------- TMDB (movies + TV) ----------

TMDB_API_KEY = config('TMDB_API_KEY')
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original"


def search_movies(query, page=1):
    response = _session.get(
        f"{TMDB_BASE_URL}/search/movie",
        params={"api_key": TMDB_API_KEY, "query": query, "page": page},
        timeout=5,
    )
    response.raise_for_status()
    data = response.json()

    return {
        "results": [
            {
                "external_id": str(movie["id"]),
                "external_source": "tmdb",
                "title": movie.get("title"),
                "year": (movie.get("release_date") or "")[:4] or None,
                "cover_image_url": (
                    f"https://image.tmdb.org/t/p/w300{movie['poster_path']}"
                    if movie.get("poster_path") else None
                ),
                "description": movie.get("overview"),
                "rating": f"{movie['vote_average']:.1f}/10" if movie.get("vote_average") else None,
            }
            for movie in data.get("results", [])
        ],
        "total_pages": min(data.get("total_pages", 1), 500),
    }


def trending_movies():
    response = _session.get(
        f"{TMDB_BASE_URL}/trending/movie/week",
        params={"api_key": TMDB_API_KEY},
        timeout=8,
    )
    response.raise_for_status()
    results = response.json().get("results", [])

    return [
        {
            "external_id": str(movie["id"]),
            "external_source": "tmdb",
            "title": movie.get("title"),
            "year": (movie.get("release_date") or "")[:4] or None,
            "cover_image_url": (
                f"https://image.tmdb.org/t/p/w300{movie['poster_path']}"
                if movie.get("poster_path") else None
            ),
            "backdrop_url": (
                f"{TMDB_BACKDROP_BASE}{movie['backdrop_path']}"
                if movie.get("backdrop_path") else None
            ),
            "description": movie.get("overview"),
            "rating": f"{movie['vote_average']:.1f}/10" if movie.get("vote_average") else None,
        }
        for movie in results[:8]
    ]


def search_tv(query, page=1):
    response = _session.get(
        f"{TMDB_BASE_URL}/search/tv",
        params={"api_key": TMDB_API_KEY, "query": query, "page": page},
        timeout=5,
    )
    response.raise_for_status()
    data = response.json()

    return {
        "results": [
            {
                "external_id": str(show["id"]),
                "external_source": "tmdb",
                "title": show.get("name"),
                "year": (show.get("first_air_date") or "")[:4] or None,
                "cover_image_url": (
                    f"https://image.tmdb.org/t/p/w300{show['poster_path']}"
                    if show.get("poster_path") else None
                ),
                "description": show.get("overview"),
                "rating": f"{show['vote_average']:.1f}/10" if show.get("vote_average") else None,
            }
            for show in data.get("results", [])
        ],
        "total_pages": min(data.get("total_pages", 1), 500),
    }


def trending_tv():
    response = _session.get(
        f"{TMDB_BASE_URL}/trending/tv/week",
        params={"api_key": TMDB_API_KEY},
        timeout=8,
    )
    response.raise_for_status()
    results = response.json().get("results", [])

    return [
        {
            "external_id": str(show["id"]),
            "external_source": "tmdb",
            "title": show.get("name"),
            "year": (show.get("first_air_date") or "")[:4] or None,
            "cover_image_url": (
                f"https://image.tmdb.org/t/p/w300{show['poster_path']}"
                if show.get("poster_path") else None
            ),
            "description": show.get("overview"),
            "rating": f"{show['vote_average']:.1f}/10" if show.get("vote_average") else None,
        }
        for show in results[:10]
    ]


# ---------- Google Books ----------

GOOGLE_BOOKS_API_KEY = config('GOOGLE_BOOKS_API_KEY', default='')
GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes"
BOOKS_PAGE_SIZE = 10


def search_books(query, page=1):
    params = {
        "q": query,
        "maxResults": BOOKS_PAGE_SIZE,
        "startIndex": (page - 1) * BOOKS_PAGE_SIZE,
    }
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY

    response = _session.get(GOOGLE_BOOKS_BASE_URL, params=params, timeout=5)
    response.raise_for_status()
    data = response.json()
    total_items = data.get("totalItems", 0)

    results = []
    for item in data.get("items", []):
        info = item.get("volumeInfo", {})
        results.append({
            "external_id": item.get("id"),
            "external_source": "google_books",
            "title": info.get("title"),
            "year": (info.get("publishedDate") or "")[:4] or None,
            "cover_image_url": info.get("imageLinks", {}).get("thumbnail"),
            "description": info.get("description"),
            "rating": f"{info['averageRating']}/5" if info.get("averageRating") else None,
        })

    total_pages = min(-(-total_items // BOOKS_PAGE_SIZE), 20) if total_items else 1
    return {"results": results, "total_pages": max(total_pages, 1)}


def trending_books():
    """Google Books has no trending endpoint — this is a best-effort stand-in via
    a bestseller-leaning query, not genuine trending data like TMDB/AniList provide."""
    params = {"q": "bestseller fiction", "maxResults": 10, "orderBy": "relevance"}
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY

    response = _session.get(GOOGLE_BOOKS_BASE_URL, params=params, timeout=8)
    response.raise_for_status()
    items = response.json().get("items", [])

    results = []
    for item in items:
        info = item.get("volumeInfo", {})
        results.append({
            "external_id": item.get("id"),
            "external_source": "google_books",
            "title": info.get("title"),
            "year": (info.get("publishedDate") or "")[:4] or None,
            "cover_image_url": info.get("imageLinks", {}).get("thumbnail"),
            "description": info.get("description"),
            "rating": f"{info['averageRating']}/5" if info.get("averageRating") else None,
        })
    return results


# ---------- RAWG (games) ----------

RAWG_API_KEY = config('RAWG_API_KEY')
RAWG_BASE_URL = "https://api.rawg.io/api"
GAMES_PAGE_SIZE = 10


def search_games(query, page=1):
    response = _session.get(
        f"{RAWG_BASE_URL}/games",
        params={"key": RAWG_API_KEY, "search": query, "page": page, "page_size": GAMES_PAGE_SIZE},
        timeout=5,
    )
    response.raise_for_status()
    data = response.json()
    count = data.get("count", 0)

    total_pages = min(-(-count // GAMES_PAGE_SIZE), 50) if count else 1
    return {
        "results": [
            {
                "external_id": str(game["id"]),
                "external_source": "rawg",
                "title": game.get("name"),
                "year": (game.get("released") or "")[:4] or None,
                "cover_image_url": game.get("background_image"),
                "description": None,
                "rating": f"{game['rating']:.1f}/5" if game.get("rating") else None,
            }
            for game in data.get("results", [])
        ],
        "total_pages": max(total_pages, 1),
    }


def trending_games():
    today = date.today()
    month_ago = today - timedelta(days=30)
    response = _session.get(
        f"{RAWG_BASE_URL}/games",
        params={
            "key": RAWG_API_KEY,
            "dates": f"{month_ago.isoformat()},{today.isoformat()}",
            "ordering": "-added",
            "page_size": 10,
        },
        timeout=8,
    )
    response.raise_for_status()
    results = response.json().get("results", [])

    return [
        {
            "external_id": str(game["id"]),
            "external_source": "rawg",
            "title": game.get("name"),
            "year": (game.get("released") or "")[:4] or None,
            "cover_image_url": game.get("background_image"),
            "description": None,
            "rating": f"{game['rating']:.1f}/5" if game.get("rating") else None,
        }
        for game in results
    ]


# ---------- AniList (manga, manhwa, manhua, anime) ----------

ANILIST_URL = "https://graphql.anilist.co"

ANILIST_SEARCH_QUERY = """
query ($search: String) {
  Page(page: 1, perPage: 50) {
    media(search: $search, type: MANGA) {
      id
      title { romaji english }
      countryOfOrigin
      startDate { year }
      coverImage { medium }
      description(asHtml: false)
      averageScore
    }
  }
}
"""

COUNTRY_TO_MEDIA_TYPE = {
    "JP": "manga",
    "KR": "manhwa",
    "CN": "manhua",
    "TW": "manhua",
}

MANGA_FAMILY_PAGE_SIZE = 10


def _anilist_media_to_result(media):
    title = media["title"].get("english") or media["title"].get("romaji")
    return {
        "external_id": str(media["id"]),
        "external_source": "anilist",
        "title": title,
        "year": media.get("startDate", {}).get("year"),
        "cover_image_url": media.get("coverImage", {}).get("medium"),
        "description": media.get("description"),
        "rating": f"{media['averageScore']}/100" if media.get("averageScore") else None,
    }


def _search_anilist(query, wanted_type, page=1):
    response = _session.post(
        ANILIST_URL,
        json={"query": ANILIST_SEARCH_QUERY, "variables": {"search": query}},
        timeout=5,
    )
    response.raise_for_status()
    media_list = response.json().get("data", {}).get("Page", {}).get("media", [])

    filtered = [
        _anilist_media_to_result(m) for m in media_list
        if COUNTRY_TO_MEDIA_TYPE.get(m.get("countryOfOrigin")) == wanted_type
    ]

    total_pages = max(-(-len(filtered) // MANGA_FAMILY_PAGE_SIZE), 1)
    start = (page - 1) * MANGA_FAMILY_PAGE_SIZE
    return {"results": filtered[start:start + MANGA_FAMILY_PAGE_SIZE], "total_pages": total_pages}


def search_manga(query, page=1):
    return _search_anilist(query, "manga", page)


def search_manhwa(query, page=1):
    return _search_anilist(query, "manhwa", page)


def search_manhua(query, page=1):
    return _search_anilist(query, "manhua", page)


ANILIST_TRENDING_QUERY = """
query {
  Page(page: 1, perPage: 50) {
    media(type: MANGA, sort: TRENDING_DESC) {
      id
      title { romaji english }
      countryOfOrigin
      startDate { year }
      coverImage { medium }
      description(asHtml: false)
      averageScore
    }
  }
}
"""


def trending_manga_family():
    response = _session.post(ANILIST_URL, json={"query": ANILIST_TRENDING_QUERY}, timeout=8)
    response.raise_for_status()
    media_list = response.json().get("data", {}).get("Page", {}).get("media", [])

    buckets = {"manga": [], "manhwa": [], "manhua": []}
    for media in media_list:
        bucket = COUNTRY_TO_MEDIA_TYPE.get(media.get("countryOfOrigin"))
        if bucket not in buckets or len(buckets[bucket]) >= 10:
            continue
        buckets[bucket].append(_anilist_media_to_result(media))
    return buckets


ANILIST_ANIME_SEARCH_QUERY = """
query ($search: String, $page: Int) {
  Page(page: $page, perPage: 15) {
    pageInfo { lastPage }
    media(search: $search, type: ANIME) {
      id
      title { romaji english }
      startDate { year }
      coverImage { medium }
      description(asHtml: false)
      averageScore
    }
  }
}
"""

ANILIST_ANIME_TRENDING_QUERY = """
query {
  Page(page: 1, perPage: 10) {
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title { romaji english }
      startDate { year }
      coverImage { medium }
      description(asHtml: false)
      averageScore
    }
  }
}
"""


def search_anime(query, page=1):
    response = _session.post(
        ANILIST_URL,
        json={"query": ANILIST_ANIME_SEARCH_QUERY, "variables": {"search": query, "page": page}},
        timeout=5,
    )
    response.raise_for_status()
    page_data = response.json().get("data", {}).get("Page", {})

    return {
        "results": [_anilist_media_to_result(m) for m in page_data.get("media", [])],
        "total_pages": max(page_data.get("pageInfo", {}).get("lastPage", 1), 1),
    }


def trending_anime():
    response = _session.post(ANILIST_URL, json={"query": ANILIST_ANIME_TRENDING_QUERY}, timeout=8)
    response.raise_for_status()
    media_list = response.json().get("data", {}).get("Page", {}).get("media", [])
    return [_anilist_media_to_result(m) for m in media_list]


# ---------- MusicBrainz (music) ----------

MUSICBRAINZ_URL = "https://musicbrainz.org/ws/2/release-group/"
MUSICBRAINZ_USER_AGENT = "MediaListApp/1.0 (your-real-email@example.com)"
MUSIC_PAGE_SIZE = 10


def search_music(query, page=1):
    response = _session.get(
        MUSICBRAINZ_URL,
        params={"query": query, "fmt": "json", "limit": MUSIC_PAGE_SIZE, "offset": (page - 1) * MUSIC_PAGE_SIZE},
        headers={"User-Agent": MUSICBRAINZ_USER_AGENT},
        timeout=8,
    )
    response.raise_for_status()
    data = response.json()
    count = data.get("count", 0)

    results = []
    for group in data.get("release-groups", []):
        artist_credit = group.get("artist-credit", [])
        artist_name = artist_credit[0]["name"] if artist_credit else "Unknown Artist"
        mbid = group.get("id")
        results.append({
            "external_id": mbid,
            "external_source": "musicbrainz",
            "title": f'{group.get("title")} — {artist_name}',
            "year": (group.get("first-release-date") or "")[:4] or None,
            "cover_image_url": f"https://coverartarchive.org/release-group/{mbid}/front-250" if mbid else None,
            "description": None,
            "rating": None,
        })

    total_pages = min(-(-count // MUSIC_PAGE_SIZE), 30) if count else 1
    return {"results": results, "total_pages": max(total_pages, 1)}


# ---------- Availability ("where to watch/read/play") ----------
# Note: TMDB's watch-provider data comes from JustWatch, and their terms require
# attributing JustWatch wherever this data is displayed — handled in the frontend.

def availability_movie(tmdb_id):
    response = _session.get(
        f"{TMDB_BASE_URL}/movie/{tmdb_id}/watch/providers",
        params={"api_key": TMDB_API_KEY},
        timeout=8,
    )
    response.raise_for_status()
    country_data = response.json().get("results", {}).get("US", {})

    seen = set()
    providers = []
    for category in ("flatrate", "rent", "buy"):
        for p in country_data.get(category, []):
            name = p.get("provider_name")
            if name and name not in seen:
                seen.add(name)
                providers.append({"name": name, "link": country_data.get("link")})

    return {"providers": providers, "note": None if providers else "Not currently listed as available in the US."}


def availability_tv(tmdb_id):
    response = _session.get(
        f"{TMDB_BASE_URL}/tv/{tmdb_id}/watch/providers",
        params={"api_key": TMDB_API_KEY},
        timeout=8,
    )
    response.raise_for_status()
    country_data = response.json().get("results", {}).get("US", {})

    seen = set()
    providers = []
    for category in ("flatrate", "rent", "buy"):
        for p in country_data.get(category, []):
            name = p.get("provider_name")
            if name and name not in seen:
                seen.add(name)
                providers.append({"name": name, "link": country_data.get("link")})

    return {"providers": providers, "note": None if providers else "Not currently listed as available in the US."}


def availability_game(rawg_id):
    response = _session.get(
        f"{RAWG_BASE_URL}/games/{rawg_id}/stores",
        params={"key": RAWG_API_KEY},
        timeout=8,
    )
    response.raise_for_status()
    results = response.json().get("results", [])
    providers = [
        {"name": s.get("store", {}).get("name", "Store"), "link": s.get("url")}
        for s in results if s.get("url")
    ]
    return {"providers": providers, "note": None if providers else "No storefront links found."}


ANILIST_EXTERNAL_LINKS_QUERY = """
query ($id: Int) {
  Media(id: $id) {
    externalLinks { url site }
  }
}
"""


def availability_anilist(anilist_id):
    response = _session.post(
        ANILIST_URL,
        json={"query": ANILIST_EXTERNAL_LINKS_QUERY, "variables": {"id": int(anilist_id)}},
        timeout=8,
    )
    response.raise_for_status()
    links = response.json().get("data", {}).get("Media", {}).get("externalLinks", [])
    providers = [{"name": l.get("site"), "link": l.get("url")} for l in links if l.get("url")]
    return {"providers": providers, "note": None if providers else "No official links listed."}


def availability_book(volume_id):
    params = {}
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY
    response = _session.get(f"{GOOGLE_BOOKS_BASE_URL}/{volume_id}", params=params, timeout=8)
    response.raise_for_status()
    data = response.json()
    access_info = data.get("accessInfo", {})
    sale_info = data.get("saleInfo", {})

    providers = []
    if access_info.get("webReaderLink"):
        providers.append({"name": "Preview on Google Books", "link": access_info["webReaderLink"]})
    if sale_info.get("buyLink"):
        providers.append({"name": "Buy on Google Books", "link": sale_info["buyLink"]})

    return {"providers": providers, "note": None if providers else "No read/buy link available."}