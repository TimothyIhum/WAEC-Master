CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    username VARCHAR(40) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    avatar VARCHAR(50) DEFAULT '🎓',
    xp INTEGER DEFAULT 0 CHECK (xp >= 0 AND xp < 1000000),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    rank_tier VARCHAR(50) DEFAULT 'Bronze Scholar',
    streak INTEGER DEFAULT 1 CHECK (streak >= 0),
    accuracy INTEGER DEFAULT 100 CHECK (accuracy >= 0 AND accuracy <= 100),
    total_quizzes INTEGER DEFAULT 0 CHECK (total_quizzes >= 0),
    time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
    subjects_studied JSONB DEFAULT '{}'::jsonb,
    is_premium BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS discussion_posts (
    id VARCHAR(128) PRIMARY KEY,
    author_email VARCHAR(100) NOT NULL REFERENCES users(email) ON DELETE CASCADE,
    author_username VARCHAR(100) NOT NULL,
    author_avatar VARCHAR(50) DEFAULT '🎓',
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
    subject VARCHAR(100) NOT NULL,
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_subject ON discussion_posts(subject);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON discussion_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id VARCHAR(128) PRIMARY KEY,
    post_id VARCHAR(128) NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
    author_username VARCHAR(100) NOT NULL,
    author_avatar VARCHAR(50) DEFAULT '🎓',
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_replies_post_id ON discussion_replies(post_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_user_profile ON users
    FOR SELECT
    USING (true);

CREATE POLICY insert_own_profile ON users
    FOR INSERT
    WITH CHECK (
        (current_setting('request.jwt.claims', true)::jsonb->>'sub' = id) OR
        (current_setting('app.current_user_id', true) = id)
    );

CREATE POLICY update_own_profile ON users
    FOR UPDATE
    USING (
        (current_setting('request.jwt.claims', true)::jsonb->>'sub' = id) OR
        (current_setting('app.current_user_id', true) = id)
    )
    WITH CHECK (
        (CASE
            WHEN (current_setting('request.jwt.claims', true)::jsonb->>'email' IN ('temiokusami@gmail.com', 'timothyihum@gmail.com', 'admin@waecmaster.edu.ng')) THEN TRUE
            ELSE (is_admin = FALSE AND is_premium = users.is_premium)
         END)
    );

CREATE POLICY select_all_posts ON discussion_posts
    FOR SELECT
    USING (true);

CREATE POLICY insert_own_post ON discussion_posts
    FOR INSERT
    WITH CHECK (
        (current_setting('request.jwt.claims', true)::jsonb->>'email' = author_email) OR
        (current_setting('app.current_user_email', true) = author_email)
    );

CREATE POLICY update_own_post ON discussion_posts
    FOR UPDATE
    USING (
        (current_setting('request.jwt.claims', true)::jsonb->>'email' = author_email) OR
        (current_setting('app.current_user_email', true) = author_email)
    );

CREATE POLICY delete_own_post ON discussion_posts
    FOR DELETE
    USING (
        (current_setting('request.jwt.claims', true)::jsonb->>'email' = author_email) OR
        (current_setting('app.current_user_email', true) = author_email)
    );

CREATE POLICY select_all_replies ON discussion_replies
    FOR SELECT
    USING (true);

CREATE POLICY insert_any_reply ON discussion_replies
    FOR INSERT
    WITH CHECK (true);

-- SECTION: QUESTIONS AND CBT SYLLABUS BANK TABLES
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(128) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('mcq', 'theory', 'fill_in_the_blank')),
    text TEXT NOT NULL CHECK (char_length(text) > 0),
    options JSONB DEFAULT NULL, -- To store options array for MCQ
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    hint TEXT DEFAULT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    marks INTEGER DEFAULT 1,
    diagram_url TEXT DEFAULT NULL,
    exam_name VARCHAR(50) DEFAULT NULL CHECK (exam_name IN ('WAEC', 'JAMB')),
    exam_year INTEGER DEFAULT NULL,
    question_number INTEGER DEFAULT NULL,
    paper_id VARCHAR(180) DEFAULT NULL,
    paper_title VARCHAR(255) DEFAULT NULL,
    source_file_name TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_subject_exam_year_number
    ON questions(subject, exam_name, exam_year DESC, question_number ASC);
CREATE INDEX IF NOT EXISTS idx_questions_paper_id ON questions(paper_id);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_all_questions ON questions
    FOR SELECT
    USING (true);

CREATE POLICY insert_admin_questions ON questions
    FOR INSERT
    WITH CHECK (
        (current_setting('request.jwt.claims', true)::jsonb->>'email' IN ('temiokusami@gmail.com', 'timothyihum@gmail.com', 'admin@waecmaster.edu.ng')) OR
        (current_setting('app.current_user_email', true) IN ('temiokusami@gmail.com', 'timothyihum@gmail.com', 'admin@waecmaster.edu.ng')) OR
        true -- Allow synchronization from applet connections
    );
