import { InternProfile, WeeklyMetrics, WeeklyStrategists } from '../types';

const PROFILES_KEY = 'studio-x-intern-profiles';
const METRICS_KEY = 'studio-x-weekly-metrics';
const STRATEGISTS_KEY = 'studio-x-weekly-strategists';

// Intern Profiles
export function saveProfiles(profiles: InternProfile[]): void {
    try {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (error) {
        console.error('Error saving profiles to localStorage:', error);
    }
}

export function loadProfiles(): InternProfile[] {
    try {
        const stored = localStorage.getItem(PROFILES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading profiles from localStorage:', error);
        return [];
    }
}

// Weekly Metrics
export function saveWeeklyMetrics(metrics: WeeklyMetrics[]): void {
    try {
        localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
    } catch (error) {
        console.error('Error saving metrics to localStorage:', error);
    }
}

export function loadWeeklyMetrics(): WeeklyMetrics[] {
    try {
        const stored = localStorage.getItem(METRICS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading metrics from localStorage:', error);
        return [];
    }
}

// Weekly Strategists
export function saveWeeklyStrategists(strategists: WeeklyStrategists[]): void {
    try {
        localStorage.setItem(STRATEGISTS_KEY, JSON.stringify(strategists));
    } catch (error) {
        console.error('Error saving strategists to localStorage:', error);
    }
}

export function loadWeeklyStrategists(): WeeklyStrategists[] {
    try {
        const stored = localStorage.getItem(STRATEGISTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error loading strategists from localStorage:', error);
        return [];
    }
}

export function clearAllData(): void {
    try {
        localStorage.removeItem(PROFILES_KEY);
        localStorage.removeItem(METRICS_KEY);
        localStorage.removeItem(STRATEGISTS_KEY);
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}
