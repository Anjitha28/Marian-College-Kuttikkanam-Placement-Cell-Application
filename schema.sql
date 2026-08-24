-- =============================================================================
-- MARIAN COLLEGE KUTTIKKANAM (AUTONOMOUS) PLACEMENT CELL APPLICATION
-- CENTRAL MARIAN DATABASE SCHEMA (PostgreSQL / Supabase)
-- Project: Marian College Placement Cell
-- Supabase Project ID: bbvmwwmfzpztlsybluml
-- Supabase Project URL: https://bbvmwwmfzpztlsybluml.supabase.co
-- Mandatory Prefix: central_marian_*
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. CENTRAL MARIAN DEPARTMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_code TEXT UNIQUE NOT NULL,
    department_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. CENTRAL MARIAN COURSES
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    department_id UUID REFERENCES central_marian_departments(id) ON DELETE SET NULL,
    duration INTEGER DEFAULT 3,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. CENTRAL MARIAN USERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student', 'teacher', 'coordinator')),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. CENTRAL MARIAN STUDENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES central_marian_users(id) ON DELETE SET NULL,
    student_id TEXT,
    name TEXT NOT NULL,
    register_number TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    gender TEXT,
    date_of_birth DATE,
    department_id UUID REFERENCES central_marian_departments(id) ON DELETE SET NULL,
    course_id UUID REFERENCES central_marian_courses(id) ON DELETE SET NULL,
    course TEXT,
    department TEXT,
    class TEXT,
    batch TEXT,
    semester INTEGER,
    address TEXT,
    password TEXT DEFAULT 'password',
    is_coordinator BOOLEAN DEFAULT FALSE,
    force_password_reset BOOLEAN DEFAULT FALSE,
    scores JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. CENTRAL MARIAN TEACHERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES central_marian_users(id) ON DELETE SET NULL,
    employee_id TEXT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    department_id UUID REFERENCES central_marian_departments(id) ON DELETE SET NULL,
    department TEXT,
    designation TEXT DEFAULT 'Assistant Professor',
    password TEXT DEFAULT 'password',
    is_coordinator BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. CENTRAL MARIAN COMPANIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    website TEXT,
    contact_person TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. CENTRAL MARIAN RECRUITMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_recruitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES central_marian_companies(id) ON DELETE SET NULL,
    job_role TEXT NOT NULL,
    job_type TEXT DEFAULT 'Full-time',
    location TEXT,
    salary TEXT,
    recruitment_date DATE,
    application_deadline DATE,
    status TEXT DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. CENTRAL MARIAN RECRUITMENT APPLICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_recruitment_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES central_marian_students(id) ON DELETE CASCADE,
    recruitment_id UUID REFERENCES central_marian_recruitments(id) ON DELETE CASCADE,
    application_status TEXT DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, recruitment_id)
);

