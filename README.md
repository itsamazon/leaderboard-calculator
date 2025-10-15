# Studio X Intern Leaderboard

A full-stack web application for tracking and ranking Learnable Interns at Studio X based on weekly performance metrics.

## 🌟 Features

- **Full-Stack Architecture** - Express.js backend + React frontend + Supabase database
- **Admin Panel** - Add interns, create weeks, grade metrics, manage strategists
- **Intern View** - Read-only view for interns to track their progress
- **Dynamic Roles** - Interns can be Strategist or Support, roles change weekly
- **Automated Scoring** - Calculates scores based on role-specific formulas
- **Weekly & Cumulative Leaderboards** - Track progress weekly and overall
- **Export Functionality** - Export data as CSV or PDF
- **Real-time Updates** - Backend API with polling for updates
- **Studio X Branding** - Custom colors, typography, and design

## 🏗️ Architecture

```
Frontend (React + TS)  →  Backend (Express.js)  →  Database (Supabase)
     ↓                          ↓                        ↓
Admin Panel              REST API                PostgreSQL
Intern View              CRUD Operations         Tables & Relations
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Set Up Supabase Database

1. Go to https://app.supabase.com and create a new project
2. In **SQL Editor**, run the schema from `supabase-schema.sql`
3. Go to **Settings** → **API** and copy:
   - **Project URL**
   - **service_role key** (⚠️ NOT the anon key!)

### Step 2: Configure Backend

```bash
cd server
```

Edit `server/.env` with your Supabase credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Step 3: Install & Run

```bash
# Install backend dependencies (from server/ directory)
npm install

# Go back to root
cd ..

# Install frontend dependencies
npm install

# Start everything!
npm run dev:all
```

### Step 4: Access the App

- **Admin Panel**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- TailwindCSS
- Framer Motion
- jsPDF

### Backend
- Node.js 18+
- Express.js
- TypeScript
- express-validator
- Supabase client

### Database
- Supabase (PostgreSQL)

## 📡 API Endpoints

### Base URL: `/api`

**Interns**
- `GET /interns` - List all interns
- `POST /interns` - Create intern
- `PUT /interns/:id` - Update intern
- `DELETE /interns/:id` - Delete intern

**Strategists**
- `GET /strategists` - List all weekly assignments
- `POST /strategists` - Create week with 2 strategists
- `PUT /strategists/:week` - Update week's strategists
- `DELETE /strategists/:week` - Delete week

**Metrics**
- `GET /metrics` - List all metrics
- `GET /metrics?week=Week1` - Filter by week
- `POST /metrics` - Create metric
- `PUT /metrics/:id` - Update metric
- `DELETE /metrics/:id` - Delete metric

## 📦 Project Structure

```
leaderboard-calculator/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── index.ts       # Express server
│   └── .env               # Backend config (YOU MUST CREATE THIS)
│
├── src/                   # Frontend
│   ├── lib/
│   │   ├── api-client.ts  # API client
│   │   └── database-api.ts # Database layer
│   ├── components/        # UI components
│   ├── App-admin.tsx      # Admin panel
│   └── App-intern.tsx     # Intern view
│
├── supabase-schema.sql    # Database schema
└── package.json
```

## 🎯 Usage

### Adding Interns
1. Click "➕ Add Intern"
2. Enter name and optional notes
3. Intern saved to database

### Creating a Week
1. Click "➕ Add New Week"
2. Select 2 strategists for the week
3. Week is created

### Grading
1. Select week
2. Click "📊 Start Grading"
3. Grade strategists first, then supports
4. Scores auto-calculated

### Viewing Leaderboard
- **Weekly View**: See rankings for specific week
- **Cumulative View**: See overall rankings
- **Breakdown**: Click any intern to see score details
- **Export**: Download as CSV or PDF

## 🚢 Deployment

### Backend to Vercel

```bash
cd server
vercel
# Set environment variables in Vercel dashboard:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - ALLOWED_ORIGINS (add your production frontend URLs)
```

### Frontend to Vercel

```bash
vercel --prod
# Set environment variable:
# - VITE_API_URL=https://your-backend.vercel.app/api
```

**Detailed deployment guide:** See `DEPLOYMENT-GUIDE.md`

## 🐛 Troubleshooting

**Backend won't start?**
- Check `SUPABASE_URL` in `server/.env`
- Ensure you used **service_role** key (not anon)
- Verify Supabase project is active

**Port 5000 in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**Frontend can't connect?**
- Ensure backend is running: `curl http://localhost:5000/health`
- Check browser console for errors
- Verify `VITE_API_URL` environment variable

**CORS errors?**
- Update `ALLOWED_ORIGINS` in `server/.env`
- Restart backend server

## 📞 Quick Commands

| Task | Command |
|------|---------|
| Start everything | `npm run dev:all` |
| Start backend only | `npm run dev:backend` |
| Start frontend only | `npm run dev` |
| Build backend | `npm run build:backend` |
| Build frontend | `npm run build` |
| Test backend | `curl http://localhost:5000/health` |

## 🔐 Security

- Service role key used in backend only
- CORS protection on API
- Input validation on all endpoints
- Environment variables for sensitive data
- No credentials exposed in frontend

## 📚 Additional Documentation

- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Production deployment
- **[API-REFERENCE.md](API-REFERENCE.md)** - Complete API documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture details

## 📄 License

MIT

## 👥 Authors

Studio X Team

---

**Need help?** Check the troubleshooting section or review the additional documentation files.
