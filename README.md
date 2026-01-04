# Coding Platform MVP

A LeetCode/HackerRank-like coding platform built with Next.js, Node.js, Express, and MySQL.

## Features

- 🔐 User authentication (JWT-based)
- 📝 Problem listing with filters (difficulty, search)
- 💻 Online code editor with syntax highlighting (Monaco Editor)
- 🚀 Code execution using Piston API
- ✅ Automated test case evaluation
- 📊 Submission history and dashboard
- 👥 Role-based access control (Student, Admin, Institution)

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Monaco Editor
- Axios

### Backend
- Node.js + Express
- MySQL + Sequelize ORM
- JWT Authentication
- Piston API (code execution)

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE coding_platform;
```

2. Configure database credentials in `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=coding_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_change_this_in_production
PORT=3001
FRONTEND_URL=http://localhost:3000
PISTON_API_URL=https://emkc.org/api/v2/piston
```

3. Copy `.env.example` to `.env` in the backend directory:
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Frontend Configuration

1. Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server will run on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App will run on http://localhost:3000
```

### 5. Initial Data (Optional)

After starting the backend, the database tables will be created automatically. You can add sample problems via MySQL:

```sql
INSERT INTO problems (title, description, difficulty, sample_input, sample_output) 
VALUES (
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'EASY',
  'nums = [2,7,11,15], target = 9',
  '[0,1]'
);

INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) 
VALUES (1, '[2,7,11,15]\n9', '[0,1]', false);
```

## Project Structure

```
coding_platform_cursor/
├── backend/
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth & role middleware
│   │   ├── services/     # Piston API service
│   │   ├── utils/        # Validators & error handlers
│   │   └── server.js     # Express server
│   └── package.json
├── frontend/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # React components
│   ├── contexts/         # Auth context
│   ├── lib/              # Utilities & API client
│   └── package.json
└── README.md
```

## API Endpoints

### Auth
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Problems
- `GET /problems` - List all problems (query: difficulty, search)
- `GET /problems/:id` - Get problem details

### Submissions
- `POST /submissions/run` - Execute code (no evaluation)
- `POST /submissions/submit` - Submit code for evaluation
- `GET /submissions/user/:id` - Get user submissions

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Browse Problems**: View problems at `/problems`
3. **Solve Problems**: Click on a problem to open the editor
4. **Write Code**: Use the Monaco editor to write your solution
5. **Run Code**: Test your code with sample input/output
6. **Submit**: Submit your solution to be evaluated against test cases
7. **View Dashboard**: Check your progress and statistics

## Supported Languages

- Python 3
- JavaScript (Node.js)
- Java
- C++

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Input validation
- CORS protection

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses node --watch for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Next.js dev server with hot reload
```

## Troubleshooting

1. **Database Connection Error**: Check MySQL is running and credentials in `.env` are correct
2. **Port Already in Use**: Change `PORT` in backend `.env` or kill process on port 3001/3000
3. **Piston API Error**: Check internet connection; Piston API must be accessible
4. **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL

## Next Steps (Phase 2)

- Course functionality
- Enhanced dashboard with charts
- Leaderboard
- Admin panel for problem management
- Contest/timed assessments

## License

MIT

