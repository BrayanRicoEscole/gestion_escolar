
import { supabase } from './client';
import { GrowerAssignment } from 'types';

export const getGrowerAssignments = async (growerId?: string): Promise<GrowerAssignment[]> => {
  let query = supabase
    .from('grower_assignments')
    .select(`
      *,
      profiles:grower_id(full_name),
      stations:station_id(name),
      subjects:subject_id(name)
    `);

  if (growerId) {
    query = query.eq('grower_id', growerId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(item => ({
    ...item,
    grower_name: item.profiles?.full_name,
    station_name: item.stations?.name,
    subject_name: item.subjects?.name
  }));
};

export const createGrowerAssignment = async (assignment: Omit<GrowerAssignment, 'id'>): Promise<GrowerAssignment> => {
  const { data, error } = await supabase
    .from('grower_assignments')
    .insert(assignment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteGrowerAssignment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('grower_assignments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
