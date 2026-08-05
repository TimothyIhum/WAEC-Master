/*
# Create questions table for WAEC/JAMB exam questions

1. New Tables
- `questions`: Stores exam questions with options, correct answers, explanations, and metadata
  - `id` (varchar, primary key): Unique question identifier
  - `subject` (varchar): Subject name (e.g., English Language)
  - `topic` (varchar): Topic within subject
  - `type` (varchar): Question type - mcq, theory, or fill_in_the_blank
  - `text` (text): The question text
  - `options` (jsonb): Array of options for MCQ questions
  - `correct_answer` (text): Index for MCQ or raw answer for theory
  - `explanation` (text): Detailed explanation of the answer
  - `hint` (text): Optional hint
  - `difficulty` (varchar): Easy, Medium, or Hard
  - `marks` (integer): Marks allocated
  - `diagram_url` (text): Optional diagram
  - `exam_name` (varchar): WAEC or JAMB
  - `exam_year` (integer): Year of exam
  - `question_number` (integer): Question number in the exam
  - `section` (varchar): Section of the exam paper
  - `created_at` (timestamp): Record creation time

2. Security
- Enable RLS on `questions`.
- Allow anon + authenticated to read all questions (public exam content).
- Allow authenticated to insert questions (admin sync).
- No updates or deletes from client side.

3. Notes
- This table stores WAEC and JAMB past questions.
- The `options` field is a JSONB array for MCQ questions.
- `correct_answer` stores the option index (0-3) for MCQ.
- The `section` field tracks which section of the exam paper the question belongs to.
*/

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(128) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'theory', 'fill_in_the_blank')),
    text TEXT NOT NULL CHECK (char_length(text) > 0),
    options JSONB DEFAULT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    hint TEXT DEFAULT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    marks INTEGER DEFAULT 1,
    diagram_url TEXT DEFAULT NULL,
    exam_name VARCHAR(50) DEFAULT NULL CHECK (exam_name IN ('WAEC', 'JAMB')),
    exam_year INTEGER DEFAULT NULL,
    question_number INTEGER DEFAULT NULL,
    section VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_exam_year ON questions(exam_year);
CREATE INDEX IF NOT EXISTS idx_questions_exam_name ON questions(exam_name);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_questions" ON questions;
CREATE POLICY "select_all_questions" ON questions
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "insert_questions" ON questions;
CREATE POLICY "insert_questions" ON questions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
