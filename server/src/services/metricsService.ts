import { supabase } from '../config/database';
import { WeeklyMetrics } from '../types';

export class MetricsService {
    async getAllMetrics(): Promise<WeeklyMetrics[]> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .select('*')
            .order('week');

        if (error) throw error;
        return data || [];
    }

    async getMetricsByWeek(week: string): Promise<WeeklyMetrics[]> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .select('*')
            .eq('week', week);

        if (error) throw error;
        return data || [];
    }

    async getMetricsByIntern(internId: string): Promise<WeeklyMetrics[]> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .select('*')
            .eq('intern_id', internId)
            .order('week');

        if (error) throw error;
        return data || [];
    }

    async getMetricById(id: string): Promise<WeeklyMetrics | null> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    async createMetrics(metrics: Omit<WeeklyMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyMetrics> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .insert(metrics)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateMetrics(id: string, updates: Partial<Omit<WeeklyMetrics, 'id' | 'created_at' | 'updated_at'>>): Promise<WeeklyMetrics> {
        const { data, error } = await supabase
            .from('weekly_metrics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteMetrics(id: string): Promise<void> {
        const { error } = await supabase
            .from('weekly_metrics')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async deleteMetricsByWeek(week: string): Promise<void> {
        const { error } = await supabase
            .from('weekly_metrics')
            .delete()
            .eq('week', week);

        if (error) throw error;
    }

    async deleteMetricsByIntern(internId: string): Promise<void> {
        const { error } = await supabase
            .from('weekly_metrics')
            .delete()
            .eq('intern_id', internId);

        if (error) throw error;
    }
}

export default new MetricsService();

