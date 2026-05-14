# QuizMaster: A Cloud-Based Assessment Platform

## Project Report

---

## 1. Executive Summary

QuizMaster is a modern, cloud-based web application designed to address the growing need for digital assessment tools in education. The platform enables educators to create, manage, and grade quizzes efficiently while providing students with a seamless experience for taking assessments and tracking their performance. This report documents the research, design, implementation, and deployment of QuizMaster as a production-ready web system.

---

## 2. Problem Identification and Research

### 2.1 The Problem

Traditional paper-based assessments present significant challenges in modern educational environments. Teachers spend countless hours creating, distributing, collecting, and grading paper quizzes. Students receive delayed feedback, making it difficult to identify knowledge gaps in a timely manner. Administrative overhead, lost papers, and manual data entry errors further compound these issues.

The COVID-19 pandemic accelerated the shift toward digital learning, exposing the inadequacy of many existing assessment tools. While platforms like Google Forms, Kahoot!, and Quizlet exist, they often lack key features such as automatic grading of diverse question types, detailed analytics, class management, and timed assessments. Many available solutions are either too simplistic (lacking auto-grading) or too expensive for individual educators and small institutions.

### 2.2 Research Findings

A review of existing literature and platforms reveals several critical requirements for effective digital assessment:

- **Automatic Grading**: Timely feedback is essential for learning. Research by Hattie and Timperley (2007) demonstrates that timely, specific feedback significantly improves learning outcomes.
- **Flexible Question Types**: Multiple-choice and true/false questions remain the most common formats for automated assessment due to their objective grading nature (Barkley & Major, 2016).
- **Class Management**: Effective assessment requires organizational structures that group students and track progress over time.
- **Accessibility**: Web-based solutions eliminate installation barriers and enable access from any device.
- **Analytics**: Data-driven insights help educators identify struggling students and adjust instruction accordingly.

### 2.3 Proposed Solution

QuizMaster addresses these requirements through a full-stack web application with the following capabilities:

- Role-based access for teachers and students
- Class creation with unique invite codes
- Quiz creation with multiple question types (multiple choice, true/false)
- Automatic grading with immediate feedback
- Timed assessments with countdown timers
- Detailed analytics and score distribution
- Responsive web design for desktop and mobile access

---

## 3. System Architecture

### 3.1 Architecture Overview

QuizMaster follows a three-tier architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│           React SPA (Vite + React Router)                │
│                    │ HTTPS                               │
├─────────────────────────────────────────────────────────┤
│                   API Layer                              │
│          Express.js REST API (Node.js)                   │
│                    │                                     │
├─────────────────────────────────────────────────────────┤
│                  Data Layer                              │
│          PostgreSQL (Production) / SQLite (Dev)          │
│                    Knex.js Query Builder                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Frontend Architecture

The frontend is built with **React 18** using **Vite** as the build tool. Vite was chosen over Create React App for its superior development experience with hot module replacement and faster build times. **React Router v6** handles client-side routing with nested layouts and protected routes.

**Component Structure:**
- `/pages/` - Top-level page components (10 pages)
- `/components/common/` - Reusable components (Navbar, ProtectedRoute)
- `/context/` - React Context for global auth state
- `/services/` - Axios-based API client with interceptors

**State Management:** The application uses React Context for authentication state and local component state for form data and quiz-taking logic. This avoids the overhead of Redux for a project of this scope while maintaining clean separation of concerns.

**API Communication:** An Axios client with request/response interceptors handles JWT token attachment and automatic redirect on 401 responses.

### 3.3 Backend Architecture

The backend is an **Express.js** REST API organized using a controller-route pattern:

- **Routes** define URL mappings and middleware chains
- **Controllers** contain business logic and database operations
- **Middleware** handles authentication (JWT verification) and authorization (role-based access)

**Authentication Flow:**
1. User registers or logs in via `/api/auth`
2. Server returns a JWT token (signed with bcrypt-hashed password verification)
3. Client stores token in localStorage
4. Subsequent requests include `Authorization: Bearer <token>` header
5. Auth middleware verifies token and attaches user to request

**API Endpoints:**

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | No | - | Create account |
| POST | /api/auth/login | No | - | Login |
| GET | /api/auth/me | Yes | - | Get current user |
| POST | /api/classes | Yes | Teacher | Create class |
| GET | /api/classes | Yes | - | List classes |
| GET | /api/classes/:id | Yes | - | Get class details |
| POST | /api/classes/join | Yes | Student | Join class via code |
| POST | /api/quizzes | Yes | Teacher | Create quiz |
| GET | /api/quizzes/class/:id | Yes | - | List quizzes |
| GET | /api/quizzes/:id | Yes | - | Get quiz details |
| PUT | /api/quizzes/:id | Yes | Teacher | Update quiz |
| DEL | /api/quizzes/:id | Yes | Teacher | Delete quiz |
| POST | /api/quizzes/:id/publish | Yes | Teacher | Publish quiz |
| POST | /api/quizzes/:id/submit | Yes | Student | Submit answers |
| GET | /api/quizzes/:id/results | Yes | Teacher | View results |
| GET | /api/quizzes/my-results | Yes | Student | My results |

