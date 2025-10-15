// Local fallback for development without Supabase
// This file provides mock data and functions for local development

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

// Mock data for local development
const mockProfiles: InternProfile[] = [
    { id: '1', name: 'Chidera Okeke', notes: 'Strong creative vision with excellent social media engagement.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Amara Nwosu', notes: 'Highly organized and detail-oriented.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: 'Ibrahim Hassan', notes: 'Natural strategist with strong analytical skills.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4', name: 'Zainab Abubakar', notes: 'Creative problem-solver with excellent communication skills.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '5', name: 'Oluwaseun Adeyemi', notes: 'Team player with strong collaborative skills.', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockStrategists: WeeklyStrategists[] = [
    { id: '1', week: 'Week 1', strategist_ids: ['1', '3'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockMetrics: WeeklyMetrics[] = [
    // Week 1 data
    {
        id: '1',
        intern_id: '1',
        week: 'Week 1',
        role: 'Strategist',
        ig_followers: 450,
        ig_views: 75000,
        ig_interactions: 1200,
        twitter_followers: 320,
        twitter_impressions: 45000,
        twitter_engagements: 800,
        creativity: 8,
        proactivity: 7,
        leadership: 9,
        collaboration: 0,
        bonus_followers: 50,
        based_on_strategist_growth: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: '2',
        intern_id: '2',
        week: 'Week 1',
        role: 'Support',
        ig_followers: 380,
        ig_views: 62000,
        ig_interactions: 950,
        twitter_followers: 280,
        twitter_impressions: 38000,
        twitter_engagements: 650,
        creativity: 7,
        proactivity: 8,
        leadership: 0,
        collaboration: 9,
        bonus_followers: 30,
        based_on_strategist_growth: 38.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    // Add more mock data as needed...
];

// Mock functions that simulate database calls
export const getInternProfiles = async (): Promise<InternProfile[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockProfiles), 100));
};

export const createInternProfile = async (profile: Omit<InternProfile, 'id' | 'created_at' | 'updated_at'>): Promise<InternProfile> => {
    const newProfile: InternProfile = {
        ...profile,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockProfiles.push(newProfile);
    return newProfile;
};

export const updateInternProfile = async (id: string, updates: Partial<InternProfile>): Promise<InternProfile> => {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Profile not found');

    mockProfiles[index] = { ...mockProfiles[index], ...updates, updated_at: new Date().toISOString() };
    return mockProfiles[index];
};

export const deleteInternProfile = async (id: string): Promise<void> => {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Profile not found');
    mockProfiles.splice(index, 1);
};

export const getWeeklyStrategists = async (): Promise<WeeklyStrategists[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockStrategists), 100));
};

export const createWeeklyStrategists = async (strategists: Omit<WeeklyStrategists, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyStrategists> => {
    const newStrategists: WeeklyStrategists = {
        ...strategists,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockStrategists.push(newStrategists);
    return newStrategists;
};

export const updateWeeklyStrategists = async (week: string, strategistIds: string[]): Promise<WeeklyStrategists> => {
    const index = mockStrategists.findIndex(s => s.week === week);
    if (index === -1) throw new Error('Week not found');

    mockStrategists[index] = { ...mockStrategists[index], strategist_ids: strategistIds, updated_at: new Date().toISOString() };
    return mockStrategists[index];
};

export const deleteWeeklyStrategists = async (week: string): Promise<void> => {
    const index = mockStrategists.findIndex(s => s.week === week);
    if (index === -1) throw new Error('Week not found');
    mockStrategists.splice(index, 1);
};

export const getWeeklyMetrics = async (): Promise<WeeklyMetrics[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockMetrics), 100));
};

export const getWeeklyMetricsByWeek = async (week: string): Promise<WeeklyMetrics[]> => {
    return new Promise(resolve => setTimeout(() => resolve(mockMetrics.filter(m => m.week === week)), 100));
};

export const createWeeklyMetrics = async (metrics: Omit<WeeklyMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyMetrics> => {
    const newMetrics: WeeklyMetrics = {
        ...metrics,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockMetrics.push(newMetrics);
    return newMetrics;
};

export const updateWeeklyMetrics = async (id: string, updates: Partial<WeeklyMetrics>): Promise<WeeklyMetrics> => {
    const index = mockMetrics.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Metrics not found');

    mockMetrics[index] = { ...mockMetrics[index], ...updates, updated_at: new Date().toISOString() };
    return mockMetrics[index];
};

export const deleteWeeklyMetrics = async (id: string): Promise<void> => {
    const index = mockMetrics.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Metrics not found');
    mockMetrics.splice(index, 1);
};

// Mock real-time subscriptions (just return empty unsubscribe functions)
export const subscribeToInternProfiles = (callback: (profiles: InternProfile[]) => void) => {
    // Simulate real-time updates by calling callback after a delay
    setTimeout(() => callback(mockProfiles), 200);

    return {
        unsubscribe: () => { }
    };
};

export const subscribeToWeeklyStrategists = (callback: (strategists: WeeklyStrategists[]) => void) => {
    setTimeout(() => callback(mockStrategists), 200);

    return {
        unsubscribe: () => { }
    };
};

export const subscribeToWeeklyMetrics = (callback: (metrics: WeeklyMetrics[]) => void) => {
    setTimeout(() => callback(mockMetrics), 200);

    return {
        unsubscribe: () => { }
    };
};
