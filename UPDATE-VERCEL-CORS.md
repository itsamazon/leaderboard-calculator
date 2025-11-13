# 🚨 URGENT: Fix CORS Error

## The Error

```
Access to fetch at 'https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/metrics' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## The Problem

Your backend on Vercel is **NOT allowing requests from `http://localhost:3000`**. 

The backend needs to have `ALLOWED_ORIGINS` environment variable set to include `http://localhost:3000`.

## The Solution (5 Minutes)

### Step 1: Go to Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your backend project: `studio-x-leaderboard-backend`
3. Click on it

### Step 2: Update Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Look for `ALLOWED_ORIGINS` variable
3. **Click Edit** (or Add if it doesn't exist)

### Step 3: Set the Value

**Set `ALLOWED_ORIGINS` to:**

```
https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
```

**Important:**
- ✅ No spaces after commas
- ✅ No quotes around the value
- ✅ Include ALL origins (production + localhost)
- ✅ Make sure `http://localhost:3000` is included

### Step 4: Save and Redeploy

1. **Click Save**
2. Go to **Deployments** tab
3. Click **⋯** (three dots) on the latest deployment
4. Click **Redeploy**
5. Wait ~1-2 minutes for redeployment

### Step 5: Test

1. Restart your frontend dev server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000`
3. Check browser console - CORS error should be gone!

## Visual Guide

```
Vercel Dashboard
  → Your Project (studio-x-leaderboard-backend)
    → Settings
      → Environment Variables
        → ALLOWED_ORIGINS
          → Edit
            → Value: https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
              → Save
                → Deployments
                  → Redeploy
```

## Verify It's Working

### Test 1: Check Backend Health

```bash
curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/health
```

Should return:
```json
{"status":"healthy","timestamp":"...","environment":"production"}
```

### Test 2: Check CORS Headers

```bash
curl -v -H "Origin: http://localhost:3000" \
  https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns \
  2>&1 | grep -i "access-control"
```

Should show:
```
< access-control-allow-origin: http://localhost:3000
< access-control-allow-credentials: true
```

### Test 3: Check Browser Console

1. Open `http://localhost:3000`
2. Open DevTools (F12)
3. Check Console tab
4. Should see:
   - ✅ `🔌 API URL: https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api`
   - ✅ `🌐 API Request: GET ...`
   - ✅ `✅ API Success: [...]`
   - ❌ NO CORS errors!

## Troubleshooting

### Still Getting CORS Error?

1. **Verify environment variable is set:**
   - Check Vercel dashboard
   - Make sure `ALLOWED_ORIGINS` includes `http://localhost:3000`
   - No extra spaces or quotes

2. **Verify backend was redeployed:**
   - Check Deployments tab
   - Latest deployment should be recent
   - Status should be "Ready"

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

4. **Check browser console:**
   - Look for the exact error message
   - Check Network tab for failed requests
   - Look at response headers

### Common Mistakes

❌ **Wrong:** `ALLOWED_ORIGINS = "http://localhost:3000"` (with quotes)
✅ **Correct:** `ALLOWED_ORIGINS = http://localhost:3000` (no quotes)

❌ **Wrong:** `ALLOWED_ORIGINS = http://localhost:3000, http://localhost:3001` (with spaces)
✅ **Correct:** `ALLOWED_ORIGINS = http://localhost:3000,http://localhost:3001` (no spaces)

❌ **Wrong:** Missing `http://` or `https://`
✅ **Correct:** Always include the protocol

❌ **Wrong:** `ALLOWED_ORIGINS = localhost:3000` (missing protocol)
✅ **Correct:** `ALLOWED_ORIGINS = http://localhost:3000` (with protocol)

## Quick Reference

**Backend URL:**
```
https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api
```

**Environment Variable:**
```
ALLOWED_ORIGINS=https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
```

**Frontend URL:**
```
http://localhost:3000
```

---

**Once you update `ALLOWED_ORIGINS` in Vercel and redeploy, the CORS error will be fixed!** 🎉

