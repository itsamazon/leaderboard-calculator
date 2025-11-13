# 🔌 Backend API Configuration

## Live Backend URL

Your live backend API is deployed at:

```
https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api
```

## Environment Configuration

The frontend is configured to use this URL via `.env.local`:

```env
VITE_API_URL=https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api
```

## Quick Test

Test if the backend is working:

```bash
# Health check
curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/health

# Get interns
curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
```

## Troubleshooting

### If APIs are not loading:

1. **Check `.env.local` exists:**
   ```bash
   cat .env.local
   ```
   Should show: `VITE_API_URL=https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api`

2. **Restart dev server:**
   - Stop the server (Ctrl+C)
   - Run: `npm run dev`
   - Vite only reads `.env.local` on startup

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for: `🔌 API URL: https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api`
   - Check Network tab for failed requests

4. **Verify backend is accessible:**
   ```bash
   curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
   ```

## API Endpoints

- **Health**: `GET /health`
- **Interns**: `GET /api/interns`
- **Strategists**: `GET /api/strategists`
- **Metrics**: `GET /api/metrics`

## Production URLs

- **Backend API**: `https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api`
- **Admin Panel**: `https://studio-x-leaderboard-admin.vercel.app`
- **Intern View**: `https://studio-x-interns.vercel.app`

