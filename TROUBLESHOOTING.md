# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Nothing is functioning" or blank page

**Check these in order:**

1. **Backend Server is Running**
   ```bash
   cd backend
   npm start
   ```
   You should see: `Server is running on port 5000`
   Test it: Open http://localhost:5000/health in your browser
   Expected response: `{"status":"ok","message":"Coding Platform API is running"}`

2. **Frontend Server is Running**
   ```bash
   cd frontend
   npm run dev
   ```
   You should see: `Ready on http://localhost:3000`
   Open http://localhost:3000 in your browser

3. **Environment Variables**
   - Backend: Check `backend/.env` - PORT should be 5000
   - Frontend: Check `frontend/.env.local` - NEXT_PUBLIC_API_URL should be http://localhost:5000

4. **Database Connection**
   ```bash
   cd backend
   npm run create-tables
   ```
   Should show: `✓ Database connection established successfully.`

5. **Check Browser Console**
   - Press F12 in browser
   - Go to Console tab
   - Look for errors (red messages)
   - Common errors:
     - `Network Error` = Backend not running
     - `CORS error` = Backend CORS not configured
     - `404` = Wrong API URL

6. **Check Network Tab**
   - Press F12 → Network tab
   - Try to use the app
   - Look for failed requests (red)
   - Click on failed request to see error details

## Quick Start Checklist

- [ ] MySQL is running
- [ ] Database `coding_platform` exists
- [ ] Backend `.env` file configured correctly
- [ ] Frontend `.env.local` file has `NEXT_PUBLIC_API_URL=http://localhost:5000`
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] No errors in browser console (F12)
- [ ] Can access http://localhost:5000/health

## Test Basic Functionality

1. **Home Page**
   - Should load without errors
   - Navigation should work

2. **Sign Up**
   - Create a test account
   - Should redirect to dashboard

3. **View Courses**
   - Click "Courses" in navigation
   - Should show 10 embedded systems courses

4. **View Problems**
   - Click "Problems" in navigation  
   - Should show 10 embedded systems problems

## Common Error Messages

### "Cannot connect to server"
- Backend is not running
- Solution: Start backend with `cd backend && npm start`

### "Network Error"
- Backend server not accessible
- Check if backend is running on port 5000

### "CORS policy" error
- Frontend and backend ports don't match
- Check `.env` files match

### Blank page
- Check browser console (F12)
- Look for JavaScript errors
- Check if both servers are running

## Still Not Working?

1. **Restart Everything**
   ```bash
   # Stop both servers (Ctrl+C)
   # Then restart:
   cd backend && npm start
   # New terminal:
   cd frontend && npm run dev
   ```

2. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete
   - Clear cache and cookies
   - Refresh page (Ctrl+F5)

3. **Check Ports are Free**
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   ```

4. **Verify Database**
   ```bash
   mysql -u root -p
   USE coding_platform;
   SHOW TABLES;
   SELECT COUNT(*) FROM courses;
   SELECT COUNT(*) FROM problems;
   ```

