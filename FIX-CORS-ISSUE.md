# 🔧 Fix CORS Issue - APIs Not Loading

## Problem

The APIs work when tested directly (curl), but fail to load in the browser app. This is likely a **CORS (Cross-Origin Resource Sharing)** issue.

## Root Cause

Your backend on Vercel needs to allow requests from `http://localhost:3000` (your local dev server). The backend CORS configuration needs to include your local origin.

## Solution: Update Backend CORS in Vercel

### Step 1: Go to Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your backend project: `studio-x-leaderboard-backend`
3. Click on it

### Step 2: Update Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Find `ALLOWED_ORIGINS` variable
3. **Edit** it to include `http://localhost:3000`:

```
https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
```

**Important:** 
- Separate multiple URLs with commas (no spaces)
- Include all origins: production URLs + localhost URLs
- Keep the production URLs you already have

### Step 3: Redeploy Backend

After updating the environment variable:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or, if you have Vercel CLI installed:
   ```bash
   cd server
   vercel --prod
   ```

### Step 4: Test Again

1. Wait for redeployment to complete (~1-2 minutes)
2. Restart your frontend dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`
4. Check browser console - should see API requests working

## Alternative: Quick Test with Browser Extension

While waiting for redeployment, you can test with a CORS browser extension (temporary solution):

1. Install a CORS extension (e.g., "CORS Unblock" for Chrome)
2. Enable it
3. Test your app
4. **Remember:** This is only for testing. Always fix CORS properly on the backend.

## Verify CORS is Working

### Test with curl:

```bash
curl -v -H "Origin: http://localhost:3000" \
  https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
```

Look for these headers in the response:
```
access-control-allow-origin: http://localhost:3000
access-control-allow-credentials: true
```

### Test in Browser Console:

1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Go to **Console** tab
4. You should see:
   ```
   🔌 API URL: https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api
   🌐 API Request: GET https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
   ✅ API Success: [...]
   ```

5. Check **Network** tab:
   - Look for requests to `/api/interns`, `/api/strategists`, `/api/metrics`
   - Status should be `200 OK` (not `CORS error` or `Failed to fetch`)

## Current Backend CORS Configuration

Your backend code (in `server/src/index.ts`) checks for:

1. **Environment variable `ALLOWED_ORIGINS`** (comma-separated list)
2. **Default fallback** (only if `ALLOWED_ORIGINS` is not set):
   - `http://localhost:3000`
   - `http://localhost:3001`

**Problem:** If `ALLOWED_ORIGINS` is set in Vercel (even if it doesn't include localhost), the defaults are ignored.

## Recommended ALLOWED_ORIGINS Value

Set this in Vercel:

```
https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
```

This allows:
- ✅ Production admin panel
- ✅ Production intern view
- ✅ Local development (port 3000)
- ✅ Local development (port 3001, if needed)

## Troubleshooting

### Still not working after updating CORS?

1. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

2. **Check browser console for errors:**
   - Open DevTools (F12)
   - Look for CORS errors or network errors
   - Share the error message

3. **Verify backend is redeployed:**
   - Check Vercel deployment logs
   - Make sure the latest deployment includes the new `ALLOWED_ORIGINS`

4. **Test API directly:**
   ```bash
   curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
   ```
   Should return JSON data

5. **Check environment variable is set:**
   - In Vercel dashboard, verify `ALLOWED_ORIGINS` includes `http://localhost:3000`
   - No extra spaces or quotes
   - Comma-separated, no trailing comma

### Common Mistakes

❌ **Wrong:** `ALLOWED_ORIGINS = "http://localhost:3000"` (with quotes)
✅ **Correct:** `ALLOWED_ORIGINS = http://localhost:3000` (no quotes)

❌ **Wrong:** `ALLOWED_ORIGINS = http://localhost:3000, http://localhost:3001` (with spaces)
✅ **Correct:** `ALLOWED_ORIGINS = http://localhost:3000,http://localhost:3001` (no spaces)

❌ **Wrong:** Missing `http://` or `https://`
✅ **Correct:** Always include the protocol

## Still Need Help?

If CORS is still not working:

1. Check the browser console for the exact error message
2. Check the Network tab to see the actual request/response
3. Verify the backend URL is correct in `.env.local`
4. Make sure you restarted the dev server after creating `.env.local`

---

**After fixing CORS, your app should load data successfully!** 🎉

