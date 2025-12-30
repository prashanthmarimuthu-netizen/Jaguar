# EmbeddedMasters - Embedded Systems Coding Platform

A comprehensive React frontend for an embedded systems interview preparation platform with integrated code editor, course management, and problem-solving features.

## Project Overview

EmbeddedMasters is designed to help engineers prepare for technical interviews at top companies like Qualcomm, NVIDIA, TI (Texas Instruments), NXP, AMD, and Tesla. The platform focuses exclusively on embedded systems coding challenges and courses.

## Features Implemented

### 1. **Home Page** (`HomePage.js`)
- **Hero Section**: Eye-catching headline and call-to-action buttons
- **Features Grid**: Showcases 4 key features of the platform
- **Popular Problems Preview**: Displays 3-4 sample problems with difficulty levels
- **Statistics Section**: Shows platform achievements (problems solved, engineers placed, companies covered)
- **CTA Section**: Encourages user registration

### 2. **Courses Page** (`CoursesPage.js`)
- **8 Embedded Systems Courses**:
  1. C Programming for Embedded Systems
  2. ARM Cortex-M Architecture
  3. RTOS Fundamentals
  4. Embedded Linux
  5. Communication Protocols
  6. Debugging & Testing
  7. Low Power Design
  8. Security in Embedded Systems

- **Features**:
  - Filter courses by difficulty level (Beginner, Intermediate, Advanced)
  - Course cards with topics, duration, ratings, and student count
  - Recommended learning path section
  - Responsive grid layout

### 3. **Problems Page** (`ProblemsPage.js`)
- **10 Embedded Systems Problems** across various categories:
  1. Bit Manipulation
  2. Pointer Arithmetic
  3. Memory Management
  4. Interrupt Service Routines
  5. Peripheral Programming
  6. Data Structures for Embedded
  7. RTOS Problems
  8. Communication Protocols
  9. Performance Optimization
  10. Debugging Challenges

- **Features**:
  - Search functionality
  - Filter by difficulty (Easy, Medium, Hard)
  - Filter by category
  - Problem statistics dashboard
  - Direct links to problem details

### 4. **Problem Detail Page** (`ProblemDetailPage.js`)
- **Left Side (60% width)**:
  - Problem title and difficulty badge
  - Complete problem statement
  - Constraints section
  - Example input/output
  - Hints for solving

- **Right Side (40% width)**:
  - **Code Editor** with:
    - CodeMirror integration
    - Support for C, C++, and Python
    - Syntax highlighting
    - Line numbers
    - Light/Dark theme toggle
    - Auto-completion
    - Tab size: 4 spaces
  - Language selector dropdown
  - Run and Submit buttons

- **Output Console**:
  - Compilation status
  - Test case results
  - Memory usage tracking
  - Execution time
  - Error messages

- **Tab Navigation**: Switch between Code Editor and Output Console

### 5. **Navigation Component** (`Navbar.js`)
- Brand logo with platform name
- Navigation links (Home, Courses, Problems)
- User authentication status display
- Login/Signup buttons for unauthenticated users
- Logout button for authenticated users
- Responsive design for mobile

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── HomePage.js              # Landing page with hero and features
│   │   ├── CoursesPage.js           # Courses catalog with filters
│   │   ├── ProblemsPage.js          # Problems listing with search/filter
│   │   └── ProblemDetailPage.js     # Problem detail with code editor
│   ├── components/
│   │   └── Navbar.js                # Navigation component
│   ├── data/
│   │   ├── coursesData.js           # 8 embedded systems courses
│   │   └── problemsData.js          # 10 embedded systems problems
│   ├── styles/
│   │   └── styles.css               # Global and component styles
│   ├── App.js                       # Main app component with routing
│   ├── index.js                     # Entry point
│   └── index.css                    # Index styles
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Dependencies

### Core Dependencies
- **react**: ^19.2.3 - UI framework
- **react-dom**: ^19.2.3 - React DOM rendering
- **react-router-dom**: ^7.11.0 - Client-side routing
- **axios**: ^1.13.2 - HTTP client for API calls

### Code Editor Dependencies
- **@uiw/react-codemirror**: ^4.x - CodeMirror React wrapper
- **@codemirror/lang-cpp**: ^6.x - C++ language support
- **@codemirror/lang-python**: ^6.x - Python language support
- **codemirror**: ^6.x - Core CodeMirror editor

### Testing Dependencies
- **@testing-library/react**: ^16.3.1
- **@testing-library/jest-dom**: ^6.9.1
- **@testing-library/user-event**: ^13.5.0
- **@testing-library/dom**: ^10.4.1

### Other
- **react-scripts**: 5.0.1 - Build and dev server
- **web-vitals**: ^2.1.4 - Performance metrics

## Key Files Description

### `App.js`
Main application component that:
- Sets up React Router with all routes
- Manages authentication state
- Integrates Navbar component
- Handles Sign In and Sign Up pages
- Routes to all main pages (Home, Courses, Problems, Problem Detail)

