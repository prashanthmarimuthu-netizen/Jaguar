# Quick Start Guide

## Fixed Issues

1. ✅ Dependencies installed for both frontend and backend
2. ✅ Environment files created (.env for backend, .env.local for frontend)
3. ✅ Next.js cache cleared (this was causing the tailwindcss resolution error)
4. ✅ Port configuration fixed (frontend now uses port 3001 to match backend)

## How to Run

### Start Backend (Terminal 1)

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Important Notes

1. **Database Setup**: Make sure MySQL is running and update `backend/.env` with your database credentials:
   - `DB_USER` - Your MySQL username (default: root)
   - `DB_PASSWORD` - Your MySQL password
   - `DB_NAME` - Database name (default: coding_platform)

2. **Create Database**: If you haven't already, create the database:
   ```sql
   CREATE DATABASE coding_platform;
   ```

3. **First Run**: The backend will automatically create database tables on first startup.

## Troubleshooting

- If you see tailwindcss errors: Make sure you're running `npm run dev` from the `frontend` directory, not the root directory
- If backend won't start: Check your MySQL connection in `backend/.env`
- If frontend can't connect: Verify `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches your backend port (3001)

