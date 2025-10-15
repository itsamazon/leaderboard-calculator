import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Database types
export interface InternProfile {
    id: string;
    name: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface WeeklyStrategists {
    id: string;
    week: string;
    strategist_ids: string[];
    created_at: string;
    updated_at: string;
}

export interface WeeklyMetrics {
    id: string;
    intern_id: string;
    week: string;
    role: 'Strategist' | 'Support';

    // Social metrics
    ig_followers: number;
    ig_views: number;
    ig_interactions: number;
    twitter_followers: number;
    twitter_impressions: number;
    twitter_engagements: number;

    // Manual scores
    creativity: number;
    proactivity: number;
    leadership: number;
    collaboration: number;

    // Bonus and growth
    bonus_followers: number;
    based_on_strategist_growth?: number;

    created_at: string;
    updated_at: string;
}
