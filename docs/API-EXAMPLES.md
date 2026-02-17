# Kolamba API - Examples & Error Formats

**Base URL:** `https://kolamba-production.up.railway.app/api` (production) or `http://127.0.0.1:8001/api` (local)

**Interactive Docs:** `/api/docs` (Swagger UI)

---

## Authentication

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "SecurePass123",
  "name": "Sarah Cohen",
  "role": "artist"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=artist@example.com&password=SecurePass123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "artist@example.com",
  "name": "Sarah Cohen",
  "role": "artist",
  "status": "active",
  "is_active": true,
  "is_superuser": false
}
```

---

## Artists

### List Artists

```bash
GET /api/artists?limit=2&offset=0
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name_en": "Sarah Cohen",
    "name_he": "שרה כהן",
    "bio_en": "Award-winning vocalist...",
    "profile_image": "https://res.cloudinary.com/...",
    "price_tier": "$$",
    "city": "Tel Aviv",
    "country": "Israel",
    "is_featured": true,
    "categories": [{"id": 1, "name_en": "Music", "slug": "music"}],
    "subcategories": ["Vocal", "Jazz"]
  }
]
```

### Get Single Artist

```bash
GET /api/artists/1
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "name_en": "Sarah Cohen",
  "name_he": "שרה כהן",
  "bio_en": "Award-winning vocalist...",
  "profile_image": "https://res.cloudinary.com/...",
  "price_single": 2500,
  "price_tour": 8000,
  "price_tier": "$$",
  "languages": ["English", "Hebrew"],
  "city": "Tel Aviv",
  "country": "Israel",
  "is_featured": true,
  "categories": [{"id": 1, "name_en": "Music", "name_he": "מוזיקה", "slug": "music"}],
  "subcategories": ["Vocal", "Jazz"],
  "performance_types": ["Concert", "Workshop"],
  "website": "https://sarahcohen.com",
  "instagram": "@sarahcohen",
  "portfolio_images": [],
  "video_urls": [],
  "spotify_links": [],
  "media_links": []
}
```

---

## Search

### Full-Text Search

```bash
GET /api/search/artists?q=music+tel+aviv&sort_by=relevance&limit=10
```

**Response (200):**
```json
[
  {
    "id": 1,
    "name_en": "Sarah Cohen",
    "price_tier": "$$",
    "city": "Tel Aviv",
    "is_featured": true,
    "categories": [{"name_en": "Music", "slug": "music"}],
    "subcategories": ["Vocal"]
  }
]
```

---

## Bookings

### Create Booking (requires auth)

```bash
POST /api/bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "artist_id": 1,
  "requested_date": "2026-04-15",
  "location": "NYC Jewish Community Center",
  "budget": 3000,
  "notes": "Evening concert for 200 guests"
}
```

**Response (200):**
```json
{
  "id": 5,
  "artist_id": 1,
  "community_id": 3,
  "requested_date": "2026-04-15",
  "location": "NYC Jewish Community Center",
  "budget": 3000,
  "notes": "Evening concert for 200 guests",
  "status": "pending",
  "created_at": "2026-02-17T10:30:00Z",
  "updated_at": "2026-02-17T10:30:00Z"
}
```

---

## Tour Dates

### Get Artist Tour Dates

```bash
GET /api/artists/1/tour-dates?include_past=false
```

**Response (200):**
```json
[
  {
    "id": 1,
    "artist_id": 1,
    "location": "New York, USA",
    "latitude": 40.7128,
    "longitude": -74.006,
    "start_date": "2026-03-15",
    "end_date": "2026-03-17",
    "description": "Northeast tour stop",
    "is_booked": false,
    "created_at": "2026-02-15T12:00:00Z"
  }
]
```

### Export iCal

```bash
GET /api/artists/1/tour-dates/ical
```

**Response (200):** Returns `.ics` file with `Content-Type: text/calendar`

---

## Notifications

### Get Notifications (requires auth)

```bash
GET /api/notifications/?limit=10&unread_only=true
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "type": "booking_new",
    "title": "New Booking Request",
    "message": "NYC Jewish Center has sent you a booking request for NYC Jewish Community Center.",
    "link": "/dashboard/artist?tab=bookings",
    "is_read": false,
    "created_at": "2026-02-17T10:30:00Z"
  }
]
```

### Get Unread Count

```bash
GET /api/notifications/count
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "unread_count": 3
}
```

---

## Categories

```bash
GET /api/categories
```

**Response (200):**
```json
[
  {"id": 1, "name_en": "Music", "name_he": "מוזיקה", "slug": "music", "sort_order": 1},
  {"id": 2, "name_en": "Comedy", "name_he": "קומדיה", "slug": "comedy", "sort_order": 2}
]
```

---

## Admin (requires superuser)

### Get Stats

```bash
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total_users": 12,
  "total_artists": 7,
  "total_communities": 3,
  "pending_artists": 1,
  "active_artists": 6,
  "active_communities": 3
}
```

### Get Analytics

```bash
GET /api/admin/analytics
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "monthly_growth": [
    {"label": "Sep 2025", "artists": 2, "communities": 1, "bookings": 3},
    {"label": "Oct 2025", "artists": 4, "communities": 2, "bookings": 5}
  ],
  "category_breakdown": [
    {"label": "Music", "value": 3},
    {"label": "Comedy", "value": 2}
  ],
  "booking_status": [
    {"label": "pending", "value": 2},
    {"label": "confirmed", "value": 3}
  ]
}
```

---

## Error Response Format

All API errors follow a consistent format:

### Validation Error (422)
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "requested_date"],
      "msg": "Value error, requested_date must be in the future",
      "input": "2020-01-01"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "detail": "Could not validate credentials"
}
```

### Authorization Error (403)
```json
{
  "detail": "Only community accounts can create bookings. Please register as a community first."
}
```

### Not Found (404)
```json
{
  "detail": "Artist not found"
}
```

### Rate Limit (429)
```json
{
  "error": "Rate limit exceeded: 5 per 1 minute"
}
```
Headers include: `Retry-After: 42` (seconds until reset)

### Server Error (500)
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limits

| Endpoint Group | Limit |
|---------------|-------|
| Auth (register/login) | 5/minute |
| Search | 30/minute |
| Bookings | 10/minute |
| Contact form | 3/minute |
| All other endpoints | 60/minute |

---

## Common Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | int | Max results to return | `?limit=10` |
| `offset` | int | Skip N results (pagination) | `?offset=20` |
| `sort_by` | string | Sort field | `?sort_by=relevance` |
| `sort_order` | string | `asc` or `desc` | `?sort_order=desc` |
| `q` | string | Search query (full-text) | `?q=music+jazz` |
| `category` | string | Filter by category slug | `?category=music` |
