# Studio X Leaderboard - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Admin Panel     │              │  Intern View     │        │
│  │  (React + TS)    │              │  (React + TS)    │        │
│  │                  │              │                  │        │
│  │  - Add Interns   │              │  - View Scores   │        │
│  │  - Grade Weeks   │              │  - Leaderboard   │        │
│  │  - Manage Data   │              │  - Breakdown     │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                 │                  │
│           └─────────────┬───────────────────┘                  │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          │
┌─────────────────────────┼─────────────────────────────────────┐
│                         │        Backend Layer                │
├─────────────────────────┼─────────────────────────────────────┤
│                         ▼                                      │
│              ┌──────────────────┐                             │
│              │   Express API    │                             │
│              │   (Node.js/TS)   │                             │
│              │                  │                             │
│              │  - REST Routes   │                             │
│              │  - Validation    │                             │
│              │  - Services      │                             │
│              └────────┬─────────┘                             │
│                       │                                        │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        │ Supabase Client
                        │
┌───────────────────────┼───────────────────────────────────────┐
│                       ▼        Database Layer                 │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│                  ┌─────────────────┐                          │
│                  │    Supabase     │                          │
│                  │   (PostgreSQL)  │                          │
│                  │                 │                          │
│                  │  - Tables       │                          │
│                  │  - Relations    │                          │
│                  │  - Constraints  │                          │
│                  └─────────────────┘                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS with Studio X brand colors
- **Animations**: Framer Motion
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **PDF Export**: jsPDF + autoTable
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: express-validator
- **CORS**: cors middleware
- **Database Client**: @supabase/supabase-js

### Database
- **Provider**: Supabase
- **Database**: PostgreSQL
- **Tables**: 
  - `intern_profiles` - Intern data
  - `weekly_strategists` - Weekly role assignments
  - `weekly_metrics` - Performance metrics

## Data Flow

### Creating an Intern

```
1. Admin Panel (React)
   └─> User clicks "Add Intern"
   └─> Fills form with name/notes
   └─> onClick handler triggered

2. Frontend API Client
   └─> POST /api/interns
   └─> Body: { name, notes }
   └─> Headers: Content-Type: application/json

3. Backend API Route
   └─> Express route: POST /interns
   └─> Validation: express-validator
   └─> If valid → InternService.createIntern()

4. Backend Service Layer
   └─> InternService.createIntern(name, notes)
   └─> supabase.from('intern_profiles').insert()
   └─> Returns created intern with ID

5. Database
   └─> INSERT INTO intern_profiles
   └─> Returns row with auto-generated UUID

6. Response Chain
   └─> Service → Route → Frontend
   └─> Frontend updates state
   └─> UI re-renders with new intern
```

### Grading a Week

```
1. Admin Panel
   └─> Select week, select intern
   └─> Fill metrics form
   └─> Submit

2. Frontend
   └─> Convert camelCase → snake_case
   └─> POST /api/metrics
   └─> Body: { intern_id, week, role, metrics... }

3. Backend
   └─> Validate all fields
   └─> MetricsService.createMetrics()
   └─> Insert into weekly_metrics table

4. Database
   └─> Store metrics with timestamp
   └─> Return created record

5. Frontend
   └─> Convert snake_case → camelCase
   └─> Update local state
   └─> Recalculate scores
   └─> Update leaderboard
```

## File Structure

### Backend (`/server`)

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # Supabase connection
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   │
│   ├── services/                # Business logic layer
│   │   ├── internService.ts     # Intern CRUD operations
│   │   ├── strategistService.ts # Strategist management
│   │   └── metricsService.ts    # Metrics management
│   │
│   ├── routes/                  # API endpoints
│   │   ├── interns.ts           # /api/interns
│   │   ├── strategists.ts       # /api/strategists
│   │   └── metrics.ts           # /api/metrics
│   │
│   └── index.ts                 # Express app setup
│
├── api/
│   └── index.ts                 # Vercel serverless entry
│
├── package.json
├── tsconfig.json
├── vercel.json                  # Vercel config
└── .env                         # Environment variables
```

### Frontend (`/src`)

```
src/
├── lib/
│   ├── api-client.ts            # HTTP client for backend
│   ├── database-api.ts          # Database layer using API
│   └── type-adapter.ts          # Type conversions
│
├── components/
│   ├── AddInternModal.tsx
│   ├── UpdateMetricsModal.tsx
│   ├── SelectStrategistsModal.tsx
│   ├── ManageWeeksModal.tsx
│   ├── ManageInternsModal.tsx
│   ├── LeaderboardTable.tsx
│   ├── CumulativeLeaderboard.tsx
│   └── BreakdownCard.tsx
│
├── utils/
│   ├── scoring.ts               # Score calculation logic
│   └── export.ts                # CSV/PDF export
│
├── types.ts                     # TypeScript types
├── App-admin.tsx                # Admin panel
├── App-intern.tsx               # Intern view
└── main.tsx                     # Entry point
```

## API Design

### RESTful Conventions

- **GET** - Read operations
- **POST** - Create operations
- **PUT** - Update operations
- **DELETE** - Delete operations

### Response Format

**Success Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "notes": "Great intern",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (delete success)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

### Tables

**intern_profiles**
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
name            TEXT NOT NULL
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

**weekly_strategists**
```sql
id              UUID PRIMARY KEY DEFAULT uuid_generate_v4()
week            TEXT NOT NULL UNIQUE
strategist_ids  TEXT[] NOT NULL (exactly 2 UUIDs)
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

