// User and Authentication Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  full_name?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'client';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Golf Club Types
export interface GolfClub {
  id: string;
  name: string;
  description?: string;
  address?: string;
  mapbox_center: [number, number]; // [lng, lat]
  mapbox_bounds: [number, number, number, number]; // [west, south, east, north]
  created_at: string;
  updated_at: string;
}

// Map Tile Types
export interface MapTile {
  id: string;
  club_id: string;
  client_user_id: string;
  tile_name: string;
  tile_bounds: [number, number, number, number]; // [west, south, east, north]
  cloudflare_url: string;
  overlay_cloudflare_url?: string;
  metadata_cloudflare_url?: string;
  health_score?: number;
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  class_areas?: ClassAreas;
  created_at: string;
  updated_at: string;
}

export interface ClassAreas {
  healthy: number; // percentage
  stressed: number; // percentage
  diseased: number; // percentage
  bare_ground: number; // percentage
  other: number; // percentage
}

// Analysis Types
export interface InstantAnalysisRequest {
  image: File;
  club_id?: string;
  tile_name?: string;
}

export interface InstantAnalysisResponse {
  analysis_id: string;
  overlay_url: string;
  health_score: number;
  class_areas: ClassAreas;
  processing_time: number;
}

export interface TileAnalysisRequest {
  tile_id: string;
  cloudflare_url: string;
  club_id: string;
  client_user_id: string;
  supabase_token: string;
}

export interface TileAnalysisResponse {
  job_id: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface JobStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    overlay_url: string;
    metadata_url: string;
    health_score: number;
    class_areas: ClassAreas;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

// Cloudflare R2 Types
export interface UploadResponse {
  publicUrl: string;
  key: string;
  etag?: string;
}

export interface PresignedUploadResponse {
  upload_url: string;
  key: string;
  public_url: string;
}

export interface MetadataUploadRequest {
  tile_id: string;
  metadata: {
    health_score: number;
    class_areas: ClassAreas;
    analysis_timestamp: string;
    model_version: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Mapbox Types
export type MapboxStyle = 
  | 'satellite-streets-v12'
  | 'satellite-v9'
  | 'streets-v12'
  | 'outdoors-v12'
  | 'light-v11'
  | 'dark-v11';

export interface MapboxImageOverlay {
  id: string;
  url: string;
  bounds: [number, number, number, number];
  opacity: number;
}

// Dashboard Stats Types
export interface DashboardStats {
  total_tiles: number;
  healthy_tiles: number;
  stressed_tiles: number;
  diseased_tiles: number;
  average_health_score: number;
  recent_analyses: MapTile[];
  health_distribution: {
    healthy: number;
    stressed: number;
    diseased: number;
    bare_ground: number;
    other: number;
  };
}

// Form Types
export interface TileFormData {
  club_id: string;
  client_user_id: string;
  tile_name: string;
  tile_bounds: [number, number, number, number];
  image?: File;
}

export interface ClubFormData {
  name: string;
  description?: string;
  address?: string;
  mapbox_center: [number, number];
  mapbox_bounds: [number, number, number, number];
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Loading and UI State Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
}

// Component Props Types
export interface MapProps {
  tiles: MapTile[];
  selectedTile?: MapTile | null;
  onTileSelect?: (tile: MapTile) => void;
  onTileDeselect?: () => void;
  className?: string;
}

export interface TileCardProps {
  tile: MapTile;
  onSelect?: (tile: MapTile) => void;
  onAnalysis?: (tileId: string) => void;
  showActions?: boolean;
}

export interface AnalysisResultProps {
  result: InstantAnalysisResponse | JobStatusResponse;
  tile?: MapTile;
}

// Environment Variable Types
export interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_URL: string;
  VITE_MAPBOX_TOKEN: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
