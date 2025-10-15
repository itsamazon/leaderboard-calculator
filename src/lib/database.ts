import { supabase, InternProfile, WeeklyStrategists, WeeklyMetrics } from './supabase';

// Intern Profiles
export const getInternProfiles = async (): Promise<InternProfile[]> => {
    const { data, error } = await supabase
        .from('intern_profiles')
        .select('*')
        .order('name');

    if (error) throw error;
    return data || [];
};

export const createInternProfile = async (profile: Omit<InternProfile, 'id' | 'created_at' | 'updated_at'>): Promise<InternProfile> => {
    const { data, error } = await supabase
        .from('intern_profiles')
        .insert(profile)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateInternProfile = async (id: string, updates: Partial<InternProfile>): Promise<InternProfile> => {
    const { data, error } = await supabase
        .from('intern_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteInternProfile = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('intern_profiles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Weekly Strategists
export const getWeeklyStrategists = async (): Promise<WeeklyStrategists[]> => {
    const { data, error } = await supabase
        .from('weekly_strategists')
        .select('*')
        .order('week');

    if (error) throw error;
    return data || [];
};

export const createWeeklyStrategists = async (strategists: Omit<WeeklyStrategists, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyStrategists> => {
    const { data, error } = await supabase
        .from('weekly_strategists')
        .insert(strategists)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateWeeklyStrategists = async (week: string, strategistIds: string[]): Promise<WeeklyStrategists> => {
    const { data, error } = await supabase
        .from('weekly_strategists')
        .update({ strategist_ids: strategistIds })
        .eq('week', week)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteWeeklyStrategists = async (week: string): Promise<void> => {
    const { error } = await supabase
        .from('weekly_strategists')
        .delete()
        .eq('week', week);

    if (error) throw error;
};

// Weekly Metrics
export const getWeeklyMetrics = async (): Promise<WeeklyMetrics[]> => {
    const { data, error } = await supabase
        .from('weekly_metrics')
        .select('*')
        .order('week', { ascending: false })
        .order('intern_id');

    if (error) throw error;
    return data || [];
};

export const getWeeklyMetricsByWeek = async (week: string): Promise<WeeklyMetrics[]> => {
    const { data, error } = await supabase
        .from('weekly_metrics')
        .select('*')
        .eq('week', week);

    if (error) throw error;
    return data || [];
};

export const createWeeklyMetrics = async (metrics: Omit<WeeklyMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyMetrics> => {
    const { data, error } = await supabase
        .from('weekly_metrics')
        .insert(metrics)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateWeeklyMetrics = async (id: string, updates: Partial<WeeklyMetrics>): Promise<WeeklyMetrics> => {
    const { data, error } = await supabase
        .from('weekly_metrics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteWeeklyMetrics = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('weekly_metrics')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Real-time subscriptions
export const subscribeToInternProfiles = (callback: (profiles: InternProfile[]) => void) => {
    return supabase
        .channel('intern_profiles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'intern_profiles' }, async () => {
            const profiles = await getInternProfiles();
            callback(profiles);
        })
        .subscribe();
};

export const subscribeToWeeklyStrategists = (callback: (strategists: WeeklyStrategists[]) => void) => {
    return supabase
        .channel('weekly_strategists')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_strategists' }, async () => {
            const strategists = await getWeeklyStrategists();
            callback(strategists);
        })
        .subscribe();
};

export const subscribeToWeeklyMetrics = (callback: (metrics: WeeklyMetrics[]) => void) => {
    return supabase
        .channel('weekly_metrics')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_metrics' }, async () => {
            const metrics = await getWeeklyMetrics();
            callback(metrics);
        })
        .subscribe();
};
