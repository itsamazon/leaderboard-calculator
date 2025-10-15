# 📡 API Reference

Complete API documentation for the Studio X Leaderboard backend.

## Base URLs

- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-backend.vercel.app/api`

## Authentication

Currently, the API uses CORS protection. No authentication tokens required (add later for production).

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "name": "John Doe",
  "created_at": "2024-10-14T00:00:00Z"
}
```

### Error Response
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 👥 Interns API

### Get All Interns

```http
GET /api/interns
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "notes": "Great intern",
    "created_at": "2024-10-14T00:00:00Z",
    "updated_at": "2024-10-14T00:00:00Z"
  }
]
```

### Get Intern by ID

```http
GET /api/interns/:id
```

**Parameters:**
- `id` (string, required): Intern UUID

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "notes": "Great intern",
  "created_at": "2024-10-14T00:00:00Z",
  "updated_at": "2024-10-14T00:00:00Z"
}
```

### Create Intern

```http
POST /api/interns
```

**Request Body:**
```json
{
  "name": "John Doe",
  "notes": "Optional notes"
}
```

**Validation:**
- `name`: Required, string
- `notes`: Optional, string

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "notes": "Optional notes",
  "created_at": "2024-10-14T00:00:00Z",
  "updated_at": "2024-10-14T00:00:00Z"
}
```

### Update Intern

```http
PUT /api/interns/:id
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`

### Delete Intern

```http
DELETE /api/interns/:id
```

**Response:** `204 No Content`

**Note:** Cascades delete - removes all related metrics.

---

## 📅 Strategists API

### Get All Weekly Strategists

```http
GET /api/strategists
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "week": "Week 1",
    "strategist_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440002"
    ],
    "created_at": "2024-10-14T00:00:00Z",
    "updated_at": "2024-10-14T00:00:00Z"
  }
]
```

### Get Strategists by Week

```http
GET /api/strategists/:week
```

**Parameters:**
- `week` (string, required): Week name (e.g., "Week 1")

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "week": "Week 1",
  "strategist_ids": ["uuid1", "uuid2"],
  "created_at": "2024-10-14T00:00:00Z",
  "updated_at": "2024-10-14T00:00:00Z"
}
```

### Create Weekly Strategists

```http
POST /api/strategists
```

**Request Body:**
```json
{
  "week": "Week 1",
  "strategistIds": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Validation:**
- `week`: Required, string, unique
- `strategistIds`: Required, array of exactly 2 UUIDs

**Response:** `201 Created`

### Update Weekly Strategists

```http
PUT /api/strategists/:week
```

**Request Body:**
```json
{
  "strategistIds": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

### Delete Week

```http
DELETE /api/strategists/:week
```

**Response:** `204 No Content`

**Note:** Cascades delete - removes all metrics for that week.

---

## 📊 Metrics API

### Get All Metrics

```http
GET /api/metrics
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "intern_id": "550e8400-e29b-41d4-a716-446655440000",
    "week": "Week 1",
    "role": "Strategist",
    "ig_followers": 1000,
    "ig_views": 5000,
    "ig_interactions": 200,
    "twitter_followers": 500,
    "twitter_impressions": 2000,
    "twitter_engagements": 100,
    "creativity": 8,
    "proactivity": 9,
    "leadership": 7,
    "collaboration": 0,
    "bonus_followers": 50,
    "based_on_strategist_growth": null,
    "created_at": "2024-10-14T00:00:00Z",
    "updated_at": "2024-10-14T00:00:00Z"
  }
]
```

### Get Metrics by Week

```http
GET /api/metrics?week=Week 1
```

**Query Parameters:**
- `week` (string, optional): Filter by week

**Response:** Array of metrics for that week

### Get Metrics by Intern

```http
GET /api/metrics?internId=550e8400-e29b-41d4-a716-446655440000
```

**Query Parameters:**
- `internId` (string, optional): Filter by intern UUID

**Response:** Array of metrics for that intern

### Get Metric by ID

```http
GET /api/metrics/:id
```

**Response:** Single metric object

### Create Metric

```http
POST /api/metrics
```

**Request Body:**
```json
{
  "intern_id": "550e8400-e29b-41d4-a716-446655440000",
  "week": "Week 1",
  "role": "Strategist",
  "ig_followers": 1000,
  "ig_views": 5000,
  "ig_interactions": 200,
  "twitter_followers": 500,
  "twitter_impressions": 2000,
  "twitter_engagements": 100,
  "creativity": 8,
  "proactivity": 9,
  "leadership": 7,
  "collaboration": 0,
  "bonus_followers": 50,
  "based_on_strategist_growth": null
}
```

**Validation:**
- `intern_id`: Required, UUID
- `week`: Required, string
- `role`: Required, "Strategist" or "Support"
- Social metrics: Required, integers ≥ 0
- Manual scores: Required, integers 0-10
- `bonus_followers`: Required, integer ≥ 0
- `based_on_strategist_growth`: Optional, float ≥ 0

**Constraint:** Unique combination of `intern_id` + `week`

**Response:** `201 Created`

### Update Metric

```http
PUT /api/metrics/:id
```

**Request Body:** (all fields optional)
```json
{
  "creativity": 9,
  "proactivity": 10
}
```

**Response:** `200 OK`

### Delete Metric

```http
DELETE /api/metrics/:id
```

**Response:** `204 No Content`

---

## 🔍 Example Requests

### cURL Examples

**Get all interns:**
```bash
curl http://localhost:5000/api/interns
```

**Create an intern:**
```bash
curl -X POST http://localhost:5000/api/interns \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","notes":"Test intern"}'
```

**Create a week:**
```bash
curl -X POST http://localhost:5000/api/strategists \
  -H "Content-Type: application/json" \
  -d '{
    "week":"Week 1",
    "strategistIds":["uuid1","uuid2"]
  }'
```

**Create metrics:**
```bash
curl -X POST http://localhost:5000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "intern_id":"uuid",
    "week":"Week 1",
    "role":"Strategist",
    "ig_followers":1000,
    "ig_views":5000,
    "ig_interactions":200,
    "twitter_followers":500,
    "twitter_impressions":2000,
    "twitter_engagements":100,
    "creativity":8,
    "proactivity":9,
    "leadership":7,
    "collaboration":0,
    "bonus_followers":50
  }'
```

---

## 🔗 Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-14T00:00:00Z",
  "environment": "development"
}
```

---

## 📝 Notes

- All UUIDs are auto-generated
- Timestamps are auto-managed
- All endpoints validate input
- CORS is configured via `ALLOWED_ORIGINS`
- Rate limiting: Not implemented (add for production)

