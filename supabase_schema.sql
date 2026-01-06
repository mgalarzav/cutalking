-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    stars INTEGER DEFAULT 0,
    profile_picture TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    progress INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scenario_id)
);

-- Initial Admin User (password: password123)
-- Username: admin
-- Password: password123
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2b$10$sTaxsY9/CL1qmukRJyjbg.le8u123JufPydSCGoOSclrLREZv6ff5C', 'admin')
ON CONFLICT (username) DO NOTHING;
