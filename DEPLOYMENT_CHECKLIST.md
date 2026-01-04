# ✅ Pre-Deployment Checklist

## 🔒 Security

- [ ] Generate new JWT secrets for production (run `node backend/src/scripts/generateSecrets.js`)
- [ ] Never commit `.env` files to Git
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL (automatic on Vercel/Railway)
- [ ] Review CORS settings
- [ ] Check rate limiting is enabled

## 🗄️ Database

- [ ] Database is set up (Railway/PlanetScale/AWS RDS)
- [ ] Database migrations have been run
- [ ] Test database connection
- [ ] Backup strategy in place

## 🔧 Configuration

- [ ] Environment variables are set correctly
- [ ] API URLs point to production backend
- [ ] Frontend URL is set in backend CORS
- [ ] Node.js version matches (18.x or 20.x)

## 🧪 Testing

- [ ] Test login/signup
- [ ] Test creating problems/courses
- [ ] Test submissions
- [ ] Test admin panel
- [ ] Test on mobile devices
- [ ] Check browser console for errors

## 📦 Build

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts successfully (`npm start`)
- [ ] No TypeScript errors
- [ ] No linting errors

## 🚀 Deployment

- [ ] Code pushed to GitHub
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Health check endpoint works (`/health`)
- [ ] API calls work from frontend

## 📊 Post-Deployment

- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Test all features
- [ ] Update documentation
- [ ] Share the live URL! 🎉

---

## 🎯 Quick Commands

```bash
# Generate secrets
node backend/src/scripts/generateSecrets.js

# Test build
cd frontend && npm run build
cd ../backend && npm start

# Check database
node backend/src/scripts/showAllTables.js
```
