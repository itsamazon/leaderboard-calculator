-- Migration: Add comments column to weekly_metrics table
-- Run this in Supabase SQL Editor

ALTER TABLE weekly_metrics 
ADD COLUMN IF NOT EXISTS comments TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'weekly_metrics' 
AND column_name = 'comments';


