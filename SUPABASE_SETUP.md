# Supabase Central Database Setup — Marian College Kuttikkanam

## Central Database Configuration
- **Supabase Project Name**: Marian College Placement Cell
- **Project URL**: `https://bbvmwwmfzpztlsybluml.supabase.co`
- **Project ID**: `bbvmwwmfzpztlsybluml`
- **Publishable Key**: `sb_publishable_-4VLIQXXBBC9QsA9IvsNng_IS0GLm3v`

## Setting Up Tables in Supabase
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/bbvmwwmfzpztlsybluml).
2. Navigate to **SQL Editor** from the left sidebar.
3. Click **New Query**.
4. Open the `schema.sql` file in this repository, copy all the SQL content, and paste it into the Supabase SQL editor.
5. Click **Run** to execute the query.

This will automatically create:
- All `central_marian_*` tables
- Foreign key constraints & indexes
- Row Level Security (RLS) policies
- Initial seed records for Marian College Kuttikkanam