**weekly_metrics**
```sql
id                          UUID PRIMARY KEY
intern_id                   UUID REFERENCES intern_profiles
week                        TEXT NOT NULL
role                        TEXT NOT NULL ('Strategist' | 'Support')
ig_followers                INTEGER DEFAULT 0
ig_views                    INTEGER DEFAULT 0
ig_interactions             INTEGER DEFAULT 0
twitter_followers           INTEGER DEFAULT 0
twitter_impressions         INTEGER DEFAULT 0
twitter_engagements         INTEGER DEFAULT 0
creativity                  INTEGER DEFAULT 0
proactivity                 INTEGER DEFAULT 0
leadership                  INTEGER DEFAULT 0
collaboration               INTEGER DEFAULT 0
bonus_followers             INTEGER DEFAULT 0
based_on_strategist_growth  FLOAT
created_at                  TIMESTAMPTZ DEFAULT NOW()
updated_at                  TIMESTAMPTZ DEFAULT NOW()

UNIQUE(intern_id, week)
```

### Relationships

```
intern_profiles (1) ──< (many) weekly_metrics
                           │
                           │ references
                           │
weekly_strategists ────────┘
     (via week)
```

## Security Measures

### Backend Security

1. **Environment Variables**
   - Sensitive data in `.env`
   - Never committed to git
   - Service role key for backend only

2. **CORS Protection**
   - Whitelist allowed origins
   - Block unauthorized domains

3. **Input Validation**
   - express-validator on all inputs
   - Type checking with TypeScript
   - Sanitization of user input

4. **Database Security**
   - Service role key (admin access)
   - Parameterized queries (Supabase client)
   - No SQL injection possible

### Frontend Security

1. **No Sensitive Keys**
   - Only backend URL exposed
   - No database credentials

2. **Type Safety**
   - TypeScript throughout
   - Runtime validation

## Performance Optimizations

### Frontend

1. **React Optimizations**
   - `useMemo` for expensive calculations
   - Proper key props in lists
   - Lazy loading of modals

2. **Data Management**
   - Local state caching
   - Polling for updates (10s interval)
   - Efficient re-renders

### Backend

1. **Database Queries**
   - Select only needed columns
   - Proper indexing (UUID primary keys)
   - Batch operations where possible

2. **API Efficiency**
   - Gzip compression
   - JSON parsing optimization
   - Minimal middleware stack

## Deployment Architecture

### Development
```
Localhost:3000 (Frontend) → Localhost:5000 (Backend) → Supabase
```

### Production
```
Vercel (Admin)   ─┐
                  ├─→ Vercel/Heroku (Backend) → Supabase
Vercel (Intern)  ─┘
```

## Environment Configuration

### Development (.env)
```env
# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### Production (.env.production)
```env
# Backend (Vercel Environment Variables)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
NODE_ENV=production
ALLOWED_ORIGINS=https://admin.vercel.app,https://intern.vercel.app

# Frontend
VITE_API_URL=https://backend.vercel.app/api
```

## Monitoring & Logging

### Backend Logging
- Request/response logging
- Error tracking
- Database query logging

### Frontend Logging
- API error handling
- User action tracking
- Performance monitoring

## Future Enhancements

### Planned Features
- [ ] Real-time updates (WebSockets/SSE)
- [ ] Rate limiting
- [ ] API authentication (JWT)
- [ ] Admin user management
- [ ] Audit logs
- [ ] Analytics dashboard
- [ ] Email notifications

### Scalability Considerations
- Horizontal scaling for backend
- Database connection pooling
- CDN for frontend assets
- Redis for caching
- Load balancing

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev:all  # Starts backend + frontend
   ```

2. **Testing**
   - Manual API testing with curl/Postman
   - UI testing in browser
   - Database verification in Supabase

3. **Deployment**
   ```bash
   # Backend
   cd server && vercel
   
   # Frontend
   cd .. && vercel --prod
   ```

4. **Monitoring**
   - Vercel Analytics
   - Supabase Dashboard
   - Error logs

---

**Version:** 1.0.0
**Last Updated:** October 2024

