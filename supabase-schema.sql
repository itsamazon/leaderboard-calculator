-- Studio X Intern Leaderboard Database Schema

-- Note: We don't need to modify auth.users table
-- This script only creates our custom tables

-- Create intern_profiles table
CREATE TABLE IF NOT EXISTS intern_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weekly_strategists table
CREATE TABLE IF NOT EXISTS weekly_strategists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week TEXT NOT NULL,
    strategist_ids TEXT[] NOT NULL, -- Array of 2 UUIDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week)
);

-- Create weekly_metrics table
CREATE TABLE IF NOT EXISTS weekly_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intern_id UUID REFERENCES intern_profiles(id) ON DELETE CASCADE,
    week TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Strategist', 'Support')),
    
    -- Social metrics
    ig_followers INTEGER DEFAULT 0,
    ig_views INTEGER DEFAULT 0,
    ig_interactions INTEGER DEFAULT 0,
    twitter_followers INTEGER DEFAULT 0,
    twitter_impressions INTEGER DEFAULT 0,
    twitter_engagements INTEGER DEFAULT 0,
    
    -- Manual scores
    creativity INTEGER DEFAULT 0,
    proactivity INTEGER DEFAULT 0,
    leadership INTEGER DEFAULT 0, -- Only for Strategists
    collaboration INTEGER DEFAULT 0, -- Only for Supports
    
    -- Bonus and growth
    bonus_followers INTEGER DEFAULT 0,
    based_on_strategist_growth DECIMAL(10,2), -- For supports
    comments TEXT, -- Weekly comments/notes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(intern_id, week)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_metrics_week ON weekly_metrics(week);
CREATE INDEX IF NOT EXISTS idx_weekly_metrics_intern_id ON weekly_metrics(intern_id);
CREATE INDEX IF NOT EXISTS idx_weekly_strategists_week ON weekly_strategists(week);

-- Enable Row Level Security on all tables
ALTER TABLE intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_strategists ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for intern view)
CREATE POLICY "Public read access for intern_profiles" ON intern_profiles
    FOR SELECT USING (true);

CREATE POLICY "Public read access for weekly_strategists" ON weekly_strategists
    FOR SELECT USING (true);

CREATE POLICY "Public read access for weekly_metrics" ON weekly_metrics
    FOR SELECT USING (true);

-- Create policies for full access (for admin view - you'll need to add authentication)
-- For now, we'll use a simple approach - you can add proper auth later
CREATE POLICY "Full access for intern_profiles" ON intern_profiles
    FOR ALL USING (true);

CREATE POLICY "Full access for weekly_strategists" ON weekly_strategists
    FOR ALL USING (true);

CREATE POLICY "Full access for weekly_metrics" ON weekly_metrics
    FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_intern_profiles_updated_at BEFORE UPDATE ON intern_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_strategists_updated_at BEFORE UPDATE ON weekly_strategists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_metrics_updated_at BEFORE UPDATE ON weekly_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No dummy data inserted - you'll add your interns through the admin panel
-- The app will start with empty tables and you can add interns manually
