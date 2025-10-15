# 🔧 Update Backend CORS Settings

## ⚠️ IMPORTANT: Complete this step for your apps to work!

Your frontend apps are deployed, but they can't communicate with the backend yet due to CORS restrictions.

---

## 📋 Steps to Update CORS

### 1. Go to Vercel Dashboard

Open: https://vercel.com/itsamazons-projects/studio-x-leaderboard-backend

### 2. Navigate to Environment Variables

1. Click on your backend project: **studio-x-leaderboard-backend**
2. Click **Settings** tab
3. Click **Environment Variables** in the left sidebar

### 3. Add/Update ALLOWED_ORIGINS

Add a new environment variable:

**Variable Name:**
```
ALLOWED_ORIGINS
```

**Value:**
```
https://studio-x-leaderboard-admin.vercel.app,https://studio-x-interns.vercel.app
```

**Important:** 
- No spaces after commas
- No trailing slashes
- Click **Save** after adding

### 4. Redeploy Backend

After saving the environment variable, you need to redeploy:

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**

**Option B: Via CLI**
```bash
cd server
vercel --prod
```

---

## ✅ Verify It Works

### Test Backend Health
```bash
curl https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production"
}
```

### Test Admin Panel
1. Open: https://studio-x-leaderboard-admin.vercel.app
2. Try adding an intern
3. If it works, CORS is configured correctly! ✅

### Test Intern View
1. Open: https://studio-x-interns.vercel.app
2. You should see the leaderboard (empty if no data yet)
3. Add data in admin, it should appear here within ~10 seconds

---

## 🐛 Troubleshooting

### CORS Error in Browser Console
- Check that `ALLOWED_ORIGINS` has no typos
- Verify the URLs match exactly (check for http vs https)
- Make sure you redeployed after adding the variable

### "Network Error" or "Failed to Fetch"
- Backend might not be deployed yet
- Check backend logs in Vercel dashboard
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set

### Data Not Loading
- Check browser console for errors
- Verify backend health endpoint responds
- Check that database tables are created (run `supabase-schema.sql`)

---

## 📱 Your Live URLs

- **Admin Panel**: https://studio-x-leaderboard-admin.vercel.app
- **Intern View**: https://studio-x-interns.vercel.app  
- **Backend API**: https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app/api

---

**After updating CORS, your apps will be fully functional!** 🎉

