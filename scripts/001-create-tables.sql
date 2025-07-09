-- Create distributors table
CREATE TABLE IF NOT EXISTS distributors (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    religion_category VARCHAR(100),
    language VARCHAR(50),
    video_url TEXT,
    distributor_id INTEGER REFERENCES distributors(id) ON DELETE CASCADE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_distributors_user_id ON distributors(user_id);
CREATE INDEX IF NOT EXISTS idx_distributors_approved ON distributors(approved);
CREATE INDEX IF NOT EXISTS idx_movies_distributor_id ON movies(distributor_id);
CREATE INDEX IF NOT EXISTS idx_movies_approved ON movies(approved);
CREATE INDEX IF NOT EXISTS idx_movies_religion_category ON movies(religion_category);
CREATE INDEX IF NOT EXISTS idx_movies_language ON movies(language);
