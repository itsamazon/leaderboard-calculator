import { supabase } from '../config/database';
import { InternProfile } from '../types';

export class InternService {
    async getAllInterns(): Promise<InternProfile[]> {
        const { data, error } = await supabase
            .from('intern_profiles')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    }

    async getInternById(id: string): Promise<InternProfile | null> {
        const { data, error } = await supabase
            .from('intern_profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }

    async createIntern(name: string, notes?: string): Promise<InternProfile> {
        const { data, error } = await supabase
            .from('intern_profiles')
            .insert({ name, notes })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateIntern(id: string, updates: { name?: string; notes?: string }): Promise<InternProfile> {
        const { data, error } = await supabase
            .from('intern_profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteIntern(id: string): Promise<void> {
        // First delete related records
        await supabase.from('weekly_metrics').delete().eq('intern_id', id);

        // Then delete the intern
        const { error } = await supabase
            .from('intern_profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export default new InternService();

