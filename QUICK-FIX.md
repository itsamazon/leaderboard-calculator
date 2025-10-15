# 🚨 Quick Fix - Update Backend URL

## Problem
Your backend URL changed after adding environment variables. Frontend apps are pointing to the old URL.

## Solution

### **Step 1: Update Admin Panel**

1. Go to: https://vercel.com/itsamazons-projects/studio-x-leaderboard-admin
2. Click **Settings** → **Environment Variables**
3. Look for `VITE_API_URL`
   - **If it exists**: Click Edit
   - **If it doesn't exist**: Click **Add New**
4. Set the value to:
   ```
   https://studio-x-leaderboard-backend-kg1by1e96-itsamazons-projects.vercel.app/api
   ```
5. **Important**: Select **Production** environment
6. Click **Save**

### **Step 2: Update Intern Panel**

1. Go to: https://vercel.com/itsamazons-projects/studio-x-interns
2. Click **Settings** → **Environment Variables**
3. Look for `VITE_API_URL`
   - **If it exists**: Click Edit
   - **If it doesn't exist**: Click **Add New**
4. Set the value to:
   ```
   https://studio-x-leaderboard-backend-kg1by1e96-itsamazons-projects.vercel.app/api
   ```
5. **Important**: Select **Production** environment
6. Click **Save**

### **Step 3: Redeploy Both Frontend Apps**

```bash
# Redeploy admin (current directory should be root)
vercel --prod

# The intern view will auto-update from the same project
```

---

## ✅ Test It Works

After redeploying, test:

**Backend Health Check:**
```bash
curl https://studio-x-leaderboard-backend-kg1by1e96-itsamazons-projects.vercel.app/health
```

Should return:
```json
{"status":"healthy","environment":"production"}
```

**Open Admin Panel:**
https://studio-x-leaderboard-admin.vercel.app

Try adding an intern - it should work now! ✅

---

## 📝 Updated URLs

- **Backend**: https://studio-x-leaderboard-backend-kg1by1e96-itsamazons-projects.vercel.app/api
- **Admin**: https://studio-x-leaderboard-admin.vercel.app
- **Intern**: https://studio-x-interns.vercel.app

---

**After completing these steps, everything will work!** 🎉

