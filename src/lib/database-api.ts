// Database layer that uses the REST API backend
import { InternProfile, WeeklyMetrics, WeeklyStrategists } from '../types';
import {
    internAPI,
    strategistAPI,
    metricsAPI,
    toBackendMetrics,
    toFrontendMetrics,
    toFrontendStrategists
} from './api-client';

// Intern operations
export const getInternProfiles = async (): Promise<InternProfile[]> => {
    return internAPI.getAll();
};

export const createInternProfile = async (profile: Omit<InternProfile, 'id'>): Promise<InternProfile> => {
    return internAPI.create(profile.name, profile.notes);
};

export const updateInternProfile = async (id: string, updates: Partial<InternProfile>): Promise<InternProfile> => {
    return internAPI.update(id, updates);
};

export const deleteInternProfile = async (id: string): Promise<void> => {
    return internAPI.delete(id);
};

// Weekly strategists operations
export const getWeeklyStrategists = async (): Promise<WeeklyStrategists[]> => {
    const backendData = await strategistAPI.getAll();
    return backendData.map(toFrontendStrategists);
};

export const createWeeklyStrategists = async (strategists: Omit<WeeklyStrategists, 'id'>): Promise<WeeklyStrategists> => {
    const backendData = await strategistAPI.create(strategists.week, strategists.strategistIds);
    return toFrontendStrategists(backendData);
};

export const updateWeeklyStrategists = async (week: string, strategistIds: string[]): Promise<WeeklyStrategists> => {
    const backendData = await strategistAPI.update(week, strategistIds);
    return toFrontendStrategists(backendData);
};

export const deleteWeeklyStrategists = async (week: string): Promise<void> => {
    return strategistAPI.delete(week);
};

// Weekly metrics operations
export const getWeeklyMetrics = async (): Promise<WeeklyMetrics[]> => {
    const backendData = await metricsAPI.getAll();
    return backendData.map(toFrontendMetrics);
};

export const getWeeklyMetricsByWeek = async (week: string): Promise<WeeklyMetrics[]> => {
    const backendData = await metricsAPI.getByWeek(week);
    return backendData.map(toFrontendMetrics);
};

export const createWeeklyMetrics = async (metrics: Omit<WeeklyMetrics, 'id'>): Promise<WeeklyMetrics> => {
    const backendMetrics = toBackendMetrics(metrics);
    const backendData = await metricsAPI.create(backendMetrics);
    return toFrontendMetrics(backendData);
};

export const updateWeeklyMetrics = async (id: string, updates: Partial<WeeklyMetrics>): Promise<WeeklyMetrics> => {
    const backendUpdates = updates.internId ? toBackendMetrics(updates as Omit<WeeklyMetrics, 'id'>) : {};
    const backendData = await metricsAPI.update(id, backendUpdates);
    return toFrontendMetrics(backendData);
};

export const deleteWeeklyMetrics = async (id: string): Promise<void> => {
    return metricsAPI.delete(id);
};

// Subscription functions (polling-based for REST API)
// Note: For real-time updates, you could use WebSockets or Server-Sent Events
// For now, these return empty cleanup functions since we'll use regular polling

export const subscribeToInternProfiles = (_callback: (profiles: InternProfile[]) => void) => {
    // Return empty cleanup function - data will be fetched on mount
    return () => { };
};

export const subscribeToWeeklyStrategists = (_callback: (strategists: WeeklyStrategists[]) => void) => {
    // Return empty cleanup function - data will be fetched on mount
    return () => { };
};

export const subscribeToWeeklyMetrics = (_callback: (metrics: WeeklyMetrics[]) => void) => {
    // Return empty cleanup function - data will be fetched on mount
    return () => { };
};

