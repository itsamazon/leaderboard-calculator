// Local database functions for development without Supabase
// This file provides mock data and functions for local development

import { InternProfile, WeeklyStrategists, WeeklyMetrics } from './supabase-local';

// Mock data for local development - starts empty, you add your own interns
const mockProfiles: InternProfile[] = [];
const mockStrategists: WeeklyStrategists[] = [];
const mockMetrics: WeeklyMetrics[] = [];

// Mock functions that simulate database calls
export const getInternProfiles = async (): Promise<InternProfile[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...mockProfiles]), 100));
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
    return new Promise(resolve => setTimeout(() => resolve([...mockStrategists]), 100));
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
    return new Promise(resolve => setTimeout(() => resolve([...mockMetrics]), 100));
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
    setTimeout(() => callback([...mockProfiles]), 200);

    return {
        unsubscribe: () => { }
    };
};

export const subscribeToWeeklyStrategists = (callback: (strategists: WeeklyStrategists[]) => void) => {
    setTimeout(() => callback([...mockStrategists]), 200);

    return {
        unsubscribe: () => { }
    };
};

export const subscribeToWeeklyMetrics = (callback: (metrics: WeeklyMetrics[]) => void) => {
    setTimeout(() => callback([...mockMetrics]), 200);

    return {
        unsubscribe: () => { }
    };
};
