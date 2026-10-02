import { supabase } from '../lib/supabase';
import { Profile } from './authService';

export interface GolfClub {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  member_count?: number;
}

export interface MapTile {
  id: string;
  club_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  upload_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  uploaded_at: string;
  uploaded_by: string;
  club_name?: string;
}

export interface AdminUser extends Profile {
  role: 'admin' | 'client';
  last_sign_in_at: string | null;
  clubs_count?: number;
}

class AdminService {
  // User Management
  async getUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as AdminUser[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // First, delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Note: Deleting from auth.users requires admin privileges
      // This should be done via a Supabase Edge Function for security
      // For now, we'll just delete the profile
      console.log('User profile deleted. User deletion from auth.users requires edge function.');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: 'admin' | 'client'): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Golf Club Management
  async getGolfClubs(): Promise<GolfClub[]> {
    try {
      const { data, error } = await supabase
        .from('golf_clubs')
        .select(`
          *,
          club_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching golf clubs:', error);
      throw error;
    }
  }

  async createGolfClub(club: Omit<GolfClub, 'id' | 'created_at' | 'updated_at'>): Promise<GolfClub> {
    try {
      const { data, error } = await supabase
        .from('golf_clubs')
        .insert(club)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating golf club:', error);
      throw error;
    }
  }

  async updateGolfClub(id: string, updates: Partial<GolfClub>): Promise<GolfClub> {
    try {
      const { data, error } = await supabase
        .from('golf_clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating golf club:', error);
      throw error;
    }
  }

  async deleteGolfClub(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('golf_clubs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting golf club:', error);
      throw error;
    }
  }

  // Map Tiles Management
  async getMapTiles(): Promise<MapTile[]> {
    try {
      const { data, error } = await supabase
        .from('map_tiles')
        .select(`
          *,
          golf_clubs(name)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching map tiles:', error);
      throw error;
    }
  }

  async createMapTile(tile: Omit<MapTile, 'id' | 'uploaded_at' | 'club_name'>): Promise<MapTile> {
    try {
      const { data, error } = await supabase
        .from('map_tiles')
        .insert({
          ...tile,
          upload_status: 'pending'
        })
        .select(`
          *,
          golf_clubs(name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating map tile:', error);
      throw error;
    }
  }

  async updateMapTileStatus(id: string, status: MapTile['upload_status']): Promise<MapTile> {
    try {
      const { data, error } = await supabase
        .from('map_tiles')
        .update({ upload_status: status })
        .eq('id', id)
        .select(`
          *,
          golf_clubs(name)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating map tile status:', error);
      throw error;
    }
  }

  async deleteMapTile(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('map_tiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting map tile:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalClubs: number;
    totalUploads: number;
    recentActivity: number;
  }> {
    try {
      const [usersResult, clubsResult, tilesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('golf_clubs').select('id', { count: 'exact' }),
        supabase.from('map_tiles').select('id', { count: 'exact' })
      ]);

      return {
        totalUsers: usersResult.count || 0,
        totalClubs: clubsResult.count || 0,
        totalUploads: tilesResult.count || 0,
        recentActivity: 0 // TODO: Implement activity tracking
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        totalClubs: 0,
        totalUploads: 0,
        recentActivity: 0
      };
    }
  }
}

export const adminService = new AdminService();
