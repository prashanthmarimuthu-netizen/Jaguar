# 🚀 Quick Start: Deploy Your Website in 15 Minutes

## Step 1: Push to GitHub (2 min)

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jaguar-platform.git
git push -u origin main
```

## Step 2: Deploy Backend on Railway (5 min)

1. Visit [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js
5. Click **"Add Database"** → **"MySQL"**
6. Go to **"Variables"** and add:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=db884479984ae3dbd7d4493f22b0f5b73a5b390368c0331f2b6d21f200b4ce38
JWT_REFRESH_SECRET=7b327488755903fa0bc9eaaaf649dab02f8d8718defcb4afe5997a569c4e4aaa
FRONTEND_URL=https://your-frontend.vercel.app
```

7. Railway auto-generates DB variables (DB_HOST, DB_USER, etc.)
8. Wait for deployment → Copy backend URL

## Step 3: Deploy Frontend on Vercel (5 min)

1. Visit [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)
5. Add Environment Variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your Railway backend URL
6. Click **"Deploy"**
7. Copy your frontend URL

## Step 4: Update Backend CORS (2 min)

1. Go back to Railway
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Railway auto-redeploys

## Step 5: Run Database Migrations (1 min)

In Railway dashboard:
- Go to your backend service
- Click **"Deployments"** → **"View Logs"** → **"Shell"**
- Run: `node src/scripts/migrateProblems.js`

## ✅ Done! Your website is live!

Visit your Vercel URL and test:
- ✅ Login/Signup
- ✅ Create problems
- ✅ Submit code
- ✅ Admin panel

---

## 📋 Files Created

- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `QUICK_DEPLOY.md` - 15-minute quick start
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `backend/src/scripts/generateSecrets.js` - Generate secure secrets

---

## 🔐 Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use the generated secrets** - Don't use the example ones
3. **Update CORS** after getting frontend URL
4. **Run migrations** after database is set up

---

## 🆘 Troubleshooting

**Backend not working?**
- Check Railway logs
- Verify environment variables
- Test `/health` endpoint

**Frontend can't connect?**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS in backend
- Check browser console

**Database errors?**
- Verify DB credentials in Railway
- Run migration scripts
- Check connection logs

---

**Need help? Check `DEPLOYMENT_GUIDE.md` for detailed instructions!**

