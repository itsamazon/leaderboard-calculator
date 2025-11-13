# 🚀 Local Development Setup

## Quick Start: Connect Frontend to Live API

If your backend API is already deployed on Vercel, you can run the frontend locally and connect it to the live API.

### Step 1: Create `.env.local` file

Create a `.env.local` file in the project root:

```bash
VITE_API_URL=https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app/api
```

**Replace with your actual backend URL if different!**

### Step 2: Restart the Dev Server

If your dev server is already running, **stop it** (Ctrl+C) and restart:

```bash
npm run dev
```

**Important:** Vite only reads `.env.local` when it starts, so you must restart the server after creating or changing the file.

### Step 3: Verify Connection

1. Open `http://localhost:3000` in your browser
2. Check the browser console (F12) for any errors
3. The app should load data from the live API

---

## Running Backend Locally (Optional)

If you want to run the backend locally instead:

### Step 1: Navigate to Server Directory

```bash
cd server
```

### Step 2: Create `.env` file

Create a `.env` file in the `server/` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=5001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:5001`

### Step 5: Update Frontend `.env.local`

Update `.env.local` in the project root:

```bash
VITE_API_URL=http://localhost:5001/api
```

### Step 6: Restart Frontend

Restart your frontend dev server:

```bash
npm run dev
```

---

## Running Both Frontend and Backend Locally

You can run both at the same time:

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 2: Using Concurrently

Run both at once:

```bash
npm run dev:all
```

This will start:
- Backend on `http://localhost:5001`
- Frontend on `http://localhost:3000`

---

## Troubleshooting

### "Failed to load data" Error

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5001/api/interns
   ```
   Or if using live API:
   ```bash
   curl https://your-backend-url.vercel.app/api/interns
   ```

2. **Verify `.env.local` file exists:**
   ```bash
   cat .env.local
   ```

3. **Check API URL in browser console:**
   - Open browser DevTools (F12)
   - Check Network tab
   - Look for failed requests
   - Verify the API URL is correct

4. **Restart dev server:**
   - Stop the server (Ctrl+C)
   - Start again: `npm run dev`

### CORS Errors

If you see CORS errors:

1. **For local backend:** Make sure `ALLOWED_ORIGINS` in `server/.env` includes `http://localhost:3000`

2. **For live API:** Make sure your Vercel backend has `ALLOWED_ORIGINS` set to include `http://localhost:3000`

### Environment Variable Not Loading

1. **Check file name:** Must be exactly `.env.local` (not `.env` or `.env.local.txt`)

2. **Check file location:** Must be in project root (same level as `package.json`)

3. **Check variable name:** Must start with `VITE_` (e.g., `VITE_API_URL`)

4. **Restart dev server:** Vite only reads env vars on startup

---

## Environment Variables Reference

### Frontend (`.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001/api` or `https://your-backend.vercel.app/api` |

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGci...` |
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

---

## Quick Commands

```bash
# Run frontend only (uses live API from .env.local)
npm run dev

# Run backend only
cd server && npm run dev

# Run both frontend and backend
npm run dev:all

# Build frontend
npm run build

# Build backend
cd server && npm run build
```

---

## Current Setup

- **Frontend:** `http://localhost:3000`
- **Backend (Live):** `https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app/api`
- **Backend (Local):** `http://localhost:5001/api` (if running locally)

---

**Need help?** Check the browser console for detailed error messages!

