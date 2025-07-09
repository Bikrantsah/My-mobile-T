-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_movies_created_at ON movies(created_at);
CREATE INDEX IF NOT EXISTS idx_distributors_company_name ON distributors(company_name);

-- Add verification status to movies
ALTER TABLE movies ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE movies ADD COLUMN IF NOT EXISTS verification_details TEXT;

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_movies_verification_status ON movies(verification_status);
