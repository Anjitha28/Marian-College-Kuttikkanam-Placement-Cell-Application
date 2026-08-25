# Marian College Kuttikkanam Placement Cell — Vercel Deployment Guide

## 1. Quick Deploy via Vercel Dashboard

1. Log into your [Vercel Dashboard](https://vercel.com/new).
2. Under **Import Git Repository**, select:
   `https://github.com/Anjitha28/Marian-College-Kuttikkanam-Placement-Cell-Application`
3. Configure Project Settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `./` (leave default)
4. Environment Variables (Optional - already configured in client):
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://bbvmwwmfzpztlsybluml.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_-4VLIqXXBBC9QsA9IvsNng_IS0GLm3v`
5. Click **Deploy**.

---

## 2. Configured Clean Routes (via `vercel.json`)

The application supports clean URL rewrites:
- `/` or `/login` ➔ Login Portal (`index.html`)
- `/admin` ➔ Admin Portal (`admin.html`)
- `/teacher` ➔ Teacher Coordinator Portal (`teacher.html`)
- `/student` ➔ Student Portal (`student.html`)
- `/coordinator` ➔ Student Coordinator Portal (`coordinator.html`)

---

## 3. GitHub Repository

- **Repository**: `https://github.com/Anjitha28/Marian-College-Kuttikkanam-Placement-Cell-Application`
- **Branch**: `main`
