# ⚡ Quick Deployment Guide

## Fastest Way to Go Live (15 minutes)

### 1. Push Code to GitHub (5 min)

```bash
# In your project root
git init
git add .
git commit -m "Ready for deployment"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/jaguar-platform.git
git push -u origin main
```

### 2. Deploy Backend on Railway (5 min)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect it's a Node.js project
5. Click **"Add Database"** → Select **"MySQL"**
6. Go to **"Variables"** tab and add:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=generate-random-32-char-string
   JWT_REFRESH_SECRET=generate-random-32-char-string
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
7. Railway will auto-generate database variables
8. Click **"Deploy"** → Wait for deployment
9. Copy your backend URL (e.g., `https://your-project.railway.app`)

### 3. Deploy Frontend on Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
5. Add Environment Variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your Railway backend URL from step 2
6. Click **"Deploy"**
7. Your site is live! Copy the URL (e.g., `https://your-project.vercel.app`)

### 4. Update Backend CORS (2 min)

1. Go back to Railway dashboard
2. Add/Update environment variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Railway will auto-redeploy

### 5. Run Database Migrations (3 min)

1. In Railway, go to your backend service
2. Click **"Deployments"** → **"View Logs"**
3. Or use Railway's built-in terminal:
   - Click **"Deployments"** → **"View Logs"** → **"Shell"**
   - Run: `node src/scripts/migrateProblems.js`

**Done! Your website is live! 🎉**

---

## Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for JWT_SECRET and JWT_REFRESH_SECRET.

---

## Test Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Check browser console for errors
4. Test creating a problem/course
5. Verify database is working

---

## Troubleshooting

**Backend not connecting?**
- Check Railway logs
- Verify environment variables
- Test `/health` endpoint

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings
- Check browser console for errors

**Database errors?**
- Verify database credentials in Railway
- Check if migrations ran
- Review database connection logs

