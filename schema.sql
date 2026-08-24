-- =============================================================================
-- MARIAN COLLEGE KUTTIKKANAM PLACEMENT CELL APPLICATION
-- CENTRAL MARIAN DATABASE SCHEMA (PostgreSQL / Supabase)
-- Project: Marian College Placement Cell
-- =============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CENTRAL MARIAN STUDENTS
CREATE TABLE IF NOT EXISTS central_marian_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    register_number TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    course TEXT,
    department TEXT,
    class TEXT,
    gender TEXT,
    password TEXT DEFAULT 'password',
    is_coordinator BOOLEAN DEFAULT FALSE,
    force_password_reset BOOLEAN DEFAULT FALSE,
    scores JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CENTRAL MARIAN TEACHERS
CREATE TABLE IF NOT EXISTS central_marian_teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    department TEXT,
    password TEXT DEFAULT 'password',
    is_coordinator BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CENTRAL MARIAN TRAINING PROGRAMS
CREATE TABLE IF NOT EXISTS central_marian_training_programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    date TEXT,
    end_date TEXT,
    days INTEGER,
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

-- 4. CENTRAL MARIAN PLACEMENT ACTIVITIES
CREATE TABLE IF NOT EXISTS central_marian_placement_activities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    venue TEXT,
    date TEXT,
    last_date TEXT,
    description TEXT,
    type TEXT,
    target JSONB DEFAULT '{"type":"all"}'::jsonb,
    registrations JSONB DEFAULT '[]'::jsonb,
    phases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CENTRAL MARIAN EXAMS
CREATE TABLE IF NOT EXISTS central_marian_exams (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    pass_mark INTEGER DEFAULT 40,
    negative NUMERIC DEFAULT 0,
    questions JSONB DEFAULT '[]'::jsonb,
    target JSONB DEFAULT '{"type":"all"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CENTRAL MARIAN EXAM ATTEMPTS
CREATE TABLE IF NOT EXISTS central_marian_exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id TEXT NOT NULL REFERENCES central_marian_exams(id) ON DELETE CASCADE,
    register_number TEXT NOT NULL,
    answers JSONB DEFAULT '[]'::jsonb,
    score NUMERIC DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CENTRAL MARIAN CLASS INCHARGES
CREATE TABLE IF NOT EXISTS central_marian_class_incharges (
    class_name TEXT PRIMARY KEY,
    incharge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CENTRAL MARIAN ADMINS
CREATE TABLE IF NOT EXISTS central_marian_admins (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Administrator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_central_marian_students_reg ON central_marian_students(register_number);
CREATE INDEX IF NOT EXISTS idx_central_marian_students_dept ON central_marian_students(department);
CREATE INDEX IF NOT EXISTS idx_central_marian_students_class ON central_marian_students(class);
CREATE INDEX IF NOT EXISTS idx_central_marian_teachers_phone ON central_marian_teachers(phone);
CREATE INDEX IF NOT EXISTS idx_central_marian_exam_attempts_exam ON central_marian_exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_central_marian_exam_attempts_reg ON central_marian_exam_attempts(register_number);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and grant read/write access for application usage
-- -----------------------------------------------------------------------------
ALTER TABLE central_marian_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_placement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_class_incharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE central_marian_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to central_marian_students" ON central_marian_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_teachers" ON central_marian_teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_training_programs" ON central_marian_training_programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_placement_activities" ON central_marian_placement_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exams" ON central_marian_exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_exam_attempts" ON central_marian_exam_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_class_incharges" ON central_marian_class_incharges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to central_marian_admins" ON central_marian_admins FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SEED INITIAL DATA (Marian College Kuttikkanam sample data)
-- -----------------------------------------------------------------------------
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
