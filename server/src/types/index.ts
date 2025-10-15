export type Role = 'Strategist' | 'Support';

export interface InternProfile {
    id: string;
    name: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface WeeklyStrategists {
    id?: string;
    week: string;
    strategist_ids: string[];
    created_at?: string;
    updated_at?: string;
}

export interface WeeklyMetrics {
    id: string;
    intern_id: string;
    week: string;
    role: Role;
    ig_followers: number;
    ig_views: number;
    ig_interactions: number;
    twitter_followers: number;
    twitter_impressions: number;
    twitter_engagements: number;
    creativity: number;
    proactivity: number;
    leadership: number;
    collaboration: number;
    bonus_followers: number;
    based_on_strategist_growth?: number;
    comments?: string;
    created_at?: string;
    updated_at?: string;
}

