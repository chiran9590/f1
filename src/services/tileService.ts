import { 
  MapTile, 
  TileFormData, 
  ClassAreas, 
  TileAnalysisRequest
} from '../types';
import { mapTileService } from './supabaseClient';
import { cloudflareService } from './cloudflareService';
import { apiService } from './apiService';

class TileService {
  // Create a new tile record
  async createTile(tileData: TileFormData): Promise<MapTile> {
    try {
      // Upload image to Cloudflare R2 if provided
      let cloudflareUrl = '';
      if (tileData.image) {
        const uploadResult = await cloudflareService.uploadTileImage(
          'temp_tile_id', // Will be replaced after tile creation
          tileData.image
        );
        cloudflareUrl = uploadResult.publicUrl;
      }

      // Create tile record in Supabase
      const newTile = await mapTileService.createMapTile({
        club_id: tileData.club_id,
        client_user_id: tileData.client_user_id,
        tile_name: tileData.tile_name,
        tile_bounds: tileData.tile_bounds,
        cloudflare_url: cloudflareUrl,
        analysis_status: 'pending',
      });

      // If image was uploaded, update the key with actual tile ID
      if (tileData.image && cloudflareUrl) {
        const updatedUploadResult = await cloudflareService.uploadTileImage(
          newTile.id,
          tileData.image
        );
        
        // Update tile with correct URL
        await mapTileService.updateMapTile(newTile.id, {
          cloudflare_url: updatedUploadResult.publicUrl,
        });
        
        newTile.cloudflare_url = updatedUploadResult.publicUrl;
      }

      return newTile;
    } catch (error) {
      throw new Error(`Failed to create tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all tiles for a specific client
  async getTilesForClient(clientUserId: string): Promise<MapTile[]> {
    try {
      return await mapTileService.getTilesByClient(clientUserId);
    } catch (error) {
      throw new Error(`Failed to get tiles for client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all tiles for a specific club
  async getTilesForClub(clubId: string): Promise<MapTile[]> {
    try {
      return await mapTileService.getTilesByClub(clubId);
    } catch (error) {
      throw new Error(`Failed to get tiles for club: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a specific tile by ID
  async getTileById(tileId: string): Promise<MapTile | null> {
    try {
      return await mapTileService.getMapTile(tileId);
    } catch (error) {
      throw new Error(`Failed to get tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update tile information
  async updateTile(tileId: string, updates: Partial<MapTile>): Promise<MapTile> {
    try {
      return await mapTileService.updateMapTile(tileId, updates);
    } catch (error) {
      throw new Error(`Failed to update tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a tile
  async deleteTile(tileId: string): Promise<void> {
    try {
      const tile = await mapTileService.getMapTile(tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }

      // Delete associated files from Cloudflare R2
      if (tile.cloudflare_url) {
        const key = tile.cloudflare_url.split('/').pop() || '';
        await cloudflareService.deleteFromR2(`tiles/${key}`);
      }

      if (tile.overlay_cloudflare_url) {
        const key = tile.overlay_cloudflare_url.split('/').pop() || '';
        await cloudflareService.deleteFromR2(`overlays/${key}`);
      }

      if (tile.metadata_cloudflare_url) {
        const key = tile.metadata_cloudflare_url.split('/').pop() || '';
        await cloudflareService.deleteFromR2(`metadata/${key}`);
      }

      // Delete tile record from Supabase
      await mapTileService.deleteMapTile(tileId);
    } catch (error) {
      throw new Error(`Failed to delete tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trigger ML analysis for a tile
  async analyzeTile(tileId: string, supabaseToken: string): Promise<void> {
    try {
      const tile = await mapTileService.getMapTile(tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }

      if (!tile.cloudflare_url) {
        throw new Error('Tile has no image URL');
      }

      // Update status to processing
      await mapTileService.updateMapTile(tileId, {
        analysis_status: 'processing',
      });

      // Trigger analysis via API
      const analysisRequest: TileAnalysisRequest = {
        tile_id: tileId,
        cloudflare_url: tile.cloudflare_url,
        club_id: tile.club_id,
        client_user_id: tile.client_user_id,
        supabase_token: supabaseToken,
      };

      const result = await apiService.triggerTileAnalysis(analysisRequest);
      
      if (!result.success) {
        // Update status to failed
        await mapTileService.updateMapTile(tileId, {
          analysis_status: 'failed',
        });
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      // Update status to failed
      try {
        await mapTileService.updateMapTile(tileId, {
          analysis_status: 'failed',
        });
      } catch (updateError) {
        console.error('Failed to update tile status:', updateError);
      }
      
      throw new Error(`Failed to analyze tile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Batch analyze multiple tiles
  async analyzeMultipleTiles(tileIds: string[], supabaseToken: string): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const tileId of tileIds) {
      try {
        await this.analyzeTile(tileId, supabaseToken);
        successful.push(tileId);
      } catch (error) {
        console.error(`Failed to analyze tile ${tileId}:`, error);
        failed.push(tileId);
      }
    }

    return { successful, failed };
  }

  // Update tile with analysis results
  async updateTileWithAnalysisResults(
    tileId: string,
    overlayUrl: string,
    metadataUrl: string,
    healthScore: number,
    classAreas: ClassAreas
  ): Promise<MapTile> {
    try {
      return await mapTileService.updateMapTile(tileId, {
        overlay_cloudflare_url: overlayUrl,
        metadata_cloudflare_url: metadataUrl,
        health_score: healthScore,
        class_areas: classAreas,
        analysis_status: 'completed',
      });
    } catch (error) {
      throw new Error(`Failed to update tile with analysis results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get tiles with analysis status
  async getTilesByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<MapTile[]> {
    try {
      return await mapTileService.getMapTiles({ analysis_status: status });
    } catch (error) {
      throw new Error(`Failed to get tiles by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get tiles that need analysis (pending status)
  async getPendingTiles(): Promise<MapTile[]> {
    return this.getTilesByStatus('pending');
  }

  // Get tiles currently being processed
  async getProcessingTiles(): Promise<MapTile[]> {
    return this.getTilesByStatus('processing');
  }

  // Get completed tiles with analysis results
  async getCompletedTiles(): Promise<MapTile[]> {
    return this.getTilesByStatus('completed');
  }

  // Get failed tiles
  async getFailedTiles(): Promise<MapTile[]> {
    return this.getTilesByStatus('failed');
  }

  // Get tile statistics
  async getTileStatistics(clientUserId?: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    averageHealthScore: number;
  }> {
    try {
      const tiles = clientUserId 
        ? await this.getTilesForClient(clientUserId)
        : await mapTileService.getMapTiles();

      const total = tiles.length;
      const pending = tiles.filter(tile => tile.analysis_status === 'pending').length;
      const processing = tiles.filter(tile => tile.analysis_status === 'processing').length;
      const completed = tiles.filter(tile => tile.analysis_status === 'completed').length;
      const failed = tiles.filter(tile => tile.analysis_status === 'failed').length;

      const completedTiles = tiles.filter(tile => tile.analysis_status === 'completed' && tile.health_score);
      const averageHealthScore = completedTiles.length > 0
        ? completedTiles.reduce((sum, tile) => sum + (tile.health_score || 0), 0) / completedTiles.length
        : 0;

      return {
        total,
        pending,
        processing,
        completed,
        failed,
        averageHealthScore: Math.round(averageHealthScore * 100) / 100,
      };
    } catch (error) {
      throw new Error(`Failed to get tile statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Reupload tile image
  async reuploadTileImage(tileId: string, newImage: File): Promise<MapTile> {
    try {
      const tile = await mapTileService.getMapTile(tileId);
      if (!tile) {
        throw new Error('Tile not found');
      }

      // Upload new image
      const uploadResult = await cloudflareService.uploadTileImage(tileId, newImage);

      // Update tile with new URL
      return await mapTileService.updateMapTile(tileId, {
        cloudflare_url: uploadResult.publicUrl,
        analysis_status: 'pending', // Reset to pending for re-analysis
      });
    } catch (error) {
      throw new Error(`Failed to reupload tile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate tile bounds
  validateTileBounds(bounds: [number, number, number, number]): { valid: boolean; error?: string } {
    const [west, south, east, north] = bounds;

    // Check if bounds are valid numbers
    if ([west, south, east, north].some(coord => isNaN(coord) || !isFinite(coord))) {
      return {
        valid: false,
        error: 'All bounds must be valid numbers',
      };
    }

    // Check longitude range
    if (west < -180 || west > 180 || east < -180 || east > 180) {
      return {
        valid: false,
        error: 'Longitude must be between -180 and 180 degrees',
      };
    }

    // Check latitude range
    if (south < -90 || south > 90 || north < -90 || north > 90) {
      return {
        valid: false,
        error: 'Latitude must be between -90 and 90 degrees',
      };
    }

    // Check if west is less than east
    if (west >= east) {
      return {
        valid: false,
        error: 'West bound must be less than east bound',
      };
    }

    // Check if south is less than north
    if (south >= north) {
      return {
        valid: false,
        error: 'South bound must be less than north bound',
      };
    }

    return { valid: true };
  }

  // Calculate tile area in square kilometers (approximate)
  calculateTileArea(bounds: [number, number, number, number]): number {
    const [west, south, east, north] = bounds;
    
    // Approximate calculation using equirectangular projection
    const latDiff = north - south;
    const lngDiff = east - west;
    
    // Convert to radians
    const latCenter = (south + north) / 2 * Math.PI / 180;
    const latDiffRad = latDiff * Math.PI / 180;
    const lngDiffRad = lngDiff * Math.PI / 180;
    
    // Earth's radius in km
    const R = 6371;
    
    // Area calculation (simplified)
    const area = R * R * Math.abs(latDiffRad) * Math.abs(lngDiffRad) * Math.cos(latCenter);
    
    return Math.round(area * 100) / 100; // Round to 2 decimal places
  }
}

export const tileService = new TileService();
export default tileService;
