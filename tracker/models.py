from django.db import models
from django.conf import settings
# Create your models here.



class MediaItem(models.Model):
    class MediaType(models.TextChoices):
        MOVIE = "movie", "Movie"
        TV = "tv", "TV Series"
        BOOK = "book", "Book"
        GAME = "game", "Video Game"
        ANIME = "anime", "Anime"
        MUSIC = "music", "Music"
        COMICS = "comics", "Comics"
        MANGA = "manga", "Manga"
        MANHWA = "manhwa", "Manhwa"
        MANHUA = "manhua", "Manhua"
        

    class Status(models.TextChoices):
        WATCHING = "watching", "Watching"
        PLANNED = "planned", "Planned"
        PAUSED = "paused", "Paused"
        COMPLETED = "completed", "Completed"
        ONGOING = "ongoing", "Ongoing"
        DROPPED = "dropped", "Dropped"
        REWATCHING = "rewatching", "Rewatching"


    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="media_items",
    )
    title = models.CharField(max_length=300)
    media_type = models.CharField(max_length=20, choices=MediaType.choices)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLANNED
    )
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cover_image_url = models.URLField(blank=True, null=True)
    external_source = models.CharField(max_length=20, blank=True)
    external_id = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.get_media_type_display()})"