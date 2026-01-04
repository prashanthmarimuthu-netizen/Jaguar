# Backend API - Coding Platform

Express.js REST API for the coding platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure database credentials in `.env`

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

## Environment Variables

- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `PISTON_API_URL` - Piston API endpoint

## API Documentation

See main README.md for endpoint documentation.

