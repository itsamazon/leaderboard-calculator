# 🚀 Quick Fix: APIs Not Loading

## The Problem

Your APIs work when tested directly, but fail to load in the browser. This is a **CORS issue**.

## The Solution (5 Minutes)

### Step 1: Update Vercel Backend CORS

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Open your backend project: `studio-x-leaderboard-backend`
3. Go to **Settings** → **Environment Variables**
4. Find `ALLOWED_ORIGINS`
5. **Update it to:**
   ```
   https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app,http://localhost:3000,http://localhost:3001
   ```
6. **Save**

### Step 2: Redeploy Backend

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Wait ~1-2 minutes

### Step 3: Restart Frontend

1. Stop your dev server (Ctrl+C)
2. Run: `npm run dev`
3. Open `http://localhost:3000`

### Step 4: Check Console

Open browser DevTools (F12) → Console tab. You should see:
- ✅ `🔌 API URL: https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api`
- ✅ `🌐 API Request: GET ...`
- ✅ `✅ API Success: [...]`

## What I Changed

1. ✅ Updated `.env.local` with your backend URL
2. ✅ Added better error logging in API client
3. ✅ Added error messages in the UI
4. ✅ Created detailed troubleshooting guides

## If Still Not Working

Check the browser console for the exact error:
- **CORS Error** → Backend CORS not updated (do Step 1-2 above)
- **Network Error** → Backend not accessible (check URL)
- **404 Error** → Wrong API URL (check `.env.local`)

## Test Your Backend

```bash
# Should return data
curl https://studio-x-leaderboard-backend-3sxwvfrfi-itsamazons-projects.vercel.app/api/interns
```

---

**Once CORS is fixed in Vercel, everything will work!** 🎉