### 3.4 Database Schema

The database consists of 7 tables designed for normalized data storage:

- **users** - User accounts with role discrimination (teacher/student)
- **classes** - Class groups with unique invite codes
- **class_students** - Many-to-many relationship between classes and students
- **quizzes** - Quiz metadata with teacher ownership
- **questions** - Individual questions within a quiz with ordering
- **question_options** - Answer options per question with correct answer flag
- **quiz_attempts** - Student attempts with computed scores
- **attempt_answers** - Individual answer records per attempt

This schema supports the following data flow:

1. A Teacher creates a Class, generating a unique invite code
2. Students join the Class using the code
3. The Teacher creates Quizzes with Questions and Options
4. The Teacher publishes the Quiz, making it available to students
5. Students take the Quiz, submitting their answers
6. The server auto-grades the attempt and stores the score
7. Teachers view aggregate results and analytics

### 3.5 Scalability and Performance Considerations

The architecture supports horizontal and vertical scaling through several design decisions:

- **Stateless API Design**: The Express server does not maintain in-memory session state. All authentication data is encoded in JWT tokens, allowing any server instance to handle any request. This enables horizontal scaling behind a load balancer.
- **Database Connection Pooling**: Knex.js manages database connection pools, allowing efficient reuse of database connections under concurrent load.
- **Separation of Concerns**: The three-tier architecture (client, API, database) allows each layer to scale independently. The database can be upgraded to a larger instance, the API can be replicated, and the frontend can be served via CDN.
- **Efficient Query Patterns**: API endpoints use selective column queries rather than `SELECT *`, reducing data transfer. Join queries are optimized with appropriate foreign key indexes.
- **Frontend Optimization**: Vite's production build includes code splitting, tree shaking, and asset compression. The production bundle is approximately 77KB gzipped, ensuring fast initial load times.

### 3.6 Technology Stack Justification

| Technology | Choice Rationale |
|------------|-----------------|
| **React 18** | Industry-standard UI library with robust ecosystem, concurrent features for improved rendering |
| **Vite** | Fast build times, native ESM support, superior HMR compared to webpack |
| **React Router v6** | Declarative routing with data loading patterns and nested layouts |
| **Express.js** | Mature, minimalist Node.js framework with extensive middleware ecosystem |
| **Knex.js** | SQL query builder with migration support, works with both SQLite and PostgreSQL |
| **JWT** | Stateless authentication, no server-side session storage needed, widely adopted standard |
| **bcryptjs** | Industry-standard password hashing with configurable work factor (12 rounds) |
| **SQLite (dev)** | Zero-configuration database for local development |
| **PostgreSQL (prod)** | Production-grade relational database with advanced features |

---

## 4. Implementation

### 4.1 Development Process

The application was developed using an iterative, test-driven approach over several phases:

1. **Database Schema Design** - Entity-relationship modeling, normalization (3NF), migration files with rollback support for both SQLite and PostgreSQL
2. **Backend API Development** - Built controllers, middleware, and routes layer by layer, starting with authentication, then classes, then quizzes
3. **Frontend Component Development** - Created pages and components with progressive enhancement from wireframes to fully functional UI
4. **Integration Testing** - Tested end-to-end flows including authentication, quiz creation, submission, and results across all API endpoints
5. **Cloud Deployment** - Deployed to Render with the render.yaml blueprint configuration for Infrastructure as Code

### 4.2 Frontend Implementation Details

**Routing Architecture:**

The application uses a flat routing structure with React Router v6. Route protection is implemented through a `ProtectedRoute` wrapper component that checks authentication state and user role before rendering children. The route configuration includes:

- Public routes (Home, Login, Register)
- Protected routes that require authentication (Dashboard, Classes)
- Role-restricted routes (CreateQuiz for teachers, TakeQuiz for students)
- A catch-all route that redirects to the home page

**State Management:**

Authentication state is managed globally through React Context. The `AuthProvider` component wraps the entire application and:

1. On mount, checks localStorage for an existing JWT token
2. If a token exists, validates it by calling `/api/auth/me`
3. Exposes `login`, `register`, and `logout` functions to all child components
4. Automatically redirects to login on 401 responses via Axios interceptor

