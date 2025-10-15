# 🚀 Deploy to Vercel - Step by Step

Follow these steps exactly to deploy your Studio X Leaderboard to production.

## ✅ Pre-Deployment Checklist

- [x] App working locally
- [x] Backend connected to Supabase
- [x] Frontend connected to backend
- [x] All features tested
- [ ] Vercel account created
- [ ] Ready to deploy!

---

## 📋 Step 1: Deploy Backend API

### 1.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 1.2 Login to Vercel

```bash
vercel login
```

### 1.3 Deploy Backend

```bash
cd server
vercel
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → **Your account**
- Link to existing project? → **No**
- Project name? → **studio-x-leaderboard-backend**
- Directory? → **./` (current directory)
- Override settings? → **No**

### 1.4 Set Environment Variables

After deployment, go to Vercel dashboard:

1. Open your backend project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `SUPABASE_URL` | `https://qmszrxeqxyfgbvfjfqda.supabase.co` | From your server/.env |
| `SUPABASE_SERVICE_KEY` | `eyJhbGci...` (full key) | From your server/.env |
| `NODE_ENV` | `production` | Type manually |
| `ALLOWED_ORIGINS` | `https://your-admin.vercel.app,https://your-intern.vercel.app` | Update after deploying frontend |

4. Click **Save**

### 1.5 Redeploy with Environment Variables

```bash
vercel --prod
```

### 1.6 Note Your Backend URL

You'll get a URL like:
```
https://studio-x-leaderboard-backend.vercel.app
```

**Save this! You'll need it for frontend deployment.**
https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app 
---

## 📱 Step 2: Deploy Admin Panel

### 2.1 Create Production Environment File

```bash
cd ..  # Back to project root
```

Create `.env.production`:
```bash
echo "VITE_API_URL=https://your-backend-url.vercel.app/api" > .env.production
```

Replace `your-backend-url` with your actual backend URL from Step 1.6

### 2.2 Deploy Admin Panel

```bash
vercel --prod
```

**Answer the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → **Your account**
- Link to existing project? → **No**
- Project name? → **studio-x-leaderboard-admin**
- Directory? → **./** (current directory)
- Override settings? → **No**

### 2.3 Set Environment Variable in Vercel

1. Go to Vercel dashboard → Admin project
2. **Settings** → **Environment Variables**
3. Add:
   - Variable: `VITE_API_URL`
   - Value: `https://your-backend-url.vercel.app/api`
4. **Save** and **Redeploy**

### 2.4 Note Your Admin URL

You'll get:
```
https://studio-x-leaderboard-admin.vercel.app
```

---

## 👀 Step 3: Deploy Intern View

### 3.1 Update main.tsx for Intern View

Temporarily change `src/main.tsx`:

```typescript
import App from './App-intern.tsx'  // Change to intern view
```

### 3.2 Deploy Intern View

```bash
vercel --prod
```

**Answer the prompts:**
- Project name? → **studio-x-leaderboard-intern**
- Everything else same as admin

### 3.3 Set Environment Variable

Same as admin panel:
- `VITE_API_URL` = `https://your-backend-url.vercel.app/api`

### 3.4 Note Your Intern URL

```
https://studio-x-leaderboard-intern.vercel.app
```

### 3.5 Revert main.tsx

Change `src/main.tsx` back:

```typescript
import App from './App-admin.tsx'  // Back to admin
```

---

## 🔧 Step 4: Update Backend CORS

### 4.1 Update ALLOWED_ORIGINS

Go to backend project in Vercel:
1. **Settings** → **Environment Variables**
2. Edit `ALLOWED_ORIGINS`:
   ```
   https://studio-x-leaderboard-admin.vercel.app,https://studio-x-leaderboard-intern.vercel.app
   ```
3. **Save**

### 4.2 Redeploy Backend

```bash
cd server
vercel --prod
```

---

## 🧪 Step 5: Test Production

### 5.1 Test Backend

```bash
curl https://your-backend.vercel.app/health
```

Expected:
```json
{
  "status": "healthy",
  "environment": "production"
}
```

### 5.2 Test Admin Panel

1. Open: `https://studio-x-leaderboard-admin.vercel.app`
2. Add an intern
3. Create a week
4. Grade metrics

### 5.3 Test Intern View

1. Open: `https://studio-x-leaderboard-intern.vercel.app`
2. Verify data appears
3. Check leaderboard updates

### 5.4 Test Live Updates

1. Open admin in one browser
2. Open intern view in another
3. Make changes in admin
4. Intern view updates within 10 seconds

---

## 🎉 You're Live!

**Your URLs:**
- 🔧 **Admin Panel**: `https://studio-x-leaderboard-admin.vercel.app`
- 👀 **Intern View**: `https://studio-x-interns.vercel.app`
- 🔌 **Backend API**: `https://studio-x-leaderboard-backend-me1g0tqeq-itsamazons-projects.vercel.app/api`

**Share with your team:**
- Admins get the admin URL
- Interns get the intern URL

---

## 🔐 Security Notes

### Current Setup
- ✅ Service role key in backend only
- ✅ CORS protection active
- ✅ Environment variables secured
- ✅ No database credentials in frontend

### Future Enhancements
- [ ] Add admin authentication
- [ ] Add rate limiting
- [ ] Add API key for admin panel
- [ ] Enable Supabase Row Level Security

---

## 🐛 Troubleshooting

### Backend deployment fails
- Verify environment variables are set
- Check Supabase credentials are correct
- Review Vercel deployment logs

### Frontend shows errors
- Verify `VITE_API_URL` is set correctly
- Check backend is deployed and responding
- Test backend health endpoint

### CORS errors
- Ensure `ALLOWED_ORIGINS` includes exact frontend URLs
- No trailing slashes in URLs
- Redeploy backend after changing CORS

### Data not loading
- Check backend logs in Vercel
- Verify database migration ran
- Test API endpoints directly

---

## 📝 Post-Deployment Tasks

1. [ ] Test all features in production
2. [ ] Share URLs with team
3. [ ] Monitor Vercel analytics
4. [ ] Set up custom domains (optional)
5. [ ] Add monitoring/alerts

---

**Ready to deploy? Let's do it!** 🚀

**Start with:** `npm install -g vercel && vercel login`


