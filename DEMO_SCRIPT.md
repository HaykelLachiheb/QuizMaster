# QuizMaster - 10-Minute Demo Script

## Presentation Structure (10 minutes total)

---

### 0:00 - 1:30 | Introduction & Problem Statement

**Script:**
"Hello, my name is [Your Name]. Today I'm presenting QuizMaster, a cloud-based assessment platform I designed and developed for my Cloud-Based Web System Design course.

The problem I identified is the inefficiency of traditional paper-based assessments in education. Teachers spend hours creating, distributing, and grading quizzes manually. Students receive delayed feedback. The COVID-19 pandemic accelerated the need for digital solutions, but existing tools like Google Forms lack automatic grading, and platforms like Kahoot! are more suited for engagement than serious assessment.

QuizMaster addresses this by providing a complete platform for creating, managing, taking, and auto-grading quizzes — all deployed to the cloud."

**Show:** Title slide with project name, your name, course name

---

### 1:30 - 3:30 | Architecture Overview

**Script:**
"Let me walk you through the system architecture. QuizMaster follows a three-tier architecture:

**Frontend:** Built with React 18 and Vite. I chose React for its component model and extensive ecosystem. Vite provides fast builds with hot module replacement during development.

**Backend:** A REST API built with Node.js and Express. I used JWT for stateless authentication — no server-side sessions needed, which makes horizontal scaling easier.

**Database:** PostgreSQL in production, SQLite for development. I used Knex.js as the query builder and migration tool, which abstracts away database-specific SQL.

The frontend communicates with the backend through REST endpoints. Authentication uses JWT tokens stored in localStorage and attached to requests via Axios interceptors."

**Show:** Architecture diagram (3 tiers: React SPA -> Express API -> PostgreSQL)

---

### 3:30 - 5:00 | Database Schema

**Script:**
"The database has 8 tables. Let me highlight the key design decisions:

- **Users table** stores both teachers and students with a role discriminator
- **Classes** has a unique invite code generated server-side
- **class_students** implements the many-to-many relationship
- **Quizzes** belong to a class and a teacher, with a published flag for draft workflow
- **Questions** have a sort_order for ordering and a question_type field
- **question_options** stores answer choices with an is_correct flag — this is what enables auto-grading
- **quiz_attempts** captures each student's submission with computed score
- **attempt_answers** stores individual answers for detailed analytics

The schema is normalized to 3rd normal form, with foreign keys ensuring referential integrity."

**Show:** Entity-relationship diagram or the migration file

---

### 5:00 - 7:30 | Live Demo

**Script:**
"Now let me show you the application in action. I'll walk through the complete flow from teacher perspective and then student perspective.

[Open browser to deployed URL]

**Teacher Flow:**
1. First, I'll register as a teacher — notice the role selection
2. After registration, I'm automatically logged in with a JWT token
3. I create a class — the system generates a unique invite code
4. Inside the class, I create a quiz with multiple choice and true/false questions
5. I can add options and mark the correct answer
6. Once ready, I publish the quiz — the system validates there's at least one question
7. I can view results once students submit

**Student Flow:**
1. I'll register as a student
2. I join the class using the invite code
3. The quiz appears in the class — I click 'Take Quiz'
4. I answer the questions and submit
5. I get immediate feedback with my score and percentage
6. Back on the teacher side, I can see the results with score distribution"

**Show:** Live demo of the application — register, create class, create quiz, publish, switch accounts, join, take quiz, view results

---

### 7:30 - 9:00 | Cloud Deployment

**Script:**
"The application is deployed using Render's Blueprint feature, which is Infrastructure as Code. The render.yaml file defines:

- A Node.js web service with build and start commands
- A PostgreSQL database that's automatically provisioned
- Environment variables for JWT secret and database URL
- Health check endpoint monitoring

The deployment process is:
1. Push code to GitHub
2. Connect repository to Render
3. Deploy via Blueprint — Render builds the frontend, installs backend dependencies, runs migrations, and starts the server
4. SSL certificates are provisioned automatically
5. The application is accessible at a public URL

For this demo, the application is also accessible through a temporary public tunnel."

**Show:** Screenshot of Render dashboard, render.yaml file, deployed URL

---

### 9:00 - 10:00 | Conclusion & Future Work

**Script:**
"In summary, QuizMaster successfully delivers:
- A full-stack web application with React and Node.js
- Automatic quiz grading with immediate feedback
- Role-based access control
- Cloud deployment with Infrastructure as Code
- Professional-grade security (bcrypt, JWT, parameterized queries)

**Future enhancements I'd like to implement:**
- Question banks for reusing questions across quizzes
- AI-powered question generation
- CSV/Excel export for results
- OAuth login (Google, Microsoft)
- Progressive Web App support for offline access

Thank you for watching. The source code is available on GitHub, and the link is in the report."

**Show:** Summary slide with key achievements, GitHub link, thank you

---

## Demo Credentials

**Teacher Account:**
- Email: teacher@example.com
- Password: password123

**Student Account:**
- Email: student@example.com
- Password: password123

## Recording Tips

1. **Screen resolution:** Record at 1920x1080 for best quality
2. **Audio:** Use a quiet room and speak clearly at a moderate pace
3. **Browser zoom:** Set zoom to 100% for clear text
4. **Demo preparation:** Have separate browser tabs ready for teacher and student accounts
5. **Backup plan:** If the live app is unavailable, have screenshots ready as fallback
6. **Timing:** Practice the full demo once to make sure you stay within 10 minutes

## Quick Links

- **Deployed App:** https://quizmaster.onrender.com
- **GitHub Repo:** https://github.com/HaykelLachiheb/QuizMaster
- **Report:** REPORT.md
- **Deploy:** https://render.com/deploy?repo=https://github.com/HaykelLachiheb/QuizMaster
