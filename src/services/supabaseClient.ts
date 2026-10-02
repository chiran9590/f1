import { createClient } from '@supabase/supabase-js';
import { Profile, GolfClub, MapTile, DashboardStats } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Auth Services
export const authService = {
  async signUp(email: string, password: string, fullName: string, role: 'admin' | 'client') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    
    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
        });
      
      if (profileError) throw profileError;
    }

    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Profile Services
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Golf Club Services
export const golfClubService = {
  async getGolfClubs(): Promise<GolfClub[]> {
    const { data, error } = await supabase
      .from('golf_clubs')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getGolfClub(id: string): Promise<GolfClub | null> {
    const { data, error } = await supabase
      .from('golf_clubs')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createGolfClub(club: Omit<GolfClub, 'id' | 'created_at' | 'updated_at'>): Promise<GolfClub> {
    const { data, error } = await supabase
      .from('golf_clubs')
      .insert(club)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateGolfClub(id: string, updates: Partial<GolfClub>): Promise<GolfClub> {
    const { data, error } = await supabase
      .from('golf_clubs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteGolfClub(id: string): Promise<void> {
    const { error } = await supabase
      .from('golf_clubs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Map Tile Services
export const mapTileService = {
  async getMapTiles(filters?: {
    club_id?: string;
    client_user_id?: string;
    analysis_status?: string;
  }): Promise<MapTile[]> {
    let query = supabase
      .from('map_tiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.club_id) {
      query = query.eq('club_id', filters.club_id);
    }
    if (filters?.client_user_id) {
      query = query.eq('client_user_id', filters.client_user_id);
    }
    if (filters?.analysis_status) {
      query = query.eq('analysis_status', filters.analysis_status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getMapTile(id: string): Promise<MapTile | null> {
    const { data, error } = await supabase
      .from('map_tiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createMapTile(tile: Omit<MapTile, 'id' | 'created_at' | 'updated_at'>): Promise<MapTile> {
    const { data, error } = await supabase
      .from('map_tiles')
      .insert(tile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMapTile(id: string, updates: Partial<MapTile>): Promise<MapTile> {
    const { data, error } = await supabase
      .from('map_tiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMapTile(id: string): Promise<void> {
    const { error } = await supabase
      .from('map_tiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTilesByClient(clientUserId: string): Promise<MapTile[]> {
    return this.getMapTiles({ client_user_id: clientUserId });
  },

  async getTilesByClub(clubId: string): Promise<MapTile[]> {
    return this.getMapTiles({ club_id: clubId });
  },
};

// Dashboard Stats Service
export const dashboardService = {
  async getDashboardStats(clientUserId?: string): Promise<DashboardStats> {
    let query = supabase.from('map_tiles').select('*');
    
    if (clientUserId) {
      query = query.eq('client_user_id', clientUserId);
    }

    const { data: tiles, error } = await query;
    if (error) throw error;

    const allTiles = tiles || [];
    const completedTiles = allTiles.filter(tile => tile.analysis_status === 'completed');
    
    const totalTiles = allTiles.length;
    const healthyTiles = completedTiles.filter(tile => (tile.health_score || 0) >= 80).length;
    const stressedTiles = completedTiles.filter(tile => (tile.health_score || 0) >= 50 && (tile.health_score || 0) < 80).length;
    const diseasedTiles = completedTiles.filter(tile => (tile.health_score || 0) < 50).length;
    
    const averageHealthScore = completedTiles.length > 0
      ? completedTiles.reduce((sum, tile) => sum + (tile.health_score || 0), 0) / completedTiles.length
      : 0;

    // Calculate health distribution
    const healthDistribution = completedTiles.reduce((acc, tile) => {
      const areas = tile.class_areas;
      if (areas) {
        acc.healthy += areas.healthy;
        acc.stressed += areas.stressed;
        acc.diseased += areas.diseased;
        acc.bare_ground += areas.bare_ground;
        acc.other += areas.other;
      }
      return acc;
    }, { healthy: 0, stressed: 0, diseased: 0, bare_ground: 0, other: 0 });

    // Normalize percentages
    const values = Object.values(healthDistribution) as number[];
    const total = values.reduce((sum: number, val: number) => sum + val, 0);
    if (total > 0) {
      Object.keys(healthDistribution).forEach(key => {
        healthDistribution[key as keyof typeof healthDistribution] = (healthDistribution[key as keyof typeof healthDistribution] / total) * 100;
      });
    }

    const recentAnalyses = allTiles
      .filter(tile => tile.analysis_status === 'completed')
      .slice(0, 5);

    return {
      total_tiles: totalTiles,
      healthy_tiles: healthyTiles,
      stressed_tiles: stressedTiles,
      diseased_tiles: diseasedTiles,
      average_health_score: Math.round(averageHealthScore * 100) / 100,
      recent_analyses: recentAnalyses,
      health_distribution: healthDistribution,
    };
  },
};

// Export all services
export default {
  supabase,
  authService,
  profileService,
  golfClubService,
  mapTileService,
  dashboardService,
};
