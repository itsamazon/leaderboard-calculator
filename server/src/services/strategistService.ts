import { supabase } from '../config/database';
import { WeeklyStrategists } from '../types';

export class StrategistService {
    async getAllWeeklyStrategists(): Promise<WeeklyStrategists[]> {
        const { data, error } = await supabase
            .from('weekly_strategists')
            .select('*')
            .order('week');

        if (error) throw error;
        return data || [];
    }

    async getStrategistsByWeek(week: string): Promise<WeeklyStrategists | null> {
        const { data, error } = await supabase
            .from('weekly_strategists')
            .select('*')
            .eq('week', week)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    async createWeeklyStrategists(week: string, strategistIds: string[]): Promise<WeeklyStrategists> {
        if (strategistIds.length !== 2) {
            throw new Error('Exactly 2 strategists must be selected per week');
        }

        const { data, error } = await supabase
            .from('weekly_strategists')
            .insert({ week, strategist_ids: strategistIds })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateWeeklyStrategists(week: string, strategistIds: string[]): Promise<WeeklyStrategists> {
        if (strategistIds.length !== 2) {
            throw new Error('Exactly 2 strategists must be selected per week');
        }

        const { data, error } = await supabase
            .from('weekly_strategists')
            .update({ strategist_ids: strategistIds })
            .eq('week', week)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteWeeklyStrategists(week: string): Promise<void> {
        // First delete related metrics
        await supabase.from('weekly_metrics').delete().eq('week', week);

        // Then delete strategists assignment
        const { error } = await supabase
            .from('weekly_strategists')
            .delete()
            .eq('week', week);

        if (error) throw error;
    }
}

export default new StrategistService();

