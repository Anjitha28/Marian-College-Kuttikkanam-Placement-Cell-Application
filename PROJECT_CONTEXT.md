# Marian College Placement Cell — Project Context

## Overview
This is the independent Placement Cell web application for **Marian College Kuttikkanam**, connected directly to the Central Marian Supabase Database.

## Architecture
- **Multi-page Application**:
  - `index.html` — Login page
  - `admin.html` — Admin portal
  - `teacher.html` — Faculty portal
  - `student.html` — Student portal
  - `coordinator.html` — Coordinator portal
  - `manage-training.html` — Training program management
- **Database Service**: `js/db.js` querying `central_marian_*` tables via Supabase JS client.
- **Authentication**: `js/auth.js` validating against `central_marian_users` / `central_marian_students` / `central_marian_teachers` / `central_marian_admins`.
