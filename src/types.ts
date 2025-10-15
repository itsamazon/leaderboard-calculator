export type Role = 'Strategist' | 'Support';

export interface SocialMetrics {
    igFollowers: number;
    igViews: number;
    igInteractions: number;
    twitterFollowers: number;
    twitterImpressions: number;
    twitterEngagements: number;
}

export interface ManualScores {
    creativity: number;
    proactivity: number;
    leadership?: number; // Only for Strategists
    collaboration?: number; // Only for Supports
}

// Base intern profile (added once) - just name now
export interface InternProfile {
    id: string;
    name: string;
    notes?: string;
}

// Weekly strategist assignments (2 per week)
export interface WeeklyStrategists {
    week: string;
    strategistIds: string[]; // Array of 2 intern IDs
}

// Weekly metrics for an intern - includes role since it can change weekly
export interface WeeklyMetrics {
    id?: string; // Optional for compatibility with database
    internId: string;
    week: string;
    role: Role; // Role can change each week!
    socialMetrics: SocialMetrics;
    manualScores: ManualScores;
    bonusFollowers: number;
    // For supports, we store the strategist growth they're based on
    basedOnStrategistGrowth?: number;
    comments?: string; // Weekly comments/notes for this intern
}

export interface ScoreBreakdown {
    growth: number;
    creativity: number;
    proactivity: number;
    leadership?: number;
    collaboration?: number;
    bonus: number;
    total: number;
    growthDetails?: {
        followersScore: number;
        viewsScore: number;
        interactionsScore: number;
        basedOnStrategistAverage?: number;
    };
}

export interface InternWithScore {
    profile: InternProfile;
    weeklyMetrics: WeeklyMetrics;
    score: ScoreBreakdown;
    rank: number;
}

// For cumulative scores
export interface InternCumulativeScore {
    profile: InternProfile;
    weeklyScores: { week: string; score: number; role: Role }[];
    cumulativeTotal: number;
    rank: number;
}

// For weekly winners
export interface WeeklyWinner {
    week: string;
    intern: InternProfile;
    score: number;
    role: Role;
}