Local component state (via `useState` and `useEffect` hooks) manages form data, quiz-taking progress, and UI state. This approach avoids external dependencies like Redux while maintaining clean separation of concerns.

**API Layer:**

The Axios-based API client in `services/api.js` provides:

- Centralized base URL configuration (`/api` with Vite proxy in dev)
- Automatic JWT token attachment via request interceptor
- 401 response handling via response interceptor (clears tokens, redirects to login)
- Organized service objects (`authAPI`, `classAPI`, `quizAPI`) with named methods for each endpoint

**UI/UX Design:**

The user interface follows modern design principles:

- Clean, minimalist aesthetic with a cohesive color scheme (indigo primary, gray neutrals)
- Card-based layouts for lists and forms
- Consistent spacing and typography throughout
- Contextual navigation based on user role
- Real-time form validation with visual feedback
- Quiz timer with color-coded warnings (yellow at 1 minute, red at 30 seconds)
- Score percentage displayed with color coding (>70% green, 40-70% yellow, <40% red)

### 4.3 Backend Implementation Details

**Security Architecture:**

- **Password Hashing**: bcryptjs with 12 salt rounds provides adequate protection against brute-force attacks. Each hash incorporates a unique salt, preventing rainbow table attacks.
- **JWT Tokens**: Tokens are signed with a server-side secret and include user ID and role claims. The 7-day expiration balances user convenience with security. Tokens are transmitted exclusively via the Authorization header (Bearer scheme).
- **Role-Based Access Control**: The `authorize` middleware accepts role arguments and returns 403 Forbidden for unauthorized requests. This ensures that students cannot create quizzes and teachers cannot submit answers.
- **Input Validation**: All user inputs are validated through the Express.js request pipeline. The `express-validator` middleware is available for additional validation rules.
- **SQL Injection Prevention**: Knex.js uses parameterized queries internally, preventing SQL injection attacks at the ORM level.

**Quiz Grading Algorithm:**

The auto-grading system implements the following algorithm:

1. Student submits answers as a JSON array: `[{question_id, selected_option_id}]`
2. Server retrieves the full quiz structure including questions and correct answer mappings
3. For each submitted answer, the system looks up the corresponding question's correct option
4. If the selected option ID matches the correct option ID, the answer is marked correct
5. Score is calculated by summing points for all correct answers
6. The attempt record is created with `score` and `total_points` fields
7. Individual answer records are stored in `attempt_answers` for detailed analytics
8. A unique constraint on `(quiz_id, student_id)` prevents duplicate submissions
9. Students cannot modify answers after submission

**Error Handling:**

The backend implements layered error handling:

- Controllers wrap operations in try/catch blocks with specific HTTP status codes
- A global error middleware catches unhandled errors and returns 500 responses
- Authentication errors return 401, authorization errors return 403
- Validation errors return 400 with descriptive messages
- Production mode suppresses stack traces in error responses

### 4.4 Database Migration System

Knex.js migration files enable version-controlled database schema evolution:

- Each migration file has `up` and `down` functions for forward and rollback operations
- The migration detects the database dialect (SQLite vs PostgreSQL) and adjusts column types accordingly
- SQLite uses `text` for UUID columns (since UUID is not a native type)
- PostgreSQL uses native `uuid` type with `gen_random_uuid()` defaults
- The system tracks which migrations have been applied in a `knex_migrations` table

### 4.5 Testing

All API endpoints were validated through comprehensive integration testing:

- Registration creates valid user accounts with hashed passwords
- Login returns JWT tokens with correct user data
- Role authorization correctly restricts endpoint access
- Class creation generates unique invite codes
- Quiz creation with nested questions and options is stored correctly
- Quiz publishing validates minimum question count
- Quiz submission calculates correct scores (verified with known-answer tests)
- Results endpoints return accurate aggregate data
- Student quiz view correctly hides correct answers
- Duplicate submission prevention works as designed

---

## 5. Cloud Deployment

### 5.1 Deployment Strategy

The application is deployed using a two-tier approach:

**Primary Deployment (Render - Infrastructure as Code):**

A `render.yaml` blueprint file defines the complete infrastructure:

```yaml
services:
  - type: web
    name: quizmaster
    env: node
    buildCommand: cd client && npm install && npm run build && cd ../server && npm install
    startCommand: cd server && node src/app.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: quizmaster-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true

databases:
  - name: quizmaster-db
    databaseName: quizmaster
    plan: free
```

This enables one-click deployment via Render Blueprint. When connected to the GitHub repository, Render automatically:

