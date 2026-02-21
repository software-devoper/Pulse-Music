# Pulse Music - Full-Stack Streaming App

Modern Spotify-style online music streaming web app built with React + Tailwind + Express + Supabase + Jamendo API.

## 1) Project Setup Instructions

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase project
- Jamendo developer account + `client_id`

### Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### Configure environment variables
1. Copy example env files:
```bash
cd client && copy .env.example .env
cd ../server && copy .env.example .env
```
2. Fill the real values.

### Run database schema
- Open Supabase SQL Editor.
- Run: `supabase/schema.sql`

### Start development servers
```bash
cd server && npm run dev
cd ../client && npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## 2) Full Folder Structure

```txt
/client
  /components
    AlbumCard.jsx
    AppLayout.jsx
    Loader.jsx
    PlayerBar.jsx
    ProtectedRoute.jsx
    Sidebar.jsx
    TrackCard.jsx
  /context
    AuthContext.jsx
    PlayerContext.jsx
  /hooks
    useDebounce.js
  /pages
    AuthPage.jsx
    DashboardPage.jsx
    LibraryPage.jsx
    SearchPage.jsx
  /services
    api.js
    jamendo.js
    playlists.js
    supabase.js
  /src
    App.jsx
    index.css
    main.jsx
  .env.example
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  vite.config.js

/server
  /controllers
    jamendoController.js
    playlistController.js
  /lib
    supabaseAdmin.js
  /middleware
    authMiddleware.js
  /routes
    jamendoRoutes.js
    playlistRoutes.js
  .env.example
  app.js
  index.js
  package.json

/supabase
  schema.sql

.gitignore
README.md
```

## 3) Environment Variable Setup

### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### `server/.env`
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JAMENDO_CLIENT_ID=YOUR_JAMENDO_CLIENT_ID
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## 4) Supabase Schema

- Schema file: `supabase/schema.sql`
- Includes:
  - `playlists` table
  - `playlist_tracks` table
  - unique track-per-playlist constraint
  - RLS policies for user-owned data

## 5) Jamendo API Example Requests

Direct Jamendo examples:
```bash
# Search tracks
https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_ID&format=json&namesearch=lofi&limit=20&audioformat=mp31

# Popular tracks
https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_ID&format=json&order=popularity_total&limit=20&audioformat=mp31

# Best artists
https://api.jamendo.com/v3.0/artists/?client_id=YOUR_ID&format=json&order=popularity_total&limit=15
```

Secure backend routes used by frontend:
```bash
GET /api/jamendo/search?q=lofi
GET /api/jamendo/popular
GET /api/jamendo/artists-best
GET /api/jamendo/track?id=123456
```

## 6) Deployment Instructions (Vercel + Render)

### Deploy frontend on Vercel
1. Push repo to GitHub.
2. Import repo in Vercel.
3. Set root directory to `client`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add frontend env vars:
   - `VITE_API_BASE_URL=https://YOUR_RENDER_API/api`
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`

### Deploy backend on Render
1. Create Web Service from same repo.
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add backend env vars:
   - `PORT=10000` (Render default is fine)
   - `CLIENT_ORIGIN=https://YOUR_VERCEL_DOMAIN`
   - `JAMENDO_CLIENT_ID=...`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`

## Key Features Implemented

- Supabase email/password auth (signup/login/logout)
- Protected routes
- Jamendo search + stream with HTML audio
- Track duration + artist metadata
- Download button (enabled only for logged-in users)
- Playlist create/fetch/add/remove with Supabase persistence
- Responsive dark Spotify-style dashboard
- Mobile collapsing sidebar + adaptive bottom player
- Loading and error states
- Reusable component architecture

## Notes

- Jamendo streams are public preview URLs returned by Jamendo API.
- Download uses Jamendo track audio URL; licensing terms depend on each track.
- Backend keeps Jamendo key private.
