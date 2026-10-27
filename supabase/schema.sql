-- ==============================================================================
-- Student Registration Schema & Row Level Security (RLS) Setup
-- Table: public.students
-- ==============================================================================

-- 1. Create the `students` table if it does not already exist
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    course TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create an explicit unique index on student_id for quick search and deduplication
CREATE UNIQUE INDEX IF NOT EXISTS students_student_id_unique_idx ON public.students (student_id);

-- 3. Enable Row Level Security (RLS)
-- Crucial: This ensures table access is strictly governed by declared policies.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow public/anonymous and authenticated visitors to insert new student registrations
-- This allows the frontend registration form to add new students without leaking admin privileges.
DROP POLICY IF EXISTS "Allow public insert to students" ON public.students;
CREATE POLICY "Allow public insert to students"
ON public.students
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Policy: Allow public/anonymous and authenticated visitors to query students
-- Needed for the frontend to verify whether a student ID already exists before submission,
-- and optionally show recent registration feedback.
DROP POLICY IF EXISTS "Allow public select to verify student_id" ON public.students;
CREATE POLICY "Allow public select to verify student_id"
ON public.students
FOR SELECT
TO anon, authenticated
USING (true);

-- ==============================================================================
-- Verification Query
-- ==============================================================================
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'students';
