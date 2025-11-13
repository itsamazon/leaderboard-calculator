# ⚡ Quick Start: Run API Locally

## Step 1: Update Frontend to Use Local API

Update `.env.local` in the project root:

```bash
VITE_API_URL=http://localhost:5001/api
```

**Note:** If port 5001 is busy, check what port your backend uses (default is 5000).

## Step 2: Start Backend

In terminal 1:
```bash
cd server
npm run dev
```

You should see:
```
🚀 Studio X Leaderboard API Server Running
Environment: development
Port: 5001 (or 5000)
URL: http://localhost:5001
```

## Step 3: Start Frontend

In terminal 2 (or use `npm run dev:all`):
```bash
npm run dev
```

## Step 4: Test

1. Open `http://localhost:3000`
2. Check browser console - should see:
   - `🔌 API URL: http://localhost:5001/api`
   - `✅ API Success: [...]`

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

```bash
# Check what's using the port
lsof -ti:5001

# Kill it
kill -9 $(lsof -ti:5001)
```

### Backend Won't Start

1. Check if `.env` exists in `server/` directory
2. Verify Supabase credentials in `server/.env`
3. Check backend logs for errors

### Frontend Can't Connect

1. Make sure backend is running
2. Check `.env.local` has correct URL: `http://localhost:5001/api`
3. Restart frontend dev server

## Run Both at Once

```bash
npm run dev:all
```

This starts both backend and frontend in one terminal.

---

**That's it! No CORS issues when running locally!** 🎉

