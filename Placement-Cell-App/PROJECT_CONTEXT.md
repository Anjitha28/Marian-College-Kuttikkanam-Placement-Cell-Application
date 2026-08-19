# Placement Cell App - Project Context

This document provides a high-level overview of the Christ Placement Cell Application. Refer to this document in future tasks to understand the architecture, database setup, and feature scope without re-analyzing the workspace from scratch.

## 1. Tech Stack
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript (No frameworks like React or Angular).
- **Architecture**: Multi-page application (MPA) with distinct pages for different roles (`admin.html`, `teacher.html`, `student.html`, `coordinator.html`).
- **State/Database**: 
  - **Local**: `localStorage` (via `js/db.js`) is used extensively for client-side caching and offline capabilities.
  - **Cloud/Backend**: Google Sheets integrated via Google Apps Script (described in `BACKEND_SETUP.md` and `GoogleAppsScript.js`).

## 2. Directory Structure
- `/`: Contains all the role-based HTML pages (`admin.html`, `teacher.html`, `student.html`, `coordinator.html`), `index.html` (login), and markdown documentation.
- `css/`: Contains styling for the pages.
- `js/`: Contains the core application logic.
  - `auth.js`: Handles login and user authentication.
  - `db.js`: Comprehensive wrapper for data operations, interacting with `localStorage` and syncing with Google Sheets.
  - `permissions.js`: Defines capability-based permissions for different roles (Admin, Teacher, Teacher Coordinator, Student Coordinator, Student).
  - `admin.js`, `teacher.js`, etc.: Page-specific logic handling the UI rendering and user interactions.

## 3. Core Features (from APP_FEATURES_AND_TABS.md)
1. **Accounts & Roles**: 5 distinct roles: Admin, Teacher Coordinator, Teacher, Student Coordinator, Student. Capability-based permissions.
2. **Student & Teacher Records**: Management of profiles, classes, coordinators, and bulk uploading via Excel.
3. **Training Programs**: Create programs, assign target audiences (course/department), two completion modes (Attendance % and/or Marks).
4. **Sessions & Attendance**: Track attendance per session, check-in flows, and registered-only attendance logic.
5. **Batches**: Auto-split students, custom batch names, and class-to-batch assignments.
6. **MCQ Exam Engine**: Question banks, timed exams, auto-grading, and pass/fail analysis.
7. **Placement Activities**: Selection phases, selection funnel, company/recruiter master, application tracking, and eligibility-aware listing.
8. **Dashboards & Reports**: Extensive analytics per program, course-wise tracking, and placement trends.

## 4. Key Workflows
- **Data Loading**: App first loads from `localStorage` for immediate rendering. It then queries the Google Apps Script endpoint to fetch updates from Google Sheets, updating the local state.
- **Saving Data**: New records (students, programs, attendance, exams) are saved locally and pushed to the Apps Script endpoint (`action=save`) to upsert into Google Sheets.

## 5. Styling Guidelines
- The design uses rich aesthetics, vibrant colors, smooth gradients, glassmorphism, and modern typography (from Google Fonts).
- Vanilla CSS is used (no Tailwind).

*Whenever working on this project, ensure that new functionalities are integrated cleanly into `db.js` for data persistence, respect the role-based system in `permissions.js`, and adhere to the established UI aesthetics.*
