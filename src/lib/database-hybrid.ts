import { InternProfile, WeeklyMetrics, WeeklyStrategists } from '../types';
import {
    adaptWeeklyMetrics,
    adaptWeeklyMetricsToSupabase,
    adaptInternProfile,
    adaptInternProfileToSupabase,
    adaptWeeklyStrategists,
    adaptWeeklyStrategistsToSupabase
} from './type-adapter';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || (process as any).env?.REACT_APP_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (process as any).env?.REACT_APP_SUPABASE_ANON_KEY;
    return !!(url && key && url !== 'your_supabase_project_url_here');
};

// Import local database functions
import * as localDb from './database-local';

// Log which mode we're using
if (isSupabaseConfigured()) {
    console.log('🔗 Supabase configured - will use live database');
} else {
    console.log('🔧 Using local mock data - set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to connect to live database');
}

// For now, always use local data with type adapters
export const getInternProfiles = async (): Promise<InternProfile[]> => {
    const supabaseProfiles = await localDb.getInternProfiles();
    return supabaseProfiles.map(adaptInternProfile);
};

export const createInternProfile = async (profile: Omit<InternProfile, 'id'>): Promise<InternProfile> => {
    const supabaseProfile = await localDb.createInternProfile(adaptInternProfileToSupabase(profile));
    return adaptInternProfile(supabaseProfile);
};

export const updateInternProfile = async (id: string, updates: Partial<InternProfile>): Promise<InternProfile> => {
    const supabaseUpdates = adaptInternProfileToSupabase(updates as Omit<InternProfile, 'id'>);
    const supabaseProfile = await localDb.updateInternProfile(id, supabaseUpdates);
    return adaptInternProfile(supabaseProfile);
};

export const deleteInternProfile = async (id: string): Promise<void> => {
    return localDb.deleteInternProfile(id);
};

export const getWeeklyStrategists = async (): Promise<WeeklyStrategists[]> => {
    const supabaseStrategists = await localDb.getWeeklyStrategists();
    return supabaseStrategists.map(adaptWeeklyStrategists);
};

export const createWeeklyStrategists = async (strategists: Omit<WeeklyStrategists, 'id'>): Promise<WeeklyStrategists> => {
    const supabaseStrategists = await localDb.createWeeklyStrategists(adaptWeeklyStrategistsToSupabase(strategists));
    return adaptWeeklyStrategists(supabaseStrategists);
};

export const updateWeeklyStrategists = async (week: string, strategistIds: string[]): Promise<WeeklyStrategists> => {
    const supabaseStrategists = await localDb.updateWeeklyStrategists(week, strategistIds);
    return adaptWeeklyStrategists(supabaseStrategists);
};

export const deleteWeeklyStrategists = async (week: string): Promise<void> => {
    return localDb.deleteWeeklyStrategists(week);
};

export const getWeeklyMetrics = async (): Promise<WeeklyMetrics[]> => {
    const supabaseMetrics = await localDb.getWeeklyMetrics();
    return supabaseMetrics.map(adaptWeeklyMetrics);
};

export const getWeeklyMetricsByWeek = async (week: string): Promise<WeeklyMetrics[]> => {
    const supabaseMetrics = await localDb.getWeeklyMetricsByWeek(week);
    return supabaseMetrics.map(adaptWeeklyMetrics);
};

export const createWeeklyMetrics = async (metrics: Omit<WeeklyMetrics, 'id'>): Promise<WeeklyMetrics> => {
    const supabaseMetrics = await localDb.createWeeklyMetrics(adaptWeeklyMetricsToSupabase(metrics));
    return adaptWeeklyMetrics(supabaseMetrics);
};

export const updateWeeklyMetrics = async (id: string, updates: Partial<WeeklyMetrics>): Promise<WeeklyMetrics> => {
    const supabaseUpdates = adaptWeeklyMetricsToSupabase(updates as WeeklyMetrics);
    const supabaseMetrics = await localDb.updateWeeklyMetrics(id, supabaseUpdates);
    return adaptWeeklyMetrics(supabaseMetrics);
};

export const deleteWeeklyMetrics = async (id: string): Promise<void> => {
    return localDb.deleteWeeklyMetrics(id);
};

export const subscribeToInternProfiles = (callback: (profiles: InternProfile[]) => void) => {
    return localDb.subscribeToInternProfiles((supabaseProfiles) => {
        callback(supabaseProfiles.map(adaptInternProfile));
    });
};

export const subscribeToWeeklyStrategists = (callback: (strategists: WeeklyStrategists[]) => void) => {
    return localDb.subscribeToWeeklyStrategists((supabaseStrategists) => {
        callback(supabaseStrategists.map(adaptWeeklyStrategists));
    });
};

export const subscribeToWeeklyMetrics = (callback: (metrics: WeeklyMetrics[]) => void) => {
    return localDb.subscribeToWeeklyMetrics((supabaseMetrics) => {
        callback(supabaseMetrics.map(adaptWeeklyMetrics));
    });
};
