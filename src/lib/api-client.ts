import { InternProfile, WeeklyMetrics, WeeklyStrategists } from '../types';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Log API URL in development for debugging
if (import.meta.env.DEV) {
    console.log('🔌 API URL:', API_BASE_URL);
}

// Helper function for API requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        if (import.meta.env.DEV) {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (import.meta.env.DEV) {
            console.log(`📡 API Response: ${response.status} ${response.statusText}`, response);
        }

        if (!response.ok) {
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                const text = await response.text().catch(() => '');
                errorMessage = text || errorMessage;
            }

            // Check for CORS errors
            if (response.status === 0 || response.type === 'opaque') {
                errorMessage = `CORS Error: The backend may not be allowing requests from ${window.location.origin}. Check backend CORS configuration.`;
            }

            console.error(`❌ API Error: ${errorMessage}`, {
                url,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null as T;
        }

        const data = await response.json();
        if (import.meta.env.DEV) {
            console.log(`✅ API Success:`, data);
        }
        return data;
    } catch (error) {
        // Network errors, CORS errors, etc.
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error(`❌ Network Error: Failed to fetch from ${url}`, error);

            // Check if it's a CORS error (no response received)
            const isCorsError = error.message.includes('Failed to fetch') || error.message.includes('NetworkError');

            if (isCorsError) {
                const corsError = new Error(
                    `CORS Error: Backend at ${API_BASE_URL} is not allowing requests from ${window.location.origin}. ` +
                    `Please update ALLOWED_ORIGINS in Vercel to include ${window.location.origin} and redeploy the backend. ` +
                    `See UPDATE-VERCEL-CORS.md for detailed instructions.`
                );
                console.error('🚨 CORS Error Details:', {
                    origin: window.location.origin,
                    apiUrl: API_BASE_URL,
                    endpoint: url,
                    error: error.message
                });
                throw corsError;
            }

            throw new Error(`Network Error: Cannot connect to API at ${url}. Check if the backend is running and CORS is configured correctly.`);
        }
        throw error;
    }
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
        igFollowers: backendMetrics.ig_followers || 0,
        igViews: backendMetrics.ig_views || 0,
        igInteractions: backendMetrics.ig_interactions || 0,
        twitterFollowers: backendMetrics.twitter_followers || 0,
        twitterImpressions: backendMetrics.twitter_impressions || 0,
        twitterEngagements: backendMetrics.twitter_engagements || 0,
    },
    manualScores: {
        creativity: backendMetrics.creativity || 0,
        proactivity: backendMetrics.proactivity || 0,
        leadership: backendMetrics.leadership || 0,
        collaboration: backendMetrics.collaboration || 0,
    },
    bonusFollowers: backendMetrics.bonus_followers || 0, // Default to 0 if undefined/null
    basedOnStrategistGrowth: backendMetrics.based_on_strategist_growth,
    comments: backendMetrics.comments,
});

export const toFrontendStrategists = (backendStrategists: any): WeeklyStrategists => ({
    week: backendStrategists.week,
    strategistIds: backendStrategists.strategist_ids,
});