### Data Files

#### `coursesData.js`
Contains 8 course objects with:
- `id`: Unique identifier
- `title`: Course name
- `description`: Short description
- `topics`: Array of course topics
- `level`: Difficulty level (Beginner, Intermediate, Advanced)
- `duration`: Course duration
- `students`: Number of enrolled students
- `rating`: Course rating
- `image`: Emoji icon for visual representation

#### `problemsData.js`
Contains 10 problem objects with:
- `id`: Unique identifier
- `title`: Problem name
- `category`: Problem category
- `difficulty`: Difficulty level (Easy, Medium, Hard)
- `description`: Short description
- `problemStatement`: Full problem statement
- `constraints`: Problem constraints
- `hints`: Array of hints
- `sampleInput`: Example input
- `sampleOutput`: Example output
- `solved`: Number of users who solved it
- `submissions`: Total submissions

### Styling (`styles.css`)

Comprehensive CSS with:
- **Global Styles**: Reset, fonts, base styling
- **Navigation**: Navbar styling with gradients
- **Hero Section**: Landing page hero styling
- **Buttons**: Primary, secondary, outline button styles
- **Grid Layouts**: Responsive grid systems (2, 3, 4 columns)
- **Cards**: Card components with hover effects
- **Badges**: Difficulty and level badges
- **Problem Detail**: Split layout for problem statement and code editor
- **Code Editor**: CodeMirror customization and theming
- **Responsive Design**: Mobile-first approach with breakpoints at 1024px, 768px, 480px
- **Dark/Light Theme**: Theme switching support for code editor

## Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+ (2 columns for problem detail)
- **Tablet**: 768px-1024px (Adjusted layouts)
- **Mobile**: Below 768px (Single column layouts)

## Color Scheme

- **Primary Color**: #667eea (Purple-blue)
- **Secondary Color**: #764ba2 (Purple)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Danger**: #ef4444 (Red)
- **Background**: #f8f9fa (Light gray)
- **Text**: #333 (Dark gray)

## Authentication Flow

1. **Sign Up**: Users create account with username, email, and password
2. **Sign In**: Users log in with email and password
3. **Token Storage**: JWT token stored in localStorage
4. **User Data**: User information stored in localStorage
5. **Logout**: Clears token and user data from localStorage

## API Integration Points

The frontend is ready to integrate with backend APIs:

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Future API Endpoints (Ready for Implementation)
- `GET /api/courses` - Fetch all courses
- `GET /api/courses/:id` - Fetch course details
- `GET /api/problems` - Fetch all problems
- `GET /api/problems/:id` - Fetch problem details
- `POST /api/problems/:id/submit` - Submit code solution
- `GET /api/user/progress` - Get user progress
- `POST /api/problems/:id/run` - Run code (simulated)

## Code Editor Features

### Supported Languages
- **C** - ANSI C with stdio.h
- **C++** - Modern C++ with iostream
- **Python** - Python 3

### Editor Features
- Syntax highlighting for all supported languages
- Line numbers with gutters
- Auto-indentation (4 spaces)
- Tab key support
- Bracket matching
- Light and Dark themes
- Customizable theme toggle

### Mock Execution
The code execution is currently mocked to:
1. Simulate compilation
2. Show execution time
3. Display memory usage
4. Pass sample test cases
5. Provide realistic feedback

To integrate with actual backend:
1. Create `/api/problems/run` endpoint
2. Create `/api/problems/submit` endpoint
3. Implement code compilation and execution on backend
4. Replace setTimeout mock with actual API calls

## Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

The application implements:
- Code splitting with React Router
- Lazy loading of pages
- Optimized CSS with minimal unused styles
- Efficient state management with React hooks
- Responsive images with emojis for fast loading

## Future Enhancements

1. **Backend Integration**
   - Connect to Node.js/MySQL backend
   - Implement real code execution
   - Add user progress tracking

2. **User Features**
   - User dashboard with statistics
   - Saved solutions and progress
   - Problem bookmarking
   - Discussion forums

3. **Code Editor**
   - Multiple file support
   - Debugging capabilities
   - Custom test cases
   - Code templates

4. **Social Features**
   - Leaderboards
   - Peer code review
   - Community discussions
   - Problem difficulty voting

5. **Platform Features**
   - Premium courses
   - Live interview prep sessions
   - Company-specific problem sets
   - Interview performance analytics

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
set PORT=3001 && npm start  # Windows
PORT=3001 npm start          # Mac/Linux
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Code Editor Not Loading
Ensure CodeMirror packages are installed:
```bash
npm install @uiw/react-codemirror @codemirror/lang-cpp @codemirror/lang-python
```

## License

This project is part of the EmbeddedMasters platform and is restricted for internal use only.

## Contact & Support

For issues, feature requests, or questions, please contact the development team.

---

**Happy Coding! 🚀** Prepare for your embedded systems interviews at top tech companies with EmbeddedMasters.