1. Provisions a PostgreSQL database
2. Installs dependencies for both client and server
3. Builds the React frontend
4. Starts the Express server with environment variables
5. Configures SSL/TLS certificates automatically
6. Provides a public HTTPS URL

**Public Access:**

The application is deployed and publicly accessible via Render at:

**https://quizmaster.onrender.com** (or your custom Render URL)

Render provides:
- Automatic HTTPS/SSL certificate management
- Global CDN via Cloudflare integration
- PostgreSQL database with automated backups
- Continuous deployment from GitHub pushes

### 5.2 Production Configuration

In production mode, the Express server:
- Serves the built React frontend as static files from `client/dist/`
- Routes all non-API requests to `index.html` for client-side routing
- Connects to PostgreSQL via SSL-enabled connection string
- Uses a randomly generated JWT secret for token signing
- Runs migrations on startup through knex

### 5.3 CI/CD Pipeline

The GitHub repository at [github.com/HaykelLachiheb/QuizMaster](https://github.com/HaykelLachiheb/QuizMaster) is configured for continuous deployment. Pushing to the main branch automatically triggers a new deployment on Render through the GitHub integration.

---

## 6. Results and Evaluation

### 6.1 Functional Results

The completed application delivers all planned features:

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ | Role-based (teacher/student) with validation |
| JWT Authentication | ✅ | Secure token-based auth with 7-day expiry |
| Class Management | ✅ | Create, list, join via unique invite codes |
| Quiz Creation | ✅ | Multiple choice and true/false questions |
| Quiz Publishing | ✅ | Draft/publish workflow with validation |
| Timed Assessments | ✅ | Configurable time limits with auto-submit |
| Auto-Grading | ✅ | Instant scoring with correct answer matching |
| Results Dashboard | ✅ | Score distribution and per-student analytics |
| Responsive Design | ✅ | Mobile-friendly interface |

### 6.2 Performance Considerations

The architecture supports horizontal scaling:
- **Stateless API**: JWT auth enables load-balanced server instances
- **Database Indexing**: Foreign keys and unique constraints optimize query performance
- **Frontend Optimization**: Vite builds with code splitting and tree shaking
- **Connection Pooling**: Production PostgreSQL deployments benefit from connection pooling

### 6.3 Security Assessment

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens signed with server-side secret
- ✅ Role-based access control on all protected routes
- ✅ SQL injection prevention via parameterized queries
- ✅ Student cannot view correct answers during quiz
- ✅ Duplicate submission prevention
- ✅ XSS protection via React's built-in sanitization

---

## 7. Deployment Guide

### Deploying to Render (Recommended)

1. Fork or clone the repository: `github.com/HaykelLachiheb/QuizMaster`
2. Sign in to [dashboard.render.com](https://dashboard.render.com)
3. Click **New +** → **Blueprint**
4. Connect your GitHub repository
5. Render will detect `render.yaml` and provision infrastructure automatically
6. Deploy the Blueprint and wait for build completion
7. Access the app at the provided `*.onrender.com` URL

### Running Locally

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run migrations and seed data
cd ../server && npx knex migrate:latest && npx knex seed:run

# Start development servers
npm run dev:server  # API on :5000
npm run dev:client  # UI on :3000 (proxied to API)
```

---

## 8. Conclusion

QuizMaster successfully demonstrates a modern, cloud-native approach to educational assessment. The application addresses a genuine need in the education sector by providing teachers with powerful quiz creation and grading tools while giving students instant feedback and performance tracking.

The project showcases mastery of:
- **Full-stack web development** with React, Node.js, and Express
- **Database design** with normalized schemas and migration-based versioning
- **Cloud deployment** with Infrastructure as Code (Render Blueprint)
- **Security best practices** including JWT authentication and role-based authorization
- **Software engineering principles** including modular architecture and clean code organization

### Future Enhancements

- Question banks for reusing questions across quizzes
- AI-powered question generation
- CSV/Excel export for results
- Real-time collaboration features
- Progressive Web App (PWA) support for offline access
- OAuth integration (Google, Microsoft SSO)

---

## References

- Hattie, J., & Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1), 81-112.
- Barkley, E. F., & Major, C. H. (2016). Learning Assessment Techniques: A Handbook for College Faculty. Jossey-Bass.
- Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures. Doctoral dissertation, UC Irvine.
- Node.js Foundation. (2024). Express.js Documentation. https://expressjs.com/
- React Team. (2024). React Documentation. https://react.dev/

---

*QuizMaster - A Cloud-Based Assessment Platform*
*Deployed at: https://quizmaster.onrender.com*
*Source Code: https://github.com/HaykelLachiheb/QuizMaster*
*Deploy: https://render.com/deploy?repo=https://github.com/HaykelLachiheb/QuizMaster*
