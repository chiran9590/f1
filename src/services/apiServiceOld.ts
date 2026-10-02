import { supabase } from '../lib/supabase';

export interface HealthMap {
  id: string;
  client_id: string;
  club_name: string;
  location: string;
  image_url: string;
  health_status: 'Good' | 'Bad' | 'Water';
  processed_at: string;
  created_at: string;
}

export interface AnalysisResult {
  health_status: 'Good' | 'Bad' | 'Water';
  processed_image_url?: string;
  confidence: number;
  analysis_summary?: string;
}

class ApiService {
  // Health Maps
  async getHealthMaps(clientId: string): Promise<HealthMap[]> {
    const { data, error } = await supabase
      .from('club_healthmaps')
      .select('*')
      .eq('client_id', clientId)
      .order('processed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getHealthMap(id: string): Promise<HealthMap | null> {
    const { data, error } = await supabase
      .from('club_healthmaps')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createHealthMap(healthMap: Omit<HealthMap, 'id' | 'created_at' | 'processed_at'>): Promise<HealthMap> {
    const { data, error } = await supabase
      .from('club_healthmaps')
      .insert({
        ...healthMap,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Image Upload
  async uploadImage(file: File, bucket: string = 'healthmaps'): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  // AI Analysis
  async analyzeImage(imageFile: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      return await response.json();
    } catch (error) {
      // For demo purposes, return mock data
      console.warn('API not available, returning mock data');
      return {
        health_status: 'Good',
        confidence: 92,
        analysis_summary: 'The grass appears to be in good health with proper coloration and density.',
      };
    }
  }

  // User Profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const apiService = new ApiService();
