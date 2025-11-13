# 🚀 Run Backend API Locally

## Quick Setup (5 Minutes)

### Step 1: Create Backend Environment File

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Or create it manually:
   ```bash
   touch .env
   ```

3. Open `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   PORT=5001
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

### Step 2: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** (secret) → `SUPABASE_SERVICE_KEY`

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 4: Update Frontend to Use Local API

1. Go back to project root:
   ```bash
   cd ..
   ```

2. Update `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

### Step 5: Start Backend

```bash
cd server
npm run dev
```

You should see:
```
🚀 Studio X Leaderboard API Server Running
Environment: development
Port: 5001
URL: http://localhost:5001
```

### Step 6: Start Frontend (in a new terminal)

```bash
npm run dev
```

### Step 7: Test

1. Open `http://localhost:3000`
2. Check browser console - should see:
   ```
   🔌 API URL: http://localhost:5001/api
   ✅ API Success: [...]
   ```

---

## Option 2: Run Both at Once

Use the `dev:all` script to run both frontend and backend together:

```bash
npm run dev:all
```

This will:
- Start backend on `http://localhost:5001`
- Start frontend on `http://localhost:3000`
- Show logs from both in the same terminal

---

## Troubleshooting

### Backend won't start

1. **Check if port 5001 is in use:**
   ```bash
   lsof -ti:5001
   ```
   If it returns a PID, kill it:
   ```bash
   kill -9 $(lsof -ti:5001)
   ```

2. **Check if .env file exists:**
   ```bash
   ls -la server/.env
   ```

3. **Verify Supabase credentials:**
   - Make sure `SUPABASE_URL` is correct
   - Make sure `SUPABASE_SERVICE_KEY` is the service role key (not anon key)
   - Check Supabase dashboard for correct values

4. **Check backend logs:**
   - Look for error messages in the terminal
   - Common errors:
     - "Missing Supabase configuration" → Check .env file
     - "Port already in use" → Change PORT in .env
     - "Database connection failed" → Check Supabase credentials

### Frontend can't connect to backend

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check .env.local:**
   ```bash
   cat .env.local
   ```
   Should show: `VITE_API_URL=http://localhost:5001/api`

3. **Restart frontend:**
   - Stop dev server (Ctrl+C)
   - Start again: `npm run dev`

4. **Check browser console:**
   - Look for API URL: `🔌 API URL: http://localhost:5001/api`
   - Check for CORS errors (shouldn't have any for localhost)

### Database errors

1. **Verify Supabase credentials:**
   - Go to Supabase dashboard
   - Check API settings
   - Make sure you're using the **Service Role Key** (not anon key)

2. **Check database connection:**
   ```bash
   curl http://localhost:5001/api/interns
   ```
   Should return data (or empty array `[]`)

3. **Check backend logs:**
   - Look for database errors in terminal
   - Common issues:
     - Wrong credentials
     - Database not accessible
     - Network issues

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGci...` |
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001/api` |

---

## Quick Commands

```bash
# Run backend only
cd server && npm run dev

# Run frontend only
npm run dev

# Run both
npm run dev:all

# Check backend health
curl http://localhost:5001/health

# Test API
curl http://localhost:5001/api/interns
```

---

## Benefits of Running Locally

✅ **No CORS issues** - Both frontend and backend on localhost  
✅ **Faster development** - No network latency  
✅ **Easier debugging** - Direct access to backend logs  
✅ **Offline development** - Works without internet (except for Supabase)  
✅ **No Vercel deployment needed** - Test changes immediately  

---

## Switching Between Local and Live API

### Use Local API:
```env
# .env.local
VITE_API_URL=http://localhost:5001/api
```

### Use Live API:
```env
# .env.local
VITE_API_URL=https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api
```

**Remember:** Restart the dev server after changing `.env.local`!

---

**Once set up, you can develop locally without CORS issues!** 🎉

