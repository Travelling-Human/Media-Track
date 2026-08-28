# Media Track

A personal media tracker for keeping movies, TV series, books, games, anime, manga, manhwa, manhua, and music in one place. Discover something new, add it to your archive, and keep track of where you are.

[View the live app](https://media-track-alpha.vercel.app/)

## Features

- Create an account and keep a private, JWT-protected library.
- Search external catalogs or add titles manually.
- Browse weekly trending movies, series, games, anime, books, manga, manhwa, and manhua.
- Track each item with a status, optional rating, notes, and cover artwork.
- Filter your library by media type and status, then revisit recently updated items in History.
- Check links for where to watch, read, play, or listen when available.
- Export your archive as JSON or plain text.

## Built with

- **Frontend:** React, Vite, React Router, Axios, Lucide
- **Backend:** Django, Django REST Framework, Simple JWT
- **Database:** MongoDB via `django-mongodb-backend`
- **Catalog data:** TMDB, Google Books, RAWG, AniList, and MusicBrainz

## Run locally

### 1. Start the backend

From the project root, create and activate a virtual environment, then install the Python packages:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017
TMDB_API_KEY=your_tmdb_key
RAWG_API_KEY=your_rawg_key
GOOGLE_BOOKS_API_KEY=your_google_books_key
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

`GOOGLE_BOOKS_API_KEY` is optional; the other database and catalog settings are required by the backend.

Apply migrations and start the API:

```bash
python manage.py migrate
python manage.py runserver
```

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Then run the development server:

```bash
npm run dev
```

Open the local URL Vite prints in your browser, register an account, and start building your archive.

## Project structure

```text
frontend/    React application
accounts/    User registration and authentication
tracker/     Personal media-library API and exports
catalog/     External search, trending, and availability services
medialist/   Django configuration
```
