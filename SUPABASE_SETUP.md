# Central Supabase Database Setup — Marian College Kuttikkanam

## 🏛️ Central Database Architecture
This project is configured to use the **CENTRAL MARIAN DATABASE** on Supabase.
All application tables strictly follow the mandatory naming convention: `central_marian_*`.

- **Supabase Project Name**: Marian College Placement Cell
- **Supabase Project ID**: `bbvmwwmfzpztlsybluml`
- **Project URL**: `https://bbvmwwmfzpztlsybluml.supabase.co`
- **REST API Endpoint**: `https://bbvmwwmfzpztlsybluml.supabase.co/rest/v1/`

---

## 📋 Mandatory Database Tables
1. `central_marian_users` — Central system users (Admin, Student, Teacher)
2. `central_marian_departments` — Academic departments (CS, Commerce, Management, etc.)
3. `central_marian_courses` — Degree courses (BCA, B.Sc CS, B.Com, MCA, etc.)
4. `central_marian_students` — Student profiles, register numbers, coordinators, scores
5. `central_marian_teachers` — Faculty profiles, in-charge assignments, coordinators
6. `central_marian_companies` — Recruiting companies and hiring partners
7. `central_marian_recruitments` — Placement and internship job postings
8. `central_marian_recruitment_applications` — Student job applications
9. `central_marian_placement_activities` — Placement drives and multi-phase rounds
10. `central_marian_training_programs` — Training sessions, attendance, feedback, and batches
11. `central_marian_program_calendar` — Schedule and timeline events
12. `central_marian_exams` — Assessment exams and tests
13. `central_marian_exam_questions` — MCQ questions bank
14. `central_marian_exam_attempts` — Student test attempts and answers
15. `central_marian_exam_results` — Graded results and score reports
16. `central_marian_notifications` — Central notifications
17. `central_marian_class_incharges` — Class and batch faculty in-charge mapping
18. `central_marian_admins` — Administrative authentication credentials

---

## 🚀 How to Apply the Schema in Supabase (1-Click SQL Setup)

1. Open your Supabase project: [https://supabase.com/dashboard/project/bbvmwwmfzpztlsybluml](https://supabase.com/dashboard/project/bbvmwwmfzpztlsybluml)
2. Navigate to **SQL Editor** from the left navigation menu.
3. Click **New Query** (or open an empty query tab).
4. Copy the entire contents of [schema.sql](schema.sql).
5. Paste it into the editor and click **Run** (or press `Ctrl + Enter`).

---

## 🔒 Security & Row Level Security (RLS)
- Every table has Row Level Security (RLS) enabled.
- Public publishable keys only have access permitted by RLS policies.
- No sensitive service keys are exposed in the client code.
