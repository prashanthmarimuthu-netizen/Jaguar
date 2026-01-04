# 🚀 Deployment Guide - Making Your Website Live

This guide will help you deploy your EmbeddedPro platform to production.

## 📋 Prerequisites

- [ ] GitHub account (for code hosting)
- [ ] Production-ready code (all features tested)
- [ ] Domain name (optional but recommended)
- [ ] Environment variables configured

---

## 🎯 Recommended Deployment Platforms

### **Option 1: Vercel (Frontend) + Railway (Backend) - EASIEST** ⭐ Recommended

#### **Frontend Deployment (Vercel)**

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/jaguar-platform.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Set root directory: `frontend`
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
   - Click "Deploy"
   - Your site will be live at: `https://your-project.vercel.app`

#### **Backend Deployment (Railway)**

1. **Go to [railway.app](https://railway.app)**
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `backend`

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   DB_HOST=your-mysql-host
   DB_USER=your-mysql-user
   DB_PASSWORD=your-mysql-password
   DB_NAME=your-database-name
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **Add MySQL Database**
   - In Railway dashboard, click "New" → "Database" → "MySQL"
   - Railway will provide connection details
   - Update your environment variables with the new DB credentials

4. **Deploy**
   - Railway auto-deploys on git push
   - Your API will be live at: `https://your-project.railway.app`

---

### **Option 2: Netlify (Frontend) + Render (Backend)**

#### **Frontend (Netlify)**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/.next`

#### **Backend (Render)**
1. Go to [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Settings:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Add MySQL database from Render dashboard

---

### **Option 3: Full Stack on Vercel (Frontend + Serverless Functions)**

For smaller projects, you can use Vercel's serverless functions for the backend.

---

## 🔧 Step-by-Step Deployment Process

### **Step 1: Prepare Your Code**

1. **Update API URLs**
   ```typescript
   // frontend/lib/api.ts
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com';
   ```

2. **Create Production Environment Files**
   ```bash
   # frontend/.env.production
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

3. **Update Backend CORS**
   ```javascript
   // backend/src/server.js
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://your-frontend-url.com',
     credentials: true
   }));
   ```

### **Step 2: Database Setup**

#### **Option A: Railway MySQL (Easiest)**
- Railway provides managed MySQL
- Connection string is auto-generated
- No manual setup needed

#### **Option B: PlanetScale (Recommended for Production)**
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Update backend environment variables

#### **Option C: AWS RDS / Google Cloud SQL**
- More control but requires more setup
- Good for enterprise deployments

### **Step 3: Run Database Migrations**

```bash
# In your backend directory
cd backend
npm run migrate  # If you have migration scripts
# OR run the migration scripts manually
node src/scripts/migrateProblems.js
```

### **Step 4: Deploy Backend**

1. **Push to GitHub**
2. **Connect to Railway/Render**
3. **Set environment variables**
4. **Deploy**

### **Step 5: Deploy Frontend**

1. **Update API URL** in frontend
2. **Push to GitHub**
3. **Connect to Vercel/Netlify**
4. **Set environment variables**
5. **Deploy**

### **Step 6: Update CORS and API URLs**

After deployment, update:
- Backend CORS to allow your frontend domain
- Frontend API URL to point to your backend

---

## 🔐 Environment Variables Checklist

### **Backend (.env)**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=generate-strong-secret-here
JWT_REFRESH_SECRET=generate-strong-secret-here
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
FRONTEND_URL=https://your-frontend-domain.com
```

### **Frontend (.env.production)**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## 🌐 Custom Domain Setup

### **For Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL is automatic

### **For Railway:**
1. Go to Project Settings → Domains
2. Add custom domain
3. Update DNS records
4. SSL is automatic

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible (test `/health` endpoint)
- [ ] Frontend loads correctly
- [ ] API calls work (check browser console)
- [ ] Database connection works
- [ ] Authentication works (login/signup)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled
- [ ] Error logging is working
- [ ] Performance is acceptable

---

## 🐛 Common Issues & Solutions

### **Issue: CORS Errors**
**Solution:** Update backend CORS to include your frontend URL
```javascript
origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'
```

### **Issue: API Connection Failed**
**Solution:** 
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running
- Check backend logs

### **Issue: Database Connection Failed**
**Solution:**
- Verify database credentials
- Check if database allows external connections
- Verify firewall rules

### **Issue: Build Errors**
**Solution:**
- Check Node.js version matches (use 18.x or 20.x)
- Clear `.next` folder and rebuild
- Check for TypeScript errors

---

## 📊 Monitoring & Maintenance

### **Recommended Tools:**
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics, Vercel Analytics
- **Logs:** Railway/Render dashboard logs

---

## 💰 Cost Estimates

### **Free Tier Options:**
- **Vercel:** Free (with limits)
- **Railway:** $5/month (free trial)
- **Render:** Free tier available
- **PlanetScale:** Free tier available

### **Paid Options (Better Performance):**
- **Vercel Pro:** $20/month
- **Railway:** $5-20/month
- **Database:** $5-10/month

---

## 🚀 Quick Start Commands

```bash
# 1. Prepare for deployment
cd frontend
npm run build  # Test build locally

cd ../backend
npm start  # Test backend locally

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Deploy (platform-specific)
# - Vercel: Auto-deploys on push
# - Railway: Auto-deploys on push
# - Netlify: Auto-deploys on push
```

---

## 📝 Next Steps

1. **Choose your platform** (Vercel + Railway recommended)
2. **Set up accounts** on chosen platforms
3. **Push code to GitHub**
4. **Deploy backend first** (get the URL)
5. **Deploy frontend** (use backend URL)
6. **Test everything**
7. **Add custom domain** (optional)
8. **Set up monitoring**

---

## 🆘 Need Help?

- Check platform documentation
- Review error logs in platform dashboard
- Test locally first before deploying
- Use platform's support/community forums

---

**Your website will be live in minutes! 🎉**

