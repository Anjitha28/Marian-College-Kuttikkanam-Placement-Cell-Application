# Marian College Kuttikkanam - Placement Cell Application

A comprehensive Placement Management System for **Marian College Kuttikkanam**, powered by Supabase (Postgres) and modern responsive web technologies.

## 🚀 Key Features

- **Role-Based Portals**:
  - 🛡️ **Admin Portal** (`admin.html`): Manage students, faculty, batches, exams, placements, and generate dynamic analytics reports.
  - 🎓 **Student Portal** (`student.html`): View eligible drives, register for training sessions, attempt MCQ exams, and review feedback.
  - 👨‍🏫 **Teacher Portal** (`teacher.html`): Monitor class student progress, manage training batches, and attendance.
  - 🤝 **Coordinator Portal** (`coordinator.html`): Organize events and track placement progress.
- **Central Marian Database**: Fully integrated with the central Marian College Supabase database (`central_marian_*` schema).
- **MCQ Exam Engine**: Timed tests, auto-grading, and instant answer reviews.
- **Training & Attendance**: Batch splitters, check-in flows, and completion tracking.
- **Placement Drive Funnel**: Manage selection rounds from application to final offer.

## 🛠️ Tech Stack & Setup

- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend / Database**: Supabase (PostgreSQL) Central Marian Database
- **Local Dev Port**: `3001`

### Running Locally

```bash
npm install
npm start
```
The application will be accessible at: `http://localhost:3001`

## 🗄️ Database Tables (`central_marian_*`)

- `central_marian_students`
- `central_marian_teachers`
- `central_marian_training_programs`
- `central_marian_placement_activities`
- `central_marian_exams`
- `central_marian_exam_attempts`
- `central_marian_class_incharges`
- `central_marian_admins`

For full setup instructions, see `SUPABASE_SETUP.md` and `DEPLOYMENT.md`.