-- =============================================================================
-- 9. CENTRAL MARIAN TRAINING PROGRAMS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_training_programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    program_name TEXT,
    description TEXT,
    trainer TEXT,
    venue TEXT,
    location TEXT,
    date TEXT,
    start_date DATE,
    end_date TEXT,
    days INTEGER,
    status TEXT DEFAULT 'active',
    is_registration_open BOOLEAN DEFAULT TRUE,
    is_feedback_open BOOLEAN DEFAULT FALSE,
    target JSONB DEFAULT '{"type":"all"}'::jsonb,
    registrations JSONB DEFAULT '[]'::jsonb,
    sessions JSONB DEFAULT '[]'::jsonb,
    batches JSONB DEFAULT '[]'::jsonb,
    feedbacks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. CENTRAL MARIAN PROGRAM CALENDAR
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_program_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id TEXT REFERENCES central_marian_training_programs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. CENTRAL MARIAN PLACEMENT ACTIVITIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_placement_activities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    activity_name TEXT,
    venue TEXT,
    date TEXT,
    last_date TEXT,
    description TEXT,
    type TEXT DEFAULT 'recruitment',
    status TEXT DEFAULT 'active',
    target JSONB DEFAULT '{"type":"all"}'::jsonb,
    registrations JSONB DEFAULT '[]'::jsonb,
    phases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 12. CENTRAL MARIAN EXAMS & EXAM QUESTIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    pass_mark INTEGER DEFAULT 40,
    negative NUMERIC DEFAULT 0,
    questions JSONB DEFAULT '[]'::jsonb,
    target JSONB DEFAULT '{"type":"all"}'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS central_marian_exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id TEXT REFERENCES central_marian_exams(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT DEFAULT 'mcq',
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    marks NUMERIC DEFAULT 1,
    category TEXT,
    difficulty TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 13. CENTRAL MARIAN EXAM ATTEMPTS & RESULTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id TEXT NOT NULL REFERENCES central_marian_exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES central_marian_students(id) ON DELETE SET NULL,
    register_number TEXT NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    score NUMERIC DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'completed',
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS central_marian_exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES central_marian_exam_attempts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES central_marian_students(id) ON DELETE CASCADE,
    exam_id TEXT REFERENCES central_marian_exams(id) ON DELETE CASCADE,
    total_marks NUMERIC DEFAULT 100,
    obtained_marks NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'graded',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 14. CENTRAL MARIAN NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES central_marian_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 15. CENTRAL MARIAN CLASS INCHARGES & ADMINS
-- =============================================================================
CREATE TABLE IF NOT EXISTS central_marian_class_incharges (
    class_name TEXT PRIMARY KEY,
    incharge TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS central_marian_admins (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Administrator',
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_central_marian_students_reg ON central_marian_students(register_number);
CREATE INDEX IF NOT EXISTS idx_central_marian_students_dept ON central_marian_students(department);
CREATE INDEX IF NOT EXISTS idx_central_marian_students_class ON central_marian_students(class);
CREATE INDEX IF NOT EXISTS idx_central_marian_teachers_phone ON central_marian_teachers(phone);
CREATE INDEX IF NOT EXISTS idx_central_marian_exam_attempts_exam ON central_marian_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_central_marian_exam_attempts_reg ON central_marian_exam_attempts(register_number);
CREATE INDEX IF NOT EXISTS idx_central_marian_recruitments_company ON central_marian_recruitments(company_id);
CREATE INDEX IF NOT EXISTS idx_central_marian_calendar_program ON central_marian_program_calendar(program_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE central_marian_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_recruitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_recruitment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_program_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_placement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_class_incharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to central_marian_departments" ON central_marian_departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_courses" ON central_marian_courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_users" ON central_marian_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_students" ON central_marian_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_teachers" ON central_marian_teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_companies" ON central_marian_companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_recruitments" ON central_marian_recruitments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_recruitment_applications" ON central_marian_recruitment_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_training_programs" ON central_marian_training_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_program_calendar" ON central_marian_program_calendar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_placement_activities" ON central_marian_placement_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exams" ON central_marian_exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exam_questions" ON central_marian_exam_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exam_attempts" ON central_marian_exam_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exam_results" ON central_marian_exam_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_notifications" ON central_marian_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_class_incharges" ON central_marian_class_incharges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_admins" ON central_marian_admins FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED INITIAL DATA (Marian College Kuttikkanam sample data)
-- =============================================================================
INSERT INTO central_marian_departments (department_code, department_name)
VALUES 
('CS', 'Computer Science'),
('COMM', 'Commerce'),
('MGMT', 'Management Studies')
ON CONFLICT (department_code) DO NOTHING;

INSERT INTO central_marian_courses (course_code, course_name, duration)
VALUES 
('BCA', 'Bachelor of Computer Applications', 3),
('BSCCS', 'B.Sc Computer Science', 3),
('BCOM', 'Bachelor of Commerce', 3),
('BBA', 'Bachelor of Business Administration', 3),
('MCA', 'Master of Computer Applications', 2)
ON CONFLICT (course_code) DO NOTHING;

INSERT INTO central_marian_admins (username, password, name)
VALUES ('admin', 'Admin@1234', 'Marian Admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO central_marian_students (name, register_number, phone, email, course, department, class, gender, password, is_coordinator)
VALUES 
('Arjun Mathew', 'MC_CS_01', '9876500001', 'arjun.mathew@mariancollege.org', 'BCA', 'Computer Science', '1 BCA A', 'Male', 'password', true),
('Diya Mariam', 'MC_CS_02', '9876500002', 'diya.mariam@mariancollege.org', 'B.Sc CS', 'Computer Science', '2 BSc CS A', 'Female', 'password', false),
('Meera George', 'MC_CS_04', '9876500004', 'meera.george@mariancollege.org', 'B.Sc CS', 'Computer Science', '2 BSc CS A', 'Female', 'password', false),
('Siddharth Tom', 'MC_CM_01', '9876500005', 'siddharth.tom@mariancollege.org', 'B.Com', 'Commerce', '3 BCom B', 'Male', 'password', false),
('Ananya Joseph', 'MC_CM_04', '9876500008', 'ananya.joseph@mariancollege.org', 'B.Com', 'Commerce', '3 BCom B', 'Female', 'password', false)
ON CONFLICT (register_number) DO NOTHING;

INSERT INTO central_marian_teachers (name, phone, email, department, password, is_coordinator)
VALUES
('Dr. Joseph Thomas', '9876599999', 'joseph.thomas@mariancollege.org', 'Computer Science', 'password', true),
('Prof. Mary Varghese', '9876588888', 'mary.varghese@mariancollege.org', 'Commerce', 'password', false)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO central_marian_class_incharges (class_name, incharge)
VALUES 
('1 BCA A', 'Dr. Joseph Thomas'),
('2 BSc CS A', 'Dr. Joseph Thomas'),
('3 BCom B', 'Prof. Mary Varghese')
ON CONFLICT (class_name) DO NOTHING;

INSERT INTO central_marian_training_programs (id, name, description, venue, date, end_date, days, is_registration_open, is_feedback_open, target, registrations, sessions, batches, feedbacks)
VALUES
('TRN_001', 'Soft Skills Mastery', 'Corporate communication and personality development training for placements.', 'Auditorium', '2026-06-01', '2026-06-05', 5, true, false, '{"type":"all"}'::jsonb, '["MC_CS_01", "MC_CS_02", "MC_CM_01"]'::jsonb, '[{"id":"sess_1","date":"2026-06-01","time":"10:00 AM","attendance":["MC_CS_01","MC_CS_02"]}]'::jsonb, '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO central_marian_placement_activities (id, name, venue, date, last_date, description, type, target, registrations, phases)
VALUES
('PLC_001', 'Google Recruitment Drive', 'Virtual', '2026-07-15', '2026-07-20', 'Campus recruitment drive for Associate Software Engineer roles.', 'recruitment', '{"type":"all"}'::jsonb, '["MC_CS_01", "MC_CS_02"]'::jsonb, '[{"id":"PHS_1","name":"Technical Round","completions":["MC_CS_01","MC_CS_02"]},{"id":"PHS_2","name":"Final Interview","completions":["MC_CS_01","MC_CS_02"]}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
