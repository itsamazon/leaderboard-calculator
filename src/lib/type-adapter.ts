// Type adapter to convert between Supabase types and original app types
import { InternProfile as SupabaseInternProfile, WeeklyMetrics as SupabaseWeeklyMetrics, WeeklyStrategists as SupabaseWeeklyStrategists } from './supabase-local';
import { InternProfile, WeeklyMetrics, WeeklyStrategists, Role } from '../types';

// Convert Supabase WeeklyMetrics to app WeeklyMetrics
export const adaptWeeklyMetrics = (supabaseMetric: SupabaseWeeklyMetrics): WeeklyMetrics => ({
    internId: supabaseMetric.intern_id,
    week: supabaseMetric.week,
    role: supabaseMetric.role as Role,
    socialMetrics: {
        igFollowers: supabaseMetric.ig_followers,
        igViews: supabaseMetric.ig_views,
        igInteractions: supabaseMetric.ig_interactions,
        twitterFollowers: supabaseMetric.twitter_followers,
        twitterImpressions: supabaseMetric.twitter_impressions,
        twitterEngagements: supabaseMetric.twitter_engagements,
    },
    manualScores: {
        creativity: supabaseMetric.creativity,
        proactivity: supabaseMetric.proactivity,
        leadership: supabaseMetric.leadership,
        collaboration: supabaseMetric.collaboration,
    },
    bonusFollowers: supabaseMetric.bonus_followers,
    basedOnStrategistGrowth: supabaseMetric.based_on_strategist_growth,
});

// Convert app WeeklyMetrics to Supabase WeeklyMetrics
export const adaptWeeklyMetricsToSupabase = (appMetric: WeeklyMetrics): Omit<SupabaseWeeklyMetrics, 'id' | 'created_at' | 'updated_at'> => ({
    intern_id: appMetric.internId,
    week: appMetric.week,
    role: appMetric.role,
    ig_followers: appMetric.socialMetrics.igFollowers,
    ig_views: appMetric.socialMetrics.igViews,
    ig_interactions: appMetric.socialMetrics.igInteractions,
    twitter_followers: appMetric.socialMetrics.twitterFollowers,
    twitter_impressions: appMetric.socialMetrics.twitterImpressions,
    twitter_engagements: appMetric.socialMetrics.twitterEngagements,
    creativity: appMetric.manualScores.creativity,
    proactivity: appMetric.manualScores.proactivity,
    leadership: appMetric.manualScores.leadership || 0,
    collaboration: appMetric.manualScores.collaboration || 0,
    bonus_followers: appMetric.bonusFollowers,
    based_on_strategist_growth: appMetric.basedOnStrategistGrowth,
});

// Convert Supabase InternProfile to app InternProfile
export const adaptInternProfile = (supabaseProfile: SupabaseInternProfile): InternProfile => ({
    id: supabaseProfile.id,
    name: supabaseProfile.name,
    notes: supabaseProfile.notes,
});

// Convert app InternProfile to Supabase InternProfile
export const adaptInternProfileToSupabase = (appProfile: Omit<InternProfile, 'id'>): Omit<SupabaseInternProfile, 'id' | 'created_at' | 'updated_at'> => ({
    name: appProfile.name,
    notes: appProfile.notes,
});

// Convert Supabase WeeklyStrategists to app WeeklyStrategists
export const adaptWeeklyStrategists = (supabaseStrategists: SupabaseWeeklyStrategists): WeeklyStrategists => ({
    week: supabaseStrategists.week,
    strategistIds: supabaseStrategists.strategist_ids,
});

// Convert app WeeklyStrategists to Supabase WeeklyStrategists
export const adaptWeeklyStrategistsToSupabase = (appStrategists: Omit<WeeklyStrategists, 'id'>): Omit<SupabaseWeeklyStrategists, 'id' | 'created_at' | 'updated_at'> => ({
    week: appStrategists.week,
    strategist_ids: appStrategists.strategistIds,
});
