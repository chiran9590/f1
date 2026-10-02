import { 
  InstantAnalysisRequest, 
  InstantAnalysisResponse, 
  TileAnalysisRequest, 
  TileAnalysisResponse, 
  JobStatusResponse,
  ApiResponse,
  ClassAreas
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async uploadFile(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {}
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('image', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; model_loaded: boolean }>> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const data = await res.json();
      return {
        success: res.ok,
        data: {
          status: data?.status ?? 'unknown',
          model_loaded: true, // Demo backend always returns healthy.
        },
        error: res.ok ? undefined : data?.detail || 'Health check failed',
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Health check failed',
      };
    }
  }

  // Instant Analysis
  async performInstantAnalysis(request: InstantAnalysisRequest): Promise<ApiResponse<InstantAnalysisResponse>> {
    try {
      // Backend expects multipart `file` and `club_name`.
      const formData = new FormData();
      formData.append('file', request.image);
      if (request.club_id) formData.append('club_name', request.club_id);

      const uploadRes = await fetch(`${API_BASE_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData?.detail || uploadData?.message || 'Upload failed');
      }

      const fileId: string = uploadData.file_id;
      if (!fileId) throw new Error('Missing file_id from backend');

      // Poll processing status until completion.
      const maxAttempts = 120; // ~2 minutes with 1s interval
      const intervalMs = 1000;
      for (let i = 0; i < maxAttempts; i++) {
        const statusRes = await fetch(`${API_BASE_URL}/process-status/${fileId}`);
        const statusData = await statusRes.json();
        if (!statusRes.ok) {
          throw new Error(statusData?.detail || statusData?.message || 'Status check failed');
        }

        if (statusData?.status === 'completed') {
          const resultsRes = await fetch(`${API_BASE_URL}/results/${fileId}`);
          const resultsData = await resultsRes.json();
          if (!resultsRes.ok) {
            throw new Error(resultsData?.detail || resultsData?.message || 'Failed to fetch results');
          }

          // Match frontend's expected response shape.
          const mapped: InstantAnalysisResponse = {
            analysis_id: resultsData.analysis_id ?? fileId,
            overlay_url: resultsData.overlay_url ?? '',
            health_score: Number(resultsData.health_score ?? 0),
            class_areas: resultsData.class_areas ?? {
              healthy: 0,
              stressed: 0,
              diseased: 0,
              bare_ground: 0,
              other: 0,
            },
            processing_time: Number(resultsData.processing_time ?? 0),
          };

          return { success: true, data: mapped };
        }

        if (statusData?.status === 'failed') {
          throw new Error(statusData?.message || 'Analysis failed');
        }

        await new Promise((r) => setTimeout(r, intervalMs));
      }

      return { success: false, error: 'Analysis timed out' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instant analysis failed',
      };
    }
  }

  // Orthomosaic Analysis (Async)
  async performOrthomosaicAnalysis(
    imageFile: File,
    clubId?: string,
    tileName?: string
  ): Promise<ApiResponse<{ job_id: string }>> {
    const additionalData: Record<string, any> = {};
    if (clubId) additionalData.club_id = clubId;
    if (tileName) additionalData.tile_name = tileName;

    return this.uploadFile('/analysis/orthomosaic', imageFile, additionalData);
  }

  // Get Job Status
  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
    return this.request(`/analysis/${jobId}`);
  }

  // Poll Job Status (with timeout)
  async pollJobStatus(
    jobId: string, 
    maxAttempts: number = 30, 
    intervalMs: number = 2000
  ): Promise<ApiResponse<JobStatusResponse>> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.getJobStatus(jobId);
      
      if (!result.success) {
        return result;
      }

      const status = result.data!;
      
      if (status.status === 'completed') {
        return result;
      }

      if (status.status === 'failed') {
        return {
          success: false,
          error: status.error || 'Job failed',
        };
      }

      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    return {
      success: false,
      error: 'Job timed out',
    };
  }

  // Tile Analysis (Admin triggered)
  async triggerTileAnalysis(request: TileAnalysisRequest): Promise<ApiResponse<TileAnalysisResponse>> {
    return this.request('/tiles/analyse', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Upload Services (for Cloudflare R2 integration)
  async getPresignedUploadUrl(
    fileName: string, 
    folder: 'tiles' | 'overlays' | 'metadata' = 'tiles'
  ): Promise<ApiResponse<{ upload_url: string; key: string; public_url: string }>> {
    return this.request(`/upload/presign?filename=${fileName}&folder=${folder}`);
  }

  async saveMetadata(
    tileId: string, 
    metadata: {
      health_score: number;
      class_areas: ClassAreas;
      analysis_timestamp: string;
      model_version: string;
    }
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request('/upload/save-metadata', {
      method: 'POST',
      body: JSON.stringify({
        tile_id: tileId,
        metadata,
      }),
    });
  }

  // Utility method to handle file uploads to Cloudflare R2
  async uploadToCloudflareR2(
    file: File,
    folder: 'tiles' | 'overlays' | 'metadata' = 'tiles'
  ): Promise<ApiResponse<{ publicUrl: string; key: string }>> {
    // Get presigned URL
    const presignedResult = await this.getPresignedUploadUrl(file.name, folder);
    
    if (!presignedResult.success) {
      return {
        success: false,
        error: presignedResult.error,
      };
    }

    const { upload_url, key, public_url } = presignedResult.data!;

    try {
      // Upload file directly to R2
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      return {
        success: true,
        data: {
          publicUrl: public_url,
          key: key,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Batch analysis for multiple tiles
  async analyzeMultipleTiles(
    tiles: Array<{
      id: string;
      cloudflare_url: string;
      club_id: string;
      client_user_id: string;
    }>,
    supabaseToken: string
  ): Promise<ApiResponse<{ results: TileAnalysisResponse[] }>> {
    const requests = tiles.map(tile => 
      this.triggerTileAnalysis({
        tile_id: tile.id,
        cloudflare_url: tile.cloudflare_url,
        club_id: tile.club_id,
        client_user_id: tile.client_user_id,
        supabase_token: supabaseToken,
      })
    );

    try {
      const results = await Promise.allSettled(requests);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<TileAnalysisResponse>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data!);

      const failed = results.filter(result => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      if (failed.length > 0) {
        console.warn(`${failed.length} tile analyses failed`);
      }

      return {
        success: true,
        data: {
          results: successful,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch analysis failed',
      };
    }
  }

  // Model information
  async getModelInfo(): Promise<ApiResponse<{
    model_version: string;
    classes: string[];
    input_shape: number[];
  }>> {
    return this.request('/model/info');
  }
}

export const apiService = new ApiService();
export default apiService;
