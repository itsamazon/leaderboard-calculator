import { InternProfile, WeeklyMetrics, WeeklyStrategists } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

// Helper function for API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// Intern API
export const internAPI = {
    getAll: () => apiRequest<InternProfile[]>('/interns'),

    getById: (id: string) => apiRequest<InternProfile>(`/interns/${id}`),

    create: (name: string, notes?: string) =>
        apiRequest<InternProfile>('/interns', {
            method: 'POST',
            body: JSON.stringify({ name, notes }),
        }),

    update: (id: string, updates: { name?: string; notes?: string }) =>
        apiRequest<InternProfile>(`/interns/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    delete: (id: string) =>
        apiRequest<void>(`/interns/${id}`, {
            method: 'DELETE',
        }),
};

// Strategist API
export const strategistAPI = {
    getAll: () => apiRequest<WeeklyStrategists[]>('/strategists'),

    getByWeek: (week: string) =>
        apiRequest<WeeklyStrategists>(`/strategists/${week}`),

    create: (week: string, strategistIds: string[]) =>
        apiRequest<WeeklyStrategists>('/strategists', {
            method: 'POST',
            body: JSON.stringify({ week, strategistIds }),
        }),

    update: (week: string, strategistIds: string[]) =>
        apiRequest<WeeklyStrategists>(`/strategists/${week}`, {
            method: 'PUT',
            body: JSON.stringify({ strategistIds }),
        }),

    delete: (week: string) =>
        apiRequest<void>(`/strategists/${week}`, {
            method: 'DELETE',
        }),
};

// Metrics API  
export const metricsAPI = {
    getAll: () => apiRequest<WeeklyMetrics[]>('/metrics'),

    getByWeek: (week: string) =>
        apiRequest<WeeklyMetrics[]>(`/metrics?week=${week}`),

    getByIntern: (internId: string) =>
        apiRequest<WeeklyMetrics[]>(`/metrics?internId=${internId}`),

    getById: (id: string) =>
        apiRequest<WeeklyMetrics>(`/metrics/${id}`),

    create: (metrics: {
        intern_id: string;
        week: string;
        role: 'Strategist' | 'Support';
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
    }) =>
        apiRequest<WeeklyMetrics>('/metrics', {
            method: 'POST',
            body: JSON.stringify(metrics),
        }),

    update: (id: string, updates: Partial<{
        intern_id: string;
        week: string;
        role: 'Strategist' | 'Support';
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
    }>) =>
        apiRequest<WeeklyMetrics>(`/metrics/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        }),

    delete: (id: string) =>
        apiRequest<void>(`/metrics/${id}`, {
            method: 'DELETE',
        }),
};

// Type converters (backend uses snake_case, frontend uses camelCase)
export const toBackendMetrics = (metrics: Omit<WeeklyMetrics, 'id'>) => ({
    intern_id: metrics.internId,
    week: metrics.week,
    role: metrics.role,
    ig_followers: metrics.socialMetrics.igFollowers,
    ig_views: metrics.socialMetrics.igViews,
    ig_interactions: metrics.socialMetrics.igInteractions,
    twitter_followers: metrics.socialMetrics.twitterFollowers,
    twitter_impressions: metrics.socialMetrics.twitterImpressions,
    twitter_engagements: metrics.socialMetrics.twitterEngagements,
    creativity: metrics.manualScores.creativity,
    proactivity: metrics.manualScores.proactivity,
    leadership: metrics.manualScores.leadership || 0,
    collaboration: metrics.manualScores.collaboration || 0,
    bonus_followers: metrics.bonusFollowers,
    based_on_strategist_growth: metrics.basedOnStrategistGrowth,
    comments: metrics.comments,
});

export const toFrontendMetrics = (backendMetrics: any): WeeklyMetrics => ({
    id: backendMetrics.id,
    internId: backendMetrics.intern_id,
    week: backendMetrics.week,
    role: backendMetrics.role,
    socialMetrics: {
        igFollowers: backendMetrics.ig_followers,
        igViews: backendMetrics.ig_views,
        igInteractions: backendMetrics.ig_interactions,
        twitterFollowers: backendMetrics.twitter_followers,
        twitterImpressions: backendMetrics.twitter_impressions,
        twitterEngagements: backendMetrics.twitter_engagements,
    },
    manualScores: {
        creativity: backendMetrics.creativity,
        proactivity: backendMetrics.proactivity,
        leadership: backendMetrics.leadership,
        collaboration: backendMetrics.collaboration,
    },
    bonusFollowers: backendMetrics.bonus_followers,
    basedOnStrategistGrowth: backendMetrics.based_on_strategist_growth,
    comments: backendMetrics.comments,
});

export const toFrontendStrategists = (backendStrategists: any): WeeklyStrategists => ({
    week: backendStrategists.week,
    strategistIds: backendStrategists.strategist_ids,
});

