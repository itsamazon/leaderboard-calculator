# 🚀 Deployment Guide

Complete guide for deploying the Studio X Leaderboard to production.

## 📋 Prerequisites

- [x] Supabase project created
- [x] Database schema loaded
- [x] App working locally
- [ ] Vercel account (free tier works)
- [ ] Domain names (optional)

## 🗄️ Database Setup (Already Done Locally)

Your Supabase database is already set up from local development. You'll use the **same Supabase project** for production.

## 🔧 Step 1: Deploy Backend to Vercel

### 1.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 1.2 Deploy Backend

```bash
cd server
vercel
```

**Follow the prompts:**
- Project name: `studio-x-leaderboard-backend`
- Framework: `Other`
- Deploy: `Yes`

### 1.3 Set Environment Variables

In Vercel dashboard for backend project:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

| Variable | Value | Example |
|----------|-------|---------|
| `SUPABASE_URL` | Your Supabase Project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your service_role key | `eyJhbGci...` |
| `NODE_ENV` | `production` | `production` |
| `ALLOWED_ORIGINS` | Your frontend URLs | `https://admin.yourapp.com,https://intern.yourapp.com` |

3. **Redeploy** after adding variables

### 1.4 Note Your Backend URL

After deployment, you'll get a URL like:
```
https://studio-x-leaderboard-backend.vercel.app
```

Save this - you'll need it for frontend deployment.

## 📱 Step 2: Deploy Admin Panel

### 2.1 Update Frontend Environment

Create `.env.production` in project root:

```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### 2.2 Deploy Admin Panel

```bash
# From project root
vercel --prod
```

**Follow the prompts:**
- Project name: `studio-x-leaderboard-admin`
- Framework: `Vite`
- Deploy: `Yes`

### 2.3 Update Backend CORS

Update `ALLOWED_ORIGINS` in backend Vercel dashboard to include your admin URL:

```
https://your-admin.vercel.app,https://your-intern.vercel.app
```

Then redeploy backend.

## 👀 Step 3: Deploy Intern View

### 3.1 Update main.tsx

Temporarily update `src/main.tsx`:

```typescript
import App from './App-intern.tsx'  // Change this line
```

### 3.2 Deploy Intern View

```bash
vercel --prod
```

**Follow the prompts:**
- Project name: `studio-x-leaderboard-intern`
- Framework: `Vite`
- Deploy: `Yes`

### 3.3 Revert main.tsx

Change `src/main.tsx` back to:

```typescript
import App from './App-admin.tsx'
```

## 🎯 Step 4: Test Production

### 4.1 Test Backend

```bash
curl https://your-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "environment": "production"
}
```

### 4.2 Test Admin Panel

1. Open `https://your-admin.vercel.app`
2. Add an intern
3. Create a week
4. Grade metrics

### 4.3 Test Intern View

1. Open `https://your-intern.vercel.app`
2. Verify leaderboard shows
3. Check data updates

### 4.4 Test Live Updates

1. Open admin panel in one tab
2. Open intern view in another
3. Make changes in admin
4. Intern view updates within 10 seconds (polling interval)

## 🔒 Step 5: Security Checklist

- [ ] Backend uses service_role key (not anon)
- [ ] CORS configured with only your frontend URLs
- [ ] Environment variables set in Vercel (not hardcoded)
- [ ] Supabase Row Level Security enabled (optional)
- [ ] Rate limiting considered (optional for later)

## 📊 Step 6: Custom Domains (Optional)

### 6.1 Add Custom Domain to Admin

In Vercel dashboard:
1. Go to admin project → **Settings** → **Domains**
2. Add domain: `admin.yourdomain.com`
3. Configure DNS as instructed

### 6.2 Add Custom Domain to Intern View

1. Go to intern project → **Settings** → **Domains**
2. Add domain: `leaderboard.yourdomain.com`
3. Configure DNS as instructed

### 6.3 Update CORS

Update backend `ALLOWED_ORIGINS`:
```
https://admin.yourdomain.com,https://leaderboard.yourdomain.com
```

## 🚨 Troubleshooting

### "Supabase connection failed"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Vercel
- Check Supabase project is active
- Ensure service_role key is used (not anon)

### "CORS error in production"
- Check `ALLOWED_ORIGINS` includes exact frontend URLs
- No trailing slashes in URLs
- Redeploy backend after changing CORS

### "Backend not responding"
- Check Vercel logs: `vercel logs your-backend`
- Verify environment variables are set
- Test health endpoint: `curl https://backend.vercel.app/health`

### "Build fails"
- Check TypeScript errors: `npm run build`
- Verify all dependencies installed
- Check Node.js version (need 18+)

## 🎉 Deployment Complete!

You now have:

✅ **Backend API**: `https://your-backend.vercel.app`
✅ **Admin Panel**: `https://your-admin.vercel.app`
✅ **Intern View**: `https://your-intern.vercel.app`
✅ **Live Database**: Supabase with real-time updates
✅ **Mobile Responsive**: Works on all devices
✅ **Studio X Branded**: Your logo and colors

## 📱 Usage

1. **Share admin URL** with managers/admins
2. **Share intern URL** with all interns
3. **Monitor** via Vercel Analytics
4. **Backup** data via Supabase dashboard

## 🔄 Making Updates

### Update Frontend
```bash
# Make changes, then:
vercel --prod
```

### Update Backend
```bash
cd server
# Make changes, then:
vercel --prod
```

### Update Database Schema
1. Go to Supabase SQL Editor
2. Run migration SQL
3. No deployment needed

## 📈 Monitoring

### Vercel Analytics
- Visit dashboard for each project
- View traffic, errors, performance

### Supabase Dashboard
- Monitor database usage
- View API requests
- Check real-time connections

---

**Need help?** Check Vercel and Supabase documentation or create an issue.


